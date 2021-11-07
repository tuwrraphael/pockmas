const { createSearchIndex } = require("./create-searchindex");
const { preprocessGtfs } = require("./gtfs-preprocessor");
const { getStopPopularity } = require("./stop-popularity");
const { getTransfers } = require("./transfers");
const { createRealtime } = require("./create-realtime");
const { concatResults } = require("./concat-results");
const path = require("path");
const fs = require("fs");
const { createCalendar } = require("./create-calendar");

let steps = ["stop-popularity", "search-index", "transfers", "gtfs", "realtime", "calendar", "concat"];
if (process.argv.length > 2) {
    steps = process.argv.slice(2);
}
const destDir = path.join(__dirname, "../preprocessing-dist");
if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir);
}
const gtfsDir = path.join(__dirname, "./gtfs");
const rtDir = path.join(__dirname, "./");
async function doSteps() {

    for (let step of steps) {
        switch (step) {
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
            case "realtime":
                console.log("Preprocessing realtime index");
                await createRealtime(gtfsDir, rtDir, destDir);
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