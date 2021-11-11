import "./styles.scss";
import "./components/RouteSearch/RouteSearch";
import "./components/RouteResults/RouteResults";
import { Store } from "./state/Store";
import { InitializeRouting } from "./state/actions/InitializeRouting";
import "./install-sw";
import { SetDepartureTime } from "./state/actions/SetDepartureTime";

let store = Store.getInstance();
store.postAction(new InitializeRouting());
document.querySelector("#add-5-min").addEventListener("click", () => { store.postAction(new SetDepartureTime(5 * 60000)); });