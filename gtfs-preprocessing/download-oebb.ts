import fetch from "node-fetch";
import fs from "fs";
import streamZip from "node-stream-zip";
import path from "path";

export async function getOebbGtfsMetadata() {
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
    console.log(`Retrieving OEBB GTFS metadata from ${restServicesBaseUrl} using basic auth ${basicAuth}`);
    let opendataResponse = await fetch(`${restServicesBaseUrl}opendata`, { headers: { Authorization: `Basic ${basicAuth}` } });
    if (!opendataResponse.ok) {
        console.error(await opendataResponse.text());
        throw new Error("Could not fetch oebb opendata list");
    }
    let opendata: { openDataDocuments: { uddikey: string; name: string }[] } = await opendataResponse.json();
    let oebbGtfs = opendata.openDataDocuments.find(d => d.name.indexOf("GTFS") > -1);
    if (!oebbGtfs?.uddikey) {
        throw new Error(`Could not find OEBB GTFS in opendata list : ${JSON.stringify(opendata, null, 2)}`);
    }
    let gtfsDetailRequest = await fetch(`${restServicesBaseUrl}opendata/detail?uddikey=${oebbGtfs.uddikey}`, { headers: { Authorization: `Basic ${basicAuth}` } });
    if (!gtfsDetailRequest.ok) {
        console.error(await gtfsDetailRequest.text());
        throw new Error("Could not fetch oebb opendata detail");
    }
    let gtfsDetail: {
        datenUndResourcen: {
            name: string;
            link: string;
            type: string;
            modified: string;
        }[]
    } = await gtfsDetailRequest.json();
    let gtfsZipFile = gtfsDetail.datenUndResourcen.find(d => d.name == "GFTS_Fahrplan_OEBB" && d.type == "ZIP");
    if (!gtfsZipFile?.link) {
        throw new Error(`Could not find OEBB GTFS zip file in opendata detail : ${JSON.stringify(gtfsDetail, null, 2)}`);
    }
    return {
        gtfsZipFile: gtfsZipFile,
        restServicesBaseUrl: restServicesBaseUrl,
        basicAuth: basicAuth,
    };
}

export async function downloadOebbGtfs(gtfsDir: string) {
    let { gtfsZipFile, restServicesBaseUrl, basicAuth } = await getOebbGtfsMetadata();

    let gtfsZipUrl = `${restServicesBaseUrl}opendata/download?url=${gtfsZipFile.link}`;
    console.log(`Downloading OEBB GTFS from ${gtfsZipUrl}`);
    if (!fs.existsSync(gtfsDir)) {
        fs.mkdirSync(gtfsDir, { recursive: true });
    }
    const res = await fetch(gtfsZipUrl, { headers: { Authorization: `Basic ${basicAuth}` } });
    const fileStream = fs.createWriteStream(path.join(gtfsDir, "oebb-gtfs.zip"));
    await new Promise((resolve, reject) => {
        res.body.pipe(fileStream);
        res.body.on("error", reject);
        fileStream.on("finish", resolve);
    });
    let zip = new streamZip.async({
        file: path.join(gtfsDir, "oebb-gtfs.zip")
    });
    await zip.extract(null, gtfsDir);
    zip.close();
}