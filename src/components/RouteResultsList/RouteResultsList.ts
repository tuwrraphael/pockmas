import { Itinerary } from "../../lib/Itinerary";
import { ItineraryDisplayModel } from "../../state/models/ItineraryDisplayModel";
import { State, StateChanges } from "../../state/State";
import { Store } from "../../state/Store";
import { ArrayToElementRenderer } from "../../utils/ArrayToElementRenderer";
import { RouteSummary } from "../RouteSummary/RouteSummary";
import template from "./RouteResultsList.html";
import "./RouteResultsList.scss";

export class RouteResultsList extends HTMLElement {
    private rendered = false;
    private store: Store;
    private abortController: AbortController;
    private itineraries: ItineraryDisplayModel[] = [];
    private renderer: ArrayToElementRenderer<ItineraryDisplayModel, RouteSummary, number>;

    constructor() {
        super();
        this.store = Store.getInstance();
    }

    connectedCallback() {
        this.abortController = new AbortController();
        if (!this.rendered) {
            this.innerHTML = template;
            this.rendered = true;
            this.renderer = new ArrayToElementRenderer<ItineraryDisplayModel, RouteSummary, number>(this, e => this.itineraries.indexOf(e), e => new RouteSummary());
        }
        this.store.subscribe((s, c) => this.update(s, c), this.abortController.signal);
        this.init(this.store.state);
    }

    private setResults(s: State) {
        if (!s.results) {
            return;
        }
        this.itineraries = s.results;
        this.renderer.update(this.itineraries, (c, i) => {
            c.update(i)
        });
    }

    private update(s: State, c: StateChanges) {
        if (c.includes("results")) {
            this.setResults(s);    
        }
    }

    private init(s: State) {
        this.setResults(s);
    }

    disconnectedCallback() {
        this.abortController.abort();
    }
}

customElements.define("route-results-list", RouteResultsList);
