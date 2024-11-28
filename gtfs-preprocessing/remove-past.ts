import path from "path";
import fs from "fs";
import csv from "csv-parser";
import csvWriteStream, { CsvWriteStream } from "csv-write-stream";
import stripBom from "strip-bom-stream";
import { readCalendar } from "./read-calendar";

async function processAny<T>(gtfsPath: string, file: string, filter: (data: T) => boolean, onDrop: (data: T) => void) {
    // create a copy if not exists
    let copyFile = path.join(gtfsPath, file + ".copyremovepast");
    if (!fs.existsSync(copyFile)) {
        fs.copyFileSync(path.join(gtfsPath, file), copyFile);
    }
    const routesStream = fs.createReadStream(copyFile);
    const writeStream = fs.createWriteStream(path.join(gtfsPath, file));
    let writer: CsvWriteStream;

    let dropped = 0;
    let written = 0;
    let processed = 0;
    return new Promise<any>(resolve => {
        routesStream
            .pipe(stripBom())
            .pipe(csv())
            .on("headers", (headers) => {
                writer = csvWriteStream({ headers: headers });
                writer.pipe(writeStream);
            })
            .on("data", (data) => {
                processed++;
                if (filter(data)) {
                    written++;
                    writer.write(data);
                } else {
                    onDrop(data);
                    dropped++;
                }
                if (process.stdout.isTTY && processed % 100 == 0) {
                    process.stdout.write(`\rWritten: ${written}, Dropped: ${dropped}`);
                }
            })
            .on('end', () => {
                if (process.stdout.isTTY) {
                    process.stdout.write(`\rWritten: ${written}, Dropped: ${dropped}\n`);
                }
                if (written === 0) {
                    throw new Error(`No data written to ${file}`);
                }
                writer.end();
                writer.once("finish", () => {
                    resolve(dropped);
                });
            });
    });
}


function fixTimeZones(agencies: any[]) {
    for (let a of agencies) {
        if (a.agency_timezone == "Europe/Berlin") {
            a.agency_timezone = "Europe/Vienna";
        }
    }
}

function ensureAgencyUrl(agencies: any[]) {
    let hasAgencyUrls = agencies.some(a => a.hasOwnProperty("agency_url"));
    if (!hasAgencyUrls) {
        return;
    }
    let num = 0;
    for (let a of agencies) {
        if (!a.agency_url) {
            a.agency_url = "https://pockmas.kesal.at";
            num++;
        }
    }
    if (num > 0) {
        console.log(`Fixed ${num} agencies without agency_url`);
    }
}

function writeGtfs(gtfsPath: string, file: string, data: any[]) {
    const writeStream = fs.createWriteStream(path.join(gtfsPath, file));
    const headers: string[] = Array.from(data.reduce((prev, cur) => new Set<string>([...prev, ...Object.keys(cur)]), new Set<string>()));
    const writer = csvWriteStream({ headers: headers });
    writer.pipe(writeStream);
    for (let a of data) {
        writer.write(a);
    }
    writer.end();
}

function ensureRouteAgency(routes: any) {
    let num = 0;
    let mostUsed: string | null = null;
    for (let a of routes) {
        if (!a.agency_id) {
            if (!mostUsed) {
                mostUsed = Object.entries(routes.reduce((prev: any, cur: any) => ({ ...prev, [cur.agency_id]: (prev[cur.agency_id] || 0) + 1 }), {}))
                    .sort(([, r1], [, r2]) => <number>r2 - <number>r1)[0][0];
            }
            a.agency_id = mostUsed;
            num++;
        }
    }
    if (num > 0) {
        console.log(`Fixed ${num} routes without agency_id to ${mostUsed}`);
    }
}

function dedupeCalendarDates(calendarDates: any[]) {
    // service_id,date,exception_type
    let deduped: any[] = [];
    let seen: any = {};
    let numDuplicates = 0;
    for (let cd of calendarDates) {
        let key = `${cd.service_id},${cd.date}`;
        if (!seen[key]) {
            seen[key] = cd.exception_type;
            deduped.push(cd);
        } else {
            if (seen[key] != cd.exception_type) {
                throw new Error(`Duplicate calendar date ${key} with different exception_type`);
            }
            numDuplicates++;
        }
    }
    if (numDuplicates > 0) {
        console.log(`Removed ${numDuplicates} duplicate calendar dates`);
    }
    return deduped;
}

function ensureStopNames(stops: any[]) {
    let num = 0;
    for (let s of stops) {
        if (!s.stop_name) {
            s.stop_name = "Unbekannt";
            num++;
        }
    }
    if (num > 0) {
        console.log(`Fixed ${num} stops without stop_name`);
    }
}

const tolerance = 1000 * 60 * 60 * 24 * 7; // 7 days

export async function removePast(gtfsDir: string) {
    const calendarCopyPath = path.join(gtfsDir, "calendar.txt.copyremovepast");
    if (fs.existsSync(calendarCopyPath)) {
        fs.copyFileSync(calendarCopyPath, path.join(gtfsDir, "calendar.txt"));
    }
    const calendarDatesCopyPath = path.join(gtfsDir, "calendar_dates.txt.copyremovepast");
    if (fs.existsSync(calendarDatesCopyPath)) {
        fs.copyFileSync(calendarDatesCopyPath, path.join(gtfsDir, "calendar_dates.txt"));
    }

    let calendar = await readCalendar(gtfsDir, true);
    let now = Date.now();
    let byServiceId: { [serviceId: string]: any[] } = {};
    for (let c of calendar) {
        if (!byServiceId[c.serviceId]) {
            byServiceId[c.serviceId] = [];
        }
        byServiceId[c.serviceId].push(c);
    }
    let pastServiceIds = Object.entries(byServiceId)
        .filter(([serviceId, inst]) => inst.every(c => {
            return (c.endDate * 1000 + tolerance < now)
                && ((c.exceptions.length == 0) ||
                    c.exceptions.every((e: any) => e.date + tolerance < now));
        })).map(([serviceId, inst]) => ({ serviceId: serviceId }));
    let pastServiceIdsSet = new Set(pastServiceIds.map(c => c.serviceId));
    console.log(`Removing ${pastServiceIds.length} of ${calendar.length} services`);
    let droppedCalendar = await processAny<{ service_id: string }>(gtfsDir, "calendar.txt", (data) => !pastServiceIdsSet.has(data.service_id), (data) => { });
    console.log(`Dropped ${droppedCalendar} calendar entries`);
    let droppedCalendarDates = await processAny<{ service_id: string }>(gtfsDir, "calendar_dates.txt", (data) => !pastServiceIdsSet.has(data.service_id), (data) => { });
    console.log(`Dropped ${droppedCalendarDates} calendar dates entries`);
    let droppedTripIds: string[] = [];
    let droppedTrips = await processAny<{ service_id: string, trip_id: string }>(gtfsDir, "trips.txt", (data) => !pastServiceIdsSet.has(data.service_id), (data) => {
        droppedTripIds.push(data.trip_id);
    });
    let droppedTripsSet = new Set(droppedTripIds);
    console.log(`Dropped ${droppedTrips} trips entries`);
    let droppedStopTimes = await processAny<{ trip_id: string }>(gtfsDir, "stop_times.txt", (data) => !droppedTripsSet.has(data.trip_id), (data) => { });
    console.log(`Dropped ${droppedStopTimes} stop times entries`);
}