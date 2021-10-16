export class Popup extends HTMLElement {
    private popupShown: boolean = false;
    private source: HTMLElement = this;
    constructor() {
        super();
        this.keyListener = this.keyListener.bind(this);
        this.clickListener = this.clickListener.bind(this);
    }

    connectedCallback() {
        this.updateStyles();
    }

    private keyListener(ev: KeyboardEvent) {
        if (ev.key == "Escape") {
            this.hide();
        }
    }

    setSource(e: HTMLElement) {
        this.source = e;
    }

    private clickListener(ev: MouseEvent | TouchEvent) {
        if (!this.source.contains(<Element>(ev.target))) {
            this.hide();
        }
    }

    public hide() {
        if (this.popupShown) {
            document.removeEventListener("keydown", this.keyListener);
            document.removeEventListener("click", this.clickListener);
            this.popupShown = false;
            this.updateStyles();
        }
    }

    public show() {
        if (!this.popupShown) {
            document.addEventListener("keydown", this.keyListener);
            document.addEventListener("click", this.clickListener);
            this.popupShown = true;
            this.updateStyles();
        }
    }

    private updateStyles() {
        this.style.display = this.popupShown ? "" : "none";
    }

    public toggle() {
        if (!this.popupShown) {
            this.show();
        }
        else {
            this.hide();

        }
    }

    disconnectedCallback() {
        this.hide();
    }
}
customElements.define("app-popup", Popup);