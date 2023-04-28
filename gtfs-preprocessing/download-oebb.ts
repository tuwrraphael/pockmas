import fetch from "node-fetch";
import fs from "fs";
import streamZip from "node-stream-zip";
import path from "path";

export async function getOebbGtfsMetadata(log: (message: string) => void) {
    let datasetsResponse = await fetch("https://data.oebb.at/oebb/DatasetsConfig.js");
    if (!datasetsResponse.ok) {
        console.error(await datasetsResponse.text());
        throw new Error("Could not fetch oebb data sets");
    }
    let datasets = await datasetsResponse.text();
    let restServicesBaseUrlRes = /restServicesBaseUrl\s=\s('|")([^"]+?)('|")/.exec(datasets);
    let basicAuthRes = /up\s=\s('|")([^"]+?)('|")/.exec(datasets);
    if (null == restServicesBaseUrlRes) {
        throw new Error("Could not find restServicesBaseUrl");
    }
    if (null == basicAuthRes) {
        throw new Error("Could not find basicAuth");
    }
    let restServicesBaseUrl = restServicesBaseUrlRes[2];
    let basicAuth = basicAuthRes[2];
    log(`Retrieving OEBB GTFS metadata from ${restServicesBaseUrl} using basic auth ${basicAuth}`);
    let opendataResponse = await fetch(`${restServicesBaseUrl}opendata`, { headers: { Authorization: `Basic ${basicAuth}` } });
    if (!opendataResponse.ok) {
        console.error(await opendataResponse.text());
        throw new Error("Could not fetch oebb opendata list");
    }
    let opendata = await opendataResponse.json() as { openDataDocuments: { uddikey: string; name: string }[] };
    let oebbGtfs = opendata.openDataDocuments.find(d => d.name.indexOf("GTFS") > -1);
    if (!oebbGtfs?.uddikey) {
        throw new Error(`Could not find OEBB GTFS in opendata list : ${JSON.stringify(opendata, null, 2)}`);
    }
    let gtfsDetailRequest = await fetch(`${restServicesBaseUrl}opendata/detail?uddikey=${oebbGtfs.uddikey}`, { headers: { Authorization: `Basic ${basicAuth}` } });
    if (!gtfsDetailRequest.ok) {
        console.error(await gtfsDetailRequest.text());
        throw new Error("Could not fetch oebb opendata detail");
    }
    let gtfsDetail
        = await gtfsDetailRequest.json() as {
            datenUndResourcen: {
                name: string;
                link: string;
                type: string;
                modified: string;
            }[]
        };
    log("Found:\n" + gtfsDetail.datenUndResourcen.filter(d => d.type == "ZIP").map(d => d.name).join("\n"));
    let gtfsZipFile = gtfsDetail.datenUndResourcen.find(d => d.name == "GFTS_Fahrplan_OEBB_2023" && d.type == "ZIP");
    if (!gtfsZipFile?.link) {
        throw new Error(`Could not find OEBB GTFS zip file in opendata detail : ${JSON.stringify(gtfsDetail, null, 2)}`);
    }
    return {
        gtfsZipFile: gtfsZipFile,
        restServicesBaseUrl: restServicesBaseUrl,
        basicAuth: basicAuth,
    };
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
    let { gtfsZipFile, restServicesBaseUrl, basicAuth } = await getOebbGtfsMetadata(log);

    let gtfsZipUrl = `${restServicesBaseUrl}opendata/download?url=${gtfsZipFile.link}`;
    log(`Downloading OEBB GTFS from ${gtfsZipUrl}`);
    if (!fs.existsSync(gtfsDir)) {
        fs.mkdirSync(gtfsDir, { recursive: true });
    }
    const res = await fetch(gtfsZipUrl, { headers: { Authorization: `Basic ${basicAuth}` } });
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
