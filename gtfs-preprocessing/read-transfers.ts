import stripBom from "strip-bom-stream";
import csv from "csv-parser";
import fs from "fs";
import path from "path";
import { GtfsStop } from "./read-stops";

export async function enhanceWithTransfers(stops: GtfsStop[], gtfsPath: string) {
    let transfersFile = path.join(gtfsPath, "transfers.txt");
    if (!fs.existsSync(transfersFile)) {
        console.log("No transfers file found to enhance transfers with.");
        return;
    }
    const stopsStream = fs.createReadStream(transfersFile);
    return new Promise<void>(resolve => {
        stopsStream
            .pipe(stripBom())
            .pipe(csv())
            .on("data", (data) => {
                let stop = stops.find(s => s.stopId === data.from_stop_id);
                if (!stop) {
                    throw new Error(`Stop ${data.from_stop_id} not found`);
                }
                let toStop = stops.find(s => s.stopId === data.to_stop_id);
                if (!toStop) {
                    throw new Error(`Stop ${data.to_stop_id} not found`);
                }
                stop.transfers = stop.transfers || [];
                stop.transfers.push({
                    to: stops.indexOf(toStop),
                    toStopId: data.to_stop_id,
                    minTransferTime: parseInt(data.min_transfer_time)
                });
            })
            .on('end', () => {
                resolve();
            });
    })
}
