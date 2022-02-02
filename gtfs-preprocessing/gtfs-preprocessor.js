const fs = require("fs");
const path = require("path");
const { readStops } = require("./read-stops");
const { enhanceWithTransfers } = require("./read-transfers");
const csv = require("csv-parser");
const stripBom = require("strip-bom-stream");
const { readRoutes } = require("./read-routes");
const { readCalendar } = require("./read-calendar");

function parseTime(time) {
    let [hour, minute, second] = time.split(":");
    return parseInt(hour) * 3600 + parseInt(minute) * 60 + parseInt(second);
}

async function readTrips(gtfsPath) {
    const tripsStream = fs.createReadStream(path.join(gtfsPath, "trips.txt"));
    return new Promise(resolve => {
        let trips = {};
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
                };
            })
            .on('end', () => {
                resolve(trips);
            });
    });
}

async function enhanceWithStopTimes(gtfsPath, trips, stopList) {
    const stopTimesStream = fs.createReadStream(path.join(gtfsPath, "stop_times.txt"));
    return new Promise(resolve => {
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

function sortTripsIntoRouteBuckets(trips, routes) {
    let routeBuckets = [];
    let indexByRouteShortName = {};
    let tripList = Object.values(trips).sort((tripA, tripB) => tripA.stopTimes[0].departureTime - tripB.stopTimes[0].departureTime);

    function tripFits(bucket, tNew) {
        let tBucket = bucket[bucket.length - 1];
        if (tBucket.stopTimes.length !== tNew.stopTimes.length || tBucket.directionId !== tNew.directionId) {
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

    function findBucket(t) {
        let routeShortName = routes[t.routeId].routeShortName;
        let candidates = (indexByRouteShortName[routeShortName] || [])
            .filter(bucket => tripFits(bucket, t));
        let bucket;
        if (!candidates.length) {
            bucket = [];
            indexByRouteShortName[routeShortName] = indexByRouteShortName[routeShortName] || [];
            indexByRouteShortName[routeShortName].push(bucket);
            routeBuckets.push(bucket);
        } else {
            bucket = candidates.sort((a, b) => a[0].stopTimes[0].departureTime - b[0].stopTimes[0].departureTime)[0];
        }
        return bucket;
    }

    for (let trip of tripList) {
        let bucket = findBucket(trip);
        bucket.push(trip);
    }
    return routeBuckets;
}

async function process(gtfsPath, outputPath) {
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
    let calendar = await readCalendar(gtfsPath);
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
    let routeStops = routeBucketsOrdered.map((trips) => trips[0].stopTimes.map(s => s.stopId));
    await fs.promises.writeFile(path.join(outputPath, "routeIdMap.json"), JSON.stringify(routeBucketsOrdered.map((trips, idx) => ({
        id: idx,
        trips: trips.map(t => t.routeId),
        direction: trips[0].directionId
    }))));
    console.log("Writing routes");
    let stoptimesOutput = await fs.promises.open(path.join(outputPath, "stoptimes.bin.bmp"), "w");
    let routeStopsOutput = await fs.promises.open(path.join(outputPath, "route_stops.bin.bmp"), "w");
    let routeOutput = await fs.promises.open(path.join(outputPath, "routes.bin.bmp"), "w");
    let tripCalendarsOutput = await fs.promises.open(path.join(outputPath, "trip_calendars.bin.bmp"), "w");
    let stopTimeIndex = 0;
    let stopIndex = 0;
    let tripCalendarsIdx = 0;
    for (let [routeId, trips] of routeBucketsOrdered.map((t, i) => [i, t])) {
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
            let calendarId = calendar.indexOf(calendar.find(c => c.serviceId === trip.serviceId));
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
        let routeIds = routeStops.map((s, i) => [i, s]).filter(([, routeStops]) => routeStops.indexOf(stopId) > -1)
            .map(([routeId,]) => routeId);
        let routeIdsArray = new Uint16Array(routeIds);
        await stopServingRoutesOutput.write(new Uint8Array(routeIdsArray.buffer));
        if (numTransfers > 0) {
            let transfersArray = new Uint16Array(stop.transfers.flatMap(t => [t.to, t.minTransferTime]));
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
    await fs.promises.writeFile(path.join(outputPath, "routes.json"), JSON.stringify(routeBucketsOrdered.map((trips, id) => {
        let route = routesWithNames[trips[0].routeId];
        if (trips.some(t => {
            let r = routesWithNames[t.routeId];
            return r.routeShortName !== route.routeShortName || r.routeType !== route.routeType;
        })) {
            throw new Error("Route description of trips doesn't match");
        }
        let tripHeadsign = trips[0].tripHeadsign;
        let nonmatchingheadsigns = trips.filter(t => t.tripHeadsign !== tripHeadsign);
        if (nonmatchingheadsigns.length > 0) {
            console.log(`Headsign of trips don't match ${nonmatchingheadsigns[0].tripHeadsign} !== ${tripHeadsign}`);
        }
        let arr = [route.routeShortName, tripHeadsign, route.routeType];
        if (route.routeColor) {
            arr.push(route.routeColor);
        }
        return arr;
    })));
}

exports.preprocessGtfs = process;