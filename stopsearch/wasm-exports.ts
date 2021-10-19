export interface StopSearchExports extends WebAssembly.Exports {
    stopsearch_allocate: (numNodes: number, numChildren: number, numResults: number) => number;
    stopsearch_reset: () => number;
    stopsearch_step: (c: number) => number;
    memory: WebAssembly.Memory;
}