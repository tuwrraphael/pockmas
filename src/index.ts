import "./styles.scss";
import "./components/RouteSearch/RouteSearch";
import "./components/RouteResults/RouteResults";
import { Store } from "./state/Store";
import { InitializeRouting } from "./state/actions/InitializeRouting";

if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
        navigator.serviceWorker.register("./sw.js").then(registration => {
        }).catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
        });
    });
}

let store = Store.getInstance();
store.postAction(new InitializeRouting());