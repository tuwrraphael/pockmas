import path from "path";
import fs, { write } from "fs";
import csv from "csv-parser";
import csvWriteStream from "csv-write-stream";
import stripBom from "strip-bom-stream";

async function readAny(gtfsPath: string, file: string) {
    const routesStream = fs.createReadStream(path.join(gtfsPath, file));
    return new Promise<any>(resolve => {
        let res: any = [];
        routesStream
            .pipe(stripBom())
            .pipe(csv())
            .on("data", (data) => {
                res.push(data);
            })
            .on('end', () => {
                resolve(res);
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

function dedupeCalendarDates(calendarDates:any[]) {
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

export async function fixGtfs(gtfsDir: string) {
    let agencies = await readAny(gtfsDir, "agency.txt");
    fixTimeZones(agencies);
    ensureAgencyUrl(agencies);
    writeGtfs(gtfsDir, "agency.txt", agencies);
    let routes = await (readAny(gtfsDir, "routes.txt"));
    ensureRouteAgency(routes);
    writeGtfs(gtfsDir, "routes.txt", routes);
    let calendarDates = await (readAny(gtfsDir, "calendar_dates.txt"));
    calendarDates = dedupeCalendarDates(calendarDates);
    writeGtfs(gtfsDir, "calendar_dates.txt", calendarDates);
}