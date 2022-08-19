import fs from "fs";
import path from "path";
import { GtfsStop, readStops } from "./read-stops";
import { groupByEquality } from "./groupBy";
import { GtfsRouteMap, readRoutes } from "./read-routes";
import { RealtimeRouteBytes, RealtimeRouteIndexBytes, RouteBytes } from "./structures";

let divaregex = /1::at:(43|49):(\d+):/;
let oebbregex = /0::81(\d+)/;
const divabase = 60200000;

const enum RealtimeIdentifierType {
    WienerLinien = 0,
    OEBB = 1
};

type RealtimeIdentifier = {
    type: RealtimeIdentifierType;
    value: number;
}

type RealtimeIdentifierRoute = {
    routeId: number;
    routeClass: number;
    headsignVariant: number;
    stopOffset: number;
};

function getRealtimeIdentifier(stop: GtfsStop) {
    let match = divaregex.exec(stop.stopId);
    if (match) {
        return {
            type: RealtimeIdentifierType.WienerLinien,
            value: parseInt(match[2]) + divabase
        };
    }
    match = oebbregex.exec(stop.stopId);
    if (match) {
        return {
            type: RealtimeIdentifierType.OEBB,
            value: parseInt(match[1])
        };
    }
    return null;
}

type RouteIdMap = {
    id: number;
    tripRoutes: string[];
    direction: number;
    headsign: string;
}[];

function onlyUnique<T>(value: T, index: number, self: T[]) {
    return self.indexOf(value) === index;
}

function createRouteClasses(routes: GtfsRouteMap, routeIdMap: RouteIdMap) {
    let c = groupByEquality(routeIdMap, r => {
        let originalRoute = routes[r.tripRoutes[0]];
        return originalRoute.routeShortName;
    }, (a, b) => a == b);

    let classes: { routeShortName: string; headsignVariants: string[] }[] = [];
    let index: { [routeId: number]: { routeClass: number, headsignVariant: number } } = {};

    for (let routeShortName of Array.from(c.keys()).sort()) {
        let routes = c.get(routeShortName)!;
        let routeClass = {
            routeShortName: routeShortName,
            headsignVariants: routes.map(r => r.headsign).filter(onlyUnique).sort()
        };
        classes.push(routeClass);
        for (let route of routes) {
            index[route.id] = {
                routeClass: classes.length - 1,
                headsignVariant: routeClass.headsignVariants.indexOf(route.headsign)
            }
        }
    }
    return {
        index, classes
    };
}

