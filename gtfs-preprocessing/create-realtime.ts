import fs from "fs";
import path from "path";
import { GtfsStop, readStops } from "./read-stops";
import { groupBy } from "./groupBy";
import { readLinien } from "./read-linien";
import { readRoutes } from "./read-routes";
import { DivaIndexBytes, DivaRouteBytes, RouteBytes } from "./structures";

let divaregex = /1::at:(43|49):(\d+):/;
const divabase = 60200000;

function getDiva(stop: GtfsStop) {
    const match = divaregex.exec(stop.stopId);
    if (match) {
        return parseInt(match[2]) + divabase;
    }
    return null;
}


export async function createRealtime(gtfsPath: string, rtPath: string, outputPath: string) {
    let s = await readStops(gtfsPath);
    let stops = s.map((stop, idx) => ({
        ...stop,
        diva: getDiva(stop),
        idx: idx,
    }));
    let stopsWithDiva = stops.filter(stop => stop.diva !== null);
    const groupedByDiva = Object.entries(groupBy(stopsWithDiva, "diva")).map(([diva, stops]) => ({ diva: parseInt(diva), stops })).sort((a, b) => a.diva - b.diva);

    const linien = await readLinien(rtPath);

    const routes = await readRoutes(gtfsPath);
    const routeIdMap: {
        id: number;
        trips: string[];
        direction: number;
    }[] = JSON.parse(await fs.promises.readFile(path.join(outputPath, "routeIdMap.json"), "utf8"));
    const stopServingRoutes = await fs.promises.readFile(path.join(outputPath, "stop_serving_routes.bin.bmp"));
    const preprocessedRoutes = await fs.promises.readFile(path.join(outputPath, "routes.bin.bmp"));
    const routeStops = await fs.promises.readFile(path.join(outputPath, "route_stops.bin.bmp"));
    const stopIndex = await fs.promises.readFile(path.join(outputPath, "stops.bin.bmp"));

    let stopIndexView = new DataView(stopIndex.buffer);
    let stopServingRoutesView = new DataView(stopServingRoutes.buffer);
    let preprocessedRoutesView = new DataView(preprocessedRoutes.buffer);
    let routeStopsView = new DataView(routeStops.buffer);
    const divaRoutes: {
        [diva: number]: {
            routeId: number;
            linie: number;
            direction: number;
            stopOffset: number;
        }[]
    } = {};
    for (let group of groupedByDiva) {
        let diva = group.diva;
        let divastops = group.stops;
        divaRoutes[diva] = [];
        for (let stop of divastops) {
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
                let route = routes[originalRouteMapping.trips[0]];
                let linie = linien.find(l => l.text == route.routeShortName);
                if (linie) {
                    divaRoutes[diva].push({
                        routeId: routeId,
                        linie: linie.id,
                        direction: originalRouteMapping.direction,
                        stopOffset: stopOffset
                    });
                }
            }
        }
        divaRoutes[diva].sort((a, b) => a.linie - b.linie);
    }
    let divas = Object.entries(divaRoutes)
        .map(([diva, routes]) => ({
            diva, routes
        }))
        .filter(({ diva, routes }) => routes.length > 0).map(({ diva, routes }) => parseInt(diva)).sort((a, b) => a - b);
    const divaLookup = new Uint8Array(divas.length * DivaIndexBytes);
    const divaLookupView = new DataView(divaLookup.buffer);
    const divaRoutesLookup = new Uint8Array(Object.values(divaRoutes).reduce((acc, routes) => acc + routes.length, 0) * DivaRouteBytes);
    const divaRoutesLookupView = new DataView(divaRoutesLookup.buffer);
    let divaRoutesIndex = 0;
    for (let i = 0; i < divas.length; i++) {
        let diva = divas[i];
        divaLookupView.setUint32(i * DivaIndexBytes, diva, true);
        divaLookupView.setUint32(i * DivaIndexBytes + 4, divaRoutesIndex, true);
        divaLookupView.setUint16(i * DivaIndexBytes + 8, divaRoutes[diva].length, true);
        for (let route of divaRoutes[diva]) {
            divaRoutesLookupView.setUint16(divaRoutesIndex * DivaRouteBytes, route.linie, true);
            divaRoutesLookupView.setUint16(divaRoutesIndex * DivaRouteBytes + 2, route.direction, true);
            divaRoutesLookupView.setUint16(divaRoutesIndex * DivaRouteBytes + 4, route.routeId, true);
            divaRoutesLookupView.setUint16(divaRoutesIndex * DivaRouteBytes + 6, route.stopOffset, true);
            divaRoutesIndex++;
        }
    }
    await fs.promises.writeFile(path.join(outputPath, "stops.json"), JSON.stringify(stops.map(s => [s.name, ...(s.diva ? [s.diva] : [])])));
    await fs.promises.writeFile(path.join(outputPath, "diva_index.bin.bmp"), Buffer.from(divaLookup));
    await fs.promises.writeFile(path.join(outputPath, "diva_routes.bin.bmp"), Buffer.from(divaRoutesLookup));
}