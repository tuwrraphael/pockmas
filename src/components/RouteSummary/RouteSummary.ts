import { Itinerary } from "../../lib/Itinerary";
import template from "./RouteSummary.html";
import "./RouteSummary.scss";
import "../RouteTimeline/RouteTimeline";
import { RouteAttribute, RouteColorAttribute, TransitDisplay } from "../TransitDisplay/TransitDisplay";
import { RouteTimeline } from "../RouteTimeline/RouteTimeline";
import { LegType } from "../../lib/LegType";

const timeFormat = Intl.DateTimeFormat([], { hour: "2-digit", minute: "2-digit" });

export class RouteSummary extends HTMLElement {
    private rendered = false;
    private departureTime: HTMLSpanElement;
    private departureLine: TransitDisplay;
    private itinerary: Itinerary;
    private departureStop: HTMLSpanElement;
    private departureHeadsign: HTMLSpanElement;
    private timeLine: RouteTimeline;
    private plannedTime: HTMLSpanElement;
    constructor() {
        super();

    }

    connectedCallback() {
        if (!this.rendered) {
            this.innerHTML = template;
            this.rendered = true;
            this.departureTime = this.querySelector(".route-summary__departure-time");
            this.plannedTime = this.querySelector(".route-summary__planned-time");
            this.departureLine = this.querySelector(".route-summary__departure-line");
            this.departureStop = this.querySelector(".route-summary__departure-stop");
            this.departureHeadsign = this.querySelector(".route-summary__departure-headsign");
            this.timeLine = this.querySelector(".route-summary__timeline");
        }
        this.render();
    }

    private render() {
        if (this.rendered && this.itinerary.legs.length > 0) {
            let firstTransitLeg = this.itinerary.legs.find(l => l.type == LegType.Transit);
            if (firstTransitLeg) {
                this.departureTime.innerText = `${timeFormat.format(new Date(firstTransitLeg.plannedDeparture.getTime() + firstTransitLeg.delay * 1000))}`;
                let palannedDepatureFormatted = timeFormat.format(firstTransitLeg.plannedDeparture);
                let delayed = palannedDepatureFormatted != this.departureTime.innerText;
                this.plannedTime.innerText = `${firstTransitLeg.isRealtime ? delayed ? palannedDepatureFormatted : "pünktlich" : ""}`;
                this.plannedTime.style.textDecoration = delayed ? "line-through" : "none";
                this.departureLine.setAttribute(RouteAttribute, firstTransitLeg.route.name);
                this.departureLine.setAttribute(RouteColorAttribute, firstTransitLeg.route.color);
                this.departureStop.innerText = firstTransitLeg.departureStop.stopName;
                this.departureHeadsign.innerText = firstTransitLeg.route.headsign;
                this.timeLine.update(this.itinerary);
            }
            else {
                // TODO
            }
        }
    }

    update(data: Itinerary) {
        this.itinerary = data;
        this.render();
    }

    disconnectedCallback() {

    }
}

customElements.define("route-summary", RouteSummary);
