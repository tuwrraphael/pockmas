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
    });


    // 26A Sonntag, Siebeckstraße, 00:07, 00:27, 00:47
    [
        { d: new Date("2021-11-21T00:07:45.000+0100"), o: 45 },
        { d: new Date("2021-11-21T00:07:00.000+0100"), o: 0 },
        { d: new Date("2021-11-21T00:06:30.000+0100"), o: -30 },
        { d: new Date("2021-11-22T00:29:00.000+0100"), o: 120 },
        { d: new Date("2021-11-22T00:46:00.000+0100"), o: -60 },
        { d: new Date("2021-11-22T00:49:15.000+0100"), o: 135 },
        { d: new Date("2021-11-22T00:47:00.000+0100"), o: 0 },
    ].map((v, i) => {
        it(`updates trip with departure time > 24h (${i})`, () => {
            routingInstance.upsertRealtimeData({
                direction: 0,
                diva: 60200238,
                linie: 426,
                timeReal: [
                    v.d
                ],
                apply: false
            });
            let result = routingInstance.getRealtimeUpdateResult();
            expect(result.length).toBe(1);
            expect(result[0].realtimeOffset).toBe(v.o);
        });
    });


    it("distributes correctly if sequence belongs to different routes", () => {
        routingInstance.upsertRealtimeData({
            direction: 1,
            diva: 60201039,
            linie: 477,
            timeReal: [
                new Date("2021-11-11T15:03:46.000+0100"),
                new Date("2021-11-11T15:13:00.000+0100"),
                new Date("2021-11-11T15:23:15.000+0100"),
                new Date("2021-11-11T15:33:00.000+0100"),
                new Date("2021-11-11T18:43:00.000+0100"),
            ],
            apply: false
        });
        let result = routingInstance.getRealtimeUpdateResult();

        expect(result.length).toBe(5);
        expect(result[0].realtimeOffset).toBe(46);
        expect(result[1].realtimeOffset).toBe(60);
        expect(result[2].realtimeOffset).toBe(15);
        expect(result[3].realtimeOffset).toBe(60);
        expect(result[4].realtimeOffset).toBe(0);
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

    it("realtime route in the morning from Polgarstraße to Kagran", () => {
        let request = {
            departureStops: [161],
            arrivalStop: 3586,
            departureTimes: [new Date(getUnixTime({
                year: 2021,
                month: 11,
                day: 9,
                hours: 9,
                minutes: 36,
                seconds: 0,
            }, vienna))]
        };
        routingInstance.upsertRealtimeData({
            direction: 1,
            diva: 60201031,
            linie: 426,
            timeReal: [
                new Date("2021-11-09T09:41:33.000+0100")
            ],
            apply: true
        });
        let result = routingInstance.route(request);
        expect(result[0].legs[0].delay).toEqual(2*60+33);
    });
});
