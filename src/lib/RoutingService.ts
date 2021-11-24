import { findTimeZone, getUnixTime, getZonedTime } from "timezone-support/dist/lookup-convert";
import { RaptorExports } from "../../raptor/wasm-exports";
import { MonitorResponse } from "../ogd_realtime/MonitorResponse";
import { Itinerary } from "./Itinerary";
import { Leg } from "./Leg";

export interface RouteRequest {
    departureStops: number[];
    arrivalStop: number;
    departureTimes: Date[];
}

const RAPTOR_MAX_REQUEST_STATIONS = 20;

const RAPTOR_LEG_SIZE = 24;
const RAPTOR_MAX_LEGS = 10;
const RAPTOR_ITINERARY_SIZE = RAPTOR_MAX_LEGS * RAPTOR_LEG_SIZE + 4;
const RAPTOR_MAX_ITINERARIES = 8;
const RAPTOR_RESULTS_SIZE = RAPTOR_MAX_ITINERARIES * RAPTOR_ITINERARY_SIZE + 4;

const RAPTOR_MAX_STOPTIME_UPDATES = 5;
const RAPTOR_UPDATE_RESULT_SIZE = 2 + 2 + 2 + 2;

const RAPTOR_STOPTIME_UPDATE_SIZE = 4 + // diva
    2 +  // linie
    1 + // direction
    1 + // weekday
    4 + // date
    1 + // apply
    1 + // num_updates
    2 + // padding
    RAPTOR_MAX_STOPTIME_UPDATES * 4 + // time_real
    RAPTOR_MAX_STOPTIME_UPDATES * RAPTOR_UPDATE_RESULT_SIZE + // results
    RAPTOR_MAX_STOPTIME_UPDATES * 1; // matches

function dayOfWeekToMask(date: Date) {
    let mask = 0;
    if (date.getDay() == 0) {
        mask = 64;
    } else {
        mask = 1 << (date.getDay() - 1);
    }
    return mask;
}

export class RoutingService {
    private mappedRealtimeData: { [routeId: number]: Set<number> } = {};
    constructor(private routingInstance: WebAssemblyInstance<RaptorExports>,
        private routeNames: [string, string, number, string | null][],
        private stops: [string, number][]) {

    }

    private getStartOfDayVienna(date: Date): number {
        const vienna = findTimeZone("Europe/Vienna");
        const viennaTime = getZonedTime(date, vienna);
        const startOfDayVienna = getUnixTime({
            year: viennaTime.year,
            month: viennaTime.month,
            day: viennaTime.day,
            hours: 0,
            minutes: 0,
            seconds: 0,
        }, vienna);
        return startOfDayVienna;
    }

    route(request: RouteRequest) {
        performance.mark("routing-start");
        let requestMemory = this.routingInstance.exports.get_request_memory();
        let view = new DataView(this.routingInstance.exports.memory.buffer, requestMemory, 4 + 4 + (RAPTOR_MAX_REQUEST_STATIONS + RAPTOR_MAX_REQUEST_STATIONS) * 2 + RAPTOR_MAX_REQUEST_STATIONS * 4);
        view.setUint8(0, 0);
        view.setUint8(1, Math.min(RAPTOR_MAX_REQUEST_STATIONS, request.departureStops.length));
        view.setUint8(2, 1);
        view.setUint8(3, dayOfWeekToMask(request.departureTimes[0]));
        for (let i = 0; i < Math.min(RAPTOR_MAX_REQUEST_STATIONS, request.departureStops.length); i++) {
            view.setUint16(4 + i * 2, request.departureStops[i], true);
        }
        view.setUint16(4 + RAPTOR_MAX_REQUEST_STATIONS * 2, request.arrivalStop, true);
        let startOfDayVienna = this.getStartOfDayVienna(request.departureTimes[0]);
        let departureDate = startOfDayVienna / 1000;
        for (let i = 0; i < Math.min(RAPTOR_MAX_REQUEST_STATIONS, request.departureStops.length); i++) {
            let departureTime = (+request.departureTimes[i] - startOfDayVienna) / 1000;
            view.setUint32(4 + (RAPTOR_MAX_REQUEST_STATIONS + RAPTOR_MAX_REQUEST_STATIONS) * 2 + i * 4, departureTime, true);
        }
        view.setUint32(4 + (RAPTOR_MAX_REQUEST_STATIONS + RAPTOR_MAX_REQUEST_STATIONS) * 2 + RAPTOR_MAX_REQUEST_STATIONS * 4, departureDate, true);
        let resOffset = this.routingInstance.exports.raptor();
        performance.mark("routing-done");
        performance.measure("routing", "routing-start", "routing-done");
        console.log(`routing took ${(performance.getEntriesByName("routing")[0]).duration}ms`);
        performance.clearMarks();
        performance.clearMeasures();
        return this.readResults(this.routingInstance.exports.memory, resOffset, startOfDayVienna);
    }

