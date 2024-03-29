import fs from "fs";
import path from "path";
import { StopTimeBytes, RouteBytes, TransferBytes, StopBytes, CalendarBytes, RouteStopBytes, StopServingRouteBytes, TripCalendarBytes, CalendarExceptionBytes, RealtimeRouteIndexBytes, RealtimeRouteBytes } from "./structures";


const files = [
    { file: "stoptimes.bin.bmp", structSize: StopTimeBytes },
    { file: "routes.bin.bmp", structSize: RouteBytes },
    { file: "transfers.bin.bmp", structSize: TransferBytes },
    { file: "stops.bin.bmp", structSize: StopBytes },
    { file: "calendar.bin.bmp", structSize: CalendarBytes },
    { file: "calendar_exceptions.bin.bmp", structSize: CalendarExceptionBytes },
    { file: "realtime_route_index.bin.bmp", structSize: RealtimeRouteIndexBytes },
    { file: "realtime_routes.bin.bmp", structSize: RealtimeRouteBytes },
    { file: "route_stops.bin.bmp", structSize: RouteStopBytes },
    { file: "stop_serving_routes.bin.bmp", structSize: StopServingRouteBytes },
    { file: "trip_calendars.bin.bmp", structSize: TripCalendarBytes }
];

export async function concatResults(outputPath:string) {
    let destination = await fs.promises.open(path.join(outputPath, "raptor_data.bin.bmp"), "w");
    let fileSizesBytes = await Promise.all(files.map(f => fs.promises.stat(path.join(outputPath, f.file)).then(s => s.size)));
    for (let i = 0; i < files.length; i++) {
        if (fileSizesBytes[i] % files[i].structSize !== 0) {
            throw new Error(`File ${files[i].file} has wrong size`);
        }
    }
    let numbeOfElements = fileSizesBytes.map((b, i) => b / files[i].structSize);
    for (let i = 0; i < files.length; i++) {
        console.log(`file ${files[i].file} has ${numbeOfElements[i]} elements`);
    }
    await destination.write(new Uint8Array(new Uint32Array(numbeOfElements).buffer));
    for (let f of files) {
        let binary = await fs.promises.readFile(path.join(outputPath, f.file));
        await destination.write(new Uint8Array(binary));
    }
    destination.close();
}
