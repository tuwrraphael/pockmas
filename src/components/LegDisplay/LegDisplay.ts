import { Leg } from "../../lib/Leg";
import { LegType } from "../../lib/LegType";
import template from "./LegDisplay.html";
import "./LegDisplay.scss";
import { TransitLegDisplay } from "./TransitLegDisplay";
import { WalkLegDisplay } from "./WalkLegDisplay";

export class LegDisplay extends HTMLElement {
    private rendered: boolean = false;
    private leg: Leg;
    private legDisplayContainer: HTMLDivElement;
    private transitLegDisplay: TransitLegDisplay;
    private walkLegDisplay: WalkLegDisplay;

    update(leg: Leg) {
        this.leg = leg;
        this.render();
    }

    constructor() {
        super();
    }

    connectedCallback() {
        if (!this.rendered) {
            this.innerHTML = template;
            this.rendered = true;
            this.legDisplayContainer = this.querySelector(`[data-ref="leg-display-container"]`);
            this.render();
        }
    }

    disconnectedCallback() {

    }

    private render() {
        if (!this.rendered || this.leg == null) {
            return;
        }
        if (this.leg.type == LegType.Transit) {
            if (this.transitLegDisplay == null) {
                this.legDisplayContainer.innerHTML = "";
                this.transitLegDisplay = new TransitLegDisplay();

                this.legDisplayContainer.appendChild(this.transitLegDisplay);
            }
            this.transitLegDisplay.update(this.leg);
        }
        else if (this.leg.type == LegType.Walking) {
            if (this.walkLegDisplay == null) {
                this.legDisplayContainer.innerHTML = "";
                this.walkLegDisplay = new WalkLegDisplay();
                this.legDisplayContainer.appendChild(this.walkLegDisplay);
            }
            this.walkLegDisplay.update(this.leg);
        }
    }
}

customElements.define("leg-display", LegDisplay);
