import { Action } from "./Action";
import { ActionType } from "./ActionType";

export class InitializeStopSearch implements Action {
    constructor() { }
    readonly type = ActionType.InitializeStopSearch;
}