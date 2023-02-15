import { RaptorExports } from "../../raptor/wasm-exports";
import { WienerLinienMonitorResponse } from "../realtime-api/WienerLinienMonitorResponse";
import { OebbMonitorResponse } from "../realtime-api/OebbMonitorResponse";
import { Departure } from "./Departure";
import { TimezoneUtility } from "./TimezoneUtility";
import { Itinerary } from "./Itinerary";
import { Leg } from "./Leg";
import { RealtimeData } from "./RealtimeData";
import { RealtimeIdentifier } from "./RealtimeIdentifier";
import { RealtimeIdentifierType } from "./RealtimeIdentifierType";
import { ResolvedRealtimeData } from "./ResolvedRealtimeData";
import { RouteInfoStore } from "./RouteInfoStore";
import { findBestMatch } from "string-similarity";
import { testmonitorresponse } from "../monitorresponse";

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

const RAPTOR_STOPTIME_UPDATE_SIZE = 4 + // realtime_route_identifier
    2 +  // linie
    1 + // direction
    1 + // weekday
    4 + // date
    1 + // apply
    1 + // num_updates
    2 + // realtime_route_identifier_type
    RAPTOR_MAX_STOPTIME_UPDATES * 4 + // time_real
    RAPTOR_MAX_STOPTIME_UPDATES * RAPTOR_UPDATE_RESULT_SIZE + // results
    RAPTOR_MAX_STOPTIME_UPDATES * 1; // matches

const DEPARTURE_RESULT_SIZE = 2 + // route_id
    2 + // stop_id
    4 + // trip
    4 + // planned_departure
    2 + // delay
    2; // padding

const MAX_DEPARTURE_RESULTS = 10;
const DEPARTURE_RESULTS_SIZE = MAX_DEPARTURE_RESULTS * DEPARTURE_RESULT_SIZE + 4;

export class RoutingService {
    private mappedRealtimeData: { [routeId: number]: Set<number> } = {};

    constructor(private routingInstance: WebAssemblyInstance<RaptorExports>,
        private routeInfoStore: RouteInfoStore,
        private timezoneUtility: TimezoneUtility) {

    }

    hasRealtime(routeId: number, trip: number) {
        return this.mappedRealtimeData[routeId]?.has(trip) || false;
    }

    private mapToDeparture(view: DataView, offset: number) {
        let route = this.routeInfoStore.getRoute(view.getUint16(offset, true));
        let tripId = view.getUint32(offset + 4, true);
        let departure: Departure = {
            route: route,
            stop: this.routeInfoStore.getStop(view.getUint16(offset + 2, true)),
            tripId: tripId,
            plannedDeparture: new Date(view.getUint32(offset + 8, true) * 1000),
            delay: view.getInt16(offset + 12, true),
            isRealtime: this.hasRealtime(route.id, tripId)
        };
        return departure;
    }

    getDepartures(r: { departureStops: { stopId: number, departureTime: Date }[] }): Departure[] {
        this.setRequest(r);
        let offset = this.routingInstance.exports.get_departures();
        let view = new DataView(this.routingInstance.exports.memory.buffer, offset, DEPARTURE_RESULTS_SIZE);
        let numResults = view.getUint32(0, true);
        let departures: Departure[] = [];
        for (let i = 0; i < numResults; i++) {
            let departure = this.mapToDeparture(view, 4 + i * DEPARTURE_RESULT_SIZE);
            departures.push(departure);
        }
        return departures;
    }

