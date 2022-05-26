import { RoutingService } from "./RoutingService";
import { RouteInfoStore } from "./RouteInfoStore";

export class RealtimeLookupService {
    private lookedUpDivas = new Map<number, Date>();

    constructor(private routeInfoStore: RouteInfoStore,
        private routingService: RoutingService) {
    }

    async performWithRealtimeLoopkup(perform: () => Promise<number[]>) {
        for (let i = 0; i < 10; i++) {
            let stopIds = await perform();
            let divas = stopIds.reduce((divas, stopId) => [...divas, this.routeInfoStore.getDiva(stopId)], [])
                .filter(d => null != d && !this.lookedUpDivas.has(d) || (new Date().getTime() - this.lookedUpDivas.get(d).getTime()) > 1000 * 30);
            if (divas.length == 0) {
                break;
            }
            await this.routingService.updateRealtimeForStops(Array.from(new Set(divas).values()));
            for (let diva of divas) {
                this.lookedUpDivas.set(diva, new Date());
            }
        }
    }
}
