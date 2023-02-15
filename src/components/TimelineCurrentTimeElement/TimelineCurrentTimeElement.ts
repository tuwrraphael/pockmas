import { FlipTimeDisplay } from "../FlipTimeDisplay/FlipTimeDisplay";
import template from "./TimelineCurrentTimeElement.html";
import "./TimelineCurrentTimeElement.scss";

export class TimelineCurrentTimeElement extends HTMLElement {
    private rendered = false;
    private timeout: any;
    private connected = false;
    private flipTimeDisplay: FlipTimeDisplay;
    constructor() {
        super();
    }

    connectedCallback() {
        this.connected = true;
        if (!this.rendered) {
            this.rendered = true;
            this.innerHTML = template;
            this.flipTimeDisplay = this.querySelector("flip-time-display");
        }
        this.refreshTime();
    }

    refreshTime() {
        this.flipTimeDisplay.setAttribute("time", `${new Date().getTime()}`);
        if (this.connected) {
            // setTimeout(() => this.refreshTime(), 1000 * (60 - (new Date()).getSeconds()));
        }
    }

    disconnectedCallback() {
        this.connected = false;
        clearTimeout(this.timeout);
    }
}

customElements.define("timeline-current-time-element", TimelineCurrentTimeElement);
