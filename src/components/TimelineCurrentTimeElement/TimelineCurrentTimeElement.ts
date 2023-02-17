import { FlipTimeDisplay } from "../FlipTimeDisplay/FlipTimeDisplay";
import template from "./TimelineCurrentTimeElement.html";
import "./TimelineCurrentTimeElement.scss";

export class TimelineCurrentTimeElement extends HTMLElement {
    private rendered = false;
    private flipTimeDisplay: FlipTimeDisplay;
    constructor() {
        super();
    }

    connectedCallback() {
        if (!this.rendered) {
            this.rendered = true;
            this.innerHTML = template;
            this.flipTimeDisplay = this.querySelector("flip-time-display");
        }
    }

    setTime(d: Date) {
        this.flipTimeDisplay.setAttribute("time", `${d.getTime()}`);
    }

    disconnectedCallback() {
    }
}

customElements.define("timeline-current-time-element", TimelineCurrentTimeElement);
