import { RaptorExports } from "../../raptor/wasm-exports";
import { Itinerary } from "./Itinerary";
import { Leg } from "./Leg";
import { LegType } from "./LegType";
import { RouteInfoStore } from "./RouteInfoStore";
import { DecodedItinerary, RouteUrlEncoder } from "./RouteUrlEncoder";
import { RoutingService } from "./RoutingService";
import { TimezoneUtility } from "./time/TimezoneUtility";
import { getDayOffset } from "./time/getDayOffset";
import { addDays } from "./time/addDays";

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

    private getStoptime(routeId: number, stopId: number, trip: number) {
        let offset = this.routingInstance.exports.get_stoptime(routeId, stopId, trip);
        let view = new DataView(this.routingInstance.exports.memory.buffer, offset, STOPTIME_LOOKUP_RESULT_SIZE);
        return {
            departureTime: view.getUint32(0, true),
            arrivalTime: view.getUint32(4, true),
            delay: view.getInt16(8, true)
        };
    }

    private reconstructTimes(stopTime: { departureStopDepartureTime: number, arrvialStopArrivalTime: number },
        itineraryDepartureStartOfDay: { unixTime: number }, expectedDayOffset: number) {
        let departureTime = new Date(itineraryDepartureStartOfDay.unixTime + stopTime.departureStopDepartureTime * 1000);
        let dayOffset = getDayOffset(itineraryDepartureStartOfDay, departureTime);
        return {
            plannedDeparture: addDays(departureTime, expectedDayOffset - dayOffset),
            plannedArrival: addDays(new Date(itineraryDepartureStartOfDay.unixTime + stopTime.arrvialStopArrivalTime * 1000), expectedDayOffset - dayOffset)
        };
    }

    private reconstructLeg(l: DecodedItinerary["legs"][0], itineraryDepartureStartOfDay: { unixTime: number }, legDepartureTime: Date, legDelay: number) {
        switch (l.type) {
            case LegType.Transit: {
                let departureStoptime = this.getStoptime(l.routeId, l.departureStopId, l.tripId);
                let arrivalStoptime = this.getStoptime(l.routeId, l.arrivalStopId, l.tripId);
                let times = this.reconstructTimes({
                    departureStopDepartureTime: departureStoptime.departureTime,
                    arrvialStopArrivalTime: arrivalStoptime.arrivalTime
                }, itineraryDepartureStartOfDay, l.dayOffset);
                return {
                    type: LegType.Transit,
                    departureStop: this.routeInfoStore.getStop(l.departureStopId),
                    arrivalStop: this.routeInfoStore.getStop(l.arrivalStopId),
                    route: this.routeInfoStore.getRoute(l.routeId),
                    arrivalTime: times.plannedArrival,
                    plannedDeparture: times.plannedDeparture,
                    delay: departureStoptime.delay,
                    duration: +times.plannedArrival - +times.plannedDeparture,
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
        let itineraryDepartureStartOfDay = this.timezoneUtility.getStartOfDay(decoded.departureTime);
        let legDelay = 0;
        for (let l of decoded.legs) {
            let leg = this.reconstructLeg(l, itineraryDepartureStartOfDay, legDepartureTime, legDelay);
            legs.push(leg);
            legDepartureTime = leg.arrivalTime;
            legDelay = leg.delay;
        }
        return {
            legs: legs
        }
    }
}