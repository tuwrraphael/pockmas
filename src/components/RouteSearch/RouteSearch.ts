import template from "./RouteSearch.html";
import "./RouteSearch.scss";
import "../StopSearch/StopSearch";
import { Store } from "../../state/Store";
import { InitializeStopSearch } from "../../state/actions/InitializeStopSearch";
import { State } from "../../state/State";
import { StopSearch } from "../StopSearch/StopSearch";
import { abortableEventListener } from "../../utils/abortableEventListener";
import { DepartureStopTermChanged } from "../../state/actions/DepartureStopTermChanged";
import { ArrivalStopTermChanged } from "../../state/actions/ArrivalStopTermChanged";
import { AppRouter } from "../../app-router";
import { SetDepartureTime } from "../../state/actions/SetDepartureTime";

const getDateString = (date?: Date) => { const newDate = date ? new Date(date) : new Date(); return new Date(newDate.getTime() - newDate.getTimezoneOffset() * 60000).toISOString().slice(0, -1); };

export class RouteSearch extends HTMLElement {
    private rendered: boolean;
    private store: Store;
    private appRouter = AppRouter.getInstance();
    private abortController: AbortController;
    private departureStopSearch: StopSearch;
    private arrivalStopSearch: StopSearch;
    private departureTimeInput: HTMLInputElement;
    private timeContainer: HTMLDivElement;

    constructor() {
        super();
        this.store = Store.getInstance();
        this.store.postAction(new InitializeStopSearch());

    }

    connectedCallback() {
        this.abortController = new AbortController();
        if (!this.rendered) {
            this.innerHTML = template;
            this.departureStopSearch = this.querySelector("#departure-stop-search");
            this.arrivalStopSearch = this.querySelector("#arrival-stop-search");
            this.departureTimeInput = this.querySelector("#departure-time-input");
            this.timeContainer = this.querySelector(".route-search__time-container");
            this.rendered = true;
        }
        this.store.subscribe((s, c) => this.update(s, c), this.abortController.signal);
        abortableEventListener(this.departureStopSearch, "input", () => this.store.postAction(new DepartureStopTermChanged(this.departureStopSearch.searchTerm)), this.abortController.signal);
        abortableEventListener(this.arrivalStopSearch, "input", () => this.store.postAction(new ArrivalStopTermChanged(this.arrivalStopSearch.searchTerm)), this.abortController.signal);
        abortableEventListener(this.departureStopSearch, "stop-selected", (e: CustomEvent) => {
            this.appRouter.search(this.store.state.departureStopResults[e.detail].id, this.store.state.selectedStopgroups.arrival?.id);
        }, this.abortController.signal);
        abortableEventListener(this.arrivalStopSearch, "stop-selected", (e: CustomEvent) => {
            this.appRouter.search(this.store.state.selectedStopgroups.departure?.id, this.store.state.arrivalStopResults[e.detail].id);
        }, this.abortController.signal);
        abortableEventListener(this.departureTimeInput, "change", () => {
            const date = new Date(this.departureTimeInput.value);
            date.setMilliseconds(0);
            date.setSeconds(0);
            this.store.postAction(new SetDepartureTime(date));
        }, this.abortController.signal);
        if (localStorage.getItem("experimental-departureTime") === "true") {
            this.timeContainer.style.display = "";
        }

    }

    private update(s: State, changes: (keyof State)[]) {
        if (changes.includes("departureStopResults")) {
            this.departureStopSearch.setResults(s.departureStopResults);
        }
        if (changes.includes("arrivalStopResults")) {
            this.arrivalStopSearch.setResults(s.arrivalStopResults);
        }
        if (changes.includes("selectedStopgroups")) {
            this.departureStopSearch.setSelected(s.selectedStopgroups.departure?.name);
            this.arrivalStopSearch.setSelected(s.selectedStopgroups.arrival?.name);
        }
        if (changes.includes("departureTime")) {
            let d = new Date(s.departureTime);
            d.setMilliseconds(0);
            d.setSeconds(0);
            this.departureTimeInput.value = getDateString(d);
        }
    }

    disconnectedCallback() {
        this.abortController.abort();
    }
}

customElements.define("route-search", RouteSearch);
