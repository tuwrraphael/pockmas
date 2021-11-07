import { RaptorExports } from "../../raptor/wasm-exports";
import { StopSearchExports } from "../../stopsearch/wasm-exports";
import { ActionType } from "./actions/ActionType";
import { ArrivalStopTermChanged } from "./actions/ArrivalStopTermChanged";
import { DepartureStopTermChanged } from "./actions/DepartureStopTermChanged";
import { InitializeRouting } from "./actions/InitializeRouting";
import { InitializeStopSearch } from "./actions/InitializeStopSearch";
import { State } from "./State";
import { StopsSelected } from "./actions/StopsSelected";
import { populateTimeZones } from "timezone-support/dist/lookup-convert";
import { copyToWasmMemory } from "../utils/copyToWasmMemory";
import { RoutingService } from "../lib/RoutingService";

type Actions = InitializeStopSearch
    | DepartureStopTermChanged
    | ArrivalStopTermChanged
    | InitializeRouting
    | StopsSelected;

let stopSearchInstance: WebAssemblyInstance<StopSearchExports>;
let routingInstance: RoutingService;
let stopGroupIndex: { name: string; stopIds: number[] }[];

async function initRouting() {
    if (routingInstance) {
        return;
    }
    let routeNamesTask = fetch(new URL("../../preprocessing-dist/routes.json", import.meta.url).toString()).then(res => (res.json()) as Promise<[string, string, number, string | null][]>);
    let stopNamesTask = fetch(new URL("../../preprocessing-dist/stops.json", import.meta.url).toString()).then(res => res.json() as Promise<[string, number][]>);
    let populateTimezonesTask = import("timezone-support/dist/data-2012-2022").then(d => populateTimeZones(d));
    let [instantiatedSource, binaryResponse] = await Promise.all([<Promise<WebAssemblyInstantiatedSource<RaptorExports>>>WebAssembly.instantiateStreaming(
        fetch(new URL("../../raptor/raptor.wasm", import.meta.url).toString())
    ), fetch(new URL("../../preprocessing-dist/raptor_data.bin.bmp", import.meta.url).toString())]);
    let [routeNames, stops] = await Promise.all([routeNamesTask, stopNamesTask, populateTimezonesTask, copyToWasmMemory(instantiatedSource.instance, binaryResponse, 11,
        (instance, sizes) => instance.exports.raptor_allocate(sizes[0], sizes[1], sizes[2], sizes[3], sizes[4], sizes[5], sizes[6], sizes[7], sizes[8], sizes[9], sizes[10]))]);
    instantiatedSource.instance.exports.initialize();
    routingInstance = new RoutingService(instantiatedSource.instance, routeNames, stops);
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

async function stopsSelected(departure: number, arrival: number) {
    if (null == routingInstance) {
        return;
    }
    let now = new Date();
    let departureStops = stopGroupIndex[state.departureStopResults[departure].id].stopIds;
    let arrivalStop = stopGroupIndex[state.arrivalStopResults[arrival].id].stopIds[0];
    let results = routingInstance.route({
        arrivalStop: arrivalStop,
        departureStops: departureStops,
        departureTimes: departureStops.map(() => now)
    });
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