import "./styles.scss";

if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
        navigator.serviceWorker.register("./sw.js").then(registration => {
        }).catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
        });
    });
}

let worker = new Worker(new URL("./worker", import.meta.url));
worker.postMessage({ type: "initStopSearch" });
worker.addEventListener("message", ev => {
    for (let i = 0; i < 10; i++) {
        document.getElementById("result-" + i).innerHTML = ev.data.results.length > i ? `${i + 1}: ` + ev.data.results[i].name : "";
    }
});
let startInput: HTMLInputElement = document.querySelector("#start");
startInput.addEventListener("input", () => {
    worker.postMessage({ type: "searchTermChanged", term: startInput.value });
});