    private setRequest(r: { departureStops: { stopId: number, departureTime: Date }[], arrivalStop?: number }) {
        let requestMemory = this.routingInstance.exports.get_request_memory();
        let view = new DataView(this.routingInstance.exports.memory.buffer, requestMemory, 4 + 4 + (RAPTOR_MAX_REQUEST_STATIONS + RAPTOR_MAX_REQUEST_STATIONS) * 2 + RAPTOR_MAX_REQUEST_STATIONS * 4);
        view.setUint8(0, 0);
        view.setUint8(1, Math.min(RAPTOR_MAX_REQUEST_STATIONS, r.departureStops.length));
        view.setUint8(2, 1);
        let startOfDayVienna = this.timezoneUtility.getStartOfDay(r.departureStops[0].departureTime);
        view.setUint8(3, startOfDayVienna.dayOfWeek);
        for (let i = 0; i < Math.min(RAPTOR_MAX_REQUEST_STATIONS, r.departureStops.length); i++) {
            view.setUint16(4 + i * 2, r.departureStops[i].stopId, true);
        }
        if (typeof r.arrivalStop == "number") {
            view.setUint16(4 + RAPTOR_MAX_REQUEST_STATIONS * 2, r.arrivalStop, true);
        }
        let departureDate = startOfDayVienna.unixTime / 1000;
        for (let i = 0; i < Math.min(RAPTOR_MAX_REQUEST_STATIONS, r.departureStops.length); i++) {
            let departureTime = (+r.departureStops[i].departureTime - startOfDayVienna.unixTime) / 1000;
            view.setUint32(4 + (RAPTOR_MAX_REQUEST_STATIONS + RAPTOR_MAX_REQUEST_STATIONS) * 2 + i * 4, departureTime, true);
        }
        view.setUint32(4 + (RAPTOR_MAX_REQUEST_STATIONS + RAPTOR_MAX_REQUEST_STATIONS) * 2 + RAPTOR_MAX_REQUEST_STATIONS * 4, departureDate, true);
    }

    route(request: RouteRequest) {
        if (request.departureStops.length != request.departureTimes.length) {
            throw new Error("departureStops and departureTimes must have the same length");
        }
        performance.mark("routing-start");
        this.setRequest({ departureStops: request.departureStops.map((d, i) => ({ stopId: d, departureTime: request.departureTimes[i] })), arrivalStop: request.arrivalStop });
        let resOffset = this.routingInstance.exports.raptor();
        performance.mark("routing-done");
        performance.measure("routing", "routing-start", "routing-done");
        console.log(`routing took ${(performance.getEntriesByName("routing")[0]).duration}ms`);
        performance.clearMarks();
        performance.clearMeasures();
        return this.readResults(this.routingInstance.exports.memory, resOffset);
    }

    private async getRealtimeForWienerLinien(divas: number[]): Promise<RealtimeData[]> {
        let params = new URLSearchParams();
        for (let diva of divas) {
            params.append("diva", diva.toString());
        }
        let res = await fetch(`https://realtime-api.grapp.workers.dev/ogd_realtime/monitor?${params}`);
        let monitorResponse: WienerLinienMonitorResponse = await res.json();
        let result: RealtimeData[] = [];
        for (let monitor of monitorResponse.data.monitors) {
            let identifier: RealtimeIdentifier = {
                type: RealtimeIdentifierType.WienerLinien,
                value: parseInt(monitor.locationStop.properties.name)
            };
            for (let line of monitor.lines) {
                let byLineAndHeadsign: Map<string, Map<string, Date[]>> = new Map();
                for (let departure of line.departures.departure) {
                    if (departure.departureTime?.timeReal || departure.departureTime?.timePlanned) {
                        let byHeadsign: Map<string, Date[]> = byLineAndHeadsign.get(departure.vehicle?.name || line.name) || new Map();
                        let departureTime = departure.departureTime.timeReal ? new Date(departure.departureTime.timeReal) : new Date(departure.departureTime.timePlanned);
                        let departureTimes = byHeadsign.get(departure.vehicle?.towards || line.towards) || [];
                        departureTimes.push(departureTime);
                        byHeadsign.set(departure.vehicle?.towards || line.towards, departureTimes);
                        byLineAndHeadsign.set(departure.vehicle?.name || line.name, byHeadsign);
                    } else {
                        console.log(`no departure time in departure`, departure);
                    }
                }
                for (let [routeClassName, byHeadsign] of byLineAndHeadsign) {
                    for (let [headsign, departureTimes] of byHeadsign) {
                        let realtimeData: RealtimeData = {
                            realtimeIdentifier: identifier,
                            routeClassName: routeClassName,
                            headsign: headsign,
                            times: departureTimes
                        };

                        result.push(realtimeData);
                    }
                }
            }
        }
        return result;
    }

