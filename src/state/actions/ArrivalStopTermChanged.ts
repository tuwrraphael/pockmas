import { Action } from "./Action";
import { ActionType } from "./ActionType";


export class ArrivalStopTermChanged implements Action {
    constructor(public term: string) { }
    readonly type = ActionType.ArrivalStopTermChanged;
}
