import { SetDepartureTime } from "../../state/actions/SetDepartureTime";
import { Store } from "../../state/Store";
import { abortableEventListener } from "../../utils/abortableEventListener";
import template from "./RouteResults.html";
import "./RouteResults.scss";
import "../RouteResultsList/RouteResultsList";

export class RouteResults extends HTMLElement {
    private rendered = false;
    private store: Store;
    private abortController: AbortController;
    constructor() {
        super();
        this.store = Store.getInstance();
    }

    connectedCallback() {
        this.abortController = new AbortController();
        if (!this.rendered) {
            this.innerHTML = template;
            this.rendered = true;
            abortableEventListener(this.querySelector("#add-5-min"), "click", () => { this.store.postAction(new SetDepartureTime(5 * 60000)); }, this.abortController.signal);
        }
    }

    disconnectedCallback() {
        this.abortController.abort();
    }
}

customElements.define("route-results", RouteResults);
