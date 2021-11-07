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
            departureStops: [2, 3, 4],
            arrivalStop: 3599,
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
});
