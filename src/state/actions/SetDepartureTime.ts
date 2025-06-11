import { Action } from "./Action";
import { ActionType } from "./ActionType";



export class SetDepartureTime implements Action {
    constructor(public time: Date) { }
    readonly type = ActionType.SetDepartureTime;
}
