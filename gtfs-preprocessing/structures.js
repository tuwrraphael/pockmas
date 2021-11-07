function padTo4Bytes(size) {
    if (size % 4 === 0) {
        return size;
    }
    return size + (4 - (size % 4));
}

let divaIndexBytes = 4 + 4 + 2;
exports.DivaIndexBytes = padTo4Bytes(divaIndexBytes);

let divaRouteBytes = 2 + 2 + 2 + 2;
exports.DivaRouteBytes = padTo4Bytes(divaRouteBytes);

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