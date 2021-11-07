import { Itinerary } from "../../lib/Itinerary";
import { RouteAttribute, RouteColorAttribute, TransitDisplay, TransitDisplayTagName } from "../TransitDisplay/TransitDisplay";
import { MinutesAttribute, WalkingDisplay, WalkingDisplayTagName } from "../WalkingDisplay/WalkingDisplay";
import template from "./RouteTimeline.html";
import "./RouteTimeline.scss";
import "../TransitDisplay/TransitDisplay";
import "../WalkingDisplay/WalkingDisplay";
import { Leg } from "../../lib/Leg";
import { LegType } from "../../lib/LegType";

const timeFormat = Intl.DateTimeFormat([], { hour: "2-digit", minute: "2-digit" });

export class RouteTimeline extends HTMLElement {
    private rendered = false;
    private departureTimeLabel: HTMLLIElement;
    private arrivalTimeLabel: HTMLLIElement;
    private timelineElements: HTMLLIElement[] = [];
    itinerary: Itinerary;
    constructor() {
        super();

    }

    connectedCallback() {
        if (!this.rendered) {
            this.rendered = true;
            this.innerHTML = template;
            this.departureTimeLabel = this.querySelector(".route-timeline__departure-time");
            this.arrivalTimeLabel = this.querySelector(".route-timeline__arrival-time");
        }
        this.render();
    }

    disconnectedCallback() {

    }

    private reuseOrCreateElement<T extends HTMLElement>(recycleBin: HTMLLIElement[], tagName: string): T {
        let element = recycleBin.find(e => e.children[0].tagName.localeCompare(tagName, undefined, { sensitivity: "accent" }) === 0);
        let child: T;
        if (element) {
            recycleBin.splice(recycleBin.indexOf(element), 1);
            child = element.children[0] as T;
        }
        else {
            element = document.createElement("li");
            child = document.createElement(tagName) as T;
            element.appendChild(child);
        }
        if (this.timelineElements.length == 0) {
            this.departureTimeLabel.insertAdjacentElement("afterend", element);
        }
        else {
            this.timelineElements[this.timelineElements.length - 1].insertAdjacentElement("afterend", element);
        }
        this.timelineElements.push(element);
        return child;
    }

    private addWalkingLeg(duration: number, recycleBin: HTMLLIElement[]) {
        let walkingDisplay = this.reuseOrCreateElement<WalkingDisplay>(recycleBin, WalkingDisplayTagName);
        walkingDisplay.setAttribute(MinutesAttribute, `${Math.ceil(duration / 60000)}`);
    }

    addTransportLeg(leg: Leg, recycleBin: HTMLLIElement[]) {
        let transitDisplay = this.reuseOrCreateElement<TransitDisplay>(recycleBin, TransitDisplayTagName);
        transitDisplay.setAttribute(RouteAttribute, leg.route.name);
        transitDisplay.setAttribute(RouteColorAttribute, leg.route.color);
    }

    update(itinerary: Itinerary) {
        this.itinerary = itinerary;
        this.render();
    }

    private render() {
        if (!this.rendered || !this.itinerary || this.itinerary.legs.length === 0) {
            return;
        }
        let departureTime = timeFormat.format(this.itinerary.legs[0].plannedDeparture);
        this.departureTimeLabel.title = `Losgehen um ${departureTime}`;
        this.departureTimeLabel.innerText = departureTime;
        let arrivalTime = timeFormat.format(this.itinerary.legs[this.itinerary.legs.length - 1].arrivalTime);
        this.arrivalTimeLabel.title = `Ankunft um ${arrivalTime}`;
        this.arrivalTimeLabel.innerText = arrivalTime;
        let recycleBin = this.timelineElements;
        this.timelineElements = [];
        let walkingDuration = 0;
        for (let i = 0; i < this.itinerary.legs.length; i++) {
            let leg = this.itinerary.legs[i];
            switch (leg.type) {
                case LegType.Walking:
                    walkingDuration += leg.duration;
                    let nextLeg = i < this.itinerary.legs.length - 1 ? this.itinerary.legs[i + 1] : null;
                    if (!nextLeg || nextLeg.type != LegType.Walking) {
                        if (i == 0 || i == this.itinerary.legs.length - 1 || walkingDuration > 2 * 60000) {
                            this.addWalkingLeg(walkingDuration, recycleBin);
                        }
                        walkingDuration = 0;
                    }
                    break;
                case LegType.Transit:
                    this.addTransportLeg(leg, recycleBin);
                    break;
            }
        }
        for (let leg of this.itinerary.legs) {

        }
        for (let element of recycleBin) {
            element.remove();
        }
    }
}


customElements.define("route-timeline", RouteTimeline);
