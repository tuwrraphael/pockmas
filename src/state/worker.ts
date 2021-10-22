import { RaptorExports } from "../../raptor/wasm-exports";
import { StopSearchExports } from "../../stopsearch/wasm-exports";
import { ActionType } from "./actions/ActionType";
import { ArrivalStopTermChanged } from "./actions/ArrivalStopTermChanged";
import { DepartureStopTermChanged } from "./actions/DepartureStopTermChanged";
import { InitializeRouting } from "./actions/InitializeRouting";
import { InitializeStopSearch } from "./actions/InitializeStopSearch";
import { State } from "./State";
import { StopsSelected } from "./actions/StopsSelected";
import { findTimeZone, getUnixTime, getZonedTime, populateTimeZones } from "timezone-support/dist/lookup-convert";
import { Itinerary } from "./Itinerary";
import { Leg } from "./Leg";

type Actions = InitializeStopSearch
    | DepartureStopTermChanged
    | ArrivalStopTermChanged
    | InitializeRouting
    | StopsSelected;

let stopSearchInstance: WebAssemblyInstance<StopSearchExports>;
let routingInstance: WebAssemblyInstance<RaptorExports>;
let stopGroupIndex: { name: string; stopIds: number[] }[];
let routeNames: [string, string, number, string | null][];
let stopNames: string[];

async function copyToWasmMemory<T extends WebAssembly.Exports & { memory: WebAssembly.Memory; }>(instance: WebAssemblyInstance<T>,
    res: Response,
    numSizes: number,
    getOffset: (instance: WebAssemblyInstance<T>, sizes: number[]) => number) {
    let reader = res.body.getReader();
    let done = false;
    let offset;
    let sizes = [];
    let sizesBuffer = new Uint8Array(numSizes * 4);
    let received = 0;
    while (!done) {
        let read = await reader.read();
        done = read.done;
        if (read.done) {
            break;
        }
        let data = read.value;

        if (sizes.length == 0) {
            sizesBuffer.set(data.slice(0, Math.min(4 * numSizes - received, data.byteLength)), received);
            received += data.byteLength;
            if (received < numSizes * 4) {
                continue;
            } else {
                let view = new DataView(sizesBuffer.buffer);
                for (let i = 0; i < numSizes; i++) {
                    sizes.push(view.getUint32(i * 4, true));
                }
                data = data.slice(numSizes * 4 - received);
            }
        }
        if (sizes.length > 0 && offset == undefined) {
            offset = getOffset(instance, sizes);
        }
        if (offset != undefined) {
            new Uint8Array(instance.exports.memory.buffer, offset, data.length).set(data);
            offset += data.length;
        }
    }
}


async function initRouting() {
    if (routingInstance) {
        return;
    }
    let routeNamesTask = fetch(new URL("../../preprocessing-dist/routes.json", import.meta.url).toString()).then(res => res.json()).then(j => routeNames = j);
    let stopNamesTask = fetch(new URL("../../preprocessing-dist/stopnames.txt", import.meta.url).toString()).then(res => res.text()).then(text => stopNames = text.split("\n"));
    let populateTimezonesTask = import("timezone-support/dist/data-2012-2022").then(d => populateTimeZones(d));
    let [instantiatedSource, binaryResponse] = await Promise.all([<Promise<WebAssemblyInstantiatedSource<RaptorExports>>>WebAssembly.instantiateStreaming(
        fetch(new URL("../../raptor/raptor.wasm", import.meta.url).toString())
    ), fetch(new URL("../../preprocessing-dist/raptor_data.bin.bmp", import.meta.url).toString())]);
    await Promise.all([routeNamesTask, stopNamesTask, populateTimezonesTask, copyToWasmMemory(instantiatedSource.instance, binaryResponse, 8,
        (instance, sizes) => instance.exports.raptor_allocate(sizes[0], sizes[1], sizes[2], sizes[3], sizes[4], sizes[5], sizes[6], sizes[7]))]);
    routingInstance = instantiatedSource.instance;
}

