import fetch from "node-fetch";
import { getOebbZipUrl } from "./download-oebb";

async function getLastModifiedDateWienerlinien() {
    let res = await fetch("http://www.wienerlinien.at/ogd_realtime/doku/ogd/gtfs/gtfs.zip", {
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
    let sorted = (await Promise.all([getLastModifiedDateWienerlinien(), getLastModifiedOebb()])).sort();
    return sorted[sorted.length - 1];
}

getLastModifiedDate().then(d => console.log(d));