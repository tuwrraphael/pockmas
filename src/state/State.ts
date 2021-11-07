import { Itinerary } from "../lib/Itinerary";

export interface State {
    departureStopResults: { name: string, id: number }[];
    arrivalStopResults: { name: string, id: number }[];
    results: Itinerary[];
}

export type StateChanges = (keyof State)[];