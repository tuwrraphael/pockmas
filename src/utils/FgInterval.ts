import { abortableEventListener } from "./abortableEventListener";

export class FgInterval {
    private timeout: any;
    private active: boolean = true;

    constructor(private callback: () => void,
        private interval: number,
        public immediateOnFocus: boolean,
        private signal: AbortSignal) {
        if (FgInterval.registeredIntervals.length == 0) {
            FgInterval.registerEvents();
        }
        FgInterval.registeredIntervals.push(this);
        signal.addEventListener("abort", () => {
            this.stopTimeout();
            FgInterval.registeredIntervals = FgInterval.registeredIntervals.filter(i => this != i);
            if (FgInterval.registeredIntervals.length == 0) {
                FgInterval.abortController.abort();
            }
        });
        this.startTimeout();
    }

    static registeredIntervals: FgInterval[] = [];
    static abortController: AbortController;
    static active: boolean = true;

    static registerEvents() {
        FgInterval.abortController = new AbortController();
        abortableEventListener(window, "focus", () => FgInterval.focus(), FgInterval.abortController.signal);
        abortableEventListener(document, "focus", () => FgInterval.focus(), FgInterval.abortController.signal);
        abortableEventListener(window, "blur", () => FgInterval.blur(), FgInterval.abortController.signal);
        abortableEventListener(document, "blur", () => FgInterval.blur(), FgInterval.abortController.signal);
    }

    startTimeoutOnFocus() {
        if (!this.signal.aborted) {
            this.active = true;
            this.startTimeout();
            if (this.immediateOnFocus) {
                this.callback();
            }
        }
    }

    stopTimeout() {
        this.active = false;
        clearTimeout(this.timeout);
    }

    private startTimeout() {
        if (this.active) {
            this.timeout = setTimeout(() => {
                if (this.active) {
                    this.callback();
                    this.startTimeout();
                }
            }, this.interval);
        }
    }

    static focus() {
        this.active = true;
        for (let i of this.registeredIntervals) {
            i.startTimeoutOnFocus();
        }
    }

    static blur() {
        this.active = false;
        for (let i of this.registeredIntervals) {
            i.stopTimeout();
        }
    }
}
