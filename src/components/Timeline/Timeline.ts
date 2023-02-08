import { abortableEventListener } from "../../utils/abortableEventListener";
import { TimelineElement } from "../TimelineElement/TimelineElement";
import template from "./Timeline.html";
import "./Timeline.scss";

const templateNode = document.createElement("template");
templateNode.innerHTML = template;

export class Timeline extends HTMLElement {
    onTimechange() {
        this.layout("timechange");
    }
    private abortController: AbortController;
    private timeLineElements: TimelineElement[] = [];
    private resizeObserver = new ResizeObserver(() => this.resizeCallback());

    constructor() {
        super();
        this.attachShadow({ mode: "open" }).appendChild(templateNode.content.cloneNode(true));
    }

    connectedCallback() {
        this.abortController = new AbortController();
        abortableEventListener(this.shadowRoot, "slotchange", () => this.slotchangeCallback(), this.abortController.signal);
        abortableEventListener(this, "timechange", () => this.onTimechange(), this.abortController.signal);
    }

    disconnectedCallback() {
        this.abortController.abort();
    }

    private slotchangeCallback() {
        let newElements: TimelineElement[] = Array.from(this.querySelectorAll("timeline-element"));
        for (let e of this.timeLineElements) {
            if (newElements.indexOf(e) < 0) {
                this.resizeObserver.unobserve(e);
            }
        }
        for (let e of newElements) {
            if (this.timeLineElements.indexOf(e) < 0) {
                this.resizeObserver.observe(e);
            }
        }
        this.timeLineElements = newElements;
        this.layout("slotchange");
    }

    private resizeCallback() {
        this.layout("resize");
    }

    private layout(reason: string) {
        console.log("layout", reason);
        let scale = this.getTimelineScale(this.timeLineElements);
        console.log(scale);
        for (let e of this.timeLineElements) {
            let timeOffset = +e.time - +this.timeLineElements[0].time;
            e.style.transform = `translateY(${timeOffset * scale.scale}px)`;
        }
    }

    private getTimelineScale(elements: TimelineElement[]) {
        if (elements.length < 1) {
            return {
                size: 0,
                scale: 1
            };
        } else if (elements.length == 1) {
            return {
                size: elements[0].clientHeight,
                scale: 1
            };
        }
        let pixelPerMs = 0;
        for (let i = 1; i < elements.length; i++) {
            let timediff = +elements[i].time - +elements[i - 1].time;
            let size = elements[i - 1].clientHeight;
            pixelPerMs = Math.max(size / timediff, pixelPerMs);
        }
        let overallTime = +elements[elements.length - 1].time - +elements[0].time;
        return {
            scale: pixelPerMs,
            size: overallTime * pixelPerMs + elements[elements.length - 1].clientHeight
        };
    }
}

customElements.define("app-timeline", Timeline);
