const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const stripBom = require("strip-bom-stream");

async function readLinien(rtPath) {
    const stopsStream = fs.createReadStream(path.join(rtPath, "wienerlinien-ogd-linien.csv"));
    return new Promise(resolve => {
        const linien = [];
        stopsStream
            .pipe(stripBom())
            .pipe(csv({
                separator: ";"
            }))
            .on("data", (data) => {
                linien.push({
                    id: parseInt(data.LineID),
                    text: data.LineText
                });
            })
            .on('end', () => {
                resolve(linien)
            });
    })
}
exports.readLinien = readLinien;
