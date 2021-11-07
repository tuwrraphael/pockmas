const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const stripBom = require("strip-bom-stream");


async function readRoutes(gtfsPath) {
    const routesStream = fs.createReadStream(path.join(gtfsPath, "routes.txt"));
    return new Promise(resolve => {
        let routes = {};
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
exports.readRoutes = readRoutes;
