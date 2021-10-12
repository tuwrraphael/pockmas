const { readStops } = require("./read-stops.js");
const fs = require("fs");
const csv = require("csv-parser");
const path = require("path");

async function createStopPopularity(gtfsPath, outputPath) {
    const stops = await readStops(gtfsPath);
    const stopPopularity = {};
    const stopsStream = fs.createReadStream(path.join(gtfsPath, "stop_times.txt"));
    return new Promise(resolve => {
        stopsStream.pipe(csv())
            .on("data", (data) => {
                stopPopularity[data.stop_id] = (stopPopularity[data.stop_id] || 0) + 1;
            })
            .on('end', () => {
                fs.promises.writeFile(path.join(outputPath, "stop-popularity.txt"), stops.map(stop => {
                    return stopPopularity[stop.stopId] || 0;
                }).join("\n")).then(() => resolve());
            });
    })
}
exports.getStopPopularity = createStopPopularity;