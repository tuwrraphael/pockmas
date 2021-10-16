import template from "./StopSearch.html";
import "./StopSearch.scss";
import "../../utils/popup";
import { Popup } from "../../utils/popup";
import { abortableEventListener } from "../../utils/abortableEventListener";
import "../SearchResultCard/SearchResultCard";
import { SearchResultCard } from "../SearchResultCard/SearchResultCard";

const LabelAttribute = "label";

export class StopSearch extends HTMLElement {
    private rendered = false;
    private labels: HTMLLabelElement[];
    private button: HTMLButtonElement;
    private popup: Popup;
    private abortController: AbortController;
    private input: HTMLInputElement;
    private searchResults: SearchResultCard[];
    private selectedResultLabel: HTMLSpanElement;

    constructor() {
        super();
    }

    connectedCallback() {
        this.abortController = new AbortController();
        if (!this.rendered) {
            this.innerHTML = template;
            this.rendered = true;
            this.labels = Array.from(this.querySelectorAll(".stop-search__label"));
            this.button = this.querySelector("button");
            this.popup = this.querySelector("app-popup");
            this.popup.setSource(this);
            this.input = this.querySelector(".stop-search__search-input");
            this.searchResults = Array.from(this.querySelectorAll(".stop-search__search-result"));
            this.selectedResultLabel = this.querySelector(".stop-search__selected-result-label");
        }
        this.updateAttributes();
        abortableEventListener(this.button, "click", evt => this.onClick(evt), this.abortController.signal);
        for (let i = 0; i < this.searchResults.length; i++) {
            abortableEventListener(this.searchResults[i], "click", evt => this.onSearchResultClick(i), this.abortController.signal);
        }
    }

    private onClick(evt: MouseEvent) {
        this.popup.show();
        this.input.focus();
    }

    private onSearchResultClick(i: number) {
        this.selectedResultLabel.innerText = this.searchResults[i].getAttribute("label");
        this.popup.hide();
    }

    attributeChangedCallback() {
        this.updateAttributes();
    }

    private updateAttributes() {
        if (!this.rendered) {
            return;
        }
        let label = this.getAttribute(LabelAttribute);
        for (let l of this.labels) {
            l.innerText = label;
        }
        this.button.setAttribute("title", `${label} auswählen`);
        this.labels[1].setAttribute("for", `${label}-search-input`);
        this.input.setAttribute("id", `${label}-search-input`);
    }

    disconnectedCallback() {
        this.abortController.abort();
    }

    get searchTerm() {
        return this.input.value;
    }

    setResults(results: { name: string, id: number }[]) {
        if (!this.rendered) {
            return;
        }
        for (let i = 0; i < this.searchResults.length; i++) {
            if (i < results.length) {
                this.searchResults[i].setAttribute("label", results[i].name);
                this.searchResults[i].style.display = "";
            } else {
                this.searchResults[i].style.display = "none";
            }
        }
    }
}

customElements.define("stop-search", StopSearch);
