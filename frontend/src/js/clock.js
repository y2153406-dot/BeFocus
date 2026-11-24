
/* ========================================
   BeFocus - Digital Clock
======================================== */

(() => {

    // 1. Clock Variables

    let is24HourFormat = true;
    let clockInterval = null;


    // 2. Get HTML Elements

    const clockDisplay = document.getElementById("clock-display");
    const clockPeriod = document.getElementById("clock-period");
    const clockDate = document.getElementById("clock-date");

    const format12Button = document.getElementById("format-12-btn");
    const format24Button = document.getElementById("format-24-btn");


    // 3. Update Clock Display

    function updateClock() {

        const now = new Date();

        // Time Formatting

        const timeFormatter = new Intl.DateTimeFormat(
            "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hourCycle: is24HourFormat ? "h23" : "h12"
            }
        );

        const timeParts = timeFormatter.formatToParts(now);

        const hours = timeParts.find(
            part => part.type === "hour"
        )?.value || "00";

        const minutes = timeParts.find(
            part => part.type === "minute"
        )?.value || "00";

        const seconds = timeParts.find(
            part => part.type === "second"
        )?.value || "00";

        const formattedTime =
            `${hours}:${minutes}:${seconds}`;

        if (clockDisplay) {
            clockDisplay.textContent = formattedTime;
        }


        // AM / PM Indicator

        if (clockPeriod) {

            if (is24HourFormat) {

                clockPeriod.textContent = "";

            } else {

                const period = timeParts.find(
                    part => part.type === "dayPeriod"
                )?.value || "";

                clockPeriod.textContent = period.toUpperCase();

            }

        }


        // Date Formatting

        const formattedDate = now.toLocaleDateString(
            "en-IN",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );

        if (clockDate) {
            clockDate.textContent = formattedDate;
        }

    }


    // 4. Set 12-Hour Format

    function set12HourFormat() {

        is24HourFormat = false;

        updateClock();
        updateFormatButtons();

    }


    // 5. Set 24-Hour Format

    function set24HourFormat() {

        is24HourFormat = true;

        updateClock();
        updateFormatButtons();

    }


    // 6. Update Active Format Button

    function updateFormatButtons() {

        format12Button?.classList.toggle(
            "active",
            !is24HourFormat
        );

        format24Button?.classList.toggle(
            "active",
            is24HourFormat
        );

    }


    // 7. Initialize Digital Clock

    function initializeClock() {

        // Display Initial Time

        updateClock();
        updateFormatButtons();


        // Clear Existing Interval

        if (clockInterval !== null) {

            clearInterval(clockInterval);

        }


        // Update Every Second

        clockInterval = setInterval(() => {

            updateClock();

        }, 1000);


        // Format Button Events

        format12Button?.addEventListener(
            "click",
            set12HourFormat
        );

        format24Button?.addEventListener(
            "click",
            set24HourFormat
        );

    }


    // 8. DOM Initialization

    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            initializeClock,
            { once: true }
        );

    } else {

        initializeClock();

    }

})();
