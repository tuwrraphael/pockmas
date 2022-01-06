import { Itinerary } from "./Itinerary";
import { LegType } from "./LegType";
import { RouteInfoStore } from "./RouteInfoStore";
import { RouteUrlEncoder } from "./RouteUrlEncoder";

export class RouteDetailsService {
    constructor(private routeUrlEncoder: RouteUrlEncoder,
        private routeInfoStore: RouteInfoStore) {

    }
    getRouteByUrl(itineraryUrl: string): Itinerary {
        let decoded = this.routeUrlEncoder.decode(itineraryUrl);
        return {
            legs: decoded.legs.map(l => ({
                type: l.type,
                departureStop: this.routeInfoStore.getStop(l.departureStopId),
                arrivalStop: this.routeInfoStore.getStop(l.arrivalStopId),
                route: l.type == LegType.Transit ? this.routeInfoStore.getRoute(l.routeId) : null,
                tripId: l.tripId,
                plannedDeparture: new Date(),
                arrivalTime: new Date(),
                delay: 0,
                duration: 0,
                isRealtime: false
            }))

        }
    }
}