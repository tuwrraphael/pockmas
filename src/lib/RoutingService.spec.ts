// import { RoutingService } from "../src/lib/RoutingService";
import { findTimeZone, getUnixTime, populateTimeZones } from "timezone-support/lookup-convert";
import tzd from "timezone-support/data-1970-2038";
// import { LegType } from "../src/lib/LegType";
// import { RoutingServicesFactory } from "../src/lib/RoutingServicesFactory";

import { RoutingService } from "./RoutingService";
import { RoutingServicesFactory } from "./RoutingServicesFactory";

describe("RoutingService", () => {
    let routingInstance: RoutingService;
    let stopgroupIndex: { name: string, stopIds: number[] }[];
    let vienna: any;

    beforeAll(async () => {
        populateTimeZones(tzd);
        vienna = findTimeZone("Europe/Vienna");
        routingInstance = await new RoutingServicesFactory().getRoutingService();
        stopgroupIndex = await (await fetch(new URL("../../preprocessing-dist/stopgroup-index.json", import.meta.url).toString())).json();
    })

    describe("getDepartures", () => {

        it("offers departures", () => {
            let day = 10;// tuesday
            let departureTime = new Date(getUnixTime({
                year: 2024,
                month: 12,
                day: day, // tuesday
                hours: 23,
                minutes: 52,
                seconds: 0,
            }, vienna));

            let departureStops = stopgroupIndex.find(n => n.name == "Kagran").stopIds;


            let result = routingInstance.getDepartures({
                departureStops: departureStops.map(stopId => ({
                    stopId,
                    departureTime
                }))
            });
            // console.log(result.map(r => `${r.route.name} ${r.route.headsign} ${r.plannedDeparture}`).join("\n"));

            let u1directionOberlaaAlaudaGasse = result.filter(r => r.route.name == "U1" && (r.route.headsign == "Wien Oberlaa" || r.route.headsign == "Wien Alaudagasse"));
            expect(u1directionOberlaaAlaudaGasse.length).toBe(2);
            expect(u1directionOberlaaAlaudaGasse[0].plannedDeparture).toEqual(new Date(`2024-12-${day}T23:57:00.000+0100`));
            expect(u1directionOberlaaAlaudaGasse[1].plannedDeparture).toEqual(new Date(`2024-12-${day + 1}T00:05:00.000+0100`));
            // expect(u1directionOberlaaAlaudaGasse[2].plannedDeparture).toEqual(new Date("2023-11-22T00:07:00.000+0100"));
            // expect(u1directionOberlaaAlaudaGasse[3].plannedDeparture).toEqual(new Date("2022-10-18T00:14:00.000+0200"));

            let u1directionLeopoldau = result.filter(r => r.route.name == "U1" && r.route.headsign == "Wien Leopoldau");
            expect(u1directionLeopoldau.length).toBe(2);
            expect(u1directionLeopoldau[0].plannedDeparture).toEqual(new Date(`2024-12-${day}T23:53:00.000+0100`));
            expect(u1directionLeopoldau[1].plannedDeparture).toEqual(new Date(`2024-12-${day + 1}T00:01:00.000+0100`));
            // expect(u1directionLeopoldau[2].plannedDeparture).toEqual(new Date("2024-11-22T00:08:00.000+0100"));
            // expect(u1directionLeopoldau[3].plannedDeparture).toEqual(new Date("2022-10-18T00:14:00.000+0200"));

            // for (let r of result) {
            //     console.log(`${r.route.name} ${r.route.id} ${r.tripId} ${r.route.headsign} Abfahrt von ${r.stop.stopName}(${r.stop.stopId}) ${new Intl.DateTimeFormat([], {
            //         hour: "numeric",
            //         minute: "numeric",
            //         day: "numeric",
            //         month: "numeric"
            //     }).format(r.plannedDeparture)}`);
            // }
        });

    });
});