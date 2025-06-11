import { Router, RouteRenderer, AsyncRouteResolver } from "route-it";
import { RouteDetailsOpened } from "./state/actions/RouteDetailsOpened";
import { Store } from "./state/Store";
import { RouteResults as RouteResultsType } from "./components/RouteResults/RouteResults";
import { StopsSelected } from "./state/actions/StopsSelected";

const DepartureStopGroupParam = "dsg";
const ArrivalStopGroupParam = "asg";

class ContainerRouteRenderer implements RouteRenderer<HTMLElement> {
    private currentComponent: HTMLElement = null;
    constructor(private container: HTMLElement) {
    }
    render(component: HTMLElement) {
        if (component && component !== this.currentComponent) {
            if (this.currentComponent) {
                this.container.innerHTML = "";
            }
            this.container.appendChild(component);
            this.currentComponent = component;
        }
    }
}

export class AppRouter {
    static instance: AppRouter = null;
    router: Router<HTMLElement>;
    private currentElement: HTMLElement = null;
    private readonly store = Store.getInstance();

    static getInstance() {
        if (null == this.instance) {
            this.instance = new AppRouter();
        }
        return this.instance;
    }

    private setCurrentElement(element: HTMLElement): HTMLElement {
        this.currentElement = element;
        return element;
    }

    search(departureStopGroup: number, arrivalStopGroup: number) {
        let params = new URLSearchParams();
        params.set(DepartureStopGroupParam, departureStopGroup.toString());
        if (arrivalStopGroup) {
            params.set(ArrivalStopGroupParam, arrivalStopGroup.toString());
        }
        this.router.navigate(`s?${params}`, "pockmas - Suchergebnisse");
    }

    constructor() {
        let self = this;


        class AppRouteResolver implements AsyncRouteResolver<HTMLElement> {

            private parseSearchRoute(pathName: string, params: URLSearchParams) {
                if (pathName == "s") {
                    if (!params.has(DepartureStopGroupParam)) {
                        return null;
                    }
                    let from = parseInt(params.get(DepartureStopGroupParam));
                    if (isNaN(from)) {
                        return null;
                    }
                    let to: number;
                    if (params.has(ArrivalStopGroupParam)) {
                        to = parseInt(params.get(ArrivalStopGroupParam));
                        if (isNaN(to)) {
                            return null;
                        }
                    }
                    return { from, to };
                }
                return null;
            }


            async resolve(lastRoute: string, currentRoute: string, router: Router<any>, s: { searchParams: URLSearchParams }): Promise<false | HTMLElement> {
                if ("features" === currentRoute) {
                    let { Features } = await import("./components/Features/Features");
                    return self.setCurrentElement(new Features());
                }
                if (/^r\/(\S+)$/.test(currentRoute)) {
                    let itineraryUrl = RegExp.$1;
                    self.store.postAction(new RouteDetailsOpened(itineraryUrl));
                    let { RouteDetails } = await import("./components/RouteDetails/RouteDetails");
                    return self.setCurrentElement(new RouteDetails());
                }
                let searchRoute = this.parseSearchRoute(currentRoute, s.searchParams);
                if (null != searchRoute) {
                    self.store.postAction(new StopsSelected(searchRoute.from, searchRoute.to));
                    if (self.currentElement instanceof RouteResultsType) {
                        return self.currentElement;
                    } else {
                        let { RouteResults } = await import("./components/RouteResults/RouteResults");
                        return self.setCurrentElement(new RouteResults());
                    }
                }
                let { RouteResults } = await import("./components/RouteResults/RouteResults");
                return new RouteResults();
            }
        }
        let container: HTMLElement = document.querySelector(".content");
        this.router = new Router<HTMLElement>(new AppRouteResolver(), new ContainerRouteRenderer(container));
    }
}