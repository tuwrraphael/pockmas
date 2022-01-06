import { populateTimeZones } from "timezone-support/dist/lookup-convert";
import * as tzd from "timezone-support/dist/data-2012-2022";
import { getStartOfDayVienna } from "./getStartOfDayVienna";
import { RouteUrlEncoder } from "./RouteUrlEncoder";
import { Leg } from "./Leg";
import { LegType } from "./LegType";

describe("RouteUrlService", () => {
    beforeAll(() => {
        populateTimeZones(tzd);
    })


    it(`decodes/encodes journey`, () => {
        let routeUrlService = new RouteUrlEncoder("abc");

        let encoded = routeUrlService.encode({
            legs: [{
                type: LegType.Walking,
                departureStop: { stopId: 1, stopName: "A" },
                arrivalStop: { stopId: 2, stopName: "B" },
                plannedDeparture: new Date(2022, 0, 1, 12, 31, 0),
                route: null,
                tripId: null,
            }, {
                type: LegType.Transit,
                departureStop: { stopId: 2, stopName: "B" },
                arrivalStop: { stopId: 4517, stopName: "C" },
                plannedDeparture: new Date(2022, 0, 1, 12, 41, 0),
                route: {
                    id: 991,
                },
                tripId: 615,
            }]
        })
        expect(encoded).toBe("1AnQ70GEAAQACAAECAKUR3wNnAg!abc");
        let decoded = routeUrlService.decode(encoded);
        expect(decoded.version).toBe(1);
        expect(decoded.departureTime).toEqual(new Date(2022, 0, 1, 12, 31, 0));
        expect(decoded.legs.length).toEqual(2);

        expect(decoded.legs[0].type).toEqual(LegType.Walking);
        expect(decoded.legs[0].departureStopId).toEqual(1);
        expect(decoded.legs[0].arrivalStopId).toEqual(2);

        expect(decoded.legs[1].type).toEqual(LegType.Transit);
        expect(decoded.legs[1].departureStopId).toEqual(2);
        expect(decoded.legs[1].arrivalStopId).toEqual(4517);
        expect(decoded.legs[1].routeId).toEqual(991);
        expect(decoded.legs[1].tripId).toEqual(615);
    });

    it(`decodes/encodes empty`, () => {
        let routeUrlService = new RouteUrlEncoder("abc");

        let encoded = routeUrlService.encode({ legs: [] })
        expect(encoded).toBe("1AAAAAAA!abc");
        let decoded = routeUrlService.decode(encoded);
        expect(decoded.version).toBe(1);
        expect(decoded.departureTime).toEqual(new Date(0));
        expect(decoded.legs.length).toEqual(0);
    });


});
