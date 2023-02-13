import { StopSearchExports } from "../../stopsearch/wasm-exports";
import { ActionType } from "./actions/ActionType";
import { ArrivalStopTermChanged } from "./actions/ArrivalStopTermChanged";
import { DepartureStopTermChanged } from "./actions/DepartureStopTermChanged";
import { InitializeRouting } from "./actions/InitializeRouting";
import { InitializeStopSearch } from "./actions/InitializeStopSearch";
import { State } from "./State";
import { StopsSelected } from "./actions/StopsSelected";
import { copyToWasmMemory } from "../utils/copyToWasmMemory";
import { SetDepartureTime } from "./actions/SetDepartureTime";
import { RouteUrlEncoder } from "../lib/RouteUrlEncoder";
import { RoutingServicesFactory } from "../lib/RoutingServicesFactory";
import { RouteDetailsOpened } from "./actions/RouteDetailsOpened";
import { DisplayMoreDepartures } from "./actions/DisplayMoreDepartures";

type Actions = InitializeStopSearch
    | DepartureStopTermChanged
    | ArrivalStopTermChanged
    | InitializeRouting
    | StopsSelected
    | SetDepartureTime
    | RouteDetailsOpened
    | DisplayMoreDepartures;

let stopSearchInstance: WebAssemblyInstance<StopSearchExports>;
let _departureTime: Date = null;

const dataVersion = new URL("../../preprocessing-dist/raptor_data.bin.bmp", import.meta.url).toString().split("/").pop().replace(".bmp", "");
const routeUrlEncoder = new RouteUrlEncoder(dataVersion);

const routingServicesFactory = new RoutingServicesFactory();

async function initRouting() {
    await routingServicesFactory.getRoutingService();
}

async function initStopSearch() {
    if (stopSearchInstance) {
        return;
    }
    let [instantiatedSource, binaryResponse] = await Promise.all([<Promise<WebAssemblyInstantiatedSource<StopSearchExports>>>WebAssembly.instantiateStreaming(
        fetch(new URL("../../stopsearch/stopsearch.wasm", import.meta.url).toString())
    ), fetch(new URL("../../preprocessing-dist/stop_search.bin.bmp", import.meta.url).toString())]);
    await Promise.all([await routingServicesFactory.getStopGroupStore(), copyToWasmMemory(instantiatedSource.instance, binaryResponse, 4, (instance, sizes) => instance.exports.stopsearch_allocate(sizes[0] / 12, sizes[1], sizes[3] / 2))]);
    instantiatedSource.instance.exports.stopsearch_reset();
    stopSearchInstance = instantiatedSource.instance;
}

let lastValue: string = "";
let state: State = {
    arrivalStopResults: [],
    departureStopResults: [],
    results: [],
    routeDetail: null,
    departures: [],
    selectedStopgroups: {
        departure: null,
        arrival: null
    }
};

function updateState(updateFn: (oldState: State) => Partial<State>) {
    let update = updateFn(state);
    state = {
        ...state,
        ...update
    };
    self.postMessage([update, Object.keys(update)]);
}

async function searchTermChanged(term: string, departure: boolean) {
    let stopGroupStore = await routingServicesFactory.getStopGroupStore();
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
    let resultsView = new DataView(stopSearchInstance.exports.memory.buffer, resultsOffset, resultsCount * 2);
    let results: { id: number, name: string }[] = [];
    for (let i = 0; i < resultsCount; i++) {
        let stopGroupId = resultsView.getUint16(i * 2, true);
        let stopGroup = stopGroupStore.getStopGroup(stopGroupId);
        results.push({ id: stopGroupId, name: stopGroup.name });
    }
    updateState(s => ({
        [departure ? "departureStopResults" : "arrivalStopResults"]: results
    }));
}

let getDeparturesRunning: Promise<void> = Promise.resolve();

async function searchInputChanged() {

    if (state.selectedStopgroups.arrival != null && state.selectedStopgroups.departure != null) {
        await route();
    } else if (state.selectedStopgroups.departure != null) {
        getDeparturesRunning = (async () => {
            updateState(s => ({
                results: []
            }));
            let stopGroupStore = await routingServicesFactory.getStopGroupStore();
            let routingService = await routingServicesFactory.getRoutingService();
            let realtimeLookupService = await routingServicesFactory.getRealtimeLookupService();

            let departureStops = stopGroupStore.getStopGroup(state.selectedStopgroups.departure.id).stopIds;

            await realtimeLookupService.performWithRealtimeLoopkup(async () => {
                let results = routingService.getDepartures({
                    departureStops: departureStops.map(d => ({ departureTime: _departureTime, stopId: d })),
                });
                updateState(() => ({ departures: results }));
                return results.map(r => r.stop.stopId);
            });
        })();
        await getDeparturesRunning;
    }
}

