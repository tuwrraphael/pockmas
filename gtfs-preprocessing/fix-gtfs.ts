import path from "path";
import fs, { write } from "fs";
import csv from "csv-parser";
import csvWriteStream from "csv-write-stream";
import stripBom from "strip-bom-stream";

async function readAgencies(gtfsPath: string) {
    const routesStream = fs.createReadStream(path.join(gtfsPath, "agency.txt"));
    return new Promise<any>(resolve => {
        let agencies: any = [];
        routesStream
            .pipe(stripBom())
            .pipe(csv())
            .on("data", (data) => {
                agencies.push(data);
            })
            .on('end', () => {
                resolve(agencies);
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

function fixAgencyUrl(agencies: any[]) {
    let hasAgencyUrls = agencies.some(a => a.hasOwnProperty("agency_url"));
    if (!hasAgencyUrls) {
        return;
    }
    for (let a of agencies) {
        if (!a.agency_url) {
            a.agency_url = "https://pockmas.kesal.at";
        }
    }
}

function writeAgencies(gtfsPath: string, agencies: any[]) {
    const writeStream = fs.createWriteStream(path.join(gtfsPath, "agency.txt"));
    const headers: string[] = Array.from(agencies.reduce((prev, cur) => new Set<string>([...prev, ...Object.keys(cur)]), new Set<string>()));
    const writer = csvWriteStream({ headers: headers });
    writer.pipe(writeStream);
    for (let a of agencies) {
        writer.write(a);
    }
    writer.end();
}

export async function fixGtfs(gtfsDir: string) {
    let agencies = await readAgencies(gtfsDir);
    fixTimeZones(agencies);
    fixAgencyUrl(agencies);
    writeAgencies(gtfsDir, agencies);
}