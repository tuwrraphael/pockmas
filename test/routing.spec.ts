import { RoutingService } from "../src/lib/RoutingService";
import { findTimeZone, getUnixTime, populateTimeZones } from "timezone-support/dist/lookup-convert";
import * as tzd from "timezone-support/dist/data-2012-2022";
import { createRoutingService } from "./createRoutingService";

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
            departureStops: [397,398,399,400,401,402],
            arrivalStop: 156,
            departureTimes: [new Date(getUnixTime({
                year: 2021,
                month: 11,
                day: 1,
                hours: 0,
                minutes: 1,
                seconds: 0,
            }, vienna))]
        });
        expect(result.length).toBeGreaterThan(0);
    });

    it("can hop on after midnight journey of before serviceday", () => {
        let result = routingInstance.route({
            departureStops: [2416], // Siebeckstraße
            arrivalStop: 156, // Polgarstraße
            departureTimes: [new Date(getUnixTime({
                year: 2021,
                month: 11,
                day: 10,
                hours: 0,
                minutes: 1,
                seconds: 0,
            }, vienna))]
        });
        expect(result[0].legs[0].type).toBe(1);
        expect(result[0].legs[0].plannedDeparture).toEqual(new Date("2021-11-10T00:07:00.000+0100"));
    });
});
