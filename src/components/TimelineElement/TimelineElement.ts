import template from "./TimelineElement.html";
import "./TimelineElement.scss";

const TimeAttribute = "time";

export class TimelineElement extends HTMLElement {

    private _time: Date;

    get time() {
        return this._time;
    }

    set time(value: Date) {
        this.setAttribute(TimeAttribute, value.toISOString());
    }

    constructor() {
        super();
        let shadowRoot = this.attachShadow({ mode: "open" });
        shadowRoot.innerHTML = template;
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
        let newTime = new Date(this.getAttribute(TimeAttribute));
        let dispatchEvent = newTime != this._time;
        this._time = newTime;
        if (dispatchEvent) {
            this.dispatchEvent(new CustomEvent("timechange", { bubbles: true, composed: true }));
        }
    }
}

customElements.define("timeline-element", TimelineElement);
