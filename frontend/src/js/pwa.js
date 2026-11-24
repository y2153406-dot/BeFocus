
if ("serviceWorker" in navigator) {
    const isSecureContext =
        window.location.protocol === "https:" ||
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";

    if (isSecureContext) {
        window.addEventListener("load", async () => {
            try {
                const registration =
                    await navigator.serviceWorker.register(
                        "./service-worker.js"
                    );

                console.log(
                    "BeFocus Service Worker registered:",
                    registration.scope
                );

            } catch (error) {
                console.error(
                    "Service Worker registration failed:",
                    error
                );
            }
        });
    }
}
