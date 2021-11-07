import { Itinerary } from "../../lib/Itinerary";
import { State, StateChanges } from "../../state/State";
import { Store } from "../../state/Store";
import { ArrayToElementRenderer } from "../../utils/ArrayToElementRenderer";
import { RouteSummary } from "../RouteSummary/RouteSummary";
import template from "./RouteResults.html";
import "./RouteResults.scss";

export class RouteResults extends HTMLElement {
    private rendered = false;
    private store: Store;
    private abortController: AbortController;
    private itineraries: Itinerary[] = [];
    private renderer: ArrayToElementRenderer<Itinerary, RouteSummary, number>;

    constructor() {
        super();
        this.store = Store.getInstance();
    }

    connectedCallback() {
        this.abortController = new AbortController();
        if (!this.rendered) {
            this.innerHTML = template;
            this.rendered = true;
            this.renderer = new ArrayToElementRenderer<Itinerary, RouteSummary, number>(this, e => this.itineraries.indexOf(e), e => new RouteSummary());
        }
        this.store.subscribe((s, c) => this.update(s, c), this.abortController.signal);
    }

    private update(s: State, c: StateChanges) {
        if (c.includes("results")) {
            this.itineraries = s.results;
            this.renderer.update(this.itineraries, (c, i) => {
                c.update(i)
            });
        }
    }

    disconnectedCallback() {
        this.abortController.abort();
    }
}

customElements.define("route-results", RouteResults);
