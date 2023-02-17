import { abortableEventListener } from "../../utils/abortableEventListener";
import { addStyleSheet } from "../../utils/addStyleSheet";
import { TimelineElement } from "../TimelineElement/TimelineElement";
import template from "./Timeline.html";
import cssContent from "./Timeline.scss" assert { type: "css" };

const templateNode = document.createElement("template");
templateNode.innerHTML = template;

const svgXmlNs = "http://www.w3.org/2000/svg";

function median(values: number[]) {
    values.sort((a, b) => a - b);
    let half = Math.floor(values.length / 2);
    if (values.length % 2) {
        return values[half];
    }
    return (values[half - 1] + values[half]) / 2.0;
}

class TimelineElementsController {

    private controllerMap: Map<TimelineElement, TimelineElementController> = new Map();
    private elementsBySlot: Map<string, TimelineElement[]> = new Map();
    timelineHeight: number;

    constructor(private svg: SVGElement, private resizeObserver: ResizeObserver) {

    }

    private add(e: TimelineElement) {
        let ctrl = new TimelineElementController(e);
        this.resizeObserver.observe(ctrl.timlineElement);
        this.svg.appendChild(ctrl.connection);
        this.controllerMap.set(e, ctrl);
        return ctrl;
    }

    private remove(e: TimelineElement) {
        this.resizeObserver.unobserve(e);
        let ctrl = this.controllerMap.get(e);
        this.svg.removeChild(ctrl.connection);
        this.controllerMap.delete(e);
    }

    elementsChange(newElements: TimelineElement[]) {
        for (let e of this.controllerMap.keys()) {
            if (newElements.indexOf(e) < 0) {
                this.remove(e);
            }
        }
        this.elementsBySlot = new Map();
        for (let e of newElements) {
            let ctrl = this.controllerMap.get(e);
            if (!ctrl) {
                ctrl = this.add(e);
            }
            let slot = e.getAttribute("slot");
            let slotList: TimelineElement[];
            if (!(slotList = this.elementsBySlot.get(slot))) {
                slotList = [];
                this.elementsBySlot.set(slot, slotList);
            } else {
                let prev = this.controllerMap.get(slotList[slotList.length - 1]);
                ctrl.previous = this.controllerMap.get(slotList[slotList.length - 1]);
                prev.next = ctrl;
            }
            slotList.push(e);
        }
    }

    layoutSlot(timelineSlot: string, offsetTime: number, pixelPerMs: number) {
        let timelineElements = this.elementsBySlot.get(timelineSlot) || [];
        for (let e of timelineElements) {
            let ctrl = this.controllerMap.get(e);
            ctrl.layout(offsetTime, pixelPerMs);
        }
    }

    allControllers() {
        return Array.from(this.controllerMap.values());
    }

    layoutTimeline(pixelPerMs: number) {
        let startCtrls = Array.from(this.elementsBySlot.values()).map(slot => this.controllerMap.get(slot[0]));
        if (startCtrls.length == 0) {
            this.timelineHeight = 0;
            return;
        }
        let offset = startCtrls.map(c => +c.timlineElement.time).sort((a, b) => a - b)[0];
        for (let slot of this.elementsBySlot.keys()) {
            this.layoutSlot(slot, offset, pixelPerMs);
        }
        let boxOffset = -startCtrls.sort((a, b) => a.boxStartPositionY - b.boxStartPositionY)[0].boxStartPositionY;
        let all = this.allControllers();
        for (let ctrl of all) {
            ctrl.moveAll(boxOffset);
        }
        // let timelineOffset = median(all.map(e => e.connectionHeight()));
        // for (let ctrl of all) {
        //     ctrl.moveTimeline(timelineOffset);
        // }
        let endCtrls = Array.from(this.elementsBySlot.values()).map(slot => this.controllerMap.get(slot[slot.length - 1]));
        this.timelineHeight = endCtrls.sort((a, b) => b.boxStartPositionY - a.boxStartPositionY)[0].boxEndPositionY;
    }

    render(linePositionX: number) {
        for (let ctrl of this.allControllers()) {
            ctrl.render(linePositionX);
        }
    }
}

class TimelineElementController {
    connection: SVGPathElement;

    private _timePositionY: number;
    private _boxStartPositionY: number;
    private _boxEndPositionY: number;
    private _connectionPositionY: number;
    private _rendered = false;

    previous: TimelineElementController;
    next: TimelineElementController;

