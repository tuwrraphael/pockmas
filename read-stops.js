const fs = require("fs");
const readline = require("readline");
const path = require("path");
const { removeQuotes } = require("./remove-quotes");

async function readStops(gtfsPath) {
    const stopsStream = fs.createReadStream(path.join(gtfsPath, "stops.txt"));
    const stopsRl = readline.createInterface({
        input: stopsStream,
        crlfDelay: Infinity
    });
    let first = true;
    const stops = [];
    for await (const line of stopsRl) {
        if (first) {
            if (line.trim() !== "stop_id,stop_name,stop_lat,stop_lon,zone_id") {
                throw new Error("Invalid stops.txt file");
            }
            first = false;
            continue;
        }
        const [stopId, name , lat, lon] = line.split(",");
        stops.push({
            stopId: removeQuotes(stopId),
            lat: parseFloat(removeQuotes(lat)),
            lon: parseFloat(removeQuotes(lon)),
            name: removeQuotes(name)
        });
    }
    return stops.sort((a, b) => a.stopId.localeCompare(b));
}
exports.readStops = readStops;
