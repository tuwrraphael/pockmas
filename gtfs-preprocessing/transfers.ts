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
            let healthJson = await healthRes.json() as { status: string };
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

    let doneMap = new Map<GtfsStop, GtfsStop[]>();
    for (let k of stopsMap.keys()) {
        doneMap.set(k, []);
    }

    function getNextSlice(stop: GtfsStop) {
        let stops = stopsMap.get(stop)!;
        let done = doneMap.get(stop)!;
        return stops.filter(s => !done.includes(s)).slice(0, 99);
    }

    function setDone(stop: GtfsStop, stopB: GtfsStop) {
        doneMap.get(stop)!.push(stopB);
        doneMap.get(stopB)!.push(stop);
    }

    for (let a = 0; a < entries.length; a++) {
        let [stop] = entries[a];
        if (a % 100 == 0) {
            console.log(`processed ${Math.round(100 * a / entries.length)}%`);
        }
        let nextSlice = getNextSlice(stop);
        while (nextSlice.length > 0) {
            // console.log(stop.lon, stop.lat);
            let res = await fetch(orsBaseUrl + "/v2/matrix/foot-walking", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    locations: [[stop.lon, stop.lat], ...nextSlice.map(s => [s.lon, s.lat])],
                    sources: [0]
                }),
            });
            if (!res.ok) {
                let errorBody = await res.text();
                console.error(errorBody);
                for (let stopB of nextSlice) {
                    await unknownTransfersOutput.write(`HTTP 500: ${stop.stopId} - ${stopB.stopId}: ${stop.name} - ${stopB.name}\n`, null, "utf8");
                    setDone(stop, stopB);
                }
            }
            else {
                let json = await res.json() as { durations: number[][] };
                let times = json.durations[0].slice(1);
                for (let i = 0; i < nextSlice.length; i++) {
                    let stopB = nextSlice[i];
                    let time = times[i];
                    if (time === null) {
                        await unknownTransfersOutput.write(`Null duration: ${stop.stopId} - ${stopB.stopId}: ${stop.name} - ${stopB.name}\n`, null, "utf8");
                    }
                    else {
                        if (time === 0) {
                            let distance = coordinateDistance(stop.lat, stop.lon, stopB.lat, stopB.lon);
                            if (distance === 0) {
                                time = 1;    
                            }
                            if (distance < (50 / 1000)) {
                                time = Math.round((distance * 1000) / (walkingSpeed / 3.6));
                            }
                        }
                        if (time < maxSeconds) {
                            await transfersOutput.write(`"${stop.stopId}","${stopB.stopId}","2",${Math.ceil(time)}\n`, null, "utf8");
                            await transfersOutput.write(`"${stopB.stopId}","${stop.stopId}","2",${Math.ceil(time)}\n`, null, "utf8");
                        }
                        if (time === 0) {
                            let distance = coordinateDistance(stop.lat, stop.lon, stopB.lat, stopB.lon);
                            await unknownTransfersOutput.write(`Zero duration: ${stop.stopId} - ${stopB.stopId}: ${stop.name} - ${stopB.name}, distance: ${Math.round(distance * 1000)}m\n`, null, "utf8");
                        }
                    }
                    setDone(stop, stopB);
                }
            }
            nextSlice = getNextSlice(stop);
        }
    }
    for (let key of stopsMap.keys()) {
        if (doneMap.get(key)!.length < stopsMap.get(key)!.length) {
            throw new Error(`Not all stops processed for ${key.stopId}: ${key.name}`);
        }
    }
    await transfersOutput.close();
    await unknownTransfersOutput.close();
    console.log("Done");
}