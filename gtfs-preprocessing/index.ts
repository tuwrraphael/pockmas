import { createSearchIndex } from "./create-searchindex";
import { preprocessGtfs } from "./gtfs-preprocessor";
import { env } from "process";
import { downloadOebbGtfs } from "./download-oebb";
import { downloadWienerlinienGtfs } from "./download-wienerlinien";
import { fixGtfs } from "./fix-gtfs";
import { gtfsTidy } from "./gtfstidy";
import { getStopPopularity } from "./stop-popularity.js";
import { getTransfers } from "./transfers";
import { createRealtime } from "./create-realtime";
import { concatResults } from "./concat-results";
import path from "path";
import fs from "fs";
import { createCalendar } from "./create-calendar";
import { createRoutes } from "./create-routes";
import { createStops } from "./create-stops";

let pathToGtfsTidyExecutable = env.GTFSTIDY_EXECUTABLE || "gtfstidy";

let steps = [
    "download-oebb",
    "download-wienerlinien",
    "fix-gtfs",
    "gtfstidy",
    "stop-popularity",
    "search-index",
    "transfers",
    "gtfs",
    "routes",
    "realtime",
    "stops",
    "calendar",
    "concat",
];
if (process.argv.length > 2) {
    steps = process.argv.slice(2);
}
const destDir = path.join(__dirname, "../../../preprocessing-dist");
if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir);
}
const gtfsDir = path.join(__dirname, "../../gtfs");
if (!fs.existsSync(gtfsDir)) {
    fs.mkdirSync(gtfsDir);
}
const gtfsWienerLinienDir = path.join(__dirname, "../../gtfs-wienerlinien");
const gtfsOebbDir = path.join(__dirname, "../../gtfs-oebb");
const rtDir = path.join(__dirname, "../../");

let allGftsDirs = [gtfsOebbDir, gtfsWienerLinienDir];

async function doSteps() {

    for (let step of steps) {
        switch (step) {
            case "download-oebb":
                await downloadOebbGtfs(gtfsOebbDir, console.log);
                break;
            case "download-wienerlinien":
                await downloadWienerlinienGtfs(gtfsWienerLinienDir);
                break;
            case "fix-gtfs":
                await fixGtfs(gtfsOebbDir,allGftsDirs.indexOf(gtfsOebbDir).toString());
                await fixGtfs(gtfsWienerLinienDir,allGftsDirs.indexOf(gtfsWienerLinienDir).toString());
                break;
            case "gtfstidy":
                await gtfsTidy(pathToGtfsTidyExecutable, allGftsDirs, gtfsDir);
                break;
            case "stop-popularity":
                console.log("Calculating stop popularity");
                await getStopPopularity(gtfsDir, destDir);
                break;
            case "search-index":
                console.log("Creating search index");
                await createSearchIndex(gtfsDir, destDir);
                break;
            case "transfers":
                console.log("Creating transfers.txt");
                await getTransfers(gtfsDir, destDir, "http://localhost:8080/ors");
                break;
            case "gtfs":
                console.log("Preprocessing GTFS");
                await preprocessGtfs(gtfsDir, destDir);
                break;
            case "routes":
                console.log("Creating routes");
                await createRoutes(gtfsDir, destDir);
                break;
            case "realtime":
                console.log("Preprocessing realtime index");
                await createRealtime(gtfsDir, rtDir, destDir);
                break;
            case "stops":
                console.log("Creating stops");
                await createStops(gtfsDir, destDir);
                break;
            case "calendar":
                console.log("Preprocessing service calendar");
                await createCalendar(gtfsDir, destDir);
                break;
            case "concat":
                console.log("Concatenating results");
                await concatResults(destDir);
                break;

        }
    }
}
doSteps().catch(err => {
    console.error(err)
    process.exit(1);
});