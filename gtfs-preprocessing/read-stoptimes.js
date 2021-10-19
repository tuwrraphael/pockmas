const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const stripBom = require("strip-bom-stream");

function parseTime(time) {
    let [hour, minute, second] = time.split(":");
    return parseInt(hour) * 3600 + parseInt(minute) * 60 + parseInt(second);
}

async function readStopTimes(gtfsPath) {
    const stopsStream = fs.createReadStream(path.join(gtfsPath, "stop_times.txt"));
    return new Promise(resolve => {
        const stoptimes = [];
        stopsStream
            .pipe(stripBom())
            .pipe(csv())
            .on("data", (data) => stoptimes.push({
                arrivalTime: parseTime(data.arrival_time),
                departureTime: parseTime(data.departure_time),
                stopSequence: parseInt(data.stop_sequence),
                stopId: data.stop_id,
            }))
            .on('end', () => {
                resolve(stoptimes);
            });
    })
}
exports.readStopTimes = readStopTimes;
