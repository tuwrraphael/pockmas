import { Action } from "./Action";
import { ActionType } from "./ActionType";


export class RefreshRouteDetails implements Action {
    constructor() { }
    readonly type = ActionType.RefreshRouteDetails;
}