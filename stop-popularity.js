const { readStops } = require("./read-stops.js");
const levenshtein = require("js-levenshtein");
const { coordinateDistance } = require("./coordinate-distance");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

async function getStopPopularity(gtfsPath) {
    const stops = await readStops(gtfsPath);
    const stopPopularity = {};
    const stopsStream = fs.createReadStream(path.join(gtfsPath, "stop_times.txt"));
    return new Promise(resolve => {
        stopsStream.pipe(csv())
            .on("data", (data) => {
                stopPopularity[data.stop_id] = (stopPopularity[data.stop_id] || 0) + 1;
            })
            .on('end', () => {
                fs.promises.writeFile("stop-popularity.txt", stops.map(stop => {
                    return stopPopularity[stop.stopId] || 0;
                }).join("\n")).then(() => resolve());
            });
    })
}
getStopPopularity("./gtfs").catch(console.error);
