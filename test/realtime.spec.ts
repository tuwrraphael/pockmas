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
                new Date("2023-10-28T18:29:02.000+0200")
            ],

        }, false);
        let result = routingInstance.getRealtimeUpdateResult();
        expect(result.length).toBe(1);
        expect(result[0].route).toBe("22A");
        expect(result[0].realtimeOffset).toBe(2);
    });

    it("updates realtime for 25 if its very late", () => {
        routingInstance.upsertRealtimeData({
            realtimeIdentifier: {
                type: RealtimeIdentifierType.WienerLinien,
                value: 60201031
            },
            routeClassName: "25",
            headsign: "Oberdorfstraße",
            times: [
                new Date("2023-11-21T16:56:33.000+0100"),
                new Date("2023-11-21T16:56:43.000+0100"),
                new Date("2023-11-21T16:59:58.000+0100"),
                new Date("2023-11-21T17:07:00.000+0100")
            ],
        }, false);
        let result = routingInstance.getRealtimeUpdateResult();

        expect(result[0].realtimeOffset).toBe(513);
        expect(result[1].realtimeOffset).toBe(163);
        expect(result[2].realtimeOffset).toBe(-2);
        expect(result[3].realtimeOffset).toBe(0);
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
                new Date("2023-11-26T14:06:55.000+0100"),
            ],
        }, false);
        let result = routingInstance.getRealtimeUpdateResult();
        expect(result[0].route).toBe("U1");
        expect(result[0].realtimeOffset).toBe(-5);
        routingInstance.upsertRealtimeData({
            realtimeIdentifier: {
                type: RealtimeIdentifierType.WienerLinien,
                value: 60200627
            },
            routeClassName: "U1",
            headsign: "Alaudagasse",
            times: [
                new Date("2023-11-26T14:12:55.000+0100")
            ],
        }, false);
        result = routingInstance.getRealtimeUpdateResult();
        expect(result[0].route).toBe("U1");
        expect(result[0].realtimeOffset).toBe(55);
    });

    // 26A Sonntag, Siebeckstraße, 00:07, 00:27, 00:47
    [
        { d: new Date("2023-11-21T00:07:45.000+0100"), o: 45 },
        { d: new Date("2023-11-21T00:07:00.000+0100"), o: 0 },
        { d: new Date("2023-11-21T00:06:30.000+0100"), o: -30 },
        { d: new Date("2023-11-22T00:29:00.000+0100"), o: 120 },
        { d: new Date("2023-11-22T00:46:00.000+0100"), o: -60 },
        { d: new Date("2023-11-22T00:49:15.000+0100"), o: 135 },
        { d: new Date("2023-11-22T00:47:00.000+0100"), o: 0 },
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
        routingInstance.upsertRealtimeData({
            headsign: "Rennweg",
            realtimeIdentifier: {
                type: RealtimeIdentifierType.WienerLinien,
                value: 60201039 // Praterbrücke
            },
            routeClassName: "77A",
            times: [
                new Date("2023-11-06T15:03:46.000+0100"),
                new Date("2023-11-06T15:13:11.000+0100"),
                new Date("2023-11-06T15:23:15.000+0100"),
                new Date("2023-11-06T15:33:14.000+0100"),
                new Date("2023-11-06T15:43:00.000+0100"),
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
        { d: new Date("2023-12-06T01:04:00.000+0100"), o: 60 },
        { d: new Date("2023-12-06T00:59:00.000+0100"), o: -4 * 60 },
    ].map((v, i) => {
        it(`updates first nightline (${i})`, () => {
            routingInstance.upsertRealtimeData({
                headsign: "Eßling Schule",
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

        let departureStops = stopgroupIndex.find(n => n.name == "Aspernstraße").stopIds;
        let departureTime = new Date(getUnixTime({
            year: 2023,
            month: 10,
            day: 24,
            hours: 18,
            minutes: 36,
            seconds: 0,
        }, vienna));

        let request = {
            departureStops: departureStops,
            arrivalStop: stopgroupIndex.find(n => n.name == "Groß-Enzersdorf Busbahnhof").stopIds[0],
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
                new Date("2023-10-24T18:30:33.000+0200"),
                new Date("2023-10-24T18:37:29.000+0200"),
                new Date("2023-10-24T18:44:04.000+0200"),
                new Date("2023-10-24T18:50:20.000+0200"),
                new Date("2023-10-24T18:57:00.000+0200"),
            ]
        }, true);

        let result = routingInstance.route(request);

        expect(resultBeforeRealtime[0].legs[0].plannedDeparture).toEqual(new Date("2023-10-24T18:37:00.000+0200"));
        expect(resultBeforeRealtime[0].legs[0].delay).toEqual(0);
        expect(result[0].legs[0].plannedDeparture).toEqual(new Date("2023-10-24T18:37:00.000+0200"));
        expect(result[0].legs[0].delay).toEqual(29);
    });

    it("realtime route in the morning from Polgarstraße to Kagran", () => {
        let departureStops = stopgroupIndex.find(n => n.name == "Polgarstraße").stopIds;
        let departureTime = new Date(getUnixTime({
            year: 2023,
            month: 11,
            day: 9,
            hours: 9,
            minutes: 36,
            seconds: 0,
        }, vienna));

        let request = {
            departureStops: departureStops,
            arrivalStop: stopgroupIndex.find(n => n.name == "Kagran").stopIds[0],
            departureTimes: new Array(departureStops.length).fill(departureTime)
        };
        routingInstance.upsertRealtimeData({
            headsign: "Kagran",
            realtimeIdentifier: {
                type: RealtimeIdentifierType.WienerLinien,
                value: 60201031
            },
            routeClassName: "26A",
            times: [
                new Date("2023-11-09T09:41:33.000+0100")
            ]
        }, true);
        let result = routingInstance.route(request);
        expect(result[0].legs[0].delay).toEqual(2 * 60 + 33);
    });
});
