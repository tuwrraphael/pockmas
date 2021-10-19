import { throws } from "assert";
import template from "./TransitDisplay.html";
import "./TransitDisplay.scss";

const RouteAttribute = "route";
const RouteColorAttribute = "route-color";

export class TransitDisplay extends HTMLElement {
    private rendered = false;
    private routeLabel : HTMLSpanElement;
    constructor() {
        super();
    }

    connectedCallback() {
        if (!this.rendered) {
            this.innerHTML = template;
            this.rendered = true;
            this.routeLabel = this.querySelector(".transit-display__route");
            this.updateAttributes();
        }
    }

    attributeChangedCallback() {
        this.updateAttributes();
    }

    static get observedAttributes() {
        return [RouteAttribute, RouteColorAttribute];
    }

    private updateAttributes() {
        if (!this.rendered) {
            return;
        }
        let label = this.getAttribute(RouteAttribute);
        this.routeLabel.innerText = label;
        this.style.backgroundColor = this.getAttribute(RouteColorAttribute);
    }

    disconnectedCallback() {

    }
}

customElements.define("transit-display", TransitDisplay);
