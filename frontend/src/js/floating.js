
/* ========================================
   BeFocus - Floating Widget
======================================== */

(() => {

    // ========================================
    // 1. DOM Elements
    // ========================================

    const display = document.getElementById("floating-display");
    const label = document.getElementById("floating-label");
    const period = document.getElementById("floating-period");

    const clockButton = document.getElementById("clock-mode-btn");
    const stopwatchButton = document.getElementById("stopwatch-mode-btn");
    const timerButton = document.getElementById("timer-mode-btn");

    const stopwatchActions = document.getElementById("stopwatch-actions");
    const timerActions = document.getElementById("timer-actions");

    // Stopwatch Buttons

    const stopwatchStartButton =
        document.getElementById("floating-stopwatch-start");

    const stopwatchPauseButton =
        document.getElementById("floating-stopwatch-pause");

    const stopwatchResetButton =
        document.getElementById("floating-stopwatch-reset");

    // Timer Buttons

    const timerStartButton =
        document.getElementById("floating-timer-start");

    const timerPauseButton =
        document.getElementById("floating-timer-pause");

    const timerResetButton =
        document.getElementById("floating-timer-reset");

    // Resize Handle

    const resizeHandle = document.getElementById("resize-handle");

    // Size Preset Buttons

    const smallSizeButton =
        document.getElementById("size-small-btn");

    const mediumSizeButton =
        document.getElementById("size-medium-btn");

    const largeSizeButton =
        document.getElementById("size-large-btn");


    // ========================================
    // 2. Widget State
    // ========================================

    let currentMode = "clock";

    let stopwatchState = {
        elapsedTime: 0,
        isRunning: false
    };

    let timerState = {
        initialTime: 0,
        remainingTime: 0,
        isRunning: false
    };


    // ========================================
    // 3. Clock Functionality
    // ========================================

    function updateClock() {

        if (currentMode !== "clock") return;

        const now = new Date();

        let hours = now.getHours();

        const minutes = String(now.getMinutes()).padStart(2, "0");

        const seconds = String(now.getSeconds()).padStart(2, "0");

        const ampm = hours >= 12 ? "PM" : "AM";

        hours = hours % 12 || 12;

        hours = String(hours).padStart(2, "0");

        display.textContent = `${hours}:${minutes}:${seconds}`;

        label.textContent = "BEFOCUS";

        period.textContent = ampm;
    }


    // ========================================
    // 4. Stopwatch Time Formatting
    // ========================================

    function formatStopwatchTime(milliseconds) {

        const hours = Math.floor(milliseconds / 3600000);

        const minutes = Math.floor(
            (milliseconds % 3600000) / 60000
        );

        const seconds = Math.floor(
            (milliseconds % 60000) / 1000
        );

        const centiseconds = Math.floor(
            (milliseconds % 1000) / 10
        );

        return (
            String(hours).padStart(2, "0") + ":" +
            String(minutes).padStart(2, "0") + ":" +
            String(seconds).padStart(2, "0") + "." +
            String(centiseconds).padStart(2, "0")
        );
    }


    // ========================================
    // 5. Timer Time Formatting
    // ========================================

    function formatTimerTime(milliseconds) {

        const totalSeconds = Math.ceil(milliseconds / 1000);

        const hours = Math.floor(totalSeconds / 3600);

        const minutes = Math.floor(
            (totalSeconds % 3600) / 60
        );

        const seconds = totalSeconds % 60;

        return (
            String(hours).padStart(2, "0") + ":" +
            String(minutes).padStart(2, "0") + ":" +
            String(seconds).padStart(2, "0")
        );
    }


    // ========================================
    // 6. Render Selected Mode
    // ========================================

    function renderMode() {

        // CLOCK MODE

        if (currentMode === "clock") {

            updateClock();

        }

        // STOPWATCH MODE

        else if (currentMode === "stopwatch") {

            label.textContent = "STOPWATCH";

            display.textContent = formatStopwatchTime(
                stopwatchState.elapsedTime
            );

            period.textContent = stopwatchState.isRunning
                ? "RUNNING"
                : "PAUSED";

        }

        // TIMER MODE

        else if (currentMode === "timer") {

            label.textContent = "COUNTDOWN TIMER";

            display.textContent = formatTimerTime(
                timerState.remainingTime
            );

            if (timerState.isRunning) {

                period.textContent = "RUNNING";

            } else if (
                timerState.remainingTime <= 0 &&
                timerState.initialTime > 0
            ) {

                period.textContent = "COMPLETED";

            } else {

                period.textContent = "PAUSED";

            }

        }

    }


    // ========================================
    // 7. Mode Switching
    // ========================================

    function switchMode(mode) {

        currentMode = mode;

        // Remove Active Class

        document.querySelectorAll(".mode-btn").forEach((button) => {

            button.classList.remove("active");

        });


        // Hide All Controls By Default

        if (stopwatchActions) {

            stopwatchActions.style.display = "none";

        }

        if (timerActions) {

            timerActions.style.display = "none";

        }


        // Activate Selected Mode

        if (mode === "clock") {

            clockButton?.classList.add("active");

        }

        else if (mode === "stopwatch") {

            stopwatchButton?.classList.add("active");

            if (stopwatchActions) {

                stopwatchActions.style.display = "flex";

            }

        }

        else if (mode === "timer") {

            timerButton?.classList.add("active");

            if (timerActions) {

                timerActions.style.display = "flex";

            }

        }


        // Update Display

        renderMode();

    }


    // ========================================
    // 8. Mode Button Events
    // ========================================

    clockButton?.addEventListener("click", () => {

        switchMode("clock");

    });

    stopwatchButton?.addEventListener("click", () => {

        switchMode("stopwatch");

    });

    timerButton?.addEventListener("click", () => {

        switchMode("timer");

    });


    // ========================================
    // 9. Floating Stopwatch Controls
    // ========================================

    stopwatchStartButton?.addEventListener("click", () => {

        window.beFocus?.controlStopwatch("start");

    });

    stopwatchPauseButton?.addEventListener("click", () => {

        window.beFocus?.controlStopwatch("pause");

    });

    stopwatchResetButton?.addEventListener("click", () => {

        window.beFocus?.controlStopwatch("reset");

    });


    // ========================================
    // 10. Floating Timer Controls
    // ========================================

    timerStartButton?.addEventListener("click", () => {

        window.beFocus?.controlTimer("start");

    });

    timerPauseButton?.addEventListener("click", () => {

        window.beFocus?.controlTimer("pause");

    });

    timerResetButton?.addEventListener("click", () => {

        window.beFocus?.controlTimer("reset");

    });


    // ========================================
    // 11. Receive Stopwatch State
    // ========================================

    if (window.beFocus?.onStopwatchState) {

        window.beFocus.onStopwatchState((state) => {

            if (!state) return;

            stopwatchState = state;

            if (currentMode === "stopwatch") {

                renderMode();

            }

        });

    }


    // ========================================
    // 12. Receive Timer State
    // ========================================

    if (window.beFocus?.onTimerState) {

        window.beFocus.onTimerState((state) => {

            if (!state) return;

            timerState = state;

            if (currentMode === "timer") {

                renderMode();

            }

        });

    }


    // ========================================
    // 13. Size Preset Configuration
    // ========================================

    const sizePresets = [

        {
            name: "small",
            width: 260,
            height: 120,
            button: smallSizeButton
        },

        {
            name: "medium",
            width: 360,
            height: 170,
            button: mediumSizeButton
        },

        {
            name: "large",
            width: 600,
            height: 300,
            button: largeSizeButton
        }

    ];


    // ========================================
    // 14. Update Active Size Button
    // ========================================

    function updateSizeSelection(width, height) {

        sizePresets.forEach((preset) => {

            if (!preset.button) return;

            const isActive =
                width === preset.width &&
                height === preset.height;

            preset.button.classList.toggle(
                "active",
                isActive
            );

        });

    }


    // ========================================
    // 15. Apply Size Preset
    // ========================================

    function applySizePreset(preset) {

        if (!preset) return;

        // Resize Floating Window

        window.beFocus?.resizeFloatingWidget(
            preset.width,
            preset.height
        );

        // Update Active Button

        updateSizeSelection(
            preset.width,
            preset.height
        );

    }


    // ========================================
    // 16. Size Preset Button Events
    // ========================================

    smallSizeButton?.addEventListener("click", () => {

        applySizePreset(sizePresets[0]);

    });

    mediumSizeButton?.addEventListener("click", () => {

        applySizePreset(sizePresets[1]);

    });

    largeSizeButton?.addEventListener("click", () => {

        applySizePreset(sizePresets[2]);

    });


    // ========================================
    // 17. Initialize Current Size Selection
    // ========================================

    async function initializeSizeSelection() {

        try {

            const size = await window.beFocus?.getFloatingWindowSize();

            if (!size) return;

            updateSizeSelection(
                size.width,
                size.height
            );

        } catch (error) {

            console.error(
                "Unable to initialize widget size:",
                error
            );

        }

    }

    initializeSizeSelection();


    // ========================================
    // 18. Floating Widget Drag-to-Resize
    // ========================================

    let isResizing = false;
    let resizeReady = false;

    let startX = 0;
    let startY = 0;

    let startWidth = 0;
    let startHeight = 0;


    // Start Resizing

    resizeHandle?.addEventListener("pointerdown", async (event) => {

        // Only allow primary mouse button

        if (event.button !== 0) return;

        event.preventDefault();

        isResizing = true;
        resizeReady = false;

        startX = event.screenX;
        startY = event.screenY;

        // Capture Pointer

        try {

            resizeHandle.setPointerCapture(event.pointerId);

        } catch (error) {

            console.warn("Pointer capture unavailable:", error);

        }


        // Get Current Widget Dimensions

        try {

            const size = await window.beFocus.getFloatingWindowSize();

            if (!isResizing || !size) return;

            startWidth = size.width;
            startHeight = size.height;

            resizeReady = true;

        } catch (error) {

            console.error(
                "Unable to get Floating Widget size:",
                error
            );

            isResizing = false;
            resizeReady = false;

        }

    });


    // Handle Pointer Movement

    window.addEventListener("pointermove", (event) => {

        if (!isResizing || !resizeReady) return;

        const deltaX = event.screenX - startX;
        const deltaY = event.screenY - startY;

        // Calculate New Dimensions

        const newWidth = Math.min(
            700,
            Math.max(260, startWidth + deltaX)
        );

        const newHeight = Math.min(
            450,
            Math.max(120, startHeight + deltaY)
        );


        // Update Active Preset
        // No preset stays active for custom dimensions

        updateSizeSelection(
            newWidth,
            newHeight
        );


        // Resize Widget

        window.beFocus?.resizeFloatingWidget(
            newWidth,
            newHeight
        );

    });


    // ========================================
    // 19. Stop Resizing
    // ========================================

    function stopResizing() {

        isResizing = false;
        resizeReady = false;

    }

    window.addEventListener("pointerup", stopResizing);

    window.addEventListener("pointercancel", stopResizing);


    // ========================================
    // 20. Initialize Widget
    // ========================================

    switchMode("clock");

    setInterval(() => {

        if (currentMode === "clock") {

            updateClock();

        }

    }, 1000);

})();
