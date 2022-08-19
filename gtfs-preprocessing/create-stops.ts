import fs from "fs";
import path from "path";
import { groupByEquality } from "./groupBy";
import { GtfsRouteMap, readRoutes } from "./read-routes";
import { RouteIdMap } from "./gtfs-preprocessor";
import { readStops } from "./read-stops";
import { StopRealtimeInfo } from "./create-realtime";


function onlyUnique<T>(value: T, index: number, self: T[]) {
    return self.indexOf(value) === index;
}

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
    })));
}