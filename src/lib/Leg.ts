import { LegType } from "./LegType";
import { LegStop } from "./LegStop";


export interface Leg {
    type: LegType;
    departureStop: LegStop;
    arrivalStop: LegStop;
    plannedDeparture: Date;
    delay: number;
    arrivalTime: Date;
    duration: number;
    route: {
        name: string;
        id: number;
        color: string;
        headsign: string;
    };
    isRealtime: boolean;
    tripId: number | null;
}
