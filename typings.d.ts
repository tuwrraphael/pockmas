declare module '*.html' {
    const content: string;
    export default content;
}
declare const __ENVIRONMENT : "local"|"gh-pages";
declare const __CACHENAME : string;

interface WebAssemblyInstantiatedSource<TExports extends WebAssembly.Exports> extends WebAssembly.WebAssemblyInstantiatedSource {
    instance: WebAssemblyInstance<TExports>;
}

interface WebAssemblyInstance<TExports extends WebAssembly.Exports> extends WebAssembly.Instance {
    exports: TExports
}

declare module "*.scss" {
    const content: string;
    export default content;
}