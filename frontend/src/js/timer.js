
/* ========================================
   BeFocus - Countdown Timer
======================================== */

(() => {

    // 1. Timer Variables

    let initialTime = 0;
    let remainingTime = 0;

    let timerInterval = null;
    let endTime = 0;

    let isRunning = false;


    // ========================================
    // 2. Floating Widget Synchronization
    // ========================================

    function publishTimerState() {

        if (!window.beFocus?.publishTimerState) return;

        window.beFocus.publishTimerState({
            initialTime,
            remainingTime,
            isRunning
        });
    }


    // ========================================
    // 3. Audio Engine
    // ========================================

    let audioContext = null;

    function initializeAudio() {

        if (!audioContext) {

            const AudioContextClass =
                window.AudioContext || window.webkitAudioContext;

            if (!AudioContextClass) {
                console.warn("Web Audio API is not supported.");
                return;
            }

            audioContext = new AudioContextClass();
        }

        if (audioContext.state === "suspended") {

            audioContext.resume().catch((error) => {
                console.error("Audio initialization failed:", error);
            });

        }
    }


    // ========================================
    // 4. Timer Completion Sound
    // ========================================

    function playCompletionSound() {

        if (!audioContext || audioContext.state !== "running") {
            console.warn("Audio engine is not ready.");
            return;
        }

        const frequencies = [880, 1174.66, 880];
        const startTime = audioContext.currentTime;

        frequencies.forEach((frequency, index) => {

            const oscillator = audioContext.createOscillator();
            const gain = audioContext.createGain();

            const noteStart = startTime + index * 0.22;

            oscillator.type = "sine";
            oscillator.frequency.value = frequency;

            gain.gain.setValueAtTime(0.0001, noteStart);

            gain.gain.exponentialRampToValueAtTime(
                0.2,
                noteStart + 0.03
            );

            gain.gain.exponentialRampToValueAtTime(
                0.0001,
                noteStart + 0.18
            );

            oscillator.connect(gain);
            gain.connect(audioContext.destination);

            oscillator.start(noteStart);
            oscillator.stop(noteStart + 0.2);

        });
    }


    // ========================================
    // 5. Time Formatting
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
    // 6. Update Timer Display
    // ========================================

    function updateTimerDisplay() {

        const display = document.getElementById("timer-display");

        if (!display) return;

        display.textContent = formatTimerTime(remainingTime);
    }


    // ========================================
    // 7. Set Timer
    // ========================================

    function setTimer(hours, minutes, seconds) {

        if (isRunning) return false;

        const totalMilliseconds =
            (hours * 3600 + minutes * 60 + seconds) * 1000;

        if (totalMilliseconds <= 0) return false;

        clearInterval(timerInterval);

        timerInterval = null;
        endTime = 0;

        initialTime = totalMilliseconds;
        remainingTime = initialTime;

        updateTimerDisplay();

        publishTimerState();

        return true;
    }


    // ========================================
    // 8. Start Timer
    // ========================================

    function startTimer() {

        if (isRunning || remainingTime <= 0) return;

        isRunning = true;

        endTime = Date.now() + remainingTime;

        publishTimerState();

        timerInterval = setInterval(() => {

            remainingTime = Math.max(
                0,
                endTime - Date.now()
            );

            updateTimerDisplay();

            publishTimerState();

            if (remainingTime <= 0) {
                completeTimer();
            }

        }, 100);
    }


    // ========================================
    // 9. Pause Timer
    // ========================================

    function pauseTimer() {

        if (!isRunning) return;

        remainingTime = Math.max(
            0,
            endTime - Date.now()
        );

        clearInterval(timerInterval);

        timerInterval = null;
        isRunning = false;

        updateTimerDisplay();

        publishTimerState();

        if (remainingTime <= 0) {
            completeTimer();
        }
    }


    // ========================================
    // 10. Reset Timer
    // ========================================

    function resetTimer() {

        clearInterval(timerInterval);

        timerInterval = null;
        isRunning = false;
        endTime = 0;

        remainingTime = initialTime;

        updateTimerDisplay();

        publishTimerState();
    }


    // ========================================
    // 11. Timer Completion
    // ========================================

    function completeTimer() {

        clearInterval(timerInterval);

        timerInterval = null;
        isRunning = false;

        remainingTime = 0;
        endTime = 0;

        updateTimerDisplay();

        publishTimerState();

        console.log("BeFocus: Timer Completed!");

        // Play Completion Sound

        playCompletionSound();

        // Send Notification Request to Electron Main Process

        if (window.beFocus?.notifyTimerCompleted) {

            window.beFocus.notifyTimerCompleted()

                .then((result) => {
                    console.log("Notification result:", result);
                })

                .catch((error) => {
                    console.error("Notification failed:", error);
                });

        } else {

            console.warn("Notification API is unavailable.");

        }
    }


    // ========================================
    // 12. Initialize Timer
    // ========================================

    document.addEventListener("DOMContentLoaded", () => {

        updateTimerDisplay();

        publishTimerState();


        // HTML Elements

        const startButton = document.getElementById("timer-start-btn");
        const pauseButton = document.getElementById("timer-pause-btn");
        const resetButton = document.getElementById("timer-reset-btn");
        const setButton = document.getElementById("timer-set-btn");

        const hoursInput = document.getElementById("timer-hours");
        const minutesInput = document.getElementById("timer-minutes");
        const secondsInput = document.getElementById("timer-seconds");


        // 13. Timer Preset Elements

        const presetButtons = document.querySelectorAll(
            ".timer-presets button"
        );


        // 14. Clear Active Preset

        function clearActivePreset() {

            presetButtons.forEach((button) => {
                button.classList.remove("active");
            });
        }


        // 15. Set Timer Event

        setButton?.addEventListener("click", () => {

            const hours = Number(hoursInput.value);
            const minutes = Number(minutesInput.value);
            const seconds = Number(secondsInput.value);

            if (
                hoursInput.value.trim() === "" ||
                minutesInput.value.trim() === "" ||
                secondsInput.value.trim() === "" ||
                !Number.isInteger(hours) ||
                !Number.isInteger(minutes) ||
                !Number.isInteger(seconds) ||
                hours < 0 ||
                minutes < 0 || minutes > 59 ||
                seconds < 0 || seconds > 59
            ) {

                console.warn("Please enter a valid timer duration.");

                return;
            }

            const success = setTimer(hours, minutes, seconds);

            if (success) {
                clearActivePreset();
            }

        });


        // 16. Timer Preset Events

        presetButtons.forEach((button) => {

            button.addEventListener("click", () => {

                if (isRunning) return;

                const minutes = Number(button.dataset.minutes);

                if (
                    !Number.isInteger(minutes) ||
                    minutes <= 0
                ) {
                    return;
                }

                hoursInput.value = 0;
                minutesInput.value = minutes;
                secondsInput.value = 0;

                const success = setTimer(0, minutes, 0);

                if (!success) return;

                clearActivePreset();

                button.classList.add("active");

            });

        });


        // 17. Main App Timer Controls

        startButton?.addEventListener("click", () => {

            initializeAudio();

            startTimer();

        });

        pauseButton?.addEventListener("click", pauseTimer);

        resetButton?.addEventListener("click", resetTimer);


        // 18. Floating Widget → Main App Controls

        window.beFocus?.onTimerControl((action) => {

            switch (action) {

                case "start":
                    initializeAudio();
                    startTimer();
                    break;

                case "pause":
                    pauseTimer();
                    break;

                case "reset":
                    resetTimer();
                    break;

            }

        });

    });

})();
