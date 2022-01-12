import "./styles.scss";
import "./components/RouteSearch/RouteSearch";
import { Store } from "./state/Store";
import { InitializeRouting } from "./state/actions/InitializeRouting";
import "./install-sw";
import { AppRouter } from "./app-router";

let store = Store.getInstance();
store.postAction(new InitializeRouting());

let appRouter = AppRouter.getInstance();
appRouter.router.run();