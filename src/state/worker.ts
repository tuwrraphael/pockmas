import { ActionType } from "./actions/ActionType";
import { ArrivalStopTermChanged } from "./actions/ArrivalStopTermChanged";
import { DepartureStopTermChanged } from "./actions/DepartureStopTermChanged";
import { InitializeStopSearch } from "./actions/InitializeStopSearch";
import { State } from "./state";

type Actions = InitializeStopSearch
    | DepartureStopTermChanged
    | ArrivalStopTermChanged;


interface WebAssemblyInstantiatedSource<TExports extends WebAssembly.Exports> extends WebAssembly.WebAssemblyInstantiatedSource {
    instance: WebAssemblyInstance<TExports>;
}

interface WebAssemblyInstance<TExports extends WebAssembly.Exports> extends WebAssembly.Instance {
    exports: TExports
}

interface StopSearchExports extends WebAssembly.Exports {
    stopsearch_allocate: (numNodes: number, numChildren: number, numResults: number) => number;
    stopsearch_reset: () => number;
    stopsearch_step: (c: number) => number;
    memory: WebAssembly.Memory;
}

let stopSearchInstance: WebAssemblyInstance<StopSearchExports>;
let stopGroupIndex: { name: string; stopIds: number[] }[];

async function populateSearchIndex(instance: WebAssemblyInstance<StopSearchExports>, res: Response) {
    let reader = res.body.getReader();
    let done = false;
    let offset;
    let sizes = [];
    let numSizes = 4;
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
            offset = instance.exports.stopsearch_allocate(sizes[0] / 12, sizes[1], sizes[3] / 2);
        }
        if (offset != undefined) {
            new Uint8Array(instance.exports.memory.buffer, offset, data.length).set(data);
            offset += data.length;
        }
    }
}


async function initStopSearch() {
    if (stopSearchInstance) {
        return;
    }
    let stopGroupIndexTask = fetch(new URL("../../preprocessing-dist/stopgroup-index.json", import.meta.url).toString()).then(res => res.json()).then(idx => stopGroupIndex = idx);
    let [instantiatedSource, binaryResponse] = await Promise.all([<Promise<WebAssemblyInstantiatedSource<StopSearchExports>>>WebAssembly.instantiateStreaming(
        fetch(new URL("../../stopsearch/stopsearch.wasm", import.meta.url).toString())
    ), fetch(new URL("../../preprocessing-dist/stop_search.bin", import.meta.url).toString())]);
    await Promise.all([stopGroupIndexTask, populateSearchIndex(instantiatedSource.instance, binaryResponse)]);
    instantiatedSource.instance.exports.stopsearch_reset();
    stopSearchInstance = instantiatedSource.instance;
}

let lastValueBy = {
    departure: "",
    arrival: ""
};

let state: State = {
    arrivalStopResults: [],
    departureStopResults: []
};

function updateState(updateFn: (oldState: State) => State) {
    state = updateFn(state);
    self.postMessage(state);
}

function searchTermChanged(term: string, departure: boolean) {
    if (null == stopSearchInstance) {
        return;
    }
    let lastValue = lastValueBy[departure ? "departure" : "arrival"];
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
    if (value.length == lastValue.length + 1) {
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
    updateState(s => {
        return {
            ...s,
            [departure ? "departureStopResults" : "arrivalStopResults"]: results
        }
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
    }
}

self.addEventListener("message", ev => {
    let msg: Actions = ev.data;
    handleMessage(msg).catch(err => console.error(err));
});