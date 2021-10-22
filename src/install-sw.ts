let updatingServiceWorker: ServiceWorker = null;

function displayUpdateReady() {
    let updateready: HTMLDivElement = document.querySelector("#updateready");
    updateready.style.display = "";
}

let updateBtn: HTMLButtonElement = document.querySelector("#update-btn");
updateBtn.addEventListener("click", () => {
    updatingServiceWorker.postMessage({ action: "skipWaiting" });
});
if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
        try {
            let reg = await navigator.serviceWorker.register("./sw.js");
            if (!navigator.serviceWorker.controller) {
                // the app started the first time with latest version
                return;
            }
            let trackInstalling = (w: ServiceWorker) => {
                w.addEventListener("statechange", () => {
                    if (w.state == "installed") {
                        updatingServiceWorker = w;
                        displayUpdateReady();
                    }
                });
            };
            if (reg.waiting) {
                updatingServiceWorker = reg.waiting;
                displayUpdateReady();
                return;
            }
            if (reg.installing) {
                trackInstalling(reg.installing);
                return;
            }
            reg.addEventListener("updatefound", () => trackInstalling(reg.installing));
        }
        catch (registrationError) {
            console.log("SW registration failed.", registrationError);
        }
    });
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!refreshing) {
            refreshing = true;
            window.location.reload();
        }
    });
}
