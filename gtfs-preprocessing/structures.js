function padTo4Bytes(size) {
    if (size % 4 === 0) {
        return size;
    }
    return size + (4 - (size % 4));
}

let realtimeRouteIndexBytes = 4 + 4 + 2 + 2;
exports.RealtimeRouteIndexBytes = padTo4Bytes(realtimeRouteIndexBytes);

let realtimeRouteBytes = 2 + 2 + 2 + 2;
exports.RealtimeRouteBytes = padTo4Bytes(realtimeRouteBytes);

let calendarBytes = padTo4Bytes(4 + 4 + 4 + 2 + 1);
exports.CalendarBytes = calendarBytes;

let calendarExceptionBytes = padTo4Bytes(4 + 1);
exports.CalendarExceptionBytes = calendarExceptionBytes;

exports.StopTimeBytes = 4 + 4;
exports.RouteBytes = 5 * 4;
exports.TransferBytes = 2 + 2;
exports.StopBytes = 4 + 4 + 2 + 2;
exports.RouteStopBytes = 2;
exports.StopServingRouteBytes = 2;
exports.TripCalendarBytes = 2;