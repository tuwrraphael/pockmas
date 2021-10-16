import template from "./SearchResultCard.html";
import "./SearchResultCard.scss";

const LabelAttribute = "label";

export class SearchResultCard extends HTMLElement {
    private rendered: boolean;
    private text: HTMLSpanElement;

    constructor() {
        super();
    }

    connectedCallback() {
        if (!this.rendered) {
            this.innerHTML = template;
            this.rendered = true;
            this.text = this.querySelector(".search-result-card__text");
        }
        this.updateAttributes();
    }
    
    attributeChangedCallback() {
        this.updateAttributes();
    }

    private updateAttributes() {
        if (!this.rendered) {
            return;
        }
        let label = this.getAttribute(LabelAttribute);
        this.text.innerText = label;
    }

    static get observedAttributes() {
        return [LabelAttribute];
    }

    disconnectedCallback() {

    }
}

customElements.define("search-result-card", SearchResultCard);
