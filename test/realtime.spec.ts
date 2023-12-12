import { RoutingService } from "../src/lib/RoutingService";
import { findTimeZone, getUnixTime, populateTimeZones } from "timezone-support/lookup-convert";
import tzd from "timezone-support/data-1970-2038";
import { RoutingServicesFactory } from "../src/lib/RoutingServicesFactory";
import { RealtimeIdentifierType } from "../src/lib/RealtimeIdentifierType";

describe("realtime", () => {
    let routingInstance: RoutingService;
    let stopgroupIndex: { name: string, stopIds: number[] }[];
    let vienna: any;

    beforeAll(() => {
        populateTimeZones(tzd);
    })

    beforeEach(async () => {
        routingInstance = await new RoutingServicesFactory().getRoutingService();
        vienna = findTimeZone("Europe/Vienna");
        stopgroupIndex = await (await fetch(new URL("../preprocessing-dist/stopgroup-index.json", import.meta.url).toString())).json();
    });


    //     it("updates realtime for S80 Erzherzog Karl Straße", () => {
    //         routingInstance.upsertRealtimeData({
    //             realtimeIdentifier: {
    //                 type: RealtimeIdentifierType.OEBB,
    //                 value: 8100756
    //             },
    //             routeClassName: "S 80",
    //             headsign: "Wien Aspern Nord Bahnhof",
    //             times: [
    //                 new Date("2022-08-21T17:09:00.000+0200"), // 46 = 16:12:00 +57 = 17:09
    //                 new Date("2022-08-21T17:24:00.000+0200"), // 48 = 16:42:00 +42 = 17:24
    //                 new Date("2022-08-21T17:39:00.000+0200"), // +27 = 18:06
    //                 new Date("2022-08-21T17:54:00.000+0200"), // +12 = 18:06
    //                 new Date("2022-08-21T18:09:00.000+0200"), // -3 = 18:06
    //                 // new Date("2022-08-21T18:24:00.000+0200"),
    //                 // new Date("2022-08-21T18:39:00.000+0200"),
    //                 // new Date("2022-08-21T18:54:00.000+0200"),
    //                 // new Date("2022-08-21T19:09:00.000+0200")
    //             ],

    //         }, true);



    //     let result = routingInstance.getRealtimeUpdateResult();
    //     console.log(result.map(r => `${r.routeId}:${r.route} ${r.trip} ${r.realtimeOffset / 60}`).join("\n"));

    //     let departureResult = routingInstance.getDepartures({
    //         departureStops: [{
    //             stopId: 36,
    //             departureTime: new Date("2022-08-21T17:00:00.000+0200")
    //         }]
    //     }).filter(s => s.route.headsign == "Wien Aspern Nord Bahnhof");
    // console.log(departureResult.map(s => `${s.plannedDeparture} ${s.route.id}:${s.tripId} ${s.route.headsign}`).join("\n"));

    //     expect(result.length).toBe(1);
    //     expect(result[0].route).toBe("S 80");
    //     expect(result[0].realtimeOffset).toBe(2);
    // });


    it("updates realtime for 22A Kagran", () => {
        routingInstance.upsertRealtimeData({
            realtimeIdentifier: {
                type: RealtimeIdentifierType.WienerLinien,
                value: 60200627
            },
            routeClassName: "22A",
            headsign: "Aspernstraße",
            times: [
                new Date("2024-10-19T18:29:02.000+0200") // saturday
            ],

        }, false);
        let result = routingInstance.getRealtimeUpdateResult();
        expect(result.length).toBe(1);
        expect(result[0].route).toBe("22A");
        expect(result[0].realtimeOffset).toBe(2);
    });

    it("updates realtime for 25 if its very late", () => {
        let realtimes = [
            513, // 8:33
            163, // 2:43
            -2,
            0
        ];
        let day = "2024-11-19T"; // tuesday
        let planTimes = [
            "18:51",
            "18:59",
            "19:06",
            "19:14",
        ];
        let times = [
            new Date(+new Date(`${day}${planTimes[0]}:00.000+0100`) + realtimes[0] * 1000),
            new Date(+new Date(`${day}${planTimes[1]}:00.000+0100`) + realtimes[1] * 1000),
            new Date(+new Date(`${day}${planTimes[2]}:00.000+0100`) + realtimes[2] * 1000),
            new Date(+new Date(`${day}${planTimes[3]}:00.000+0100`) + realtimes[3] * 1000)
        ];
        routingInstance.upsertRealtimeData({
            realtimeIdentifier: {
                type: RealtimeIdentifierType.WienerLinien,
                value: 60201031 // Polgarstaße
            },
            routeClassName: "25",
            headsign: "Oberdorfstraße",
            times: times,
        }, false);
        let result = routingInstance.getRealtimeUpdateResult();

        expect(result[0].realtimeOffset).toBe(realtimes[0]);
        expect(result[1].realtimeOffset).toBe(realtimes[1]);
        expect(result[2].realtimeOffset).toBe(realtimes[2]);
        expect(result[3].realtimeOffset).toBe(realtimes[3]);
        for (let r of result) {
            expect(r.route).toBe("25");
        }
    });

    it("updates next U1", () => {
        routingInstance.upsertRealtimeData({
            realtimeIdentifier: {
                type: RealtimeIdentifierType.WienerLinien,
                value: 60200627 // Kagran
            },
            routeClassName: "U1",
            headsign: "OBERLAA          ",
            times: [
                // sunday
                new Date("2024-11-24T14:06:55.000+0100"),
            ],
        }, false);
        let result = routingInstance.getRealtimeUpdateResult();
        expect(result[0].route).toBe("U1");
        expect(result[0].realtimeOffset).toBe(55);
        routingInstance.upsertRealtimeData({
            realtimeIdentifier: {
                type: RealtimeIdentifierType.WienerLinien,
                value: 60200627
            },
            routeClassName: "U1",
            headsign: "Alaudagasse",
            times: [
                // sunday
                new Date("2024-11-24T14:12:55.000+0100")
            ],
        }, false);
        result = routingInstance.getRealtimeUpdateResult();
        expect(result[0].route).toBe("U1");
        expect(result[0].realtimeOffset).toBe(115);
    });

    // 26A Dienstag/Mittwoch, Siebeckstraße, 00:07, 00:27, 00:47
    [
        { d: new Date("2024-11-19T00:07:45.000+0100"), o: 45 },
        { d: new Date("2024-11-19T00:07:00.000+0100"), o: 0 },
        { d: new Date("2024-11-19T00:06:30.000+0100"), o: -30 },
        { d: new Date("2024-11-20T00:29:00.000+0100"), o: 7*60 },
        { d: new Date("2024-11-20T00:46:00.000+0100"), o: -60 },
        { d: new Date("2024-11-20T00:49:15.000+0100"), o: 135 },
        { d: new Date("2024-11-20T00:47:00.000+0100"), o: 0 },
    ].map((v, i) => {
        it(`updates trip with departure time > 24h (${i})`, () => {
            routingInstance.upsertRealtimeData({
                headsign: "Groß-Enzersdorf",
                realtimeIdentifier: {
                    type: RealtimeIdentifierType.WienerLinien,
                    value: 60200238
                },
                routeClassName: "26A",
                times: [
                    v.d
                ]
            }, false);
            let result = routingInstance.getRealtimeUpdateResult();
            expect(result.length).toBe(1);
            expect(result[0].route).toBe("26A");
            expect(result[0].realtimeOffset).toBe(v.o);
        });
    });


    it("distributes correctly if sequence belongs to different routes", () => {
        let day = "04"; // monday
        routingInstance.upsertRealtimeData({
            headsign: "Rennweg",
            realtimeIdentifier: {
                type: RealtimeIdentifierType.WienerLinien,
                value: 60201039 // Praterbrücke
            },
            routeClassName: "77A",
            times: [
                new Date(`2024-11-${day}T15:03:46.000+0100`),
                new Date(`2024-11-${day}T15:13:11.000+0100`),
                new Date(`2024-11-${day}T15:23:15.000+0100`),
                new Date(`2024-11-${day}T15:33:14.000+0100`),
                new Date(`2024-11-${day}T15:43:00.000+0100`),
            ]
        }, false);
        let result = routingInstance.getRealtimeUpdateResult();
        expect(result.length).toBe(5);
        for (let r of result) {
            expect(r.route).toBe("77A");
        }
        expect(result[0].realtimeOffset).toBe(46);
        expect(result[1].realtimeOffset).toBe(11);
        expect(result[2].realtimeOffset).toBe(15);
        expect(result[3].realtimeOffset).toBe(14);
        expect(result[4].realtimeOffset).toBe(0);
    });

    [
        // saturday
        { d: new Date("2024-11-16T01:12:00.000+0100"), o: 60 },
        { d: new Date("2024-11-16T01:07:00.000+0100"), o: -4 * 60 },
    ].map((v, i) => {
        it(`updates first nightline (${i})`, () => {
            routingInstance.upsertRealtimeData({
                headsign: "Eßling, Stadtgrenze",
                realtimeIdentifier: {
                    type: RealtimeIdentifierType.WienerLinien,
                    value: 60200627
                },
                routeClassName: "N26",
                times: [
                    v.d
                ]
            }, false);
            let result = routingInstance.getRealtimeUpdateResult();
            expect(result.length).toBe(1);
            expect(result[0].route).toBe("N26");
            expect(result[0].realtimeOffset).toBe(v.o);
        });
    });

    it("get realtime route from Aspernstraße to Groß-Enzersdorf", () => {
        let day = 22; // tuesday
        let departureStops = stopgroupIndex.find(n => n.name == "Aspernstraße").stopIds;
        let departureTime = new Date(getUnixTime({
            year: 2024,
            month: 10,
            day: day,
            hours: 19,
            minutes: 36,
            seconds: 0,
        }, vienna));

        let request = {
            departureStops: departureStops,
            arrivalStops: stopgroupIndex.find(n => n.name == "Groß-Enzersdorf Busbahnhof").stopIds,
            departureTimes: new Array(departureStops.length).fill(departureTime),
        };

        let resultBeforeRealtime = routingInstance.route(request);

        routingInstance.upsertRealtimeData({
            headsign: "Groß-Enzersdorf",
            realtimeIdentifier: {
                type: RealtimeIdentifierType.WienerLinien,
                value: 60200299
            },
            routeClassName: "26A",
            times: [
                new Date(`2024-10-${day}T19:34:33.000+0200`),
                new Date(`2024-10-${day}T19:39:29.000+0200`),
                new Date(`2024-10-${day}T19:49:04.000+0200`),
                new Date(`2024-10-${day}T19:55:20.000+0200`),
                new Date(`2024-10-${day}T20:04:00.000+0200`),
            ]
        }, true);

        let result = routingInstance.route(request);

        expect(resultBeforeRealtime[0].legs[0].plannedDeparture).toEqual(new Date(`2024-10-${day}T19:39:00.000+0200`));
        expect(resultBeforeRealtime[0].legs[0].delay).toEqual(0);
        expect(result[0].legs[0].plannedDeparture).toEqual(new Date(`2024-10-${day}T19:39:00.000+0200`));
        expect(result[0].legs[0].delay).toEqual(29);
    });

    it("realtime route in the morning from Polgarstraße to Kagran", () => {
        let d = 7; // thursday
        let departureStops = stopgroupIndex.find(n => n.name == "Polgarstraße").stopIds;
        let departureTime = new Date(getUnixTime({
            year: 2024,
            month: 11,
            day: d,
            hours: 9,
            minutes: 39,
            seconds: 0,
        }, vienna));

        let request = {
            departureStops: departureStops,
            arrivalStops: stopgroupIndex.find(n => n.name == "Kagran").stopIds,
            departureTimes: new Array(departureStops.length).fill(departureTime)
        };
        let delay = 60 + 33;
        let planTime = "09:39";
        let day = `2024-11-${String(d).padStart(2, "0")}T`;// donnerstag
        routingInstance.upsertRealtimeData({
            headsign: "Kagran",
            realtimeIdentifier: {
                type: RealtimeIdentifierType.WienerLinien,
                value: 60201031 // Polgarstraße
            },
            routeClassName: "26A",
            times: [
                new Date(+new Date(`${day}${planTime}:00.000+0100`) + delay * 1000)
            ]
        }, true);        
        let result = routingInstance.route(request);
        expect(result[0].legs[0].route.name).toBe("26A");
        expect(result[0].legs[0].delay).toEqual(delay);
    });
});
