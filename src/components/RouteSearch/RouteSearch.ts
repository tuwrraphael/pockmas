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
import { StopsSelected } from "../../state/actions/StopsSelected";
import { AppRouter } from "../../app-router";

export class RouteSearch extends HTMLElement {
    private rendered: boolean;
    private store: Store;
    private appRouter = AppRouter.getInstance();
    private abortController: AbortController;
    private departureStopSearch: StopSearch;
    private arrivalStopSearch: StopSearch;
    private selectedDepartureStop: number;
    private selectedArrivalStop: number;

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
            this.rendered = true;
        }
        this.store.subscribe((s, c) => this.update(s, c), this.abortController.signal);
        abortableEventListener(this.departureStopSearch, "input", () => this.store.postAction(new DepartureStopTermChanged(this.departureStopSearch.searchTerm)), this.abortController.signal);
        abortableEventListener(this.arrivalStopSearch, "input", () => this.store.postAction(new ArrivalStopTermChanged(this.arrivalStopSearch.searchTerm)), this.abortController.signal);
        abortableEventListener(this.departureStopSearch, "stop-selected", (e: CustomEvent) => {
            this.selectedDepartureStop = e.detail;
            this.onStopsSelected();
        }, this.abortController.signal);
        abortableEventListener(this.arrivalStopSearch, "stop-selected", (e: CustomEvent) => {
            this.selectedArrivalStop = e.detail;
            this.onStopsSelected();
        }, this.abortController.signal);
    }

    private update(s: State, changes: (keyof State)[]) {
        if (changes.includes("departureStopResults")) {
            this.departureStopSearch.setResults(s.departureStopResults);
        }
        if (changes.includes("arrivalStopResults")) {
            this.arrivalStopSearch.setResults(s.arrivalStopResults);
        }
        if (changes.includes("routeDetail") && s.routeDetail) {
            this.departureStopSearch.setSelected(s.routeDetail.itinerary.legs[0].departureStop.stopName);
            this.arrivalStopSearch.setSelected(s.routeDetail.itinerary.legs[s.routeDetail.itinerary.legs.length - 1].arrivalStop.stopName);
        }
    }

    onStopsSelected() {
        if (null != this.selectedDepartureStop && null != this.selectedArrivalStop) {
            // this.store.postAction(new StopsSelected(this.selectedDepartureStop, this.selectedArrivalStop));
            this.appRouter.search(this.store.state.departureStopResults[this.selectedDepartureStop].id, this.store.state.arrivalStopResults[this.selectedArrivalStop].id);
        }
    }

    disconnectedCallback() {
        this.abortController.abort();
    }
}

customElements.define("route-search", RouteSearch);
