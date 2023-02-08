import { Leg } from "../../lib/Leg";
import { DepartureDisplay } from "../DepartureDisplay/DepartureDisplay";
import template from "./TransitLegDisplay.html";
import "./TransitLegDisplay.scss";
import "../DepartureDisplay/DepartureDisplay";

export class TransitLegDisplay extends HTMLElement {
    private rendered: boolean;
    private departureDisplay: DepartureDisplay;
    private leg: Leg;
    update(leg: Leg) {
        this.leg = leg;
        this.render();
    }

    constructor() {
        super();

    }

    connectedCallback() {
        if (!this.rendered) {
            this.innerHTML = template;
            this.rendered = true;
            this.departureDisplay = this.querySelector(`departure-display`);
            this.render();
        }
    }

    disconnectedCallback() {

    }

    private render() {
        if (!this.rendered || this.leg == null) {
            return;
        }
        this.departureDisplay.update({
            delay: this.leg.delay,
            plannedDeparture: this.leg.plannedDeparture,
            route: this.leg.route,
            stop: this.leg.departureStop,
            tripId: this.leg.tripId,
            isRealtime: this.leg.isRealtime
        });
    }
}

customElements.define("transit-leg-display", TransitLegDisplay);
