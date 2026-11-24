
(() => {
    "use strict";

    // ========================================
    // 1. DOM Elements
    // ========================================

    const floatingButton = document.getElementById(
        "open-floating-btn"
    );


    // ========================================
    // 2. Open Floating Widget
    // ========================================

    async function openFloatingWidget() {

        try {

            await window.beFocus.openFloatingWidget();

            console.log("Floating Widget opened successfully.");

        } catch (error) {

            console.error(
                "Unable to open Floating Widget:",
                error
            );

        }

    }


    // ========================================
    // 3. Event Listener
    // ========================================

    floatingButton.addEventListener(
        "click",
        openFloatingWidget
    );

})();
