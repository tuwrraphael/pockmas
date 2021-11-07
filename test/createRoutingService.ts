import { RaptorExports } from "../raptor/wasm-exports";
import { RoutingService } from "../src/lib/RoutingService";
import { copyToWasmMemory } from "../src/utils/copyToWasmMemory";


export async function createRoutingService() {
    let routeNamesTask = fetch(new URL("../preprocessing-dist/routes.json", import.meta.url).toString()).then(res => (res.json()) as Promise<[string, string, number, string | null][]>);
    let stopNamesTask = fetch(new URL("../preprocessing-dist/stops.json", import.meta.url).toString()).then(res => res.json() as Promise<[string, number][]>);
    let [instantiatedSource, binaryResponse] = await Promise.all([<Promise<WebAssemblyInstantiatedSource<RaptorExports>>>WebAssembly.instantiateStreaming(
        fetch(new URL("../raptor/raptor.wasm", import.meta.url).toString())
    ), fetch(new URL("../preprocessing-dist/raptor_data.bin.bmp", import.meta.url).toString())]);
    let [routeNames, stops] = await Promise.all([routeNamesTask, stopNamesTask, copyToWasmMemory(instantiatedSource.instance, binaryResponse, 11,
        (instance, sizes) => instance.exports.raptor_allocate(sizes[0], sizes[1], sizes[2], sizes[3], sizes[4], sizes[5], sizes[6], sizes[7], sizes[8], sizes[9], sizes[10]))]);
    instantiatedSource.instance.exports.initialize();
    return new RoutingService(instantiatedSource.instance, routeNames, stops);
}
