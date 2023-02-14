import { abortableEventListener } from "../../utils/abortableEventListener";
import { addStyleSheet } from "../../utils/addStyleSheet";
import { TimelineElement } from "../TimelineElement/TimelineElement";
import template from "./Timeline.html";
import cssContent from "./Timeline.scss" assert { type: "css" };

const templateNode = document.createElement("template");
templateNode.innerHTML = template;

const svgXmlNs = "http://www.w3.org/2000/svg";

// const maxPixelPerMs = 20 / (1 * 60 * 1000);

function median(values: number[]) {
    values.sort((a, b) => a - b);
    let half = Math.floor(values.length / 2);
    if (values.length % 2) {
        return values[half];
    }
    return (values[half - 1] + values[half]) / 2.0;
}

export class Timeline extends HTMLElement {
    onTimechange() {
        this.triggerLayout("timechange");
    }
    private abortController: AbortController;
    private timeLineElements: TimelineElement[] = [];
    private resizeObserver = new ResizeObserver(() => this.resizeCallback());
    private timelinePath: SVGPathElement;
    private timelineContent: HTMLDivElement;
    private timeline1Box: HTMLDivElement;
    private timelinePlaceholder: HTMLDivElement;
    private arrows: Map<TimelineElement, SVGPathElement> = new Map();
    private svg: SVGElement;
    private layoutTriggered = false;

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        addStyleSheet(this.shadowRoot, cssContent);
        this.shadowRoot.appendChild(templateNode.content.cloneNode(true));
        this.timelinePath = this.shadowRoot.querySelector("#timeline-path");
        this.timelineContent = this.shadowRoot.querySelector("#timeline-content");
        this.svg = this.shadowRoot.querySelector("svg");
        this.timeline1Box = this.shadowRoot.querySelector("#timeline1-box");
        this.timelinePlaceholder = this.shadowRoot.querySelector("#timeline-placeholder");
    }

    connectedCallback() {
        this.abortController = new AbortController();
        abortableEventListener(this.shadowRoot, "slotchange", () => this.slotchangeCallback(), this.abortController.signal);
        abortableEventListener(this, "timechange", () => this.onTimechange(), this.abortController.signal);
        this.resizeObserver.observe(this);
        this.resizeObserver.observe(this.timeline1Box);

    }

    disconnectedCallback() {
        this.abortController.abort();
        this.resizeObserver.unobserve(this);
        this.resizeObserver.unobserve(this.timeline1Box);
    }

    private createArrow(): SVGPathElement {
        let p: SVGPathElement = document.createElementNS(svgXmlNs, "path");
        p.classList.add("connection");
        this.svg.appendChild(p);
        return p;

    }

    private slotchangeCallback() {
        let newElements: TimelineElement[] = Array.from(this.querySelectorAll("timeline-element"));
        for (let e of this.timeLineElements) {
            if (newElements.indexOf(e) < 0) {
                this.resizeObserver.unobserve(e);
                let arrow = this.arrows.get(e);
                this.svg.removeChild(arrow);
                this.arrows.delete(e);
            }
        }
        for (let e of newElements) {
            if (this.timeLineElements.indexOf(e) < 0) {
                this.resizeObserver.observe(e);
                this.arrows.set(e, this.createArrow());
            }
        }
        this.timeLineElements = newElements;
        this.triggerLayout("slotchange");
    }

    private resizeCallback() {
        this.triggerLayout("resize");
    }

    private createArc(startpoint: { x: number, y: number }, endpoint: { x: number, y: number }) {
        let midx = startpoint.x + (endpoint.x - startpoint.x) / 2;
        return `M ${startpoint.x} ${startpoint.y} C ${midx} ${startpoint.y} ${midx} ${endpoint.y} ${endpoint.x} ${endpoint.y}`;
    }

    private triggerLayout(reason: string) {
        if (this.layoutTriggered) {
            return;
        }
        console.log("layout", reason);
        this.layoutTriggered = true;
        requestAnimationFrame(() => {
            this.layout();
        })
    }

    private layout() {
        this.layoutTriggered = false;
        if (this.timeLineElements.length == 0) {
            this.timelineContent.style.height = `0px`;
            return;
        }
        // this.timeLineElements = this.timeLineElements.sort((a, b) => (+a.time - +b.time));
        let scale = this.getTimelineScale(this.timeLineElements);
        console.log(scale);
        const linePositionX = this.timelinePlaceholder.offsetLeft + this.timelinePlaceholder.clientWidth / 2;
        // let beforeEnd = 0;

        let boxYStartPositions: number[] = [];
        let boxYEndPositions: number[] = [];
        let timeYPositions: number[] = [];

        let arrowYStart: number[] = [];

        for (let e of this.timeLineElements) {
            let arrowOffset = e.clientHeight / 2;
            let timeOffset = +e.time - +this.timeLineElements[0].time;
            let timePositionY = timeOffset * scale.scale;
            timeYPositions.push(timePositionY);
            let boxPositionY = timePositionY - arrowOffset;
            let diff = boxPositionY - boxYEndPositions[boxYEndPositions.length - 1];

            if (diff < 0) {
                boxPositionY -= diff / 2;
                let diff2 = diff / 2;
                for (let i = boxYStartPositions.length - 1; i >= 0; i--) {
                    boxYStartPositions[i] += diff2;
                    boxYEndPositions[i] += diff2;
                    arrowYStart[i] += diff2;
                    if (i > 0) {
                        diff2 = boxYStartPositions[i] - boxYEndPositions[i - 1];
                    }
                    if (diff2 > 0) {
                        break;
                    }
                }
            }
            boxYStartPositions.push(boxPositionY);
            boxYEndPositions.push(boxPositionY + e.clientHeight);
            arrowYStart.push(boxPositionY + arrowOffset);
        }
        let boxYZero = boxYStartPositions[0];
        boxYStartPositions = boxYStartPositions.map(b => b - boxYZero);
        arrowYStart = arrowYStart.map(b => b - boxYZero);
        timeYPositions = timeYPositions.map(b => b - boxYZero);

        let timelineOffset = median(timeYPositions.map((cur, idx) => arrowYStart[idx] - cur));

        for (let i = 0; i < this.timeLineElements.length; i++) {
            let e = this.timeLineElements[i];
            e.style.transform = `translateY(${boxYStartPositions[i]}px)`;
            // TODO
            if (e.style.transition == "") {
                requestAnimationFrame(() => {
                    e.style.transition = "0.2s linear";
                })
            }

            let arrow = this.arrows.get(e);
            let startpoint = {
                x: e.offsetLeft,
                y: arrowYStart[i]
            };
            let endpoint = {
                x: linePositionX,
                y: timeYPositions[i] + timelineOffset
            };
            arrow.setAttribute("d", this.createArc(startpoint, endpoint));
        }
        this.timelineContent.style.height = `${boxYEndPositions[boxYEndPositions.length - 1] - boxYZero}px`;
        this.timelinePath.setAttribute("d", `M ${linePositionX} ${0} L ${linePositionX} ${boxYEndPositions[boxYEndPositions.length - 1] - boxYZero}`);
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
        let times = this.timeLineElements.map(t => +t.time).sort((a, b) => a - b);
        let overallSize = (times[times.length - 1] - times[0]) * pixelPerMs;
        const minHeight = window.innerHeight * 0.7;
        const maxHeight = window.innerHeight * 1.4;
        if (overallSize < minHeight) {
            pixelPerMs = minHeight / overallSize * pixelPerMs;
        } else if (overallSize > maxHeight) {
            pixelPerMs = maxHeight / overallSize * pixelPerMs;
        }
        return {
            scale: pixelPerMs,
        };
    }
}

customElements.define("app-timeline", Timeline);
