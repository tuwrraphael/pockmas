import { State } from "../../state/State";
import { Store } from "../../state/Store";
import template from "./RouteDetails.html";
import "./RouteDetails.scss";
import { Leg } from "../../lib/Leg";
import "../Timeline/Timeline";
import "../TimelineElement/TimelineElement";
import { TimelineElement } from "../TimelineElement/TimelineElement";
import { LegType } from "../../lib/LegType";
import { Timeline } from "../Timeline/Timeline";
import { WalkingLegDisplay } from "../LegDisplay/WalkingLegDisplay";
import { TransitLegDisplay } from "../LegDisplay/TransitLegDisplay";
import { TimelineGoalElement } from "../TimelineGoalElement/TimelineGoalElement";
import { TimelineCurrentTimeElement } from "../TimelineCurrentTimeElement/TimelineCurrentTimeElement";

export class RouteDetails extends HTMLElement {
    private rendered = false;
    private store: Store;
    private abortController: AbortController;
    private timeline: Timeline;

    constructor() {
        super();

        this.store = Store.getInstance();
    }

    connectedCallback() {
        this.abortController = new AbortController();
        if (!this.rendered) {
            this.innerHTML = template;
            this.timeline = this.querySelector("app-timeline");
            this.rendered = true;
        }
        this.store.subscribe((s, c) => this.update(s, c), this.abortController.signal);
        this.init(this.store.state);
    }

    private updateTimelineElementAndReturnNext<T extends Element>(current: TimelineElement,
        getNext: (e: TimelineElement) => T,
        create: () => T,
        update: (t: TimelineElement, e: T) => void): TimelineElement | null {
        let e = current ? getNext(current) : null;
        let timelineElement = current;
        if (!e) {
            timelineElement = new TimelineElement();
            e = create();
            timelineElement.appendChild(e);
            if (current != null) {
                current.insertAdjacentElement("afterend", timelineElement);
                current.remove();
            } else {
                this.timeline.appendChild(timelineElement);
            }
        }
        update(timelineElement, e);
        return <TimelineElement>timelineElement.nextElementSibling;
    }

    private setRouteDetail(s: State) {
        if (!s?.routeDetail || !this.rendered) {
            return;
        }
        let walkingLegs: Leg[] = [];
        let itinerary = s.routeDetail.itinerary;
        let currentChild: TimelineElement = <TimelineElement>this.timeline.children[0];
        for (let i = 0; i < itinerary.legs.length; i++) {
            let leg = itinerary.legs[i];
            switch (leg.type) {
                case LegType.Walking:
                    walkingLegs.push(leg);
                    let nextLeg = i < itinerary.legs.length - 1 ? itinerary.legs[i + 1] : null;
                    if (!nextLeg || nextLeg.type != LegType.Walking) {
                        currentChild = this.updateTimelineElementAndReturnNext(currentChild,
                            t => t.children[0] instanceof WalkingLegDisplay ? t.children[0] : null,
                            () => new WalkingLegDisplay(),
                            (t, e) => {
                                t.setAttribute("time", (new Date(walkingLegs[0].plannedDeparture.getTime() + leg.delay * 1000)).toISOString());
                                t.setAttribute("slot", "timeline2");
                                e.update(walkingLegs);
                            });
                        walkingLegs = [];
                    }
                    break;
                case LegType.Transit:
                    currentChild = this.updateTimelineElementAndReturnNext(currentChild,
                        t => t.children[0] instanceof TransitLegDisplay ? t.children[0] : null,
                        () => new TransitLegDisplay(),
                        (t, e) => {
                            t.setAttribute("time", (new Date(leg.plannedDeparture.getTime() + leg.delay * 1000)).toISOString());
                            t.setAttribute("slot", "timeline2");
                            e.update(leg);
                        });
                    break;
            }
        }
        let lastLeg = itinerary.legs[itinerary.legs.length - 1];
        currentChild = this.updateTimelineElementAndReturnNext(currentChild,
            t => t.children[0] instanceof TimelineGoalElement ? t.children[0] : null,
            () => new TimelineGoalElement(),
            (t, e) => {

                t.setAttribute("time", (new Date(lastLeg.arrivalTime.getTime() + lastLeg.delay * 1000)).toISOString());
                t.setAttribute("slot", "timeline2");
            });
        currentChild = this.updateTimelineElementAndReturnNext(currentChild,
            t => t.children[0] instanceof TimelineCurrentTimeElement ? t.children[0] : null,
            () => new TimelineCurrentTimeElement(),
            (t, e) => {
                t.setAttribute("time", (new Date()).toISOString());
                // t.setAttribute("move-to", (new Date(lastLeg.arrivalTime.getTime() + lastLeg.delay * 1000).toISOString()));
                t.setAttribute("slot", "timeline1");
            });
        while (currentChild != null) {
            let next = <TimelineElement>currentChild.nextElementSibling;
            currentChild.remove();
            currentChild = next;
        }
    }

    private update(s: State, c: (keyof State)[]): void {
        if (c.indexOf("routeDetail") > -1) {
            this.setRouteDetail(s);
        }
    }

    private init(s: State) {
        this.setRouteDetail(s);
    }

    disconnectedCallback() {
        this.abortController.abort();
    }
}

customElements.define("route-details", RouteDetails);