    async updateRealtimeForStops(divas: number[]) {
        let params = new URLSearchParams();
        for (let diva of divas) {
            params.append("diva", diva.toString());
        }
        let res = await fetch(`https://realtime-api.grapp.workers.dev/ogd_realtime/monitor?${params}`);
        let monitorResponse: MonitorResponse = await res.json();
        for (let monitor of monitorResponse.data.monitors) {
            for (let line of monitor.lines) {
                let direction: number;
                if (line.richtungsId == "1") {
                    direction = 0;
                } else if (line.richtungsId == "2") {
                    direction = 1;
                } else {
                    throw new Error(`unknown richtungsId in monitor ${line.richtungsId}`);
                }
                let timeReal = line.departures.departure
                    .filter(d => null != d.departureTime.timeReal)
                    .map(d => new Date(d.departureTime.timeReal));
                if (timeReal.length > 0) {
                    this.upsertRealtimeData({
                        diva: parseInt(monitor.locationStop.properties.name),
                        linie: line.lineId,
                        apply: true,
                        direction: direction,
                        timeReal: timeReal
                    });
                }
            }
        }

    }

    private readLeg(buffer: ArrayBuffer, offset: number, departureDate: number): Leg {
        let view = new DataView(buffer, offset, RAPTOR_LEG_SIZE);
        let departureStopId = view.getUint16(4, true);
        let arrivalStopId = view.getUint16(6, true);
        let departureSeconds = view.getUint32(8, true);
        let arrivalSeconds = view.getUint32(12, true);
        let leg: Leg = {
            type: view.getUint32(0, true),
            departureStop: {
                stopId: departureStopId,
                stopName: this.stops[departureStopId][0]
            },
            arrivalStop: {
                stopId: arrivalStopId,
                stopName: this.stops[arrivalStopId][0]
            },
            plannedDeparture: new Date(departureSeconds * 1000),
            delay: view.getInt16(18, true),
            arrivalTime: new Date(departureDate + arrivalSeconds * 1000),
            duration: (departureDate / 1000 + arrivalSeconds - departureSeconds) * 1000,
            route: null,
            tripId: null,
            isRealtime : false
        };
        if (leg.type == 1) {
            let routeId = view.getUint16(16, true);
            leg.route = {
                name: this.routeNames[routeId][0],
                color: this.routeNames[routeId].length > 3 ? this.routeNames[routeId][3] : (this.routeNames[routeId][2] == 0 ? "c4121a" : ""),
                id: routeId,
                headsign: this.routeNames[routeId][1]
            };
            leg.tripId = view.getUint32(20, true);
            leg.isRealtime = this.mappedRealtimeData[leg.route.id]?.has(leg.tripId) || false;
        }
        return leg;
    }

    getDiva(stopId: number) {
        return this.stops[stopId][1];
    }

