const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

async function readStops(gtfsPath) {
    const stopsStream = fs.createReadStream(path.join(gtfsPath, "stops.txt"));
    return new Promise(resolve => {
        const stops = [];
        stopsStream.pipe(csv())
        .on("data", (data) => stops.push({
            stopId : data.stop_id,
            name: data.stop_name,
            lat: parseFloat(data.stop_lat),
            lon: parseFloat(data.stop_lon)
        }))
        .on('end', () => {
          resolve(stops.sort((a, b) => a.stopId.localeCompare(b)))
        });
    })
}
exports.readStops = readStops;
