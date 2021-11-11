import { Action } from "./Action";
import { ActionType } from "./ActionType";



export class SetDepartureTime implements Action {
    constructor(public increment: number) { }
    readonly type = ActionType.SetDepartureTime;
}
