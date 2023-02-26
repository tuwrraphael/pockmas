import template from "./RouteSummary.html";
import "./RouteSummary.scss";
import "../RouteTimeline/RouteTimeline";
import "../DepartureDisplay/DepartureDisplay";
import { RouteTimeline } from "../RouteTimeline/RouteTimeline";
import { LegType } from "../../lib/LegType";
import { ItineraryDisplayModel } from "../../state/models/ItineraryDisplayModel";
import { AppRouter } from "../../app-router";
import { abortableEventListener } from "../../utils/abortableEventListener";
import { DepartureDisplay } from "../DepartureDisplay/DepartureDisplay";

export class RouteSummary extends HTMLElement {
    private rendered = false;
    private itinerary: ItineraryDisplayModel;
    private timeLine: RouteTimeline;
    private link: HTMLAnchorElement;
    private router = AppRouter.getInstance();
    private abortController: AbortController;
    private departureDisplay: DepartureDisplay;
    private durationContainer: HTMLDivElement;
    private durationLabel: HTMLSpanElement;

    constructor() {
        super();

    }

    connectedCallback() {
        this.abortController = new AbortController();
        if (!this.rendered) {
            this.innerHTML = template;
            this.rendered = true;
            this.departureDisplay = this.querySelector("departure-display");
            this.timeLine = this.querySelector(".route-summary__timeline");
            this.link = this.querySelector("a");
            this.durationContainer = this.querySelector(".route-summary__duration");
            this.durationLabel = this.querySelector(".route-summary__duration-label");
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
                this.departureDisplay.update({
                    delay: firstTransitLeg.delay,
                    plannedDeparture: firstTransitLeg.plannedDeparture,
                    route: firstTransitLeg.route,
                    stop: firstTransitLeg.departureStop,
                    tripId: firstTransitLeg.tripId,
                    isRealtime: firstTransitLeg.isRealtime
                });
                this.link.href = `r/${this.itinerary.itineraryUrlEncoded}`;
                this.timeLine.update(this.itinerary.itinerary);
            }
            else {
                // TODO
            }
            let duration = this.itinerary.itinerary.legs[this.itinerary.itinerary.legs.length - 1].arrivalTime.getTime() - this.itinerary.itinerary.legs[0].plannedDeparture.getTime();
            let durationMinutes = Math.ceil(duration / 60000);
            this.durationLabel.innerText = `${durationMinutes}'`;
            this.durationContainer.title = `Dauer ${durationMinutes} Minuten`;
            this.durationLabel.innerText = `${durationMinutes}'`;
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
