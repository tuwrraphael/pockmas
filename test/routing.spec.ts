import { RoutingService } from "../src/lib/RoutingService";
import { findTimeZone, getUnixTime, populateTimeZones } from "timezone-support/dist/lookup-convert";
import * as tzd from "timezone-support/dist/data-2012-2022";
import { createRoutingService } from "./createRoutingService";
import { LegType } from "../src/lib/LegType";

describe("routing", () => {
    let routingInstance: RoutingService;
    let vienna: any;

    beforeAll(async () => {
        populateTimeZones(tzd);
        vienna = findTimeZone("Europe/Vienna");
        routingInstance = await createRoutingService();
    })

    it("can get home on halloween", () => {
        let result = routingInstance.route({
            departureStops: [384, 385, 386, 387, 388, 389],
            arrivalStop: 156,
            departureTimes: [new Date(getUnixTime({
                year: 2022,
                month: 11,
                day: 1,
                hours: 0,
                minutes: 1,
                seconds: 0,
            }, vienna))]
        });
        expect(result.length).toBeGreaterThan(0);
    });

    it("uses the U4 -> U2 transfer at Schottenring", () => {
        let result = routingInstance.route({
            departureStops: [2683],
            arrivalStop: 2136,
            departureTimes: [new Date(getUnixTime({
                year: 2022,
                month: 11,
                day: 1,
                hours: 0,
                minutes: 1,
                seconds: 0,
            }, vienna))]
        });
        expect(result.length).toBeGreaterThan(0);
        let routeWithU2AndU4 = result.find(r => r.legs.some(r => r.route?.name == "U4") && r.legs.some(r => r.route?.name == "U2"));
        expect(routeWithU2AndU4).toBeDefined();
        expect(routeWithU2AndU4.legs[0].route.name).toBe("U4");
        expect(routeWithU2AndU4.legs[0].arrivalStop.stopName).toBe("Schottenring");
        expect(routeWithU2AndU4.legs[2].route.name).toBe("U2");
        expect(routeWithU2AndU4.legs[2].departureStop.stopName).toBe("Schottenring");
        expect(routeWithU2AndU4.legs[1].type).toBe(LegType.Walking);
        expect(routeWithU2AndU4.legs[1].duration).toBeLessThan(4 * 60 * 1000);
    });

    it("can hop on after midnight journey of before serviceday", () => {
        let result = routingInstance.route({
            departureStops: [2333], // Siebeckstraße
            arrivalStop: 153, // Polgarstraße
            departureTimes: [new Date(getUnixTime({
                year: 2022,
                month: 11,
                day: 10,
                hours: 0,
                minutes: 1,
                seconds: 0,
            }, vienna))]
        });
        expect(result[0].legs[0].type).toBe(1);
        expect(result[0].legs[0].route.name).toBe("26A");
        expect(result[0].legs[0].plannedDeparture).toEqual(new Date("2022-11-10T00:07:00.000+0100"));
    });
});
