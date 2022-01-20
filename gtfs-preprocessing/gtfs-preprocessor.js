const fs = require("fs");
const path = require("path");
const { readStops } = require("./read-stops");
const { enhanceWithTransfers } = require("./read-transfers");
const csv = require("csv-parser");
const stripBom = require("strip-bom-stream");
const { groupBy } = require("./groupBy");
const { readRoutes } = require("./read-routes");
const { readCalendar } = require("./read-calendar");

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

function parseTime(time) {
    let [hour, minute, second] = time.split(":");
    return parseInt(hour) * 3600 + parseInt(minute) * 60 + parseInt(second);
}

function tripEquals(tripa, tripb) {
    if (tripa.stopTimes.length !== tripb.stopTimes.length) {
        return false;
    }
    for (let i = 0; i < tripa.stopTimes.length; i++) {
        if (tripa.stopTimes[i].stopId !== tripb.stopTimes[i].stopId) {
            return false;
        }
    }
    return true;
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
    let tripsByRoute = Object.entries(groupBy(Object.values(trips), "routeId"))
    console.log("Splitting routes at different trips");
    let routes = [];
    let originalIdMap = {};
    for (let [routeId, trips] of tripsByRoute) {
        let splittedRoutes = [];
        let first = true;
        for (let trip of trips) {
            let existing = splittedRoutes.find(([, tr]) => tripEquals(tr[0], trip));
            if (!existing) {
                let newRouteId = first ? routeId : `${routeId}_${splittedRoutes.length}`;
                originalIdMap[newRouteId] = routeId;
                splittedRoutes.push([newRouteId, [trip]]);
                first = false;
            }
            else {
                existing[1].push(trip);
            }
        }
        routes = [...routes, ...splittedRoutes];
    }
    console.log("Condensing routes")
    let concatenatedRoutes = [];
    let concatenatedIdMap = {};
    for (let [routeId, trips] of routes) {
        let existing = concatenatedRoutes.filter(([cRouteId, cTrips]) => {
            let originalC = routesWithNames[originalIdMap[cRouteId]];
            let originalR = routesWithNames[originalIdMap[routeId]];
            return originalC.routeShortName === originalR.routeShortName && originalC.routeType === originalR.routeType;
        }).find(([cRouteId, cTrips]) => tripEquals(cTrips[0], trips[0]));
        if (!existing) {
            concatenatedRoutes.push([routeId, trips]);
            concatenatedIdMap[routeId] = originalIdMap[routeId];
        }
        else {
            let idx = concatenatedRoutes.indexOf(existing);
            concatenatedRoutes[idx][1] = [...concatenatedRoutes[idx][1], ...trips];
            concatenatedIdMap[routeId] = originalIdMap[existing[0]];
        }
    }
    console.log(`Condensed ${routes.length} routes to ${concatenatedRoutes.length}.`);
    console.log("Ordering trips in routes");
    concatenatedRoutes = concatenatedRoutes.map(([routeId, trips]) => [routeId, trips.sort((trip1, trip2) => trip1.stopTimes[0].departureTime - trip2.stopTimes[0].departureTime)]);
    console.log("Ordering routes");
    let tripsByRouteOrdered = concatenatedRoutes.sort(([routeId,], [routeId2,]) => routeId.localeCompare(routeId2));
    let routeStops = tripsByRouteOrdered.map(([routeId, trips]) => [routeId, trips[0].stopTimes.map(s => s.stopId)]);
    await fs.promises.writeFile(path.join(outputPath, "routeIdMap.json"), JSON.stringify(tripsByRouteOrdered.map(([routeId, trips], idx) => ({
        id: idx,
        originalId: concatenatedIdMap[routeId],
        direction: trips[0].directionId
    }))));
    console.log("Writing routes");
    let stoptimesOutput = await fs.promises.open(path.join(outputPath, "stoptimes.bin.bmp"), "w");
    let routeStopsOutput = await fs.promises.open(path.join(outputPath, "route_stops.bin.bmp"), "w");
    let routeOutput = await fs.promises.open(path.join(outputPath, "routes.bin.bmp"), "w");
    let tripCalendarsOutput = await fs.promises.open(path.join(outputPath, "trip_calendars.bin.bmp"), "w");
    let routeIndex = tripsByRouteOrdered.map(([routeId,]) => routeId);
    let stopTimeIndex = 0;
    let stopIndex = 0;
    let tripCalendarsIdx = 0;
    for (let [routeId, trips] of tripsByRouteOrdered) {
        let currentStops = routeStops.find(([r,]) => r === routeId)[1];
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
        let routeIds = routeStops.filter(([, routeStops]) => routeStops.indexOf(stopId) > -1)
            .map(([routeId,]) => routeIndex.indexOf(routeId));
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
    await fs.promises.writeFile(path.join(outputPath, "routes.json"), JSON.stringify(tripsByRouteOrdered.map(([routeId, trips]) => {
        let route = routesWithNames[concatenatedIdMap[routeId]];
        let arr = [route.routeShortName, trips[0].tripHeadsign, route.routeType];
        if (route.routeColor) {
            arr.push(route.routeColor);
        }
        return arr;
    })));
}

exports.preprocessGtfs = process;