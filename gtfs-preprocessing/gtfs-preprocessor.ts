import fs from "fs";
import path from "path";
import { readStops } from "./read-stops";
import { enhanceWithTransfers } from "./read-transfers";
import csv from "csv-parser";
import stripBom from "strip-bom-stream";
import { GtfsRouteMap, readRoutes } from "./read-routes";
import { readCalendar } from "./read-calendar";

function parseTime(time: string) {
    let [hour, minute, second] = time.split(":");
    return parseInt(hour) * 3600 + parseInt(minute) * 60 + parseInt(second);
}

interface GtfsTrip {
    tripId: string;
    routeId: string;
    serviceId: string;
    directionId: number;
    tripHeadsign: string;
    stopTimes: {
        arrivalTime: number,
        departureTime: number,
        stopSequence: number,
        stopId: number
    }[];
    tripShortName?: string;
}

type GtfsTripMap = { [tripId: string]: GtfsTrip };

export type RouteIdMap = {
    id: number;
    tripRoutes: string[];
    direction: number;
    routeName: string;
    headsign: string;
}[];

async function readTrips(gtfsPath: string) {
    const tripsStream = fs.createReadStream(path.join(gtfsPath, "trips.txt"));
    return new Promise<GtfsTripMap>(resolve => {
        let trips: GtfsTripMap = {};
        tripsStream
            .pipe(stripBom())
            .pipe(csv())
            .on("data", (data) => {
                trips[data.trip_id] = {
                    tripId: data.trip_id,
                    routeId: data.route_id,
                    serviceId: data.service_id,
                    directionId: parseInt(data.direction_id),
                    tripHeadsign: data.trip_headsign,
                    tripShortName: data.trip_short_name,
                    stopTimes: []
                };
            })
            .on('end', () => {
                resolve(trips);
            });
    });
}

async function enhanceWithStopTimes(gtfsPath: string, trips: GtfsTripMap, stopList: string[]) {
    const stopTimesStream = fs.createReadStream(path.join(gtfsPath, "stop_times.txt"));
    return new Promise<GtfsTripMap>(resolve => {
        stopTimesStream
            .pipe(stripBom())
            .pipe(csv())
            .on("data", (data) => {
                // "trip_id,arrival_time,departure_time,stop_id,stop_sequence,pickup_type,drop_off_type,shape_dist_traveled")
                trips[data.trip_id].stopTimes = trips[data.trip_id].stopTimes || [];
                trips[data.trip_id].stopTimes.push({
                    arrivalTime: parseTime(data.arrival_time),
                    departureTime: parseTime(data.departure_time),
                    stopSequence: parseInt(data.stop_sequence),
                    stopId: stopList.indexOf(data.stop_id)
                });
            })
            .on('end', () => {
                resolve(trips);
            });
    });
}
type RouteBucket = GtfsTrip[];

function sortTripsIntoRouteBuckets(trips: GtfsTripMap, routes: GtfsRouteMap) {

    let routeBuckets: RouteBucket[] = [];
    let indexByRouteName: { [routeName: string]: RouteBucket[] } = {};
    let tripList = Object.values(trips).sort((tripA, tripB) => tripA.stopTimes[0].departureTime - tripB.stopTimes[0].departureTime);

    function tripFits(bucket: RouteBucket, tNew: GtfsTrip) {
        let tBucket = bucket[bucket.length - 1];
        // because we cut the routes of oebb we can't sort into the same bucket to display the correct headsign
        if (tBucket.tripHeadsign !== tNew.tripHeadsign) {
            return false;
        }
        if (tBucket.stopTimes.length !== tNew.stopTimes.length) {
            return false;
        }
        for (let i = 0; i < tBucket.stopTimes.length; i++) {
            if (tBucket.stopTimes[i].stopId !== tNew.stopTimes[i].stopId) {
                return false;
            }
        }
        if (tNew.stopTimes[0].departureTime < tBucket.stopTimes[tBucket.stopTimes.length - 1].departureTime) {
            for (let i = 0; i < tNew.stopTimes.length; i++) {
                if (tNew.stopTimes[i].departureTime < tBucket.stopTimes[i].departureTime) {
                    return false;
                }
            }
        }
        return true;
    }

    function findBucket(t: GtfsTrip) {
        let routeName = t.tripShortName || routes[t.routeId].routeShortName;
        let candidates = (indexByRouteName[routeName] || [])
            .filter(b => tripFits(b, t));
        let bucket: RouteBucket;
        if (!candidates.length) {
            bucket = [];
            indexByRouteName[routeName] = indexByRouteName[routeName] || [];
            indexByRouteName[routeName].push(bucket);
            routeBuckets.push(bucket);
        } else {
            bucket = candidates.sort((a, b) => {
                let byDepartureTime = a[0].stopTimes[0].departureTime - b[0].stopTimes[0].departureTime;
                if (byDepartureTime !== 0) {
                    return byDepartureTime;
                }
                return a[0].tripId.localeCompare(b[0].tripId);
            })[0];
        }
        return bucket;
    }

    for (let trip of tripList) {
        let bucket = findBucket(trip);
        bucket.push(trip);
    }
    return routeBuckets;
}

