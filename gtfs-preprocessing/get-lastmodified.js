const fetch = require("node-fetch");

fetch("http://www.wienerlinien.at/ogd_realtime/doku/ogd/gtfs/gtfs.zip", {
    method : "HEAD"
}).then(res => {
    console.log(new Date(res.headers.get("last-modified")).getTime());
});