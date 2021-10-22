import "./styles.scss";
import "./components/RouteSearch/RouteSearch";
import "./components/RouteResults/RouteResults";
import { Store } from "./state/Store";
import { InitializeRouting } from "./state/actions/InitializeRouting";
import "./install-sw";

let store = Store.getInstance();
store.postAction(new InitializeRouting());