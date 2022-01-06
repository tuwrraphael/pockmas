import { Itinerary } from "../lib/Itinerary";
import { ItineraryDisplayModel } from "./models/ItineraryDisplayModel";

export interface State {
    departureStopResults: { name: string, id: number }[];
    arrivalStopResults: { name: string, id: number }[];
    results: ItineraryDisplayModel[];
    routeDetail: ItineraryDisplayModel;
}

export type StateChanges = (keyof State)[];