import { Action } from "./Action";
import { ActionType } from "./ActionType";

export class DepartureStopTermChanged implements Action {
    constructor(public term: string) { }
    readonly type = ActionType.DepartureStopTermChanged;
}
