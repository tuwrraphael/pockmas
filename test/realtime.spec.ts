import { RoutingService } from "../src/lib/RoutingService";
import { findTimeZone, getUnixTime, populateTimeZones } from "timezone-support/dist/lookup-convert";
import * as tzd from "timezone-support/dist/data-2012-2022";
import { createRoutingService } from "./createRoutingService";

describe("realtime", () => {
    let routingInstance: RoutingService;
    let vienna: any;

    beforeAll(() => {
        populateTimeZones(tzd);
    })

    beforeEach(async () => {
        routingInstance = await createRoutingService();
        vienna = findTimeZone("Europe/Vienna");
    });

    it("updates realtime for 22A Kagran", () => {
        routingInstance.upsertRealtimeData({
            direction: 0,
            diva: 60200627,
            linie: 422,
            timeReal: [
                new Date("2021-10-29T18:29:02.000+0200")
            ],
            apply: false
        });
        let result = routingInstance.getRealtimeUpdateResult();

        expect(result.length).toBe(1);
        expect(result[0].route).toBe("22A");
        expect(result[0].realtimeOffset).toBe(2);
        expect(result[0].numMatches).toBe(1);

    });

    it("get realtime route from Aspernstraße to Groß-Enzersdorf", () => {
        let request = {
            departureStops: [2624],
            arrivalStop: 13,
            departureTimes: [new Date(getUnixTime({
                year: 2021,
                month: 10,
                day: 29,
                hours: 18,
                minutes: 36,
                seconds: 0,
            }, vienna))]
        };

        let resultBeforeRealtime = routingInstance.route(request);

        routingInstance.upsertRealtimeData({
            direction: 0,
            diva: 60200299,
            linie: 426,
            timeReal: [
                new Date("2021-10-29T18:30:33.000+0200"),
                new Date("2021-10-29T18:37:29.000+0200"),
                new Date("2021-10-29T18:44:04.000+0200"),
                new Date("2021-10-29T18:50:20.000+0200"),
                new Date("2021-10-29T18:57:00.000+0200"),
            ],
            apply: true
        });

        let result = routingInstance.route(request);

        expect(resultBeforeRealtime[0].legs[0].plannedDeparture).toEqual(new Date("2021-10-29T18:37:00.000+0200"));
        expect(resultBeforeRealtime[0].legs[0].delay).toEqual(0);
        expect(result[0].legs[0].plannedDeparture).toEqual(new Date("2021-10-29T18:37:00.000+0200"));
        expect(result[0].legs[0].delay).toEqual(29);
    });
});
