import { RaptorExports } from "../../raptor/wasm-exports";
import { Itinerary } from "./Itinerary";
import { Leg } from "./Leg";
import { LegType } from "./LegType";
import { RouteInfoStore } from "./RouteInfoStore";
import { DecodedItinerary, RouteUrlEncoder } from "./RouteUrlEncoder";
import { RoutingService } from "./RoutingService";
import { TimezoneUtility } from "./TimezoneUtility";

const STOPTIME_LOOKUP_RESULT_SIZE = 4 + //planned_departure
    4 + // planned_arrival
    2; // delay

export class RouteDetailsService {
    constructor(private routeUrlEncoder: RouteUrlEncoder,
        private routeInfoStore: RouteInfoStore,
        private routingInstance: WebAssemblyInstance<RaptorExports>,
        private routingService: RoutingService,
        private timezoneUtility: TimezoneUtility) {
    }

    private getStoptime(routeId: number, stopId: number, trip: number, departureDate: Date) {
        let offset = this.routingInstance.exports.get_stoptime(routeId, stopId, trip, this.timezoneUtility.getStartOfDay(departureDate).unixTime / 1000);
        let view = new DataView(this.routingInstance.exports.memory.buffer, offset, STOPTIME_LOOKUP_RESULT_SIZE);
        return {
            plannedDeparture: new Date(view.getUint32(0, true) * 1000),
            plannedArrival: new Date(view.getUint32(4, true) * 1000),
            delay: view.getInt16(8, true)
        };
    }

    private reconstructLeg(l: DecodedItinerary["legs"][0], legDepartureTime: Date, legDelay : number) {
        switch (l.type) {
            case LegType.Transit: {
                let departureStoptime = this.getStoptime(l.routeId, l.departureStopId, l.tripId, legDepartureTime);
                let arrivalStoptime = this.getStoptime(l.routeId, l.arrivalStopId, l.tripId, legDepartureTime);
                return {
                    type: LegType.Transit,
                    departureStop: this.routeInfoStore.getStop(l.departureStopId),
                    arrivalStop: this.routeInfoStore.getStop(l.arrivalStopId),
                    route: this.routeInfoStore.getRoute(l.routeId),
                    arrivalTime: arrivalStoptime.plannedArrival,
                    plannedDeparture: departureStoptime.plannedDeparture,
                    delay: departureStoptime.delay,
                    duration: +arrivalStoptime.plannedArrival - +departureStoptime.plannedDeparture,
                    isRealtime: this.routingService.hasRealtime(l.routeId, l.tripId),
                    tripId: l.tripId
                };
            }
            case LegType.Walking: {
                let duration = this.routingInstance.exports.get_transfer_time(l.departureStopId, l.arrivalStopId);
                return {
                    type: LegType.Walking,
                    departureStop: this.routeInfoStore.getStop(l.departureStopId),
                    arrivalStop: this.routeInfoStore.getStop(l.arrivalStopId),
                    route: null,
                    tripId: null,
                    plannedDeparture: legDepartureTime,
                    arrivalTime: new Date(+legDepartureTime + (duration * 1000)),
                    delay: legDelay,
                    duration: duration * 1000,
                    isRealtime: false
                };
            }
        }
    }

    getRouteByUrl(itineraryUrl: string): Itinerary {
        let decoded = this.routeUrlEncoder.decode(itineraryUrl);
        let legs: Leg[] = [];
        let legDepartureTime = decoded.departureTime;
        let legDelay = 0;
        for (let l of decoded.legs) {
            let leg = this.reconstructLeg(l, legDepartureTime, legDelay);
            legs.push(leg);
            legDepartureTime = leg.arrivalTime;
            legDelay = leg.delay;
        }
        return {
            legs: legs
        }
    }
}