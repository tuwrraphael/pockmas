import fs from "fs";
import path from "path";
import { readStops } from "./read-stops";
import { StopRealtimeInfo } from "./create-realtime";

export type RouteClass = { routeShortName: string; headsignVariants: string[] };
export type RouteClassIndex = { [routeId: number]: { routeClass: number, headsignVariant: number } };

export async function createStops(gtfsPath: string, outputPath: string) {
    const stops = await readStops(gtfsPath);
    const stopRealtimeInfo: StopRealtimeInfo = JSON.parse(await fs.promises.readFile(path.join(outputPath, "stops-realtime-info.json"), "utf8"));


    await fs.promises.writeFile(path.join(outputPath, "stops.json"), JSON.stringify(stops.map((r, idx) => {
        let rtInfo = stopRealtimeInfo[idx];
        if (rtInfo) {
            return [r.name, rtInfo.realtimeIdentifier.type, rtInfo.realtimeIdentifier.value];
        }
        return [r.name];
    })));
}