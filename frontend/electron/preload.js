
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("beFocus", {

    // ========================================
    // 1. Application Information
    // ========================================

    appName: "BeFocus",
    platform: process.platform,


    // ========================================
    // 2. Timer Notification
    // ========================================

    notifyTimerCompleted: () => {
        return ipcRenderer.invoke("timer:completed");
    },


    // ========================================
    // 3. Wallpaper Gallery
    // ========================================

    getWallpapers: () => {
        return ipcRenderer.invoke("wallpapers:list");
    },


    // ========================================
    // 4. Open Floating Widget
    // ========================================

    openFloatingWidget: () => {
        return ipcRenderer.invoke("floating:open");
    },


    // ========================================
    // 5. Publish Stopwatch State
    // Main App → Main Process
    // ========================================

    publishStopwatchState: (state) => {

        if (
            !state ||
            typeof state.elapsedTime !== "number" ||
            !Number.isFinite(state.elapsedTime) ||
            state.elapsedTime < 0 ||
            typeof state.isRunning !== "boolean"
        ) {
            return;
        }

        ipcRenderer.send("stopwatch:update", {
            elapsedTime: state.elapsedTime,
            isRunning: state.isRunning
        });
    },


    // ========================================
    // 6. Receive Stopwatch State
    // Main Process → Floating Widget
    // ========================================

    onStopwatchState: (callback) => {

        if (typeof callback !== "function") {
            return () => {};
        }

        const listener = (_event, state) => {
            callback(state);
        };

        ipcRenderer.on("stopwatch:state", listener);

        return () => {
            ipcRenderer.removeListener("stopwatch:state", listener);
        };
    },


    // ========================================
    // 7. Publish Timer State
    // Main App → Main Process
    // ========================================

    publishTimerState: (state) => {

        if (
            !state ||
            typeof state.initialTime !== "number" ||
            !Number.isFinite(state.initialTime) ||
            state.initialTime < 0 ||
            typeof state.remainingTime !== "number" ||
            !Number.isFinite(state.remainingTime) ||
            state.remainingTime < 0 ||
            typeof state.isRunning !== "boolean"
        ) {
            return;
        }

        ipcRenderer.send("timer:update", {
            initialTime: state.initialTime,
            remainingTime: state.remainingTime,
            isRunning: state.isRunning
        });
    },


    // ========================================
    // 8. Receive Timer State
    // Main Process → Floating Widget
    // ========================================

    onTimerState: (callback) => {

        if (typeof callback !== "function") {
            return () => {};
        }

        const listener = (_event, state) => {
            callback(state);
        };

        ipcRenderer.on("timer:state", listener);

        return () => {
            ipcRenderer.removeListener("timer:state", listener);
        };
    },


    // ========================================
    // 9. Send Stopwatch Control Commands
    // Floating Widget → Main Process
    // ========================================

    controlStopwatch: (action) => {

        const allowedActions = [
            "start",
            "pause",
            "reset"
        ];

        if (!allowedActions.includes(action)) {
            return;
        }

        ipcRenderer.send("stopwatch:control", action);
    },


    // ========================================
    // 10. Receive Stopwatch Control Commands
    // Main Process → Main App
    // ========================================

    onStopwatchControl: (callback) => {

        if (typeof callback !== "function") {
            return () => {};
        }

        const listener = (_event, action) => {
            callback(action);
        };

        ipcRenderer.on("stopwatch:control", listener);

        return () => {
            ipcRenderer.removeListener("stopwatch:control", listener);
        };
    },


    // ========================================
    // 11. Send Timer Control Commands
    // Floating Widget → Main Process
    // ========================================

    controlTimer: (action) => {

        const allowedActions = [
            "start",
            "pause",
            "reset"
        ];

        if (!allowedActions.includes(action)) {
            return;
        }

        ipcRenderer.send("timer:control", action);
    },


    // ========================================
    // 12. Receive Timer Control Commands
    // Main Process → Main App
    // ========================================

    onTimerControl: (callback) => {

        if (typeof callback !== "function") {
            return () => {};
        }

        const listener = (_event, action) => {
            callback(action);
        };

        ipcRenderer.on("timer:control", listener);

        return () => {
            ipcRenderer.removeListener("timer:control", listener);
        };
    },


    // ========================================
    // 13. Resize Floating Widget
    // Floating Widget → Main Process
    // ========================================

    resizeFloatingWidget: (width, height) => {

        if (
            typeof width !== "number" ||
            typeof height !== "number" ||
            !Number.isFinite(width) ||
            !Number.isFinite(height)
        ) {
            return;
        }

        ipcRenderer.send("floating:resize", {
            width,
            height
        });
    },


    // ========================================
    // 14. Get Floating Widget Size
    // Floating Widget → Main Process
    // ========================================

    getFloatingWindowSize: () => {

        return ipcRenderer.invoke("floating:get-size");

    }

});

console.log("BeFocus Preload Bridge Initialized");
