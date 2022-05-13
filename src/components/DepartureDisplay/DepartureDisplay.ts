import template from "./DepartureDisplay.html";
import "./DepartureDisplay.scss";
import "../FlipTimeDisplay/FlipTimeDisplay";
import { RouteAttribute, RouteColorAttribute, TransitDisplay } from "../TransitDisplay/TransitDisplay";
import { FlipTimeDisplay } from "../FlipTimeDisplay/FlipTimeDisplay";
import { Departure } from "../../lib/Departure";

const timeFormat = Intl.DateTimeFormat([], { hour: "2-digit", minute: "2-digit" });

export class DepartureDisplay extends HTMLElement {
    private rendered = false;
    private departureTime: FlipTimeDisplay;
    private departureLine: TransitDisplay;
    private departureStop: HTMLSpanElement;
    private departureHeadsign: HTMLSpanElement;
    private plannedTime: HTMLSpanElement;
    private abortController: AbortController;
    private departure: Departure;

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
        if (this.rendered && this.departure) {
            let departureTime = new Date(this.departure.plannedDeparture.getTime() + this.departure.delay * 1000);
            let depratureTimeFormatted = timeFormat.format(departureTime);
            this.departureTime.setAttribute("time", "" + (departureTime.getTime()));
            this.departureTime.setAttribute("title", `Abfahrt um ${depratureTimeFormatted}`);
            let palannedDepatureFormatted = timeFormat.format(this.departure.plannedDeparture);
            let delayed = palannedDepatureFormatted != depratureTimeFormatted;
            this.plannedTime.innerText = `${this.departure.isRealtime ? delayed ? palannedDepatureFormatted : "pünktlich" : ""}`;
            this.plannedTime.style.textDecoration = delayed ? "line-through" : "none";
            this.departureLine.setAttribute(RouteAttribute, this.departure.route.name);
            this.departureLine.setAttribute(RouteColorAttribute, this.departure.route.color);
            this.departureStop.innerText = this.departure.stop.stopName;
            this.departureHeadsign.innerText = this.departure.route.headsign;
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

customElements.define("departure-display", DepartureDisplay);
