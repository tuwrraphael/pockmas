import template from "./DepartureDisplay.html";
import "./DepartureDisplay.scss";
import "../FlipTimeDisplay/FlipTimeDisplay";
import { RouteAttribute, RouteColorAttribute, TransitDisplay } from "../TransitDisplay/TransitDisplay";
import { FlipTimeDisplay } from "../FlipTimeDisplay/FlipTimeDisplay";
import { Departure } from "../../lib/Departure";
import { timeFormat } from "../../time-format";

export class DepartureDisplay extends HTMLElement {
    private rendered = false;
    private departureTime: FlipTimeDisplay;
    private departureLine: TransitDisplay;
    private departureStop: HTMLSpanElement;
    private departureHeadsign: HTMLSpanElement;
    private plannedTime: HTMLSpanElement;
    private abortController: AbortController;
    private renderedDeparture: Departure;
    private nextDeparture: Departure;

    constructor() {
        super();

    }

    connectedCallback() {
        this.abortController = new AbortController();
        if (!this.rendered) {
            this.innerHTML = template;
            this.rendered = true;
            this.departureTime = this.querySelector(".departure-display__departure-time");
            this.plannedTime = this.querySelector(".departure-display__planned-time");
            this.departureLine = this.querySelector(".departure-display__departure-line");
            this.departureStop = this.querySelector(".departure-display__departure-stop");
            this.departureHeadsign = this.querySelector(".departure-display__departure-headsign");
        }
        this.render();
    }

    private render() {
        if (this.rendered && this.nextDeparture) {
            if (this.renderedDeparture?.plannedDeparture !== this.nextDeparture.plannedDeparture ||
                this.renderedDeparture?.delay !== this.nextDeparture.delay ||
                this.renderedDeparture.isRealtime !== this.nextDeparture.isRealtime) {
                let departureTime = new Date(this.nextDeparture.plannedDeparture.getTime() + this.nextDeparture.delay * 1000);
                let depratureTimeFormatted = timeFormat.format(departureTime);
                this.departureTime.setAttribute("time", "" + (departureTime.getTime()));
                this.departureTime.setAttribute("title", `Abfahrt um ${depratureTimeFormatted}`);
                let palannedDepatureFormatted = timeFormat.format(this.nextDeparture.plannedDeparture);
                let delayed = palannedDepatureFormatted != depratureTimeFormatted;
                this.plannedTime.innerText = `${this.nextDeparture.isRealtime ? delayed ? palannedDepatureFormatted : "pünktlich" : ""}`;
                this.plannedTime.style.textDecoration = delayed ? "line-through" : "none";
            }
            if (this.renderedDeparture?.route.id !== this.nextDeparture.route.id) {
                this.departureLine.setAttribute(RouteAttribute, this.nextDeparture.route.name);
                this.departureLine.setAttribute(RouteColorAttribute, this.nextDeparture.route.color);
                this.departureHeadsign.innerText = this.nextDeparture.route.headsign;
            }
            if (this.renderedDeparture?.stop.stopId !== this.nextDeparture.stop.stopId) {
                this.departureStop.innerText = this.nextDeparture.stop.stopName;
            }
        }
        this.renderedDeparture = this.nextDeparture;
    }

    update(data: Departure) {
        this.nextDeparture = data;
        this.render();
    }

    disconnectedCallback() {
        this.abortController.abort();
    }
}

customElements.define("departure-display", DepartureDisplay);
