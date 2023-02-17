import { LegType } from "./LegType";
import { Base64 } from "js-base64";
import { Stop } from "./Stop";
import { TimezoneUtility } from "./time/TimezoneUtility";
import { getDayOffset } from "./time/getDayOffset";

const UrlVersion = 2;

export interface DecodedItinerary {
    departureTime: Date;
    version: number;
    legs: {
        dayOffset: number;
        type: LegType;
        departureStopId: number;
        arrivalStopId: number;
        routeId: number;
        tripId: number;
    }[];

}

class DataVersionMismatchError extends Error {
    constructor(public expected: string, public actual: string) {
        super(`Data version mismatch - expected ${expected}, actual ${actual}`);
    }
}

export class RouteUrlEncoder {
    public readonly UrlVersion = UrlVersion;

    constructor(private dataVersion: string, private timezoneUtility: TimezoneUtility) {

    }

    private getEncodedString(binary: Uint8Array): string {
        return `${UrlVersion}${Base64.fromUint8Array(binary, true)}!${this.dataVersion}`
    }

    encode(r: {
        legs: {
            type: LegType;
            departureStop: Stop;
            arrivalStop: Stop;
            route: {
                id: number;
            };
            tripId: number | null;
            plannedDeparture: Date;
        }[]
    }): string {
        let binary = new Uint8Array(1 + 4 + r.legs.filter(v => v.type == LegType.Transit).length * 10 +
            r.legs.filter(v => v.type == LegType.Walking).length * 5);
        let view = new DataView(binary.buffer);
        view.setUint8(0, r.legs.length);
        if (r.legs.length < 1) {
            return this.getEncodedString(binary);
        }
        view.setUint32(1, r.legs.length > 0 ? (r.legs[0].plannedDeparture.getTime() / 1000) : 0, true);
        let itineraryDepartureStartOfDay = this.timezoneUtility.getStartOfDay(r.legs[0].plannedDeparture);
        let offset = 5;
        for (let l of r.legs) {
            view.setUint8(offset + 0, l.type);
            view.setUint16(offset + 1, l.departureStop.stopId, true);
            view.setUint16(offset + 3, l.arrivalStop.stopId, true);
            offset += 5;
            if (l.type === LegType.Transit) {
                view.setUint16(offset, l.route?.id || 0, true);
                view.setUint16(offset + 2, l.tripId || 0, true);
                view.setUint8(offset + 4, getDayOffset(itineraryDepartureStartOfDay, l.plannedDeparture));
                offset += 5;
            }
        }
        return this.getEncodedString(binary);
    }

    decode(url: string): DecodedItinerary {
        let version = parseInt(url.substr(0, 1));
        switch (version) {
            case 1:
                return this.decodeV1(url);
            case 2:
                return this.decodeV2(url);
            default:
                break;
        }
        throw new Error(`Unsupported version ${version}`);
    }

    private decodeV2(url: string): DecodedItinerary {
        let [data, dataVersion] = url.substr(1).split("!");
        if (dataVersion !== this.dataVersion) {
            throw new DataVersionMismatchError(this.dataVersion, dataVersion);
        }
        let binary = Base64.toUint8Array(data);
        let view = new DataView(binary.buffer);
        let numLegs = view.getUint8(0);
        let departureTime = new Date(view.getUint32(1, true) * 1000);
        let legs: {
            type: LegType;
            departureStopId: number;
            arrivalStopId: number;
            routeId: number;
            tripId: number;
            dayOffset: number;
        }[] = [];
        let offset = 5;
        for (let i = 0; i < numLegs; i++) {
            let type = view.getUint8(offset + 0);
            let departureStopId = view.getUint16(offset + 1, true);
            let arrivalStopId = view.getUint16(offset + 3, true);
            offset += 5;
            if (type === LegType.Transit) {
                let routeId = view.getUint16(offset, true);
                let tripId = view.getUint16(offset + 2, true);
                let dayOffset = view.getUint8(offset + 4);
                offset += 5;
                legs.push({
                    type,
                    departureStopId,
                    arrivalStopId,
                    routeId,
                    tripId,
                    dayOffset: dayOffset
                });
            } else {
                legs.push({
                    type,
                    departureStopId,
                    arrivalStopId,
                    routeId: null,
                    tripId: null,
                    dayOffset: 0
                });
            }
        }
        return {
            departureTime,
            version: 1,
            legs
        };
    }

    private decodeV1(url: string): DecodedItinerary {
        let [data, dataVersion] = url.substr(1).split("!");
        if (dataVersion !== this.dataVersion) {
            throw new DataVersionMismatchError(this.dataVersion, dataVersion);
        }
        let binary = Base64.toUint8Array(data);
        let view = new DataView(binary.buffer);
        let numLegs = view.getUint8(0);
        let departureTime = new Date(view.getUint32(1, true) * 1000);
        let legs: {
            type: LegType;
            departureStopId: number;
            arrivalStopId: number;
            routeId: number;
            tripId: number;
            dayOffset: number;
        }[] = [];
        let offset = 5;
        for (let i = 0; i < numLegs; i++) {
            let type = view.getUint8(offset + 0);
            let departureStopId = view.getUint16(offset + 1, true);
            let arrivalStopId = view.getUint16(offset + 3, true);
            offset += 5;
            if (type === LegType.Transit) {
                let routeId = view.getUint16(offset, true);
                let tripId = view.getUint16(offset + 2, true);
                offset += 4;
                legs.push({
                    type,
                    departureStopId,
                    arrivalStopId,
                    routeId,
                    tripId,
                    dayOffset: 0
                });
            } else {
                legs.push({
                    type,
                    departureStopId,
                    arrivalStopId,
                    routeId: null,
                    tripId: null,
                    dayOffset: 0
                });
            }
        }
        return {
            departureTime,
            version: 1,
            legs
        };
    }


}