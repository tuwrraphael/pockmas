import { Action } from "./Action";
import { ActionType } from "./ActionType";


export class DisplayMoreDepartures implements Action {
    constructor() { }
    readonly type = ActionType.DisplayMoreDepartures;
}
