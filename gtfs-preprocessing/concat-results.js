const fs = require("fs");
const path = require("path");
const { StopTimeBytes, RouteBytes, TransferBytes, StopBytes, CalendarBytes, RouteStopBytes, StopServingRouteBytes, TripCalendarBytes, DivaIndexBytes, DivaRouteBytes, CalendarExceptionBytes } = require("./structures");


const files = [
    { file: "stoptimes.bin.bmp", structSize: StopTimeBytes },
    { file: "routes.bin.bmp", structSize: RouteBytes },
    { file: "transfers.bin.bmp", structSize: TransferBytes },
    { file: "stops.bin.bmp", structSize: StopBytes },
    { file: "calendar.bin.bmp", structSize: CalendarBytes },
    { file: "calendar_exceptions.bin.bmp", structSize: CalendarExceptionBytes },
    { file: "diva_index.bin.bmp", structSize: DivaIndexBytes },
    { file: "diva_routes.bin.bmp", structSize: DivaRouteBytes },
    { file: "route_stops.bin.bmp", structSize: RouteStopBytes },
    { file: "stop_serving_routes.bin.bmp", structSize: StopServingRouteBytes },
    { file: "trip_calendars.bin.bmp", structSize: TripCalendarBytes }
];

async function concatResults(outputPath) {
    let destination = await fs.promises.open(path.join(outputPath, "raptor_data.bin.bmp"), "w");
    let fileSizesBytes = await Promise.all(files.map(f => fs.promises.stat(path.join(outputPath, f.file)).then(s => s.size)));
    for (let i = 0; i < files.length; i++) {
        if (fileSizesBytes[i] % files[i].structSize !== 0) {
            throw new Error(`File ${files[i].file} has wrong size`);
        }
    }
    let numbeOfElements = fileSizesBytes.map((b, i) => b / files[i].structSize);
    destination.write(new Uint8Array(new Uint32Array(numbeOfElements).buffer));
    for (let f of files) {
        let binary = await fs.promises.readFile(path.join(outputPath, f.file));
        destination.write(new Uint8Array(binary));
    }
    destination.close();
}
exports.concatResults = concatResults;
