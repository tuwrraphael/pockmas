import template from "./TimelineElement.html";
import "./TimelineElement.scss";

const TimeAttribute = "time";
const MoveToAttribute = "move-to";

export class TimelineElement extends HTMLElement {

    private _time: Date;

    private _moveTo: Date | null;

    get time() {
        return this._time;
    }

    set time(value: Date) {
        this.setAttribute(TimeAttribute, value.toISOString());
    }

    get moveTo() {
        return this._moveTo;
    }

    set moveTo(value: Date) {
        this.setAttribute(MoveToAttribute, value.toISOString());
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
        return [TimeAttribute, MoveToAttribute];
    }

    private updateAttributes() {
        let newTime = new Date(this.getAttribute(TimeAttribute));
        let newMoveToAttr = this.getAttribute(MoveToAttribute);
        let newMoveTo = newMoveToAttr ? new Date(newMoveToAttr) : null;
        if (newMoveTo && isNaN(newMoveTo.getTime())) {
            newMoveTo = null;
        }
        let dispatchEvent = newTime != this._time || newMoveTo != this._moveTo;
        this._time = newTime;
        this._moveTo = newMoveTo;
        if (dispatchEvent) {
            this.dispatchEvent(new CustomEvent("timechange", { bubbles: true, composed: true }));
        }
    }
}

customElements.define("timeline-element", TimelineElement);

