import { RealtimeIdentifier } from "./RealtimeIdentifier";
import { Route } from "./Route";
import { RouteClass } from "./RouteClass";
import { Stop } from "./Stop";

export class RouteInfoStore {
    constructor(private routes: [routeClass: number, headsignVariant: number][],
        private routeClasses: {
            routeClassName: string;
            headsignVariants: string[],
            routeType: number;
            routeColor?: string;
        }[],
        private routeClassesByRealtimeIdentifier: [realtimeIdentiferType: number, realtimeIdentifier: number, ...routeClasses: number[]][],
        private stops: [name: string, realtimeIdentifierType?: number, realtimeIdentifier?: number][]) {

    }

    getRealtimeIdentifier(stopId: number): RealtimeIdentifier {
        if (this.stops[stopId].length < 1) {
            return null;
        }
        return {
            type: this.stops[stopId][1],
            value: this.stops[stopId][2]
        };
    }

    getStop(stopId: number): Stop {
        if (stopId > this.stops.length) {
            throw new Error(`Invalid stop id ${stopId}`);
        }
        return {
            stopId: stopId,
            stopName: this.stops[stopId][0]
        };
    }

    getRoute(routeId: number): Route {
        if (routeId > this.routes.length) {
            throw new Error(`Invalid route id ${routeId}`);
        }
        let route = this.routes[routeId];
        let routeClass = this.routeClasses[route[0]];
        let color = "";
        if (routeClass.routeColor) {
            color = routeClass.routeColor;
        } else if (routeClass.routeType == 0) {
            color = "c4121a";
        }
        return {
            name: this.routeClasses[route[0]].routeClassName,
            id: routeId,
            color: color,
            headsign: routeClass.headsignVariants[route[1]]
        };
    }

    getRouteClassesFotRealtimeIdentifier(realtimeIdentifier: RealtimeIdentifier): RouteClass[] {
        let realtimeIdentifierType = realtimeIdentifier.type;
        let realtimeIdentifierValue = realtimeIdentifier.value;
        let routeClasses = this.routeClassesByRealtimeIdentifier.find(r => r[0] == realtimeIdentifierType && r[1] == realtimeIdentifierValue).slice(2);
        return routeClasses.map(id => ({
            routeClassName: this.routeClasses[id].routeClassName,
            headsignVariants: this.routeClasses[id].headsignVariants,
            id: id
        }));
    }
}
