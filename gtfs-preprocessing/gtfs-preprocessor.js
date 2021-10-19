const fs = require("fs");
const path = require("path");
const { readStops } = require("./read-stops");
const { findTimeZone, getUnixTime } = require("timezone-support");
const { coordinateDistance } = require("./coordinate-distance");
const csv = require("csv-parser");
const stripBom = require("strip-bom-stream");

const maxDistance = 0.6;
const walkingSpeed = 3.6;

let timezone = findTimeZone("Europe/Vienna");

function walkingTimeSeconds(distanceKm, speedKmH) {
    return Math.round(distanceKm / speedKmH * 3600);
}


function groupBy(xs, key) {
    return xs.reduce(function (rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
    }, {});
};

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
                    direction_id: parseInt(data.direction_id),
                    tripHeadsign: data.trip_headsign,
                };
            })
            .on('end', () => {
                resolve(trips);
            });
    });
}

function parseDate(date) {
    let year = date.substring(0, 4);
    let month = date.substring(4, 6);
    let day = date.substring(6, 8);
    return getUnixTime({
        year: year,
        month: month,
        day: day,
        hours: 0,
        minutes: 0,
        seconds: 0
    }, timezone) / 1000;
}

async function readCalendar(gtfsPath) {
    const calendarStream = fs.createReadStream(path.join(gtfsPath, "calendar.txt"));
    return new Promise(resolve => {
        let calendar = [];
        calendarStream
            .pipe(stripBom())
            .pipe(csv())
            .on("data", (data) => {
                let weekdays = 0;
                weekdays += data.monday === '1' ? 1 : 0;
                weekdays += data.tuesday === '1' ? 2 : 0;
                weekdays += data.wednesday === '1' ? 4 : 0;
                weekdays += data.thursday === '1' ? 8 : 0;
                weekdays += data.friday === '1' ? 16 : 0;
                weekdays += data.saturday === '1' ? 32 : 0;
                weekdays += data.sunday === '1' ? 64 : 0;
                calendar.push({
                    serviceId: data.service_id,
                    weekdays: weekdays,
                    startDate: parseDate(data.start_date),
                    endDate: parseDate(data.end_date) + 24 * 3600
                });
            })
            .on('end', () => {
                resolve(calendar.sort((a, b) => a.serviceId.localeCompare(b.serviceId)));
            });
    });
}

async function readRoutes(gtfsPath) {
    const routesStream = fs.createReadStream(path.join(gtfsPath, "routes.txt"));
    return new Promise(resolve => {
        let routes = {};
        routesStream
            .pipe(stripBom())
            .pipe(csv())
            .on("data", (data) => {
                routes[data.route_id] = {
                    routeId: data.route_id,
                    routeShortName: data.route_short_name,
                    routeLongName: data.route_long_name,
                    routeType: parseInt(data.route_type),
                    routeColor: data.route_color
                };
            })
            .on('end', () => {
                resolve(routes);
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
    let stopList = stops.map(s => s.stopId);
    console.log(`Found ${stops.length} stops`);
    console.log("Reading calendar");
    let calendar = await readCalendar(gtfsPath);
    console.log(`Found ${calendar.length} serviceIds.`);
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
    console.log("Ordering trips in routes");
    tripsByRoute = tripsByRoute.map(([routeId, trips]) => [routeId, trips.sort((trip1, trip2) => trip1.stopTimes[0].departureTime - trip2.stopTimes[0].departureTime)]);
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
    console.log("Ordering routes");
    let tripsByRouteOrdered = routes.sort(([routeId,], [routeId2,]) => routeId.localeCompare(routeId2));
    let routeStops = tripsByRouteOrdered.map(([routeId, trips]) => [routeId, trips[0].stopTimes.map(s => s.stopId)]);
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
        let routeIds = routeStops.filter(([, routeStops]) => routeStops.indexOf(stopId) > -1)
            .map(([routeId,]) => routeIndex.indexOf(routeId));
        let routeIdsArray = new Uint16Array(routeIds);
        await stopServingRoutesOutput.write(new Uint8Array(routeIdsArray.buffer));
        let transfers = [];
        for (let j = 0; j < stops.length; j++) {
            if (stopId !== j) {
                let distance = coordinateDistance(stops[stopId].lat, stops[stopId].lon, stops[j].lat, stops[j].lon);
                if (distance < maxDistance) {
                    transfers.push(j);
                    transfers.push(walkingTimeSeconds(distance, walkingSpeed));
                }
            }
        }
        let transfersArray = new Uint16Array(transfers);
        await transfersOutput.write(new Uint8Array(transfersArray.buffer));

        let stopArray = new Uint32Array([stopServingRoutesIdx, transfersIdx]);
        await stopsOutput.write(new Uint8Array(stopArray.buffer));
        await stopsOutput.write(new Uint8Array(new Uint16Array([routeIds.length, transfers.length / 2]).buffer));
        stopServingRoutesIdx += routeIds.length;
        transfersIdx += transfers.length / 2;
    }
    await stopServingRoutesOutput.close();
    await stopsOutput.close();
    await transfersOutput.close();
    console.log("Writing calendar");
    let calendarArray = new Uint32Array(calendar.flatMap(c => [c.startDate, c.endDate, c.weekdays]));
    let calendarOutput = await fs.promises.open(path.join(outputPath, "calendar.bin.bmp"), "w");
    await calendarOutput.write(new Uint8Array(calendarArray.buffer));
    await calendarOutput.close();
    await fs.promises.writeFile(path.join(outputPath, "routes.json"), JSON.stringify(tripsByRouteOrdered.map(([routeId, trips]) => {
        let route = routesWithNames[originalIdMap[routeId]];
        let arr = [route.routeShortName, trips[0].tripHeadsign, route.routeType];
        if (route.routeColor) {
            arr.push(route.routeColor);
        }
        return arr;
    })));
    await fs.promises.writeFile(path.join(outputPath, "stopnames.txt"), stops.map(s => s.name).join("\n"));
    await concatResults(outputPath, stopTimeIndex, tripsByRouteOrdered.length, stopIndex, stopServingRoutesIdx,
        transfersIdx, stops.length, calendar.length, tripCalendarsIdx);
}

async function concatResults(outputPath, numberOfStoptimes, numberOfRoutes, numberOfRouteStops,
    numberOfStopRoutes, numberOfTransfers, numberOfStops,
    numberOfCalendars, numberOfTripCalendars) {
    let destination = await fs.promises.open(path.join(outputPath, "raptor_data.bin.bmp"), "w");
    let files = ["stoptimes.bin.bmp",
        "routes.bin.bmp",
        "transfers.bin.bmp",
        "stops.bin.bmp",
        "calendar.bin.bmp",
        "route_stops.bin.bmp",
        "stop_serving_routes.bin.bmp",
        "trip_calendars.bin.bmp"];
    let sizes = [numberOfStoptimes, numberOfRoutes, numberOfTransfers,
        numberOfStops, numberOfCalendars, numberOfRouteStops,
        numberOfStopRoutes, numberOfTripCalendars];
    destination.write(new Uint8Array(new Uint32Array(sizes).buffer));
    for (let file of files) {
        let binary = await fs.promises.readFile(path.join(outputPath, file));
        destination.write(new Uint8Array(binary));
    }
    destination.close();
}

exports.preprocessGtfs = process;