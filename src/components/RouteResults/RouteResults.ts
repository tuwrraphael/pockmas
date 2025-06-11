import { SetDepartureTime } from "../../state/actions/SetDepartureTime";
import { Store } from "../../state/Store";
import { abortableEventListener } from "../../utils/abortableEventListener";
import template from "./RouteResults.html";
import "./RouteResults.scss";
import { State, StateChanges } from "../../state/State";
import { RouteResultsList } from "../RouteResultsList/RouteResultsList";
import { DepartureResultsList } from "../DepartureResultsList/DepartureResultsList";
import { AppRouter } from "../../app-router";

enum DisplayMode {
    Departures,
    Routes
}

export class RouteResults extends HTMLElement {
    private rendered = false;
    private displayMode: DisplayMode = null;
    private store: Store;
    private appRouter: AppRouter;
    private abortController: AbortController;
    private addMinBtn: HTMLButtonElement;
    private routeResultsList: RouteResultsList;
    private departureResultsList: DepartureResultsList;
    private tabTitleAbfahrten: HTMLAnchorElement;
    private tabTitleRouten: HTMLAnchorElement;
    private hasAbfahrten: boolean;
    private hasRouten: boolean;
    private header: HTMLDivElement;
    private departureStopGroupId: number;


    constructor() {
        super();
        this.store = Store.getInstance();
        this.appRouter = AppRouter.getInstance();
    }

    connectedCallback() {
        this.abortController = new AbortController();
        if (!this.rendered) {
            this.innerHTML = template;
            this.rendered = true;
            this.addMinBtn = this.querySelector("#add-5-min");
            this.tabTitleAbfahrten = this.querySelector("#tab-title-abfahrten");
            this.tabTitleRouten = this.querySelector("#tab-title-routen");
            this.header = this.querySelector(".route-results__header");
            abortableEventListener(this.addMinBtn, "click", () => { this.store.postAction(new SetDepartureTime(new Date(+this.store.state.departureTime + 5 * 60000))); }, this.abortController.signal);
            abortableEventListener(this.tabTitleAbfahrten, "click", e => {
                e.preventDefault();
                this.appRouter.search(this.departureStopGroupId, null);
            }, this.abortController.signal);
        }
        this.store.subscribe((s, c) => this.update(s, c), this.abortController.signal);
    }

    private async update(s: State, c: StateChanges) {
        if (c.includes("results") || c.includes("departures")) {
            this.hasAbfahrten = s.departures != null && s.departures.length > 0;
            this.hasRouten = s.results != null && s.results.length > 0;
            this.render();
        }
        if (c.includes("selectedStopgroups")) {
            this.departureStopGroupId = s.selectedStopgroups.departure?.id;
        }
    }

    private async render() {
        let displayRouten = this.hasRouten;
        this.tabTitleAbfahrten.classList.toggle("route-results__tab-title--disabled", displayRouten);
        this.tabTitleRouten.classList.toggle("route-results__tab-title--disabled", !displayRouten);

        this.tabTitleAbfahrten.style.display = this.departureStopGroupId ? "" : "none";
        this.tabTitleAbfahrten.href = `s?dsg=${this.departureStopGroupId}`;
        this.tabTitleRouten.style.display = this.hasRouten ? "" : "none";
        this.header.style.display = this.hasAbfahrten || this.hasRouten ? "" : "none";



        if (displayRouten && this.displayMode != DisplayMode.Routes) {
            this.displayMode = DisplayMode.Routes;
            this.routeResultsList = new (await import("../RouteResultsList/RouteResultsList")).RouteResultsList;
            this.querySelector(".button-pane").insertAdjacentElement("beforebegin", this.routeResultsList);
        } else if (!displayRouten && this.routeResultsList != null) {
            this.routeResultsList.remove();
            this.routeResultsList = null;
        }
        if (!displayRouten && this.displayMode != DisplayMode.Departures) {
            this.displayMode = DisplayMode.Departures;
            this.departureResultsList = new (await import("../DepartureResultsList/DepartureResultsList")).DepartureResultsList;
            this.querySelector(".button-pane").insertAdjacentElement("beforebegin", this.departureResultsList);
        } else if (displayRouten && this.departureResultsList != null) {
            this.departureResultsList.remove();
            this.departureResultsList = null;
        }
        this.addMinBtn.style.display = this.displayMode != DisplayMode.Departures ? "" : "none";

    }

    disconnectedCallback() {
        this.abortController.abort();
    }
}

customElements.define("route-results", RouteResults);
