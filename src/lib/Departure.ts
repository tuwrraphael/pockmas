import { Stop } from "./Stop"
import { Route } from "./Route"

export interface Departure {
    route: Route;
    stop: Stop;
    tripId: number | null;
    plannedDeparture: Date;
    delay: number;
    isRealtime: boolean;
}