    private currentShortAnimation: {
        animation: Animation,
        targetY: number;
    };
    private moveToBoxAnimation: Animation;
    private moveToConnectionAnimation: Animation;
    private moveTo: {
        boxTargetStartPositionY: number;
        timeTargetPositionY: number;
        speedPxPerMs: number;
    }

    get boxStartPositionY() {
        return this._boxStartPositionY;
    }

    get boxEndPositionY() {
        return this._boxEndPositionY;
    }

    connectionHeight() {
        return this._connectionPositionY - this._timePositionY;
    }

    constructor(public timlineElement: TimelineElement) {
        this.connection = document.createElementNS(svgXmlNs, "path");
        this.connection.classList.add("connection");
    }

    layout(offsetTime: number, pixelPerMs: number) {
        let connectionOffset = this.timlineElement.clientHeight / 2;
        let timeOffset = +this.timlineElement.time - offsetTime;
        this._timePositionY = timeOffset * pixelPerMs;
        this._boxStartPositionY = this._timePositionY - connectionOffset;
        this._boxEndPositionY = this._boxStartPositionY + this.timlineElement.clientHeight;
        this._connectionPositionY = this._boxStartPositionY + connectionOffset;
        this.moveTo = this.timlineElement.moveTo ? {
            timeTargetPositionY: (+this.timlineElement.moveTo - offsetTime) * pixelPerMs,
            boxTargetStartPositionY: (+this.timlineElement.moveTo - offsetTime) * pixelPerMs - connectionOffset,
            speedPxPerMs: pixelPerMs
        } : null;

        if (this.previous) {
            let overlap = this.previous._boxEndPositionY - this._boxStartPositionY;
            if (overlap > 0) {
                this.previous.moveBox(-overlap / 2);
                this.moveBox(overlap / 2);
            }
        }
    }

    private moveBox(amount: number) {
        this._boxEndPositionY += amount;
        this._boxStartPositionY += amount;
        this._connectionPositionY += amount;
        if (this.moveTo) {
            this.moveTo.boxTargetStartPositionY += amount;
        }
        if (amount < 0 && this.previous) {
            let overlap = this.previous._boxEndPositionY - this._boxStartPositionY;
            if (overlap > 0) {
                this.previous.moveBox(-overlap);
            }
        }
    }

    moveAll(amount: number) {
        this._boxStartPositionY += amount;
        this._boxEndPositionY += amount;
        this._timePositionY += amount;
        this._connectionPositionY += amount;
        if (this.moveTo) {
            this.moveTo.boxTargetStartPositionY += amount;
            this.moveTo.timeTargetPositionY += amount;
        }
    }

    moveTimeline(amount: number) {
        this._timePositionY += amount;
    }

    private createArc(startpoint: DOMPoint, endpoint: DOMPoint) {
        let midx = startpoint.x + (endpoint.x - startpoint.x) / 2;
        return `M ${startpoint.x} ${startpoint.y} C ${midx} ${startpoint.y} ${midx} ${endpoint.y} ${endpoint.x} ${endpoint.y}`;
    }

    cancelMoveAnimations() {
        if (this.moveToBoxAnimation) {
            this.moveToBoxAnimation.cancel();
            this.moveToBoxAnimation = null;
        }
        if (this.moveToConnectionAnimation) {
            this.moveToConnectionAnimation.cancel();
            this.moveToConnectionAnimation = null;
        }
    }

    private currentYPos() {
        return this.timlineElement.getBoundingClientRect().top - this.timlineElement.parentElement.getBoundingClientRect().top;
    }

    render(linePositionX: number) {
        this.cancelMoveAnimations();
        if (this._rendered) {
            let from = this.currentYPos();
            if (Math.abs(from - this._boxStartPositionY) > 1) {
                if (null != this.currentShortAnimation && this.currentShortAnimation.targetY != this._boxStartPositionY) {
                    this.currentShortAnimation.animation.cancel();
                    console.log("timeline: canceled animation");
                }
                this.currentShortAnimation = {
                    animation: this.timlineElement.animate([{
                        transform: `translateY(${from}px)`
                    },
                    {
                        transform: `translateY(${this._boxStartPositionY}px)`
                    }], { duration: 200 }), targetY: this._boxStartPositionY
                };
                this.currentShortAnimation.animation.addEventListener("finish", () => {
                    this.currentShortAnimation = null;
                });
            }
        }
        this.timlineElement.style.transform = `translateY(${this._boxStartPositionY}px)`;
        let startX = linePositionX < this.timlineElement.offsetLeft ?
            this.timlineElement.offsetLeft : this.timlineElement.offsetLeft + this.timlineElement.clientWidth;
        let startpoint = new DOMPoint(startX, this._connectionPositionY);

        let endpoint = new DOMPoint(linePositionX, this._timePositionY);

        this.connection.setAttribute("d", this.createArc(startpoint, endpoint));
        this._rendered = true;
        // (this.currentShortAnimation?.animation?.finished || Promise.resolve()).then(() => {
        //     this.playMoveAnimation();
        // });
    }

