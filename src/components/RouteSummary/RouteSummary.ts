import template from "./RouteSummary.html";
import "./RouteSummary.scss";
import "../RouteTimeline/RouteTimeline";
import "../FlipTimeDisplay/FlipTimeDisplay";
import { RouteAttribute, RouteColorAttribute, TransitDisplay } from "../TransitDisplay/TransitDisplay";
import { RouteTimeline } from "../RouteTimeline/RouteTimeline";
import { LegType } from "../../lib/LegType";
import { FlipTimeDisplay } from "../FlipTimeDisplay/FlipTimeDisplay";
import { ItineraryDisplayModel } from "../../state/models/ItineraryDisplayModel";
import { AppRouter } from "../../app-router";
import { abortableEventListener } from "../../utils/abortableEventListener";

const timeFormat = Intl.DateTimeFormat([], { hour: "2-digit", minute: "2-digit" });

export class RouteSummary extends HTMLElement {
    private rendered = false;
    private departureTime: FlipTimeDisplay;
    private departureLine: TransitDisplay;
    private itinerary: ItineraryDisplayModel;
    private departureStop: HTMLSpanElement;
    private departureHeadsign: HTMLSpanElement;
    private timeLine: RouteTimeline;
    private plannedTime: HTMLSpanElement;
    private link: HTMLAnchorElement;
    private router = AppRouter.getInstance();
    private abortController: AbortController;

    constructor() {
        super();

    }

    connectedCallback() {
        this.abortController = new AbortController();
        if (!this.rendered) {
            this.innerHTML = template;
            this.rendered = true;
            this.departureTime = this.querySelector(".route-summary__departure-time");
            this.plannedTime = this.querySelector(".route-summary__planned-time");
            this.departureLine = this.querySelector(".route-summary__departure-line");
            this.departureStop = this.querySelector(".route-summary__departure-stop");
            this.departureHeadsign = this.querySelector(".route-summary__departure-headsign");
            this.timeLine = this.querySelector(".route-summary__timeline");
            this.link = this.querySelector("a");
            abortableEventListener(this.link, "click", (e) => {
                e.preventDefault();
                this.router.router.navigate(`r/${this.itinerary.itineraryUrlEncoded}`, "pockmas - Route");
            }, this.abortController.signal);
        }
        this.render();
    }

    private render() {
        if (this.rendered && this.itinerary.itinerary.legs.length > 0) {
            let firstTransitLeg = this.itinerary.itinerary.legs.find(l => l.type == LegType.Transit);
            if (firstTransitLeg) {
                let departureTime = new Date(firstTransitLeg.plannedDeparture.getTime() + firstTransitLeg.delay * 1000);
                let depratureTimeFormatted = timeFormat.format(departureTime);
                this.departureTime.setAttribute("time", "" + (departureTime.getTime()));
                this.departureTime.setAttribute("title", `Abfahrt um ${depratureTimeFormatted}`);
                let palannedDepatureFormatted = timeFormat.format(firstTransitLeg.plannedDeparture);
                let delayed = palannedDepatureFormatted != depratureTimeFormatted;
                this.plannedTime.innerText = `${firstTransitLeg.isRealtime ? delayed ? palannedDepatureFormatted : "pünktlich" : ""}`;
                this.plannedTime.style.textDecoration = delayed ? "line-through" : "none";
                this.departureLine.setAttribute(RouteAttribute, firstTransitLeg.route.name);
                this.departureLine.setAttribute(RouteColorAttribute, firstTransitLeg.route.color);
                this.departureStop.innerText = firstTransitLeg.departureStop.stopName;
                this.departureHeadsign.innerText = firstTransitLeg.route.headsign;
                this.link.href = `r/${this.itinerary.itineraryUrlEncoded}`;
                this.timeLine.update(this.itinerary.itinerary);
            }
            else {
                // TODO
            }
        }
    }

    update(data: ItineraryDisplayModel) {
        this.itinerary = data;
        this.render();
    }

    disconnectedCallback() {
        this.abortController.abort();
    }
}

customElements.define("route-summary", RouteSummary);
