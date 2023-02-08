import template from "./RouteProgressBar.html";
import "./RouteProgressBar.scss";

export class RouteProgressBar extends HTMLElement {
   
    constructor() {
        super();
        this.innerHTML = template;
    }

    connectedCallback() {

    }

    disconnectedCallback() {

    }
}

customElements.define("route-progress-bar", RouteProgressBar);
