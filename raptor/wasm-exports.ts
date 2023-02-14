export interface RaptorExports extends WebAssembly.Exports {
    raptor_allocate: (number_of_stoptimes: number, number_of_routes: number, number_of_transfers: number,
        number_of_stops: number, number_of_calendars: number, number_of_calendar_exceptions: number, number_of_realtime_route_identifiers: number, number_of_realtime_routes: number,
        number_of_route_stops: number, number_of_stop_routes: number, number_of_trip_calendars: number) => number;
    get_request_memory: () => number;
    get_stoptime_update_memory: () => number;
    initialize: () => void;
    process_realtime: () => void;
    raptor: () => number;
    memory: WebAssembly.Memory;
    get_departures: () => number;
    get_stoptime: (route_id: number, stop_id: number, trip: number, date: number) => number;
    get_transfer_time: (stop_from_id: number, stop_to_id: number) => number;
}