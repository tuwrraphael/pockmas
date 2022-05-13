import { Departure } from "../../lib/Departure";
import { State, StateChanges } from "../../state/State";
import { Store } from "../../state/Store";
import { ArrayToElementRenderer } from "../../utils/ArrayToElementRenderer";
import { DepartureSummary } from "../DepartureSummary/DepartureSummary";
import template from "./DepartureResultsList.html";
import "./DepartureResultsList.scss";

export class DepartureResultsList extends HTMLElement {
    private rendered = false;
    private store: Store;
    private abortController: AbortController;
    private departures: Departure[] = [];
    private renderer: ArrayToElementRenderer<Departure, DepartureSummary, number>;

    constructor() {
        super();
        this.store = Store.getInstance();
    }

    connectedCallback() {
        this.abortController = new AbortController();
        if (!this.rendered) {
            this.innerHTML = template;
            this.rendered = true;
            this.renderer = new ArrayToElementRenderer<Departure, DepartureSummary, number>(this, e => this.departures.indexOf(e), e => new DepartureSummary());
        }
        this.store.subscribe((s, c) => this.update(s, c), this.abortController.signal);
        this.init(this.store.state);
    }

    private setResults(s: State) {
        if (!s?.departures) {
            return;
        }
        this.departures = s.departures;
        this.renderer.update(this.departures, (c, i) => {
            c.update(i)
        });
    }

    private update(s: State, c: StateChanges) {
        if (c.includes("departures")) {
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

customElements.define("departure-results-list", DepartureResultsList);