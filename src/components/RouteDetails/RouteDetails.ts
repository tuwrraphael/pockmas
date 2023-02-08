import { State } from "../../state/State";
import { Store } from "../../state/Store";
import template from "./RouteDetails.html";
import "./RouteDetails.scss";
import "../RouteProgressBar/RouteProgressBar";
import { ArrayToElementRenderer } from "../../utils/ArrayToElementRenderer";
import { Leg } from "../../lib/Leg";
import { LegDisplay } from "../LegDisplay/LegDisplay";
import "../Timeline/Timeline";
import "../TimelineElement/TimelineElement";

export class RouteDetails extends HTMLElement {
    private rendered = false;
    private store: Store;
    private abortController: AbortController;
    private renderer: ArrayToElementRenderer<Leg, LegDisplay, number>;

    constructor() {
        super();

        this.store = Store.getInstance();
    }

    connectedCallback() {
        this.abortController = new AbortController();
        if (!this.rendered) {
            this.innerHTML = template;
            this.renderer = new ArrayToElementRenderer(document.querySelector("#route-details__container"),
                (_, idx) => idx,
                () => new LegDisplay());
            this.rendered = true;
        }
        this.store.subscribe((s, c) => this.update(s, c), this.abortController.signal);
        this.init(this.store.state);
    }

    private setRouteDetail(s: State) {
        if (!s?.routeDetail || !this.rendered) {
            return;
        }
        console.log(s.routeDetail);
        // this.renderer.update(s.routeDetail.itinerary.legs, (e, leg) => {
        //     e.update(leg);
        // });
        // let text = "";
        // for (let l of s.routeDetail.itinerary.legs) {
        //     text += `<div>${l.departureStop.stopName} - ${l.arrivalStop.stopName}</div>`;
        // }
        // this.innerHTML = text;
    }

    private update(s: State, c: (keyof State)[]): void {
        if (c.indexOf("routeDetail") > -1) {
            this.setRouteDetail(s);
        }
    }

    private init(s: State) {
        this.setRouteDetail(s);
    }

    disconnectedCallback() {
        this.abortController.abort();
    }
}

customElements.define("route-details", RouteDetails);
