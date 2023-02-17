import { Leg } from "../../lib/Leg";
import { FlipTimeDisplay } from "../FlipTimeDisplay/FlipTimeDisplay";
import template from "./TimelineGoalElement.html";
import "./TimelineGoalElement.scss";

export class TimelineGoalElement extends HTMLElement {
    private rendered = false;
    private flipTimeDisplay: FlipTimeDisplay;
    private goalLabel: HTMLSpanElement;
    constructor() {
        super();
    }

    connectedCallback() {
        if (!this.rendered) {
            this.rendered = true;
            this.innerHTML = template;
            this.flipTimeDisplay = this.querySelector("flip-time-display");
            this.goalLabel = this.querySelector(`[data-ref="goal"]`);
        }
    }

    setLeg(lastLeg: Leg) {
        this.flipTimeDisplay.setAttribute("time", `${new Date(lastLeg.arrivalTime.getTime() + lastLeg.delay * 1000).getTime()}`);
        this.goalLabel.innerText = lastLeg.arrivalStop.stopName;
    }

    disconnectedCallback() {
    }
}

customElements.define("timeline-goal-element", TimelineGoalElement);