    private parseOebbDate(date: string, time: string): Date | null {
        const dateRegex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
        const timeRegex = /^(\d{2}):(\d{2})$/;
        if (!date || !time || !dateRegex.test(date) || !timeRegex.test(time)) {
            console.log(`unexpected oebb date or time: "${date}" "${time}"`);
            return null;
        }
        let dateParts = date.split(".");
        let timeParts = time.split(":");
        return this.timezoneUtility.getDateInTimezone(+dateParts[2], +dateParts[1], +dateParts[0], +timeParts[0], +timeParts[1], 0);
    }

    private async *getRealtimeForOebb(evaIds: number[]): AsyncGenerator<RealtimeData> {
        for (let evaId of evaIds) {
            let res = await fetch(`https://realtime-api.grapp.workers.dev/bin/stboard.exe/dn?L=vs_scotty.vs_liveticker&evaId=${evaId}&boardType=dep&productsFilter=1011111111011&additionalTime=0&disableEquivs=yes&maxJourneys=20&outputMode=tickerDataOnly&start=yes&selectDate=today`);
            let data: OebbMonitorResponse = await res.json();
            let identifier: RealtimeIdentifier = {
                type: RealtimeIdentifierType.OEBB,
                value: evaId
            };
            let byLineAndHeadsign: Map<string, Map<string, Date[]>> = new Map();
            for (let journey of data.journey) {
                if (!journey.pr) {
                    console.log(`no journey.pr in journey`, journey);
                    continue;
                }
                if (!journey.st) {
                    console.log(`no journey.st in journey`, journey);
                    continue;
                }
                if (journey.rt && journey.rt.status == "Ausfall") {
                    console.log(`Ausfall not supported yet`, journey);
                    continue;
                }
                let realtime: Date = null;
                if (journey.rt) {
                    realtime = this.parseOebbDate(journey.rt.dld, journey.rt.dlt);
                } else {
                    realtime = this.parseOebbDate(journey.da, journey.ti);
                }
                if (null != realtime) {
                    let byHeadsign: Map<string, Date[]> = byLineAndHeadsign.get(journey.pr) || new Map();
                    let departureTimes = byHeadsign.get(journey.st) || [];
                    departureTimes.push(realtime);
                    byHeadsign.set(journey.st, departureTimes);
                    byLineAndHeadsign.set(journey.pr, byHeadsign);
                } else {
                    console.log(`no departure time in journey`, journey);
                }
            }
            for (let [routeClassName, byHeadsign] of byLineAndHeadsign) {
                for (let [headsign, departureTimes] of byHeadsign) {
                    let realtimeData: RealtimeData = {
                        realtimeIdentifier: identifier,
                        routeClassName: routeClassName,
                        headsign: headsign,
                        times: departureTimes
                    };
                    yield realtimeData;
                }
            }
        }
    }

    async updateRealtimeForStops(realtimeIdentifiers: RealtimeIdentifier[]) {
        let data = await this.getRealtimeForWienerLinien(realtimeIdentifiers.filter(v => v.type == RealtimeIdentifierType.WienerLinien).map(i => i.value));
        for (let realtimeData of data) {
            this.upsertRealtimeData(realtimeData, true);
        }
        for await (let realtimeData of this.getRealtimeForOebb(realtimeIdentifiers.filter(v => v.type == RealtimeIdentifierType.OEBB).map(i => i.value))) {
            this.upsertRealtimeData(realtimeData, true);
        }
    }

    private readLeg(buffer: ArrayBuffer, offset: number): Leg {
        let view = new DataView(buffer, offset, RAPTOR_LEG_SIZE);
        let departureStopId = view.getUint16(4, true);
        let arrivalStopId = view.getUint16(6, true);
        let departureSeconds = view.getUint32(8, true);
        let arrivalSeconds = view.getUint32(12, true);
        let leg: Leg = {
            type: view.getUint32(0, true),
            departureStop: this.routeInfoStore.getStop(departureStopId),
            arrivalStop: this.routeInfoStore.getStop(arrivalStopId),
            plannedDeparture: new Date(departureSeconds * 1000),
            delay: view.getInt16(18, true),
            arrivalTime: new Date(arrivalSeconds * 1000),
            duration: (arrivalSeconds - departureSeconds) * 1000,
            route: null,
            tripId: null,
            isRealtime: false
        };
        if (leg.type == 1) {
            let routeId = view.getUint16(16, true);
            leg.route = this.routeInfoStore.getRoute(routeId);
            leg.tripId = view.getUint32(20, true);
            leg.isRealtime = this.hasRealtime(leg.route.id, leg.tripId);
        }
        return leg;
    }