export async function createRealtime(gtfsPath: string, rtPath: string, outputPath: string) {
    let s = await readStops(gtfsPath);
    let stops = s.map((stop, idx) => ({
        ...stop,
        realtimeIdentifier: getRealtimeIdentifier(stop),
        idx: idx,
    }));
    let stopsWithRtIdentifier = stops.filter(stop => stop.realtimeIdentifier !== null);
    let groupedByRtIdentifier = groupByEquality(stopsWithRtIdentifier, s => s.realtimeIdentifier!, (a, b) => a.type == b.type && a.value == b.value);

    const routes = await readRoutes(gtfsPath);
    const routeIdMap: RouteIdMap = JSON.parse(await fs.promises.readFile(path.join(outputPath, "routeIdMap.json"), "utf8"));
    const stopServingRoutes = await fs.promises.readFile(path.join(outputPath, "stop_serving_routes.bin.bmp"));
    const preprocessedRoutes = await fs.promises.readFile(path.join(outputPath, "routes.bin.bmp"));
    const routeStops = await fs.promises.readFile(path.join(outputPath, "route_stops.bin.bmp"));
    const stopIndex = await fs.promises.readFile(path.join(outputPath, "stops.bin.bmp"));

    let stopIndexView = new DataView(stopIndex.buffer);
    let stopServingRoutesView = new DataView(stopServingRoutes.buffer);
    let preprocessedRoutesView = new DataView(preprocessedRoutes.buffer);
    let routeStopsView = new DataView(routeStops.buffer);
    const realtimeRouteMap: Map<RealtimeIdentifier, RealtimeIdentifierRoute[]> = new Map();

    let routeClasses = createRouteClasses(routes, routeIdMap);

    for (let rtIdentifier of groupedByRtIdentifier.keys()) {
        let rtIdentifierStops = groupedByRtIdentifier.get(rtIdentifier)!;

        let rtIdentifierRoutes: RealtimeIdentifierRoute[] = [];
        for (let stop of rtIdentifierStops) {
            let stopServingRoutesIndex = stopIndexView.getUint32(stop.idx * 12, true);
            let stopServingRoutesCount = stopIndexView.getUint16(stop.idx * 12 + 8, true);
            for (let i = 0; i < stopServingRoutesCount; i++) {
                let routeId = stopServingRoutesView.getUint16(stopServingRoutesIndex * 2 + i * 2, true);
                let routeStopIndex = preprocessedRoutesView.getUint32(routeId * RouteBytes + 4, true);
                let routeStopCount = preprocessedRoutesView.getUint32(routeId * RouteBytes + 8, true);
                let stopOffset = null;
                for (let j = 0; j < routeStopCount; j++) {
                    let routeStopId = routeStopsView.getUint16((routeStopIndex + j) * 2, true);
                    if (routeStopId === stop.idx) {
                        stopOffset = j;
                        break;
                    }
                }
                if (stopOffset === null) {
                    throw new Error(`Stop ${stop.idx} not found in route ${routeId}`);
                }
                let originalRouteMapping = routeIdMap.find(r => r.id == routeId);
                if (!originalRouteMapping) {
                    throw new Error(`Original route mapping for ${routeId} not found`);
                }
                let routeClass = routeClasses.index[routeId];
                rtIdentifierRoutes.push({
                    routeId: routeId,
                    headsignVariant: routeClass.headsignVariant,
                    routeClass: routeClass.routeClass,
                    stopOffset: stopOffset
                });

            }
        }

        rtIdentifierRoutes.sort((a, b) => a.routeId - b.routeId);
        realtimeRouteMap.set(rtIdentifier, rtIdentifierRoutes);
    }
    const realtimeRouteLookup = new Uint8Array(Array.from(realtimeRouteMap.keys()).length * RealtimeRouteIndexBytes);
    const realtimeRouteLookupView = new DataView(realtimeRouteLookup.buffer);
    const realtimeRoutes = new Uint8Array(Array.from(realtimeRouteMap.values()).reduce((acc, routes) => acc + routes.length, 0) * RealtimeRouteBytes);
    const realtimeRoutesView = new DataView(realtimeRoutes.buffer);
    let realtimeRouteIndex = 0;
    let realTimeRouteIdentifiers = Array.from(realtimeRouteMap.keys()).sort((a, b) => {
        let byType = a.type - b.type;
        if (byType != 0) {
            return byType;
        }
        return a.value - b.value;
    })
    for (let i = 0; i < realTimeRouteIdentifiers.length; i++) {
        let realtimeRouteIdentifier = realTimeRouteIdentifiers[0];
        let realtimeRoutes = realtimeRouteMap.get(realtimeRouteIdentifier)!;
        realtimeRouteLookupView.setUint32(i * RealtimeRouteIndexBytes, realtimeRouteIdentifier.value, true);
        realtimeRouteLookupView.setUint32(i * RealtimeRouteIndexBytes + 4, realtimeRouteIndex, true);
        realtimeRouteLookupView.setUint16(i * RealtimeRouteIndexBytes + 8, realtimeRoutes.length, true);
        realtimeRouteLookupView.setUint16(i * RealtimeRouteIndexBytes + 10, realtimeRouteIdentifier.type, true);
        for (let route of realtimeRoutes) {
            realtimeRoutesView.setUint16(realtimeRouteIndex * RealtimeRouteBytes, route.routeClass, true);
            realtimeRoutesView.setUint16(realtimeRouteIndex * RealtimeRouteBytes + 2, route.headsignVariant, true);
            realtimeRoutesView.setUint16(realtimeRouteIndex * RealtimeRouteBytes + 4, route.routeId, true);
            realtimeRoutesView.setUint16(realtimeRouteIndex * RealtimeRouteBytes + 6, route.stopOffset, true);
            realtimeRouteIndex++;
        }
    }
    await fs.promises.writeFile(path.join(outputPath, "stops.json"), JSON.stringify(stops.map(s => [s.name, ...(s.realtimeIdentifier ? [s.realtimeIdentifier.type, s.realtimeIdentifier.value] : [])])));
    await fs.promises.writeFile(path.join(outputPath, "realtime_route_index.bin.bmp"), Buffer.from(realtimeRouteLookup));
    await fs.promises.writeFile(path.join(outputPath, "realtime_routes.bin.bmp"), Buffer.from(realtimeRoutes));
}