    private readItinerary(buffer: ArrayBuffer, offset: number, departureDate: number): Itinerary {
        let legs = [];
        let view = new DataView(buffer, offset, RAPTOR_ITINERARY_SIZE);
        let numLegs = view.getUint32(0, true);
        for (let i = 0; i < numLegs; i++) {
            legs.push(this.readLeg(buffer, offset + 4 + i * RAPTOR_LEG_SIZE, departureDate));
        }
        return { legs: legs.reverse() };
    }

    private readResults(memory: WebAssembly.Memory, offset: number, departureDate: number): Itinerary[] {
        let itineraries = [];
        let view = new DataView(memory.buffer, offset, RAPTOR_RESULTS_SIZE);
        let numItineraries = view.getUint32(0, true);
        for (let i = 0; i < numItineraries; i++) {
            let itinerary = this.readItinerary(memory.buffer, offset + 4 + i * RAPTOR_ITINERARY_SIZE, departureDate);
            itineraries.push(itinerary);
        }
        return itineraries;
    }


    private readStoptimeUpdate(buffer: ArrayBuffer, offset: number) {
        let view = new DataView(buffer, offset, RAPTOR_STOPTIME_UPDATE_SIZE);
        let routeId = view.getUint16(0, true);
        let trip = view.getUint16(2, true);
        let realtimeOffset = view.getInt16(4, true);
        return {
            routeId: routeId,
            route: this.routeNames[routeId][0],
            trip: trip,
            realtimeOffset: realtimeOffset
        };
    }

    getRealtimeUpdateResult() {
        let memoryOffset = this.routingInstance.exports.get_stoptime_update_memory();
        let dataView = new DataView(this.routingInstance.exports.memory.buffer, memoryOffset, RAPTOR_STOPTIME_UPDATE_SIZE);
        let numUpdates = dataView.getUint8(13);
        let updates = [];
        for (let i = 0; i < numUpdates; i++) {
            let update = this.readStoptimeUpdate(this.routingInstance.exports.memory.buffer, memoryOffset + 16 + (4 * RAPTOR_MAX_STOPTIME_UPDATES) + (i * RAPTOR_UPDATE_RESULT_SIZE));
            updates.push({ ...update, numMatches: dataView.getUint8(16 + RAPTOR_MAX_STOPTIME_UPDATES * (RAPTOR_UPDATE_RESULT_SIZE + 4) + i) });
        }
        return updates;
    }

    upsertRealtimeData(updates: {
        diva: number,
        linie: number,
        direction: number,
        timeReal: Date[],
        apply: boolean
    }) {
        let memoryOffset = this.routingInstance.exports.get_stoptime_update_memory();
        let dataView = new DataView(this.routingInstance.exports.memory.buffer, memoryOffset, RAPTOR_STOPTIME_UPDATE_SIZE);
        dataView.setUint32(0, updates.diva, true);
        dataView.setUint16(4, updates.linie, true);
        dataView.setUint8(6, updates.direction);
        let date = this.getStartOfDayVienna(updates.timeReal[0]);
        let weekday = dayOfWeekToMask(updates.timeReal[0]);
        dataView.setUint8(7, weekday);
        dataView.setUint32(8, date / 1000, true);
        dataView.setUint8(12, updates.apply ? 1 : 0);
        let numUpdates = Math.min(updates.timeReal.length, RAPTOR_MAX_STOPTIME_UPDATES);
        dataView.setUint8(13, numUpdates);
        for (let i = 0; i < numUpdates; i++) {
            dataView.setUint32(16 + i * 4, (+updates.timeReal[i] - date) / 1000, true);
        }
        this.routingInstance.exports.process_realtime();
        let res = this.getRealtimeUpdateResult();
        for (let update of res) {
            if (update.numMatches > 0) {
                this.mappedRealtimeData[update.routeId] = this.mappedRealtimeData[update.routeId] || new Set();
                this.mappedRealtimeData[update.routeId].add(update.trip);
            }
        }
    }
}