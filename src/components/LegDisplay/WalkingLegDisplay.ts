import { Leg } from "../../lib/Leg";
import { FlipTimeDisplay } from "../FlipTimeDisplay/FlipTimeDisplay";
import template from "./WalkingLegDisplay.html";
import "./WalkingLegDisplay.scss";

export class WalkingLegDisplay extends HTMLElement {
    private rendered: boolean;
    private legs: Leg[];
    private fromText: HTMLSpanElement;
    private toText: HTMLSpanElement;
    private durationText: HTMLSpanElement;
    private timestamp : FlipTimeDisplay;

    update(legs: Leg[]) {
        this.legs = legs;
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
            this.timestamp = this.querySelector(`[data-ref="timestamp"]`);
            this.rendered = true;
            this.render();
        }
    }

    disconnectedCallback() {

    }

    private render() {
        if (!this.rendered || !this.legs?.length) {
            return;
        }
        let last = this.legs[this.legs.length - 1];
        let first = this.legs[0];
        this.timestamp.setAttribute("time", `${first.plannedDeparture.getTime()}`);
        this.fromText.innerText = first.departureStop.stopName;
        this.toText.innerText = last.arrivalStop.stopName;
        this.durationText.innerHTML = `${Math.ceil((+last.arrivalTime - +first.plannedDeparture) / (1000 * 60))}`;

    }
}

customElements.define("walking-leg-display", WalkingLegDisplay);
