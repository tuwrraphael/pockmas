import fetch from "node-fetch";
import fs from "fs";
import streamZip from "node-stream-zip";
import path from "path";

export async function getOebbZipUrl() {
    return "https://static.web.oebb.at/open-data/soll-fahrplan-gtfs/GTFS_Fahrplan_2026.zip";
}

async function  findFileRecursive(dir:string, file:string):Promise<string|null> {
    let files = fs.readdirSync(dir);
    for (let f of files) {
        if (f == file) {
            return dir;
        }
        let subPath = path.join(dir, f);
        if ((await fs.promises.stat(subPath)).isDirectory()) {
            let res = findFileRecursive(subPath, file);
            if (null != res) {
                return res;
            }
        }
    }
    return null;
}

async function moveFiles(srcDir:string, targetDir:string) {
    let files = fs.readdirSync(srcDir);
    for (let f of files) {
        await fs.promises.rename(path.join(srcDir, f), path.join(targetDir, f));
    }
}

export async function downloadOebbGtfs(gtfsDir: string, log: (message: string) => void) {
    let gtfsZipUrl = await getOebbZipUrl();
    log(`Downloading OEBB GTFS from ${gtfsZipUrl}`);
    if (!fs.existsSync(gtfsDir)) {
        fs.mkdirSync(gtfsDir, { recursive: true });
    }
    const res = await fetch(gtfsZipUrl);
    const fileStream = fs.createWriteStream(path.join(gtfsDir, "oebb-gtfs.zip"));
    await new Promise((resolve, reject) => {
        res.body!.pipe(fileStream);
        res.body!.on("error", reject);
        fileStream.on("finish", resolve);
    });
    let zip = new streamZip.async({
        file: path.join(gtfsDir, "oebb-gtfs.zip")
    });
    await zip.extract(null, gtfsDir);

    let agencyFilePath = await findFileRecursive(gtfsDir, "agency.txt");
    if (null == agencyFilePath) {
        throw new Error(`Could not find agency.txt in ${gtfsDir}`);
    }
    if (agencyFilePath != gtfsDir) {
        await moveFiles(agencyFilePath, gtfsDir);
    }
    
    zip.close();
}
