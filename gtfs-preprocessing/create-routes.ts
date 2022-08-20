import fs from "fs";
import path from "path";
import { groupByEquality } from "./groupBy";
import { GtfsRouteMap, readRoutes } from "./read-routes";
import { RouteIdMap } from "./gtfs-preprocessor";


function onlyUnique<T>(value: T, index: number, self: T[]) {
    return self.indexOf(value) === index;
}

export type RouteClass = {
    routeShortName: string;
    headsignVariants: string[];
    routeColor?: string;
    routeType: number;
};
export type RouteClassIndex = { [routeId: number]: { routeClass: number, headsignVariant: number } };

function createRouteClasses(routes: GtfsRouteMap, routeIdMap: RouteIdMap) {
    let c = groupByEquality(routeIdMap, r => {
        let originalRoute = routes[r.tripRoutes[0]];
        return originalRoute.routeShortName;
    }, (a, b) => a == b);

    let classes: RouteClass[] = [];
    let index: RouteClassIndex = {};

    for (let routeShortName of Array.from(c.keys()).sort()) {
        let _routes = c.get(routeShortName)!;
        if (_routes.map(r => routes[_routes[0].tripRoutes[0]].routeColor).filter(onlyUnique).length > 1) {
            throw new Error("Multiple route colors for route " + routeShortName);
        }
        if (_routes.map(r => routes[_routes[0].tripRoutes[0]].routeType).filter(onlyUnique).length > 1) {
            throw new Error("Multiple route types for route " + routeShortName);
        }
        let routeClass: RouteClass = {
            routeShortName: routeShortName,
            headsignVariants: _routes.map(r => r.headsign).filter(onlyUnique).sort(),
            routeType: routes[_routes[0].tripRoutes[0]].routeType
        };
        let routeColor = routes[_routes[0].tripRoutes[0]].routeColor;
        if (routeColor) {
            routeClass.routeColor = routeColor;
        }
        classes.push(routeClass);
        for (let route of _routes) {
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

export async function createRoutes(gtfsPath: string, outputPath: string) {
    const routes = await readRoutes(gtfsPath);
    const routeIdMap: RouteIdMap = JSON.parse(await fs.promises.readFile(path.join(outputPath, "routeIdMap.json"), "utf8"));

    let routeClasses = createRouteClasses(routes, routeIdMap);

    await fs.promises.writeFile(path.join(outputPath, "route-classes.json"), JSON.stringify(routeClasses.classes));
    await fs.promises.writeFile(path.join(outputPath, "route-classes-index.json"), JSON.stringify(routeClasses.index));

    await fs.promises.writeFile(path.join(outputPath, "routes.json"), JSON.stringify(routeIdMap.map((r) => {
        let routeClass = routeClasses.index[r.id];
        return [routeClass.routeClass, routeClass.headsignVariant];
    })));
}