function validateRouteBuckets(routesWithNames: GtfsRouteMap, routeBucketsOrdered: RouteBucket[]) {

    function getRouteDescription(trip: GtfsTrip) {
        return `${trip.tripShortName || routesWithNames[trip.routeId].routeShortName} ${trip.tripHeadsign}`;
    }

    for (let trips of routeBucketsOrdered) {
        let routeDescription = getRouteDescription(trips[0]);
        if (trips.some(t => {
            let trip2RouteDescription = getRouteDescription(t);
            return trip2RouteDescription !== routeDescription;
        })) {
            throw new Error("Route description of trips doesn't match");
        }
        let tripHeadsign = trips[0].tripHeadsign;
        let nonmatchingheadsigns = trips.filter(t => t.tripHeadsign !== tripHeadsign);
        if (nonmatchingheadsigns.length > 0) {
            console.log(`Headsign of trips don't match ${nonmatchingheadsigns[0].tripHeadsign} !== ${tripHeadsign}`);
        }
    }
}

export async function preprocessGtfs(gtfsPath: string, outputPath: string) {
    console.log("Reading trips");
    let trips = await readTrips(gtfsPath);
    console.log(`Found ${Object.keys(trips).length} trips`);
    console.log("Reading stops");
    let stops = (await readStops(gtfsPath));
    console.log("Reading transfers");
    // we read transfers from output because we generated them ourselves
    await enhanceWithTransfers(stops, outputPath);
    let stopList = stops.map(s => s.stopId);
    console.log(`Found ${stops.length} stops`);
    console.log("Reading calendar");
    let calendar = await readCalendar(gtfsPath, false);
    console.log(`Found ${calendar.length} serviceIds`);
    let routesWithNames = await readRoutes(gtfsPath);
    trips = await enhanceWithStopTimes(gtfsPath, trips, stopList);
    console.log("Ordering stoptimes in trips");
    for (let tripId in trips) {
        trips[tripId].stopTimes.sort((a, b) => a.stopSequence - b.stopSequence);
        for (let i = 0; i < trips[tripId].stopTimes.length - 2; i++) {
            if (trips[tripId].stopTimes[i].departureTime > trips[tripId].stopTimes[i + 1].departureTime) {
                trips[tripId].stopTimes[i + 1].departureTime += 3600 * 24;
                trips[tripId].stopTimes[i + 1].arrivalTime += 3600 * 24;
            }
        }
    }
    console.log("Sorting trips into route buckets");
    let routeBuckets = sortTripsIntoRouteBuckets(trips, routesWithNames);
    console.log(`Found ${routeBuckets.length} route buckets`);
    console.log("Ordering routes");
    let routeBucketsOrdered = routeBuckets.sort(([tripA,], [tripB,]) => tripA.routeId.localeCompare(tripB.routeId));
    validateRouteBuckets(routesWithNames, routeBucketsOrdered);
    let routeStops = routeBucketsOrdered.map((trips) => trips[0].stopTimes.map(s => s.stopId));
    let routeIdMap: RouteIdMap = routeBucketsOrdered.map((trips, idx) => ({
        id: idx,
        tripRoutes: trips.map(t => t.routeId),
        direction: trips[0].directionId,
        headsign: trips[0].tripHeadsign,
        routeName: routesWithNames[trips[0].routeId].routeShortName
    }));
    await fs.promises.writeFile(path.join(outputPath, "routeIdMap.json"), JSON.stringify(routeIdMap));
    console.log("Writing routes");
    let stoptimesOutput = await fs.promises.open(path.join(outputPath, "stoptimes.bin.bmp"), "w");
    let routeStopsOutput = await fs.promises.open(path.join(outputPath, "route_stops.bin.bmp"), "w");
    let routeOutput = await fs.promises.open(path.join(outputPath, "routes.bin.bmp"), "w");
    let tripCalendarsOutput = await fs.promises.open(path.join(outputPath, "trip_calendars.bin.bmp"), "w");
    let stopTimeIndex = 0;
    let stopIndex = 0;
    let tripCalendarsIdx = 0;
    for (let { routeId, trips } of routeBucketsOrdered.map((t, i) => ({ routeId: i, trips: t }))) {
        let currentStops = routeStops[routeId];
        let routeArray = new Uint32Array([stopTimeIndex, stopIndex, currentStops.length, trips.length, tripCalendarsIdx]);
        await routeOutput.write(new Uint8Array(routeArray.buffer));
        for (let trip of trips) {
            let orderedStopTimes = trip.stopTimes.sort((a, b) => a.stopSequence - b.stopSequence);
            let stopTimesArray = new Uint32Array(orderedStopTimes.flatMap(({ arrivalTime, departureTime }) => [arrivalTime, departureTime]));
            await stoptimesOutput.write(new Uint8Array(stopTimesArray.buffer));
            stopTimeIndex += stopTimesArray.length / 2;
            if (stopTimeIndex > 0xFFFFFFFF) {
                throw new Error("Too many stop times");
            }
            let foundCalendar = calendar.find(c => c.serviceId === trip.serviceId);
            if (!foundCalendar) {
                throw new Error(`Could not find calendar for ${trip.serviceId}`);
            }
            let calendarId = calendar.indexOf(foundCalendar);
            let tripCalendarArray = new Uint16Array([calendarId]);
            await tripCalendarsOutput.write(new Uint8Array(tripCalendarArray.buffer));
            tripCalendarsIdx += 1;
        }
        let stopArray = new Uint16Array(currentStops);
        await routeStopsOutput.write(new Uint8Array(stopArray.buffer));
        stopIndex += currentStops.length;
    }
    await stoptimesOutput.close();
    await routeStopsOutput.close();
    await routeOutput.close();
    await tripCalendarsOutput.close();
    console.log("Processing Stops");
    let stopServingRoutesOutput = await fs.promises.open(path.join(outputPath, "stop_serving_routes.bin.bmp"), "w");
    let transfersOutput = await fs.promises.open(path.join(outputPath, "transfers.bin.bmp"), "w");
    let stopsOutput = await fs.promises.open(path.join(outputPath, "stops.bin.bmp"), "w");
    let stopServingRoutesIdx = 0;
    let transfersIdx = 0;
    for (let stopId = 0; stopId < stops.length; stopId++) {
        let stop = stops[stopId];
        let numTransfers = stop.transfers ? stop.transfers.length : 0;
        let routeIds = routeStops.map((s, i) => ({ routeId: i, routeStops: s })).filter(({ routeStops }) => routeStops.indexOf(stopId) > -1)
            .map(({ routeId }) => routeId);
        let routeIdsArray = new Uint16Array(routeIds);
        await stopServingRoutesOutput.write(new Uint8Array(routeIdsArray.buffer));
        if (numTransfers > 0) {
            let transfersArray = new Uint16Array((stop.transfers || []).flatMap(t => [t.to, t.minTransferTime]));
            await transfersOutput.write(new Uint8Array(transfersArray.buffer));
        }

        let stopArray = new Uint32Array([stopServingRoutesIdx, transfersIdx]);
        await stopsOutput.write(new Uint8Array(stopArray.buffer));
        await stopsOutput.write(new Uint8Array(new Uint16Array([routeIds.length, numTransfers]).buffer));
        stopServingRoutesIdx += routeIds.length;
        transfersIdx += numTransfers;
    }
    await stopServingRoutesOutput.close();
    await stopsOutput.close();
    await transfersOutput.close();
}