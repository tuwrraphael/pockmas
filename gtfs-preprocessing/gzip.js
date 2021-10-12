const { createGzip, gzip } = require('zlib');
const { pipeline } = require('stream');
const {
    createReadStream,
    createWriteStream
} = require('fs');

const { promisify } = require('util');
const pipe = promisify(pipeline);

async function doGzip(input, output) {
    const gzip = createGzip({

    });
    const source = createReadStream(input);
    const destination = createWriteStream(output);
    await pipe(source, gzip, destination);
}

async function make() {
    let inputs = [
        "stoptimes.bin",
        "stops.bin",
        "calendar.bin",
        "route_stops.bin",
        "routes.bin",
        "stop_serving_routes.bin",
        "transfers.bin",
        "trip_calendars.bin"
    ];
    for (let i of inputs) {
        await doGzip(i, i + ".gz");
    }
}

make().catch(console.error);

