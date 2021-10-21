const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const stripBom = require("strip-bom-stream");

async function enhanceWithTransfers(stops, gtfsPath) {
    const stopsStream = fs.createReadStream(path.join(gtfsPath, "transfers.txt"));
    return new Promise(resolve => {
        stopsStream
            .pipe(stripBom())
            .pipe(csv())
            .on("data", (data) => {
                let stop = stops.find(s => s.stopId === data.from_stop_id);
                stop.transfers = stop.transfers || [];
                stop.transfers.push({
                    to: stops.indexOf(stops.find(s => s.stopId === data.to_stop_id)),
                    toStopId: data.to_stop_id,
                    minTransferTime: parseInt(data.min_transfer_time)
                });
            })
            .on('end', () => {
                resolve();
            });
    })
}
exports.enhanceWithTransfers = enhanceWithTransfers;
