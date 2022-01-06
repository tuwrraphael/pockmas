import { State } from "../../state/State";
import { Store } from "../../state/Store";
import template from "./RouteDetails.html";
import "./RouteDetails.scss";

export class RouteDetails extends HTMLElement {
    private rendered = false;
    private store: Store;
    private abortController: AbortController;

    constructor() {
        super();
        this.store = Store.getInstance();
    }

    connectedCallback() {
        this.abortController = new AbortController();
        if (!this.rendered) {
            this.innerHTML = template;
            this.rendered = true;
        }
        this.store.subscribe((s, c) => this.update(s, c), this.abortController.signal);
    }

    update(s: State, c: (keyof State)[]): void {
        if (c.indexOf("routeDetail") > -1) {
            let text = "";
            for (let l of s.routeDetail.itinerary.legs) {
                text += `<div>${l.departureStop.stopName} - ${l.arrivalStop.stopName}</div>`;
            }
            this.innerHTML = text;
        }
    }

    disconnectedCallback() {
        this.abortController.abort();
    }
}

customElements.define("route-details", RouteDetails);
