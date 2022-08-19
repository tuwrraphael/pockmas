import fs from "fs";
import path from "path";
import { GtfsStop, readStops } from "./read-stops";
import { groupByEquality } from "./groupBy";
import { RealtimeRouteBytes, RealtimeRouteIndexBytes, RouteBytes } from "./structures";
import { RouteClassIndex } from "./create-routes";

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

export interface StopRealtimeInfo {
    [stopId: number]: {
        realtimeIdentifier: RealtimeIdentifier;
    }
}

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

function onlyUnique<T>(value: T, index: number, self: T[]) {
    return self.indexOf(value) === index;
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

    const stopServingRoutes = await fs.promises.readFile(path.join(outputPath, "stop_serving_routes.bin.bmp"));
    const preprocessedRoutes = await fs.promises.readFile(path.join(outputPath, "routes.bin.bmp"));
    const routeStops = await fs.promises.readFile(path.join(outputPath, "route_stops.bin.bmp"));
    const stopIndex = await fs.promises.readFile(path.join(outputPath, "stops.bin.bmp"));

    let stopIndexView = new DataView(stopIndex.buffer);
    let stopServingRoutesView = new DataView(stopServingRoutes.buffer);
    let preprocessedRoutesView = new DataView(preprocessedRoutes.buffer);
    let routeStopsView = new DataView(routeStops.buffer);
    const realtimeRouteMap: Map<RealtimeIdentifier, RealtimeIdentifierRoute[]> = new Map();

    let routeClassesIndex: RouteClassIndex = JSON.parse(await fs.promises.readFile(path.join(outputPath, "route-classes-index.json"), "utf8"));

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
                let routeClass = routeClassesIndex[routeId];
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
        let realtimeRouteIdentifier = realTimeRouteIdentifiers[i];
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

    let realtimeRouteIdentifiers = Array.from(realtimeRouteMap.keys());
    let stopRealtimeInfo: StopRealtimeInfo = {};
    for (let s of stops) {
        if (s.realtimeIdentifier != null) {
            let key = realtimeRouteIdentifiers.find(r => r.value == s.realtimeIdentifier!.value && r.type == s.realtimeIdentifier!.type)!;
            let rtRoutes = realtimeRouteMap.get(key)!;
            stopRealtimeInfo[s.idx] = {
                realtimeIdentifier: s.realtimeIdentifier
            }
        }
    }

    let routeClassesByRealtimeIdentifier: [realtimeIdentifierType: number, realTimeIdentifier: number, ...routeClasses: number[]][] = [];
    for (let rtIdentifier of realtimeRouteMap.keys()) {
        let rtRoutes = realtimeRouteMap.get(rtIdentifier)!;
        let routeClasses = rtRoutes.map(r => r.routeClass);
        routeClassesByRealtimeIdentifier.push([rtIdentifier.type, rtIdentifier.value, ...routeClasses.filter(onlyUnique)]);
    }

    await fs.promises.writeFile(path.join(outputPath, "stops-realtime-info.json"), JSON.stringify(stopRealtimeInfo));
    await fs.promises.writeFile(path.join(outputPath, "route-classes-by-realtime-identifier.json"), JSON.stringify(routeClassesByRealtimeIdentifier));
    await fs.promises.writeFile(path.join(outputPath, "realtime_route_index.bin.bmp"), Buffer.from(realtimeRouteLookup));
    await fs.promises.writeFile(path.join(outputPath, "realtime_routes.bin.bmp"), Buffer.from(realtimeRoutes));
}