import template from "./DepartureSummary.html";
import "./DepartureSummary.scss";
import "../FlipTimeDisplay/FlipTimeDisplay";
import { Departure } from "../../lib/Departure";
import "../DepartureDisplay/DepartureDisplay";
import { DepartureDisplay } from "../DepartureDisplay/DepartureDisplay";

export class DepartureSummary extends HTMLElement {
    private rendered = false;
    private abortController: AbortController;
    private departureDisplay: DepartureDisplay;
    private departure: Departure;

    constructor() {
        super();
    }

    connectedCallback() {
        this.abortController = new AbortController();
        if (!this.rendered) {
            this.innerHTML = template;
            this.rendered = true;
            this.departureDisplay = this.querySelector("departure-display");
        }
        this.render();
    }

    private render() {
        if (this.rendered && this.departure) {
            this.departureDisplay.update(this.departure);
        }
    }

    update(data: Departure) {
        this.departure = data;
        this.render();
    }

    disconnectedCallback() {
        this.abortController.abort();
    }
}

customElements.define("departure-summary", DepartureSummary);
