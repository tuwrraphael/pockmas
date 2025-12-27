import fetch from "node-fetch";
import { getOebbZipUrl } from "./download-oebb";

async function getLastModifiedDateWienerlinien() {
    let res = await fetch("https://www.wienerlinien.at/ogd_realtime/doku/ogd/gtfs/gtfs.zip", {
        method: "GET"
    });
    let lastModifiedHeader = res.headers.get("last-modified");
    if (lastModifiedHeader) {
        return new Date(lastModifiedHeader).getTime();
    }
    else {
        throw new Error("No last-modified header found");
    }
}

async function getLastModifiedOebb() {
    let res = await fetch(await getOebbZipUrl(), {
        method: "HEAD"
    });
    let lastModifiedHeader = res.headers.get("last-modified");
    if (lastModifiedHeader) {
        return new Date(lastModifiedHeader).getTime();
    }
    else {
        throw new Error("No last-modified header found");
    }
}

async function getLastModifiedDate() {
    try {
        let sorted = (await Promise.all([getLastModifiedDateWienerlinien(), getLastModifiedOebb()])).sort();
        return sorted[sorted.length - 1];
    }
    catch (e) {
        console.error("Error getting last modified dates:", e);
        return new Date().getTime().toString();
    }
}

getLastModifiedDate().then(d => console.log(d));