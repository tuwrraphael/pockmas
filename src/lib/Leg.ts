import { LegType } from "./LegType";
import { Stop } from "./Stop";
import { Route } from "./Route";


export interface Leg {
    type: LegType;
    departureStop: Stop;
    arrivalStop: Stop;
    plannedDeparture: Date;
    delay: number;
    arrivalTime: Date;
    duration: number;
    route: Route;
    isRealtime: boolean;
    tripId: number | null;
}


