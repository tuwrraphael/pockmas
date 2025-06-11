import { State } from "../../state/State";
import { Store } from "../../state/Store";
import { abortableEventListener } from "../../utils/abortableEventListener";
import template from "./Features.html";
import "./Features.scss";

export class Features extends HTMLElement {
    private rendered = false;
    private store: Store;
    private abortController: AbortController;
    private departureTime: HTMLInputElement;


    constructor() {
        super();
        this.store = Store.getInstance();
    }

    connectedCallback() {
        this.abortController = new AbortController();
        if (!this.rendered) {
            this.innerHTML = template;
            this.departureTime = this.querySelector("#departuretime");
            this.rendered = true;
        }
        this.store.subscribe((s, c) => this.update(s, c), this.abortController.signal);
        this.init(this.store.state);
        this.departureTime.checked = localStorage.getItem("experimental-departureTime") === "true";
        abortableEventListener(this.departureTime, "change", () => {
            localStorage.setItem("experimental-departureTime", this.departureTime.checked ? "true" : "false");
            window.location.reload();
        }, this.abortController.signal);
    }

    private update(s: State, c: (keyof State)[]): void {

    }

    private init(s: State) {
    }

    disconnectedCallback() {
        this.abortController.abort();
    }
}

customElements.define("feature-flags", Features);
