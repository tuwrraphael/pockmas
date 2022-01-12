import { Action } from "./Action";
import { ActionType } from "./ActionType";


export class RouteDetailsOpened implements Action {
    constructor(public itineraryUrlEncoded: string) { }
    readonly type = ActionType.RouteDetailsOpened;
}