async function displayMoreDepartures() {
    await getDeparturesRunning;
    if (state.selectedStopgroups.departure != null && state.departures?.length > 0) {
        getDeparturesRunning = (async () => {
            let stopGroupStore = await routingServicesFactory.getStopGroupStore();
            let routingService = await routingServicesFactory.getRoutingService();
            let realtimeLookupService = await routingServicesFactory.getRealtimeLookupService();

            let departureStops = stopGroupStore.getStopGroup(state.selectedStopgroups.departure.id).stopIds;
            let departuresBefore = state.departures;
            await realtimeLookupService.performWithRealtimeLoopkup(async () => {
                let results = routingService.getDepartures({
                    departureStops: departureStops.map(d => ({ departureTime: new Date(departuresBefore[departuresBefore.length - 1].plannedDeparture.getTime() + departuresBefore[departuresBefore.length - 1].delay), stopId: d })),
                });
                let firstDuplicate = departuresBefore.findIndex(dbefore => results.some(dNew => dbefore.route.id == dNew.route.id && dbefore.tripId == dNew.tripId && dbefore.stop.stopId == dNew.stop.stopId));
                if (firstDuplicate != -1) {
                    firstDuplicate = departuresBefore.length;
                }
                updateState(() => ({ departures: [...departuresBefore.slice(0, firstDuplicate), ...results] }));
                return results.map(r => r.stop.stopId);
            });
        })();
    }
}

async function stopsSelected(d: number, a: number) {
    let stopGroupStore = await routingServicesFactory.getStopGroupStore();
    updateState(s => ({
        selectedStopgroups: {
            departure: d == null ? null : { id: d, name: stopGroupStore.getStopGroup(d).name },
            arrival: a == null ? null : { id: a, name: stopGroupStore.getStopGroup(a).name }
        }
    }));
    _departureTime = new Date();
    await searchInputChanged();
}

async function departureTimeInc(inc: number) {
    if (null == _departureTime) {
        return;
    }
    _departureTime = new Date(_departureTime.getTime() + inc);
    await searchInputChanged();
}

async function route() {
    let routingService = await routingServicesFactory.getRoutingService();
    let realtimeLookupService = await routingServicesFactory.getRealtimeLookupService();
    let stopGroupStore = await routingServicesFactory.getStopGroupStore();

    let departureStops = stopGroupStore.getStopGroup(state.selectedStopgroups.departure.id).stopIds;
    let arrivalStop = stopGroupStore.getStopGroup(state.selectedStopgroups.arrival.id).stopIds[0];

    await realtimeLookupService.performWithRealtimeLoopkup(async () => {
        let results = routingService.route({
            arrivalStop: arrivalStop,
            departureStops: departureStops,
            departureTimes: departureStops.map(() => _departureTime)
        });
        updateState(() => ({ results: results.map(i => ({ itineraryUrlEncoded: routeUrlEncoder.encode(i), itinerary: i })) }));
        return results.reduce((stopIds, r) => [...stopIds, ...r.legs.map(l => l.departureStop.stopId)], []);
    });
}

async function routeDetailsOpened(itineraryIdUrlEncoded: string) {
    let routeDetailsService = await routingServicesFactory.getRouteDetailsService();
    let stopGroupStore = await routingServicesFactory.getStopGroupStore();

    let realtimeLookupService = await routingServicesFactory.getRealtimeLookupService();
    realtimeLookupService.performWithRealtimeLoopkup(async () => {
        let itinerary = routeDetailsService.getRouteByUrl(itineraryIdUrlEncoded);
        updateState(() => ({
            routeDetail: { itineraryUrlEncoded: itineraryIdUrlEncoded, itinerary: itinerary },
            selectedStopgroups: {
                departure: stopGroupStore.findByStopId(itinerary.legs[0].departureStop.stopId),
                arrival: stopGroupStore.findByStopId(itinerary.legs[itinerary.legs.length - 1].arrivalStop.stopId)
            }
        }));
        return itinerary.legs.reduce((stopIds, r) => [...stopIds, r.departureStop.stopId], []);
    });
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
            await stopsSelected(msg.departure, msg.arrival);
            break;
        }
        case ActionType.SetDepartureTime: {
            await departureTimeInc(msg.increment);
            break;
        }
        case ActionType.RouteDetailsOpened: {
            await routeDetailsOpened(msg.itineraryUrlEncoded);
            break;
        }
        case ActionType.DisplayMoreDepartures: {
            await displayMoreDepartures();
            break;
        }
    }
}
self.postMessage([state, Object.keys(state)]);
self.addEventListener("message", ev => {
    let msg: Actions = ev.data;
    handleMessage(msg).catch(err => console.error(err));
});