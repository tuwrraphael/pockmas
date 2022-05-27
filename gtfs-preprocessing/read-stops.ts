import fs from "fs";
import path from "path";
import csv from "csv-parser";
import stripBom from "strip-bom-stream";

export interface GtfsStop {
    stopId: string;
    name: string;
    lat: number;
    lon: number;
    transfers?: {
        to: number,
        toStopId: string,
        minTransferTime: number
    }[]
}

export async function readStops(gtfsPath: string) {
    const stopsStream = fs.createReadStream(path.join(gtfsPath, "stops.txt"));
    return new Promise<GtfsStop[]>(resolve => {
        const stops: GtfsStop[] = [];
        stopsStream
            .pipe(stripBom())
            .pipe(csv())
            .on("data", (data) => stops.push({
                stopId: data.stop_id,
                name: data.stop_name,
                lat: parseFloat(data.stop_lat),
                lon: parseFloat(data.stop_lon)
            }))
            .on('end', () => {
                resolve(stops.sort((a, b) => a.stopId.localeCompare(b.stopId)))
            });
    })
}
