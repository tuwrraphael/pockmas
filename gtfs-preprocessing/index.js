const { createSearchIndex } = require("./create-searchindex");
const { preprocessGtfs } = require("./gtfs-preprocessor");
const { getStopPopularity } = require("./stop-popularity");
const path = require("path");
const fs = require("fs");

let steps = ["stop-popularity", "search-index", "gtfs"];
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
                await getStopPopularity(gtfsDir, destDir);
                break;
            case "search-index":
                await createSearchIndex(gtfsDir, destDir);
                break;
            case "gtfs":
                await preprocessGtfs(gtfsDir, destDir);
                break;
        }
    }
}
doSteps().catch(console.error);