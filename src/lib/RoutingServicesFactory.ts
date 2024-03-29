import { RouteInfoStore } from "./RouteInfoStore";
import { RoutingService } from "./RoutingService";
import { populateTimeZones } from "timezone-support/lookup-convert";
import { RaptorExports } from "../../raptor/wasm-exports";
import { copyToWasmMemory } from "../utils/copyToWasmMemory";
import { RouteDetailsService } from "./RouteDetailsService";
import { RouteUrlEncoder } from "./RouteUrlEncoder";
import { RealtimeLookupService } from "./RealtimeLookupService";
import { StopGroupStore } from "./StopGroupStore";
import { TimezoneUtility } from "./time/TimezoneUtility";

export class RoutingServicesFactory {
    private routingServicePromise: Promise<RoutingService>;
    private routeInfoStorePromise: Promise<RouteInfoStore>;
    private timezoneUtilityPromise: Promise<TimezoneUtility>;
    private routingInstancePromise: Promise<WebAssemblyInstance<RaptorExports>>;
    private routeDetailsServicePromise: Promise<RouteDetailsService>;
    private readonly dataVersion = new URL("../../preprocessing-dist/raptor_data.bin.bmp", import.meta.url).toString().split("/").pop().replace(".bmp", "");
    private realtimeLookupServicePromise: Promise<RealtimeLookupService>;
    private stopGroupStorePromise: Promise<StopGroupStore>;
    private routeUrlEncoderPromise: Promise<RouteUrlEncoder>;

    private async createTimezoneUtility() {
        const { default: defaultFunc } = await import("timezone-support/data-1970-2038");
        populateTimeZones(defaultFunc);
        return new TimezoneUtility("Europe/Vienna");
    }

    private async getTimezoneUtility() {
        if (this.timezoneUtilityPromise == null) {
            this.timezoneUtilityPromise = this.createTimezoneUtility();
        }
        return this.timezoneUtilityPromise;
    }

    private async createRouteInfoStore() {
        let routesTask = fetch(new URL("../../preprocessing-dist/routes.json", import.meta.url).toString()).then(res => (res.json()) as Promise<[number, number][]>);
        let stopsTask = fetch(new URL("../../preprocessing-dist/stops.json", import.meta.url).toString()).then(res => res.json() as Promise<[string, number, number][]>);
        let routeClassesTask = fetch(new URL("../../preprocessing-dist/route-classes.json", import.meta.url).toString()).then(res => res.json() as Promise<{
            routeClassName: string;
            headsignVariants: string[];
            routeType: number;
            routeColor?: string;
        }[]>);
        let routeClassesByRealtimeIdentifierTask = fetch(new URL("../../preprocessing-dist/route-classes-by-realtime-identifier.json", import.meta.url).toString()).then(res => res.json() as Promise<[type: number, value: number, ...routeClasses: number[]][]>);
        let [routes, stops, routeClasses, routeClassesByRealtimeIdentifier] = await Promise.all([routesTask, stopsTask, routeClassesTask, routeClassesByRealtimeIdentifierTask]);
        return new RouteInfoStore(routes, routeClasses, routeClassesByRealtimeIdentifier, stops);
    }

    private async createRoutingInstance() {
        let [instantiatedSource, binaryResponse] = await Promise.all([<Promise<WebAssemblyInstantiatedSource<RaptorExports>>>WebAssembly.instantiateStreaming(
            fetch(new URL("../../raptor/raptor.wasm", import.meta.url).toString())
        ), fetch(new URL("../../preprocessing-dist/raptor_data.bin.bmp", import.meta.url).toString())]);
        await copyToWasmMemory(instantiatedSource.instance, binaryResponse, 11,
            (instance, sizes) => instance.exports.raptor_allocate(sizes[0], sizes[1], sizes[2], sizes[3], sizes[4], sizes[5], sizes[6], sizes[7], sizes[8], sizes[9], sizes[10]));
        instantiatedSource.instance.exports.initialize();
        return instantiatedSource.instance;
    }

    private async getRoutingInstance() {
        if (this.routingInstancePromise == null) {
            this.routingInstancePromise = this.createRoutingInstance();
        }
        return this.routingInstancePromise;
    }

    async getRouteInfoStore() {
        if (this.routeInfoStorePromise == null) {
            this.routeInfoStorePromise = this.createRouteInfoStore();
        }
        return this.routeInfoStorePromise;
    }

    private async createRoutingService() {
        let [routingInstance, routeInfoStore, timezoneUtility] = await Promise.all([this.getRoutingInstance(), this.getRouteInfoStore(), this.getTimezoneUtility()])
        return new RoutingService(routingInstance, routeInfoStore, timezoneUtility);
    }

    async getRoutingService() {
        if (this.routingServicePromise == null) {
            this.routingServicePromise = this.createRoutingService();
        }
        return this.routingServicePromise;
    }

    private async createRouteDetailsService() {
        let [routingInstance, routeInfoStore, timezoneUtility, routingService] = await Promise.all([this.getRoutingInstance(), this.getRouteInfoStore(), this.getTimezoneUtility(), this.getRoutingService()])
        return new RouteDetailsService(new RouteUrlEncoder(this.dataVersion, timezoneUtility), routeInfoStore, routingInstance, routingService, timezoneUtility);
    }

    async getRouteDetailsService() {
        if (this.routeDetailsServicePromise == null) {
            this.routeDetailsServicePromise = this.createRouteDetailsService();
        }
        return this.routeDetailsServicePromise;
    }

    private async createRealtimeLookupService() {
        let [routingService, routeInfoStore] = await Promise.all([this.getRoutingService(), this.getRouteInfoStore()])
        return new RealtimeLookupService(routeInfoStore, routingService);
    }

    async getRealtimeLookupService() {
        if (this.realtimeLookupServicePromise == null) {
            this.realtimeLookupServicePromise = this.createRealtimeLookupService();
        }
        return this.realtimeLookupServicePromise;
    }

    private async createStopGroupStore() {
        let stopGroupIndexTask = fetch(new URL("../../preprocessing-dist/stopgroup-index.json", import.meta.url).toString()).then(res => res.json()) as Promise<{ name: string; stopIds: number[] }[]>;
        return new StopGroupStore(await stopGroupIndexTask);
    }

    async getStopGroupStore() {
        if (this.stopGroupStorePromise == null) {
            this.stopGroupStorePromise = this.createStopGroupStore();
        }
        return this.stopGroupStorePromise;
    }

    private async createRouteUrlEncoder() {
        let timezoneUtility = await this.getTimezoneUtility();
        return new RouteUrlEncoder(this.dataVersion, timezoneUtility);
    }

    async getRouteUrlEncoder() {
        if (this.routeUrlEncoderPromise == null) {
            this.routeUrlEncoderPromise = this.createRouteUrlEncoder();
        }
        return this.routeUrlEncoderPromise;
    }
}