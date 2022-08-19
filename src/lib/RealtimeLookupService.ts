import { RoutingService } from "./RoutingService";
import { RouteInfoStore } from "./RouteInfoStore";
import { RealtimeIdentifier } from "./RealtimeIdentifier";

export class RealtimeLookupService {
    private lookedUp: { rtIdentifier: RealtimeIdentifier, when: Date }[] = [];

    constructor(private routeInfoStore: RouteInfoStore,
        private routingService: RoutingService) {
    }

    private hasJustBeenLookedUp(rtIdentifier: RealtimeIdentifier) {
        return this.lookedUp.some(lookedUp =>
            lookedUp.rtIdentifier.type == rtIdentifier.type &&
            lookedUp.rtIdentifier.value == rtIdentifier.value &&
            (new Date().getTime() - lookedUp.when.getTime()) < 1000 * 30);
    }

    private setLookedUp(rtIdentifier: RealtimeIdentifier) {
        let existing = this.lookedUp.find(lookedUp => lookedUp.rtIdentifier.type == rtIdentifier.type && lookedUp.rtIdentifier.value == rtIdentifier.value);
        if (existing) {
            existing.when = new Date();
        }
        else {
            this.lookedUp.push({ rtIdentifier: rtIdentifier, when: new Date() });
        }
    }

    async performWithRealtimeLoopkup(perform: () => Promise<number[]>) {
        for (let i = 0; i < 10; i++) {
            let stopIds = await perform();

            let lookupIdentifiers: RealtimeIdentifier[] = [];
            for (let id of stopIds.reduce((realtimeIdentifiers, stopId) => [...realtimeIdentifiers, this.routeInfoStore.getRealtimeIdentifier(stopId)], [])) {
                if (id !== null && !this.hasJustBeenLookedUp(id) && !lookupIdentifiers.some(identifier => identifier.type == id.type && identifier.value == id.value)) {
                    lookupIdentifiers.push(id);
                }
            }
            if (lookupIdentifiers.length == 0) {
                break;
            }
            await this.routingService.updateRealtimeForStops(lookupIdentifiers);
            for (let id of lookupIdentifiers) {
                this.setLookedUp(id);
            }
        }
    }
}
