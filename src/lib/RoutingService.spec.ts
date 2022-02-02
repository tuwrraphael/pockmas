// import { RoutingService } from "../src/lib/RoutingService";
import { findTimeZone, getUnixTime, populateTimeZones } from "timezone-support/dist/lookup-convert";
import * as tzd from "timezone-support/dist/data-2012-2022";
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
            
            let departureTime = new Date(getUnixTime({
                year: 2022,
                month: 10,
                day: 28,
                hours: 18,
                minutes: 36,
                seconds: 0,
            }, vienna));

            let departureStops = stopgroupIndex.find(n => n.name == "Aspernstraße").stopIds;
            // console.log(departureStops);
            // performance.mark("start");
            let result = routingInstance.getDepartures({
                departureStops: departureStops.map(stopId => ({
                    stopId,
                    departureTime
                }))
            });
            // performance.mark("end");
            // performance.measure("getDepartures", "start", "end");
            // console.log(performance.getEntriesByName("getDepartures").map(n => n.duration));
            // // log the results route names, headsigns and times line by line
            // for(let r of result) {
            //     console.log(`${r.route.name} ${r.route.id} ${r.trip} ${r.route.headsign} ${r.stop.stopId} ${r.plannedDeparture}`);
            // }
        });

    });
});