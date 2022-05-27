import fs from "fs";
import path from "path";
import csv from "csv-parser";
import stripBom from "strip-bom-stream";

export interface GtfsRoute {
    routeId: string;
    routeShortName: string;
    routeLongName: string;
    routeType: number;
    routeColor: string;
}

export type GtfsRouteMap = { [routeId: string]: GtfsRoute };

export async function readRoutes(gtfsPath: string) {
    const routesStream = fs.createReadStream(path.join(gtfsPath, "routes.txt"));
    return new Promise<GtfsRouteMap>(resolve => {
        let routes: GtfsRouteMap = {};
        routesStream
            .pipe(stripBom())
            .pipe(csv())
            .on("data", (data) => {
                routes[data.route_id] = {
                    routeId: data.route_id,
                    routeShortName: data.route_short_name,
                    routeLongName: data.route_long_name,
                    routeType: parseInt(data.route_type),
                    routeColor: data.route_color
                };
            })
            .on('end', () => {
                resolve(routes);
            });
    });
}