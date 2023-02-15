import template from "./TimelineGoalElement.html";
import "./TimelineGoalElement.scss";

export class TimelineGoalElement extends HTMLElement {
   
    constructor() {
        super();
        this.innerHTML = template;
    }

    connectedCallback() {

    }

    disconnectedCallback() {

    }
}

customElements.define("timeline-goal-element", TimelineGoalElement);
