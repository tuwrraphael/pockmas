import { Departure } from "../lib/Departure";
import { ItineraryDisplayModel } from "./models/ItineraryDisplayModel";

export interface State {
    departureStopResults: { name: string, id: number }[];
    arrivalStopResults: { name: string, id: number }[];
    departures: Departure[];
    results: ItineraryDisplayModel[];
    routeDetail: ItineraryDisplayModel;
    selectedStopgroups: {
        departure: {
            id: number;
            name: string;
        },
        arrival: {
            id: number;
            name: string;
        }
    }
}

export type StateChanges = (keyof State)[];