    private readItinerary(buffer: ArrayBuffer, offset: number): Itinerary {
        let legs = [];
        let view = new DataView(buffer, offset, RAPTOR_ITINERARY_SIZE);
        let numLegs = view.getUint32(0, true);
        for (let i = 0; i < numLegs; i++) {
            legs.push(this.readLeg(buffer, offset + 4 + i * RAPTOR_LEG_SIZE));
        }
        return { legs: legs.reverse() };
    }

    private readResults(memory: WebAssembly.Memory, offset: number): Itinerary[] {
        let itineraries = [];
        let view = new DataView(memory.buffer, offset, RAPTOR_RESULTS_SIZE);
        let numItineraries = view.getUint32(0, true);
        for (let i = 0; i < numItineraries; i++) {
            let itinerary = this.readItinerary(memory.buffer, offset + 4 + i * RAPTOR_ITINERARY_SIZE);
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
            route: this.routeInfoStore.getRoute(routeId).name,
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

    upsertRealtimeData(realtimeData: RealtimeData, apply: boolean) {
        // performance.mark("realtime-upsert-start");
        let routeClasses = this.routeInfoStore.getRouteClassesFotRealtimeIdentifier(realtimeData.realtimeIdentifier);
        let routeShortNameCleaned = realtimeData.routeClassName.replace(/\s/g, "").toLowerCase();
        let routeClassesCleaned = routeClasses.map(c => c.routeClassName.replace(/\s/g, "").toLowerCase());
        let matchingRouteClass = routeClasses[routeClassesCleaned.findIndex(c => c == routeShortNameCleaned)];
        if (!matchingRouteClass) {
            console.log(`no matching route class for ${realtimeData.routeClassName}`);
            return;
        }
        let headsignCleaned = realtimeData.headsign.replace(/^Wien /, "").trim().toLowerCase();
        let headsignVariantsCleaned = matchingRouteClass.headsignVariants.map(h => h.replace(/^Wien /, "").toLowerCase());
        let bestHeadsignVariantMatch = findBestMatch(headsignCleaned, headsignVariantsCleaned);
        this.upsertResolvedRealtimeData({
            headsignVariant: bestHeadsignVariantMatch.bestMatchIndex,
            realtimeIdentifier: realtimeData.realtimeIdentifier,
            routeClass: matchingRouteClass.id,
            times: realtimeData.times
        }, apply);
        // performance.mark("realtime-upsert-end");
        // performance.measure("realtime-upsert", "realtime-upsert-start", "realtime-upsert-end");
        // console.log(`Realtime upsert took ${performance.getEntriesByName("realtime-upsert", "measure")[0].duration}ms`);
        // performance.clearMarks();
        // performance.clearMeasures();
    }

    private upsertResolvedRealtimeData(update: ResolvedRealtimeData, apply: boolean) {
        let memoryOffset = this.routingInstance.exports.get_stoptime_update_memory();
        let dataView = new DataView(this.routingInstance.exports.memory.buffer, memoryOffset, RAPTOR_STOPTIME_UPDATE_SIZE);
        dataView.setUint32(0, update.realtimeIdentifier.value, true);
        dataView.setUint16(4, update.routeClass, true);
        dataView.setUint8(6, update.headsignVariant);
        let date = this.timezoneUtility.getStartOfDay(update.times[0]);
        dataView.setUint8(7, date.dayOfWeek);
        dataView.setUint32(8, date.unixTime / 1000, true);
        dataView.setUint8(12, apply ? 1 : 0);
        let numUpdates = Math.min(update.times.length, RAPTOR_MAX_STOPTIME_UPDATES);
        dataView.setUint8(13, numUpdates);
        dataView.setUint16(14, update.realtimeIdentifier.type, true);
        for (let i = 0; i < numUpdates; i++) {
            dataView.setUint32(16 + i * 4, (+update.times[i] - date.unixTime) / 1000, true);
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