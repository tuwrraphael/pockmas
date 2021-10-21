const { createSearchIndex } = require("./create-searchindex");
const { preprocessGtfs } = require("./gtfs-preprocessor");
const { getStopPopularity } = require("./stop-popularity");
const { getTransfers } = require("./transfers");
const path = require("path");
const fs = require("fs");

let steps = ["stop-popularity", "search-index", "transfers", "gtfs"];
if (process.argv.length > 2) {
    steps = process.argv.slice(2);
}
const destDir = path.join(__dirname, "../preprocessing-dist");
if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir);
}
const gtfsDir = path.join(__dirname, "./gtfs");
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
        }
    }
}
doSteps().catch(err => {
    console.error(err)
    process.exit(1);
});