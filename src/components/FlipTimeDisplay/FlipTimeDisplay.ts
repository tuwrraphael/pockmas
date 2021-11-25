import "../FlipDisplay/FlipDisplay";
import { FlipDisplay, TextAttribute } from "../FlipDisplay/FlipDisplay";
import template from "./FlipTimeDisplay.html";

export const TimeAttribute = "time";

export class FlipTimeDisplay extends HTMLElement {
    private digits: FlipDisplay[];

    constructor() {
        super();
        let shadowRoot = this.attachShadow({ mode: "open" });
        shadowRoot.innerHTML = template;
        this.digits = Array.from(shadowRoot.querySelectorAll("flip-display"));
    }

    connectedCallback() {
    }

    disconnectedCallback() {

    }

    attributeChangedCallback() {
        this.updateAttributes();
    }

    static get observedAttributes() {
        return [TimeAttribute];
    }

    private updateAttributes() {
        let value = this.getAttribute(TimeAttribute);
        let time = new Date(parseInt(value));
        let hours = time.getHours();
        let minutes = time.getMinutes();
        this.digits[0].setAttribute(TextAttribute, ((hours / 10) >> 0).toString());
        this.digits[1].setAttribute(TextAttribute, (hours % 10).toString());
        this.digits[2].setAttribute(TextAttribute, ((minutes / 10) >> 0).toString());
        this.digits[3].setAttribute(TextAttribute, (minutes % 10).toString());
    }
}

customElements.define("flip-time-display", FlipTimeDisplay);