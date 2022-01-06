import "./styles.scss";
import "./components/RouteSearch/RouteSearch";
import { Store } from "./state/Store";
import { InitializeRouting } from "./state/actions/InitializeRouting";
import "./install-sw";
import { Router, ContainerRouteRenderer } from "route-it";
import { AsyncRouteResolver } from "route-it/dist/router";
import { RouteDetailsOpened } from "./state/actions/RouteDetailsOpened";

let store = Store.getInstance();
store.postAction(new InitializeRouting());

class AppRouteResolver implements AsyncRouteResolver<HTMLElement> {
    async resolve(lastRoute: string, currentRoute: string, router: Router<any>): Promise<false | HTMLElement> {
        if (/^r\/(\S+)$/.test(currentRoute)) {
            let itineraryUrl = RegExp.$1;
            store.postAction(new RouteDetailsOpened(itineraryUrl));
            let { RouteDetails } = await import("./components/RouteDetails/RouteDetails");
            return new RouteDetails();
        } else {
            let { RouteResults } = await import("./components/RouteResults/RouteResults");
            return new RouteResults();
        }
    }
}

let container: HTMLElement = document.querySelector(".content");

new Router<HTMLElement>(new AppRouteResolver(), new ContainerRouteRenderer(container))
    .run();