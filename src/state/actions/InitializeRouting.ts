import { Action } from "./Action";
import { ActionType } from "./ActionType";

export class InitializeRouting implements Action {
    constructor() { }
    readonly type = ActionType.InitializeRouting;
}