async function initStopSearch() {
    if (stopSearchInstance) {
        return;
    }
    let stopGroupIndexTask = fetch(new URL("../../preprocessing-dist/stopgroup-index.json", import.meta.url).toString()).then(res => res.json()).then(idx => stopGroupIndex = idx);
    let [instantiatedSource, binaryResponse] = await Promise.all([<Promise<WebAssemblyInstantiatedSource<StopSearchExports>>>WebAssembly.instantiateStreaming(
        fetch(new URL("../../stopsearch/stopsearch.wasm", import.meta.url).toString())
    ), fetch(new URL("../../preprocessing-dist/stop_search.bin.bmp", import.meta.url).toString())]);
    await Promise.all([stopGroupIndexTask, copyToWasmMemory(instantiatedSource.instance, binaryResponse, 4, (instance, sizes) => instance.exports.stopsearch_allocate(sizes[0] / 12, sizes[1], sizes[3] / 2))]);
    instantiatedSource.instance.exports.stopsearch_reset();
    stopSearchInstance = instantiatedSource.instance;
}

let lastValue: string = "";
let state: State = {
    arrivalStopResults: [],
    departureStopResults: [],
    results: []
};

function updateState(updateFn: (oldState: State) => Partial<State>) {
    let update = updateFn(state);
    state = {
        ...state,
        ...update
    };
    self.postMessage([update, Object.keys(update)]);
}

function searchTermChanged(term: string, departure: boolean) {
    if (null == stopSearchInstance) {
        return;
    }
    let value = term.toLowerCase()
        .replace(/ä/g, "a")
        .replace(/ö/g, "o")
        .replace(/ü/g, "u")
        .replace(/ß/g, "ss")
        .replace(/[^a-z0-9]/g, " ")
        .replace(/ +(?= )/g, '')
        .trim()
    if (value == lastValue) {
        return;
    }
    let result;
    if (value.length == lastValue.length + 1 && value.startsWith(lastValue)) {
        result = stopSearchInstance.exports.stopsearch_step(value.charCodeAt(value.length - 1));
    } else {
        result = stopSearchInstance.exports.stopsearch_reset();
        for (let i = 0; i < value.length; i++) {
            result = stopSearchInstance.exports.stopsearch_step(value.charCodeAt(i));
        }
    }
    lastValue = value;
    let resultArrayView = new DataView(stopSearchInstance.exports.memory.buffer, result, 2 * 4);
    let resultsCount = resultArrayView.getUint32(0, true);
    let resultsOffset = resultArrayView.getUint32(4, true);
    let resultsArray = new Uint16Array(stopSearchInstance.exports.memory.buffer, resultsOffset, resultsCount);
    let results: { id: number, name: string }[] = [];
    for (let i = 0; i < resultsCount; i++) {
        let stopGroupId = resultsArray[i];
        let stopGroup = stopGroupIndex[stopGroupId];
        results.push({ id: stopGroupId, name: stopGroup.name });
    }
    updateState(s => ({
        [departure ? "departureStopResults" : "arrivalStopResults"]: results
    }));
}

function dayOfWeekToMask(date: Date) {
    let mask = 0;
    if (date.getDay() == 0) {
        mask = 64;
    } else {
        mask = 1 << (date.getDay() - 1);
    }
    return mask;
}

const RAPTOR_MAX_REQUEST_STATIONS = 20;

const RAPTOR_LEG_SIZE = 24;
const RAPTOR_MAX_LEGS = 10;
const RAPTOR_ITINERARY_SIZE = RAPTOR_MAX_LEGS * RAPTOR_LEG_SIZE + 4;
const RAPTOR_MAX_ITINERARIES = 8;
const RAPTOR_RESULTS_SIZE = RAPTOR_MAX_ITINERARIES * RAPTOR_ITINERARY_SIZE + 4;

function getStartOfDayVienna(date: Date): number {
    const vienna = findTimeZone("Europe/Vienna");
    const viennaTime = getZonedTime(date, vienna);
    const startOfDayVienna = getUnixTime({
        year: viennaTime.year,
        month: viennaTime.month,
        day: viennaTime.day,
        hours: 0,
        minutes: 0,
        seconds: 0,
    }, vienna);
    return startOfDayVienna;
}

function readLeg(buffer: ArrayBuffer, offset: number): Leg {
    let view = new DataView(buffer, offset, RAPTOR_LEG_SIZE);
    let departureStopId = view.getUint16(4, true);
    let arrivalStopId = view.getUint16(6, true);
    let departureSeconds = view.getUint32(8, true);
    let arrivalSeconds = view.getUint32(12, true);
    let leg: Leg = {
        type: view.getUint32(0, true),
        departureStop: {
            stopId: departureStopId,
            stopName: stopNames[departureStopId]
        },
        arrivalStop: {
            stopId: arrivalStopId,
            stopName: stopNames[arrivalStopId]
        },
        departureTime: new Date(getStartOfDayVienna(new Date()) + departureSeconds * 1000),
        arrivalTime: new Date(getStartOfDayVienna(new Date()) + arrivalSeconds * 1000),
        duration: (arrivalSeconds - departureSeconds) * 1000,
        route: null,
        tripId: null
    };
    if (leg.type == 1) {
        let routeId = view.getUint16(16, true);
        leg.route = {
            name: routeNames[routeId][0],
            color: routeNames[routeId].length > 3 ? routeNames[routeId][3] : (routeNames[routeId][2] == 0 ? "c4121a" : ""),
            id: routeId,
            headsign: routeNames[routeId][1]
        };
        leg.tripId = view.getUint32(18, true);
    }
    return leg;
}

