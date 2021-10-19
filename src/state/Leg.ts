import { LegType } from "./LegType";
import { LegStop } from "./LegStop";


export interface Leg {
    type: LegType;
    departureStop: LegStop;
    arrivalStop: LegStop;
    departureTime: Date;
    arrivalTime: Date;
    route: {
        name: string;
        id: number;
    };
    tripId: number | null;
}
