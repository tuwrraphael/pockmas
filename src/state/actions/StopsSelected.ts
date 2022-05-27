import { Action } from "./Action";
import { ActionType } from "./ActionType";


export class StopsSelected implements Action {
    constructor(public departure: number, public arrival: number) { }
    readonly type = ActionType.StopsSelected;
}


