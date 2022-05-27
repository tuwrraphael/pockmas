import fetch from "node-fetch";
import fs from "fs";
import streamZip from "node-stream-zip";
import path from "path"

export async function downloadWienerlinienGtfs(gtfsDir: string) {
    let gtfsZipUrl = "http://www.wienerlinien.at/ogd_realtime/doku/ogd/gtfs/gtfs.zip";
    console.log(`Downloading Wiener linien GTFS from ${gtfsZipUrl}`);
    if (!fs.existsSync(gtfsDir)) {
        fs.mkdirSync(gtfsDir, { recursive: true });
    }
    const res = await fetch(gtfsZipUrl);
    const fileStream = fs.createWriteStream(path.join(gtfsDir, "wienerlinien-gtfs.zip"));
    await new Promise((resolve, reject) => {
        res.body.pipe(fileStream);
        res.body.on("error", reject);
        fileStream.on("finish", resolve);
    });
    let zip = new streamZip.async({
        file: path.join(gtfsDir, "wienerlinien-gtfs.zip"),
    });
    await zip.extract(null, gtfsDir);
    zip.close();
}