function readItinerary(buffer: ArrayBuffer, offset: number): Itinerary {
    let legs = [];
    let view = new DataView(buffer, offset, RAPTOR_ITINERARY_SIZE);
    let numLegs = view.getUint32(0, true);
    for (let i = 0; i < numLegs; i++) {
        legs.push(readLeg(buffer, offset + 4 + i * RAPTOR_LEG_SIZE));
    }
    return { legs: legs.reverse() };
}

function readResults(memory: WebAssembly.Memory, offset: number): Itinerary[] {
    let itineraries = [];
    let view = new DataView(memory.buffer, offset, RAPTOR_RESULTS_SIZE);
    let numItineraries = view.getUint32(0, true);
    for (let i = 0; i < numItineraries; i++) {
        let itinerary = readItinerary(memory.buffer, offset + 4 + i * RAPTOR_ITINERARY_SIZE);
        itineraries.push(itinerary);
    }
    return itineraries;
}

async function stopsSelected(departure: number, arrival: number) {
    if (null == routingInstance) {
        return;
    }
    let now = new Date();
    let requestMemory = routingInstance.exports.get_request_memory();
    let view = new DataView(routingInstance.exports.memory.buffer, requestMemory, 4 + 4 + (RAPTOR_MAX_REQUEST_STATIONS + RAPTOR_MAX_REQUEST_STATIONS) * 2 + RAPTOR_MAX_REQUEST_STATIONS * 4);
    view.setUint8(0, 0);
    let departureStops = stopGroupIndex[state.departureStopResults[departure].id].stopIds;
    let arrivalStop = stopGroupIndex[state.arrivalStopResults[arrival].id].stopIds[0];
    view.setUint8(1, Math.min(RAPTOR_MAX_REQUEST_STATIONS, departureStops.length));
    view.setUint8(2, 1);
    view.setUint8(3, dayOfWeekToMask(now));
    for (let i = 0; i < Math.min(RAPTOR_MAX_REQUEST_STATIONS, departureStops.length); i++) {
        view.setUint16(4 + i * 2, departureStops[i], true);
    }
    view.setUint16(4 + RAPTOR_MAX_REQUEST_STATIONS * 2, arrivalStop, true);
    let startOfDayVienna = getStartOfDayVienna(now);
    let departureDate = startOfDayVienna / 1000;
    let departureTime = (+now - startOfDayVienna) / 1000;
    for (let i = 0; i < Math.min(RAPTOR_MAX_REQUEST_STATIONS, departureStops.length); i++) {
        view.setUint32(4 + (RAPTOR_MAX_REQUEST_STATIONS + RAPTOR_MAX_REQUEST_STATIONS) * 2 + i * 4, departureTime, true);
    }
    view.setUint32(4 + (RAPTOR_MAX_REQUEST_STATIONS + RAPTOR_MAX_REQUEST_STATIONS) * 2 + RAPTOR_MAX_REQUEST_STATIONS * 4, departureDate, true);
    let results = readResults(routingInstance.exports.memory, routingInstance.exports.raptor());
    updateState(() => ({ results: results }))
}

async function handleMessage(msg: Actions) {
    switch (msg.type) {
        case ActionType.InitializeStopSearch:
            await initStopSearch();
            break;
        case ActionType.DepartureStopTermChanged: {
            searchTermChanged(msg.term, true);
            break;
        }
        case ActionType.ArrivalStopTermChanged: {
            searchTermChanged(msg.term, false);
            break;
        }
        case ActionType.InitializeRouting: {
            await initRouting();
            break;
        }
        case ActionType.StopsSelected: {
            stopsSelected(msg.departure, msg.arrival);
            break;
        }
    }
}

self.addEventListener("message", ev => {
    let msg: Actions = ev.data;
    handleMessage(msg).catch(err => console.error(err));
});