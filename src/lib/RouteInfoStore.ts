export class RouteInfoStore {
    constructor(private routeNames: [string, string, number, string | null][],
        private stops: [string, number][]) {

    }

    getDiva(stopId: number) {
        return this.stops[stopId][1];
    }

    getStop(stopId: number): {
        stopId: number;
        stopName: string;
    } {
        if (stopId > this.stops.length) {
            throw new Error(`Invalid stop id ${stopId}`);
        }
        return {
            stopId: stopId,
            stopName: this.stops[stopId][0]
        };
    }

    getRoute(routeId: number): {
        name: string;
        id: number;
        color: string;
        headsign: string;
    } {
        if (routeId > this.routeNames.length) {
            throw new Error(`Invalid route id ${routeId}`);
        }
        return {
            name: this.routeNames[routeId][0],
            id: routeId,
            color: this.routeNames[routeId].length > 3 ? this.routeNames[routeId][3] : (this.routeNames[routeId][2] == 0 ? "c4121a" : ""),
            headsign: this.routeNames[routeId][1]
        };
    }
}