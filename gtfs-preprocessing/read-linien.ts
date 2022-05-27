import fs from "fs";
import path from "path";
import csv from "csv-parser";
import stripBom from "strip-bom-stream";

export interface Linie {
    id: number;
    text: string;
}

export async function readLinien(rtPath:string) {
    const stopsStream = fs.createReadStream(path.join(rtPath, "wienerlinien-ogd-linien.csv"));
    return new Promise<Linie[]>(resolve => {
        const linien :Linie[] = [];
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
