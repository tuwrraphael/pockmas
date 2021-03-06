import fetch from "node-fetch";
import { GtfsStop, readStops } from "./read-stops";
import { coordinateDistance } from "./coordinate-distance";
import fs from "fs";
import path from "path";
import { enhanceWithTransfers } from "./read-transfers";

let maxDistance = 0.8;
let walkingSpeed = 5;
let kmPerMinute = walkingSpeed / 60;
let maxMinutes = maxDistance / kmPerMinute;
let maxSeconds = maxMinutes * 60;

export async function getTransfers(gtfsPath: string, outputPath: string, orsBaseUrl: string) {
    console.log("Wait until ORS healthy");
    let healthy = false
    let errors = [];
    for (let i = 0; i < 8; i++) {
        try {
            let healthRes = await fetch(orsBaseUrl + "/v2/health");
            let healthJson = await healthRes.json() as {status: string};
            if (healthJson.status !== "ready") {
                console.log(`status: ${healthJson.status}, wait 30s`);
                await new Promise(resolve => setTimeout(resolve, 30000));
            } else {
                healthy = true;
                break;
            }
        }
        catch (e) {
            console.log("fetch error, wait 30s");
            errors.push(e);
            await new Promise(resolve => setTimeout(resolve, 30000));
        }
    }
    if (!healthy) {
        for (let e of errors) {
            console.log(e);
        }
        throw new Error("Timeout: ORS not healthy");
    }
    console.log("ORS healthy. Reading stops.");
    let stops = await readStops(gtfsPath);
    await enhanceWithTransfers(stops, gtfsPath);
    let stopsMap = new Map<GtfsStop, GtfsStop[]>();
    for (let stop of stops) {
        for (let stop2 of stops) {
            if (stop2 == stop) {
                continue;
            }
            if (coordinateDistance(stop.lat, stop.lon, stop2.lat, stop2.lon) < maxDistance) {
                if (!stopsMap.has(stop)) {
                    stopsMap.set(stop, [stop2]);
                } else {
                    stopsMap.get(stop)!.push(stop2);
                }
            }
        }
    }
    let transfersOutput = await fs.promises.open(path.join(outputPath, "transfers.txt"), "w");
    let unknownTransfersOutput = await fs.promises.open(path.join(outputPath, "unknown-transfers.txt"), "w");
    await transfersOutput.write("from_stop_id,to_stop_id,transfer_type,min_transfer_time\n", null, "utf8");

    let entries = Array.from(stopsMap.entries());
    console.log("Start processing");
    for (let a = 0; a < entries.length; a++) {
        let [stop, stops] = entries[a];
        if (a % 100 == 0) {
            console.log(`processed ${Math.round(100 * a / entries.length)}%`);
        }
        let stopsToCheck = stops.slice(0, 99);
        stops = stops.slice(99);
        while (stopsToCheck.length > 0) {
            let res = await fetch(orsBaseUrl + "/v2/matrix/foot-walking", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    locations: [[stop.lon, stop.lat], ...stopsToCheck.map(s => [s.lon, s.lat])],
                    sources: [0]
                }),
            });
            if (!res.ok) {
                for (let stopB of stopsToCheck) {
                    await unknownTransfersOutput.write(`HTTP 500: ${stop.stopId} - ${stopB.stopId}: ${stop.name} - ${stopB.name}\n`, null, "utf8");
                }
            }
            else {
                let json = await res.json() as {durations: number[][]};
                let times = json.durations[0].slice(1);
                for (let i = 0; i < stopsToCheck.length; i++) {
                    let stopB = stopsToCheck[i];
                    let time = times[i];
                    if (time === null) {
                        await unknownTransfersOutput.write(`Null duration: ${stop.stopId} - ${stopB.stopId}: ${stop.name} - ${stopB.name}\n`, null, "utf8");
                    }
                    else {
                        if (time === 0) {
                            let distance = coordinateDistance(stop.lat, stop.lon, stopB.lat, stopB.lon);
                            if (distance < (30/1000)) {
                                time = Math.round((distance * 1000) / (walkingSpeed / 3.6));
                            }
                        }
                        if (time < maxSeconds) {
                            await transfersOutput.write(`"${stop.stopId}","${stopB.stopId}","2",${Math.ceil(time)}\n`, null, "utf8");
                            await transfersOutput.write(`"${stopB.stopId}","${stop.stopId}","2",${Math.ceil(time)}\n`, null, "utf8");
                            let stopBEntry = entries.find(e => e[0] == stopB)!;
                            stopBEntry[1].splice(stopBEntry.indexOf(stop), 1);
                        }
                        if (time === 0) {
                            let distance = coordinateDistance(stop.lat, stop.lon, stopB.lat, stopB.lon);
                            await unknownTransfersOutput.write(`Zero duration: ${stop.stopId} - ${stopB.stopId}: ${stop.name} - ${stopB.name}, distance: ${Math.round(distance * 1000)}m\n`, null, "utf8");
                        }
                    }
                }
            }
            stopsToCheck = stops.slice(0, 99);
            stops = stops.slice(99);
        }
    }
    await transfersOutput.close();
    await unknownTransfersOutput.close();
    console.log("Done");
}