import { RoutingService } from "../src/lib/RoutingService";
import { findTimeZone, getUnixTime, populateTimeZones } from "timezone-support/dist/lookup-convert";
import * as tzd from "timezone-support/dist/data-2012-2022";
import { createRoutingService } from "./createRoutingService";
import { LegType } from "../src/lib/LegType";

describe("routing", () => {
    let routingInstance: RoutingService;
    let stopgroupIndex: { name: string, stopIds: number[] }[];
    let vienna: any;

    beforeAll(async () => {
        populateTimeZones(tzd);
        vienna = findTimeZone("Europe/Vienna");
        routingInstance = await createRoutingService();
        stopgroupIndex = await (await fetch(new URL("../preprocessing-dist/stopgroup-index.json", import.meta.url).toString())).json();
    })

    it("can get home on halloween", () => {

        let departureTime = new Date(getUnixTime({
            year: 2022,
            month: 11,
            day: 1,
            hours: 0,
            minutes: 1,
            seconds: 0,
        }, vienna));

        let departureStops = stopgroupIndex.find(n => n.name == "Rochusgasse").stopIds;

        let result = routingInstance.route({
            departureStops: departureStops,
            arrivalStop: stopgroupIndex.find(n => n.name == "Donaustadtstraße").stopIds[0],
            departureTimes: new Array(departureStops.length).fill(departureTime)
        });
        expect(result.length).toBeGreaterThan(0);
    });

    it("uses the U4 -> U2 transfer at Schottenring", () => {
        let departureStops = stopgroupIndex.find(n => n.name == "Friedensbrücke").stopIds;
        let departureTime = new Date(getUnixTime({
            year: 2022,
            month: 11,
            day: 1,
            hours: 0,
            minutes: 1,
            seconds: 0,
        }, vienna));
        let result = routingInstance.route({
            departureStops: departureStops,
            arrivalStop: stopgroupIndex.find(n => n.name == "Taborstraße").stopIds[0],
            departureTimes: new Array(departureStops.length).fill(departureTime)
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
        let departureStops = stopgroupIndex.find(n => n.name == "Siebeckstraße").stopIds;
        let departureTime = new Date(getUnixTime({
            year: 2022,
            month: 11,
            day: 10,
            hours: 0,
            minutes: 1,
            seconds: 0,
        }, vienna));
        let result = routingInstance.route({
            departureStops: departureStops,
            arrivalStop: stopgroupIndex.find(n => n.name == "Polgarstraße").stopIds[0],
            departureTimes: new Array(departureStops.length).fill(departureTime)
        });
        expect(result[0].legs[0].type).toBe(1);
        expect(result[0].legs[0].route.name).toBe("26A");
        expect(result[0].legs[0].plannedDeparture).toEqual(new Date("2022-11-10T00:07:00.000+0100"));
    });
});
