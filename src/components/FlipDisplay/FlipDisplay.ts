import template from "./FlipDisplay.html";

export const TextAttribute = "text";

export class FlipDisplay extends HTMLElement {

    private isFront = true;
    private beforeValue: string = null;
    private frontSpan: HTMLSpanElement;
    private backSpan: HTMLSpanElement;
    private boxInner: HTMLSpanElement;
    private actualSpan: HTMLSpanElement;
    private animating = false;
    private connected = false;
    private queuedValue: string = null;
    private listener: () => void;

    constructor() {
        super();
        let shadowRoot = this.attachShadow({ mode: "open" });
        shadowRoot.innerHTML = template;
        this.frontSpan = shadowRoot.querySelector(".front");
        this.backSpan = shadowRoot.querySelector(".back");
        this.boxInner = shadowRoot.querySelector(".box-inner");
        this.actualSpan = shadowRoot.querySelector(".actual");
        this.listener = () => this.animationEnded();
    }

    connectedCallback() {
        this.connected = true;
        this.boxInner.addEventListener("animationend", this.listener);
    }

    private animationEnded() {
        this.animating = false;
        if (this.queuedValue) {
            this.updateAttributes();
            this.queuedValue = null;
        }
    }

    disconnectedCallback() {
        this.connected = false;
        this.boxInner.removeEventListener("animationend", this.listener);
    }

    attributeChangedCallback() {
        this.updateAttributes();
    }

    static get observedAttributes() {
        return [TextAttribute];
    }

    private updateAttributes() {
        let value = this.getAttribute(TextAttribute);
        if (!this.beforeValue) {
            this.isFront = true;
            this.frontSpan.innerText = value;
            this.backSpan.innerText = "";
            this.boxInner.classList.remove("show-back");
            this.boxInner.classList.remove("show-front");
            this.beforeValue = value;
            this.actualSpan.innerText = value;
        } else if (value !== this.beforeValue) {
            if (this.animating) {
                this.queuedValue = value;
            } else {
                this.isFront = !this.isFront;
                if (this.isFront) {
                    this.frontSpan.innerText = value;
                    this.boxInner.classList.remove("show-back");
                    this.boxInner.classList.add("show-front");
                } else {
                    this.backSpan.innerText = value;
                    this.boxInner.classList.remove("show-front");
                    this.boxInner.classList.add("show-back");
                }
                if (this.connected) {
                    this.animating = true;
                }
                this.actualSpan.innerText = value;
                this.beforeValue = value;
            }
        }
    }
}

customElements.define("flip-display", FlipDisplay);