
(() => {
    "use strict";

    // ========================================
    // 1. Stopwatch Variables
    // ========================================

    let startTime = 0;
    let elapsedTime = 0;
    let timerInterval = null;
    let isRunning = false;

    let laps = [];


    // ========================================
    // 2. Time Formatting
    // ========================================

    function formatTime(milliseconds) {

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
    // 3. Publish Stopwatch State
    // ========================================

    function publishStopwatchState(milliseconds = elapsedTime) {

        if (!window.beFocus?.publishStopwatchState) {
            return;
        }

        window.beFocus.publishStopwatchState({
            elapsedTime: milliseconds,
            isRunning: isRunning
        });
    }


    // ========================================
    // 4. Update Stopwatch Display
    // ========================================

    function updateDisplay() {

        const display = document.getElementById("stopwatch-display");

        if (display) {
            display.textContent = formatTime(elapsedTime);
        }

        publishStopwatchState();
    }


    function updateDisplayValue(milliseconds) {

        const display = document.getElementById("stopwatch-display");

        if (display) {
            display.textContent = formatTime(milliseconds);
        }

        publishStopwatchState(milliseconds);
    }


    // ========================================
    // 5. Start Stopwatch
    // ========================================

    function startStopwatch() {

        if (isRunning) return;

        isRunning = true;

        startTime = Date.now();

        publishStopwatchState();

        timerInterval = setInterval(() => {

            const currentElapsed =
                elapsedTime + (Date.now() - startTime);

            updateDisplayValue(currentElapsed);

        }, 10);
    }


    // ========================================
    // 6. Pause Stopwatch
    // ========================================

    function pauseStopwatch() {

        if (!isRunning) return;

        elapsedTime += Date.now() - startTime;

        clearInterval(timerInterval);

        timerInterval = null;

        isRunning = false;

        updateDisplay();
    }


    // ========================================
    // 7. Reset Stopwatch
    // ========================================

    function resetStopwatch() {

        clearInterval(timerInterval);

        startTime = 0;

        elapsedTime = 0;

        timerInterval = null;

        isRunning = false;

        laps = [];

        updateDisplay();

        renderLaps();
    }


    // ========================================
    // 8. Record Lap
    // ========================================

    function recordLap() {

        if (!isRunning) return;

        const lapTime =
            elapsedTime + (Date.now() - startTime);

        const previousLap = laps.length > 0
            ? laps[laps.length - 1].total
            : 0;

        const lap = {
            number: laps.length + 1,
            total: lapTime,
            duration: lapTime - previousLap
        };

        laps.push(lap);

        renderLaps();
    }


    // ========================================
    // 9. Display Lap Records
    // ========================================

    function renderLaps() {

        const lapContainer = document.getElementById("lap-list");

        if (!lapContainer) return;

        lapContainer.innerHTML = "";

        laps.forEach((lap) => {

            const lapItem = document.createElement("li");

            lapItem.textContent =
                `Lap ${lap.number} — ${formatTime(lap.duration)}`;

            lapContainer.appendChild(lapItem);

        });
    }


    // ========================================
    // 10. Initialize Stopwatch
    // ========================================

    document.addEventListener("DOMContentLoaded", () => {

        updateDisplay();

        const startButton = document.getElementById("start-btn");
        const pauseButton = document.getElementById("pause-btn");
        const resetButton = document.getElementById("reset-btn");
        const lapButton = document.getElementById("lap-btn");


        // Main App Stopwatch Controls

        startButton?.addEventListener("click", startStopwatch);
        pauseButton?.addEventListener("click", pauseStopwatch);
        resetButton?.addEventListener("click", resetStopwatch);
        lapButton?.addEventListener("click", recordLap);


        // Floating Widget → Main App Controls

        window.beFocus?.onStopwatchControl((action) => {

            switch (action) {

                case "start":
                    startStopwatch();
                    break;

                case "pause":
                    pauseStopwatch();
                    break;

                case "reset":
                    resetStopwatch();
                    break;

            }

        });

    });

})();
