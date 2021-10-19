import { Itinerary } from "../../state/Itinerary";
import template from "./RouteSummary.html";
import "./RouteSummary.scss";
import "../TransitDisplay/TransitDisplay";
import "../WalkingDisplay/WalkingDisplay";

export class RouteSummary extends HTMLElement {
    private rendered = false;
    constructor() {
        super();

    }

    connectedCallback() {
        if (!this.rendered) {
            this.innerHTML = template;
            this.rendered = true;
        }
    }

    update(data: Itinerary) {
        if (this.rendered) {

        }
    }

    disconnectedCallback() {

    }
}

customElements.define("route-summary", RouteSummary);
