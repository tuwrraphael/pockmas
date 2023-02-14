import { Leg } from "../../lib/Leg";
import template from "./WalkLegDisplay.html";
import "./WalkLegDisplay.scss";

export class WalkLegDisplay extends HTMLElement {
    private rendered: boolean;
    private leg: Leg;
    private fromText: HTMLSpanElement;
    private toText: HTMLSpanElement;
    private durationText: HTMLSpanElement;
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
            this.fromText = this.querySelector(`[data-ref="from"]`);
            this.toText = this.querySelector(`[data-ref="to"]`);
            this.durationText = this.querySelector(`[data-ref="duration"]`);
            this.rendered = true;
            this.render();
        }
    }

    disconnectedCallback() {

    }

    private render() {
        if (!this.rendered || this.leg == null) {
            return;
        }
        this.fromText.innerText = this.leg.departureStop.stopName;
        this.toText.innerText = this.leg.arrivalStop.stopName;
        this.durationText.innerHTML = `${Math.ceil((+this.leg.arrivalTime - +this.leg.plannedDeparture) / (1000 * 60))}`;

    }
}

customElements.define("walk-leg-display", WalkLegDisplay);
