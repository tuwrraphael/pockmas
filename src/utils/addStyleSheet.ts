
export function addStyleSheet(shadowRoot: ShadowRoot, style: string) {
    // replace this with constructable style sheet thing when safari is ready
    let styleElement = document.createElement("style");
    styleElement.innerHTML = style;
    shadowRoot.appendChild(styleElement);
}
