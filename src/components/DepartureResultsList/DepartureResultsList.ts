import { Departure } from "../../lib/Departure";
import { DisplayMoreDepartures } from "../../state/actions/DisplayMoreDepartures";
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
    private intersectionObserver: IntersectionObserver;
    private moreRequestedAt = 0;
    private lastSelectedDest: number = null;

    constructor() {
        super();
        this.store = Store.getInstance();
    }

    private requestMoreDepartures() {
        this.store.postAction(new DisplayMoreDepartures());
    }

    connectedCallback() {
        this.abortController = new AbortController();
        this.intersectionObserver = new IntersectionObserver((intersections) => {
            if (intersections.some(i => i.isIntersecting)) {
                if (this.moreRequestedAt >= this.departures.length) {
                    return;
                } else {
                    this.requestMoreDepartures();
                }
                this.moreRequestedAt = this.departures.length;
            }
        });
        if (!this.rendered) {
            this.innerHTML = template;
            this.rendered = true;
            this.renderer = new ArrayToElementRenderer<Departure, DepartureSummary, number>(this, e => this.departures.indexOf(e), e => {
                let s = new DepartureSummary();
                return s;
            });
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
            c.update(i);
        });
        this.intersectionObserver.disconnect();
        if (this.lastElementChild) {
            this.intersectionObserver.observe(this.lastElementChild);
        }

    }

    private update(s: State, c: StateChanges) {
        if (c.includes("departures")) {
            this.setResults(s);
        }
        if (c.includes("selectedStopgroups")) {
            if (s.selectedStopgroups.departure?.id != this.lastSelectedDest) {
                this.lastSelectedDest = s.selectedStopgroups.departure?.id;
                this.moreRequestedAt = 0;
            }
        }
    }

    private init(s: State) {
        this.setResults(s);
    }

    disconnectedCallback() {
        this.abortController.abort();
        this.intersectionObserver.disconnect();
    }
}

customElements.define("departure-results-list", DepartureResultsList);