    private playMoveAnimation() {
        if (this.moveTo) {
            let from = this.currentYPos();
            this.moveToBoxAnimation = this.timlineElement.animate([{
                transform: `translateY(${this._boxStartPositionY}px)`
            },
            {
                transform: `translateY(${this.moveTo.boxTargetStartPositionY}px)`
            }], { duration: 1 / this.moveTo.speedPxPerMs * Math.abs((this._boxStartPositionY - this.moveTo.boxTargetStartPositionY)) });
            this.moveToBoxAnimation.finished.then(() => {
                this.moveToBoxAnimation = null;
            });
        }
    }
}

export class Timeline extends HTMLElement {
    onTimechange() {
        this.triggerLayout("timechange");
    }
    private abortController: AbortController;
    private resizeObserver = new ResizeObserver(() => this.resizeCallback());
    private timelinePath: SVGPathElement;
    private timelineContent: HTMLDivElement;
    private timeline1Box: HTMLDivElement;
    private timelinePlaceholder: HTMLDivElement;
    private svg: SVGElement;
    private layoutTriggered = false;
    private elementsCtrl: TimelineElementsController;
    // private _rendered : boolean;

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

        this.elementsCtrl = new TimelineElementsController(this.svg, this.resizeObserver);
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

    private slotchangeCallback() {
        this.elementsCtrl.elementsChange(Array.from(this.querySelectorAll("timeline-element")));
        this.triggerLayout("slotchange");
    }

    private resizeCallback() {
        this.triggerLayout("resize");
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
        let pixelPerMs = this.getTimelineScale();
        this.elementsCtrl.layoutTimeline(pixelPerMs)

        console.log("ppm", pixelPerMs * 60 * 1000);
        const linePositionX = this.timelinePlaceholder.offsetLeft + this.timelinePlaceholder.clientWidth / 2;
        this.elementsCtrl.render(linePositionX);

        this.timelineContent.style.height = `${this.elementsCtrl.timelineHeight}px`;
        if (this.elementsCtrl.timelineHeight > 0) { // no initial animation, TODO handle better
            this.timelinePath.setAttribute("d", `M ${linePositionX} ${0} L ${linePositionX} ${this.elementsCtrl.timelineHeight}`);
        }
    }

    private getTimelineScale(): number {
        let elements = Array.from(this.elementsCtrl.allControllers()).map(e => e.timlineElement);
        const maxPixelPerMin = 2 * parseFloat(getComputedStyle(this).fontSize);
        const maxPixelPerMs = maxPixelPerMin / (1 * 60 * 1000);
        if (elements.length < 1) {
            return 1;
        } else if (elements.length == 1) {
            return 1;
        }
        let pixelPerMs = 0;
        for (let i = 1; i < elements.length; i++) {
            let timediff = +elements[i].time - +elements[i - 1].time;
            let size = elements[i - 1].clientHeight;
            if (timediff == 0) {
                pixelPerMs = maxPixelPerMs;
            } else {
                pixelPerMs = Math.max(size / timediff, pixelPerMs);
            }
        }
        let times = elements.map(t => +t.time).sort((a, b) => a - b);
        let overallSize = (times[times.length - 1] - times[0]) * pixelPerMs;
        const minHeight = window.innerHeight * 0.65;
        const maxHeight = window.innerHeight * 1.4;
        if (overallSize < minHeight) {
            pixelPerMs = minHeight / overallSize * pixelPerMs;
        } else {
            if (overallSize > maxHeight) {
                pixelPerMs = maxHeight / overallSize * pixelPerMs;
            }
            pixelPerMs = Math.min(Math.max(maxPixelPerMs, minHeight / overallSize * pixelPerMs), pixelPerMs);
        }
        return pixelPerMs;
    }
}

customElements.define("app-timeline", Timeline);
