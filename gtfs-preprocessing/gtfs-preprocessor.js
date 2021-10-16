const fs = require("fs");
const readline = require("readline");
const path = require("path");
const { readStops } = require("./read-stops");
const { removeQuotes } = require("./remove-quotes");
const { findTimeZone, getUnixTime } = require("timezone-support");
const { coordinateDistance } = require("./coordinate-distance");

const maxDistance = 0.2;
const walkingSpeed = 1.4;

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
    const tripsRl = readline.createInterface({
        input: tripsStream,
        crlfDelay: Infinity
    });

    let first = true;
    let trips = {};
    for await (const line of tripsRl) {
        if (first) {
            if (line.trim() !== "route_id,service_id,trip_id,shape_id,trip_headsign,trip_short_name,direction_id,block_id") {
                throw new Error("Invalid trips.txt file");
            }
            first = false;
            continue;
        }
        let [routeId, serviceId, tripId, , , , direction_id] = line.split(",");
        trips[tripId] = {
            tripId: removeQuotes(tripId),
            routeId: removeQuotes(routeId),
            serviceId: removeQuotes(serviceId),
            direction_id: parseInt(removeQuotes(direction_id)),
        };
    }
    return trips;
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

async function readCalendar(gtfsPath, outputPath) {
    const calendarStream = fs.createReadStream(path.join(gtfsPath, "calendar.txt"));
    const calendarRl = readline.createInterface({
        input: calendarStream,
        crlfDelay: Infinity
    });

    let first = true;
    let calendar = [];
    for await (const line of calendarRl) {
        if (first) {
            if (line.trim() !== "service_id,monday,tuesday,wednesday,thursday,friday,saturday,sunday,start_date,end_date") {
                throw new Error("Invalid calendar.txt file");
            }
            first = false;
            continue;
        }
        let [serviceId, monday, tuesday, wednesday, thursday, friday, saturday, sunday, startDate, endDate] = line.split(",");
        let weekdays = 0;
        weekdays += monday === '"1"' ? 1 : 0;
        weekdays += tuesday === '"1"' ? 2 : 0;
        weekdays += wednesday === '"1"' ? 4 : 0;
        weekdays += thursday === '"1"' ? 8 : 0;
        weekdays += friday === '"1"' ? 16 : 0;
        weekdays += saturday === '"1"' ? 32 : 0;
        weekdays += sunday === '"1"' ? 64 : 0;
        calendar.push({
            serviceId: removeQuotes(serviceId),
            weekdays: weekdays,
            startDate: parseDate(removeQuotes(startDate)),
            endDate: parseDate(removeQuotes(endDate)) + 24 * 3600
        });
    }
    return calendar.sort((a, b) => a.serviceId.localeCompare(b.serviceId));
}

async function readRoutes(gtfsPath) {
    const routesStream = fs.createReadStream(path.join(gtfsPath, "routes.txt"));
    const routesRl = readline.createInterface({
        input: routesStream,
        crlfDelay: Infinity
    });

    let first = true;
    let routes = {};
    for await (const line of routesRl) {
        if (first) {
            if (line.trim() !== "route_id,agency_id,route_short_name,route_long_name,route_type,route_color,route_text_color") {
                throw new Error("Invalid routes.txt file");
            }
            first = false;
            continue;
        }
        let [routeId, , routeShortName, routeLongName] = line.split(",");
        routes[removeQuotes(routeId)] = {
            routeId: removeQuotes(routeId),
            routeShortName: removeQuotes(routeShortName),
            routeLongName: removeQuotes(routeLongName)
        };
    }
    return routes;
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
    console.log(`Found ${calendar.length} serviceIds. Writing calendar`);
    let calendarOutput = await fs.promises.open(path.join(outputPath, "calendar.bin.bmp"), "w");
    for (let c of calendar) {
        let calendarArray = new Uint32Array([c.startDate, c.endDate, c.weekdays]);
        calendarOutput.write(new Uint8Array(calendarArray.buffer));
    }
    await calendarOutput.close();
    const stopTimesStream = fs.createReadStream(path.join(gtfsPath, "stop_times.txt"));
    const stopTimesRl = readline.createInterface({
        input: stopTimesStream,
        crlfDelay: Infinity
    });
    let first = true;
    for await (const line of stopTimesRl) {
        if (first) {
            if (line.trim() !== "trip_id,arrival_time,departure_time,stop_id,stop_sequence,pickup_type,drop_off_type,shape_dist_traveled") {
                console.log(line);
                throw new Error("Invalid stop_times.txt file");
            }
            first = false;
            continue;
        }
        let [tripId, arrivalTime, departureTime, stop_id, stopSequence] = line.split(",");
        if (!trips[tripId]) {
            throw new Error("Invalid trip_id");
        }
        trips[tripId].stopTimes = trips[tripId].stopTimes || [];
        trips[tripId].stopTimes.push({
            arrivalTime: parseTime(removeQuotes(arrivalTime)),
            departureTime: parseTime(removeQuotes(departureTime)),
            stopSequence: parseInt(removeQuotes(stopSequence)),
            stopId: stopList.indexOf(removeQuotes(stop_id))
        });
    }
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

        let stopArray = new Uint16Array([stopServingRoutesIdx, routeIds.length, transfersIdx, transfers.length / 2]);
        await stopsOutput.write(new Uint8Array(stopArray.buffer));
        stopServingRoutesIdx += routeIds.length;
        transfersIdx += transfers.length / 2;
    }
    await stopServingRoutesOutput.close();
    await stopsOutput.close();
    await transfersOutput.close();

    let routesWithNames = await readRoutes(gtfsPath);
    await fs.promises.writeFile(path.join(outputPath, "routenames.txt"), tripsByRouteOrdered.map(([routeId,]) => {
        let route = routesWithNames[originalIdMap[routeId]];
        return `${route.routeShortName} ${route.routeLongName}`;
    }).join("\n"));
    await fs.promises.writeFile(path.join(outputPath, "stopnames.txt"), stops.map(s => s.name).join("\n"));

}

exports.preprocessGtfs = process;