import template from "./WalkingDisplay.html";
import "./WalkingDisplay.scss";

export const MinutesAttribute = "minutes";

export class WalkingDisplay extends HTMLElement {

    private rendered = false;
    private minutesLabel: HTMLSpanElement;
    constructor() {
        super();
    }

    connectedCallback() {
        if (!this.rendered) {
            this.innerHTML = template;
            this.rendered = true;
            this.minutesLabel = this.querySelector(".walking-display__minutes");
            this.updateAttributes();
        }
    }

    attributeChangedCallback() {
        this.updateAttributes();
    }

    static get observedAttributes() {
        return [MinutesAttribute];
    }

    private updateAttributes() {
        if (!this.rendered) {
            return;
        }
        let label = this.getAttribute(MinutesAttribute);
        this.minutesLabel.innerText = `${label}'`;
    }

    disconnectedCallback() {

    }
}
export const WalkingDisplayTagName = "walking-display";
customElements.define(WalkingDisplayTagName, WalkingDisplay);
