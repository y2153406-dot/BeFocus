
const {
    app,
    BrowserWindow,
    ipcMain,
    Notification
} = require("electron");

const path = require("path");
const fs = require("fs");


// ========================================
// 1. Main Window Reference
// ========================================

let mainWindow = null;


// ========================================
// 2. Floating Window Reference
// ========================================

let floatingWindow = null;


// Store Latest Timer State

let lastTimerState = null;


// ========================================
// 3. Timer Completion Notification
// ========================================

ipcMain.handle("timer:completed", (event) => {

    if (
        !mainWindow ||
        mainWindow.isDestroyed() ||
        event.sender !== mainWindow.webContents
    ) {
        return false;
    }

    if (!Notification.isSupported()) {

        console.warn("Notifications are not supported.");

        return false;
    }

    const notification = new Notification({
        title: "BeFocus",
        body: "Your timer has completed!",
        silent: false
    });

    notification.show();

    return true;
});


// ========================================
// 4. Wallpaper Gallery - List Wallpapers
// ========================================

ipcMain.handle("wallpapers:list", async (event) => {

    if (
        !mainWindow ||
        mainWindow.isDestroyed() ||
        event.sender !== mainWindow.webContents
    ) {
        return [];
    }

    const wallpaperRoot = path.join(
        __dirname,
        "../src/assets/wallpapers"
    );

    const categories = ["scenic", "animated"];

    const allowedExtensions = [
        ".png",
        ".jpg",
        ".jpeg",
        ".webp"
    ];

    const wallpapers = [];

    for (const category of categories) {

        const folderPath = path.join(
            wallpaperRoot,
            category
        );

        try {

            const files = await fs.promises.readdir(folderPath);

            for (const file of files) {

                const extension = path.extname(file).toLowerCase();

                if (!allowedExtensions.includes(extension)) {
                    continue;
                }

                wallpapers.push({

                    id: `${category}-${file}`,

                    name: path.parse(file).name,

                    category,

                    src: `./assets/wallpapers/${category}/${encodeURIComponent(file)}`

                });
            }

        } catch (error) {

            console.error(
                `Unable to read ${category} wallpapers:`,
                error
            );
        }
    }

    return wallpapers;
});


// ========================================
// 5. Main Application Window
// ========================================

function createWindow() {

    if (mainWindow && !mainWindow.isDestroyed()) {

        mainWindow.show();
        mainWindow.focus();

        return;
    }

    mainWindow = new BrowserWindow({

        width: 1200,
        height: 800,

        minWidth: 800,
        minHeight: 600,

        title: "BeFocus",

        webPreferences: {

            preload: path.join(__dirname, "preload.js"),

            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true,
            webSecurity: true

        }
    });


    // Load Application HTML

    mainWindow.loadFile(
        path.join(__dirname, "../src/index.html")
    );


    // Prevent Navigation to External Websites

    mainWindow.webContents.on("will-navigate", (event, url) => {

        if (url !== mainWindow.webContents.getURL()) {
            event.preventDefault();
        }
    });


    // Reset Main Window Reference

    mainWindow.on("closed", () => {

        mainWindow = null;

    });
}


// ========================================
// 6. Floating Widget Window
// ========================================

function createFloatingWindow() {

    // Prevent Duplicate Floating Windows

    if (floatingWindow && !floatingWindow.isDestroyed()) {

        floatingWindow.show();
        floatingWindow.focus();

        return;
    }

    floatingWindow = new BrowserWindow({

        // Default Widget Size

        width: 360,
        height: 170,

        // Minimum Widget Size

        minWidth: 260,
        minHeight: 120,

        // Maximum Widget Size

        maxWidth: 700,
        maxHeight: 450,

        // Enable Resizing

        resizable: true,
        movable: true,

        title: "BeFocus Floating Widget",

        frame: false,
        transparent: true,
        backgroundColor: "#00000000",

        alwaysOnTop: true,

        hasShadow: false,
        skipTaskbar: true,

        show: false,

        webPreferences: {

            preload: path.join(__dirname, "preload.js"),

            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true,
            webSecurity: true

        }
    });


    // Keep Widget Above Normal Windows

    floatingWindow.setAlwaysOnTop(true);


    // Load Floating Widget HTML

    floatingWindow.loadFile(
        path.join(__dirname, "../src/floating.html")
    );


    // Show Window After Loading

    floatingWindow.once("ready-to-show", () => {

        if (floatingWindow && !floatingWindow.isDestroyed()) {

            floatingWindow.show();

            // Send Latest Timer State

            if (lastTimerState) {

                floatingWindow.webContents.send(
                    "timer:state",
                    lastTimerState
                );

            }
        }
    });


    // Prevent External Navigation

    floatingWindow.webContents.on("will-navigate", (event, url) => {

        if (url !== floatingWindow.webContents.getURL()) {
            event.preventDefault();
        }
    });


    // Reset Floating Window Reference

    floatingWindow.on("closed", () => {

        floatingWindow = null;

    });
}


// ========================================
// 7. Floating Widget IPC Handler
// ========================================

ipcMain.handle("floating:open", (event) => {

    if (
        !mainWindow ||
        mainWindow.isDestroyed() ||
        event.sender !== mainWindow.webContents
    ) {
        return false;
    }

    createFloatingWindow();

    return true;

});


// ========================================
// 8. Floating Widget Resize Handler
// Floating Widget → Main Process
// ========================================

ipcMain.on("floating:resize", (event, dimensions) => {

    // Accept Requests Only from Floating Widget

    if (
        !floatingWindow ||
        floatingWindow.isDestroyed() ||
        event.sender !== floatingWindow.webContents
    ) {
        return;
    }


    // Validate Dimensions

    if (
        !dimensions ||
        typeof dimensions.width !== "number" ||
        typeof dimensions.height !== "number" ||
        !Number.isFinite(dimensions.width) ||
        !Number.isFinite(dimensions.height)
    ) {
        return;
    }


    // Restrict Widget Dimensions

    const width = Math.min(
        700,
        Math.max(260, Math.round(dimensions.width))
    );

    const height = Math.min(
        450,
        Math.max(120, Math.round(dimensions.height))
    );


    // Resize Floating Window

    floatingWindow.setSize(width, height);

});


// ========================================
// 9. Get Floating Widget Current Size
// Floating Widget → Main Process
// ========================================

ipcMain.handle("floating:get-size", (event) => {

    // Accept Requests Only from Floating Widget

    if (
        !floatingWindow ||
        floatingWindow.isDestroyed() ||
        event.sender !== floatingWindow.webContents
    ) {
        return null;
    }


    // Get Current Window Dimensions

    const [width, height] = floatingWindow.getSize();

    return {
        width,
        height
    };

});


// ========================================
// 10. Stopwatch State Synchronization
// Main App → Floating Widget
// ========================================

ipcMain.on("stopwatch:update", (event, state) => {

    if (
        !mainWindow ||
        mainWindow.isDestroyed() ||
        event.sender !== mainWindow.webContents
    ) {
        return;
    }


    // Validate Stopwatch State

    if (
        !state ||
        typeof state.elapsedTime !== "number" ||
        !Number.isFinite(state.elapsedTime) ||
        state.elapsedTime < 0 ||
        typeof state.isRunning !== "boolean"
    ) {
        return;
    }


    // Forward Stopwatch State

    if (floatingWindow && !floatingWindow.isDestroyed()) {

        floatingWindow.webContents.send("stopwatch:state", {

            elapsedTime: state.elapsedTime,

            isRunning: state.isRunning

        });

    }

});


// ========================================
// 11. Timer State Synchronization
// Main App → Floating Widget
// ========================================

ipcMain.on("timer:update", (event, state) => {

    if (
        !mainWindow ||
        mainWindow.isDestroyed() ||
        event.sender !== mainWindow.webContents
    ) {
        return;
    }


    // Validate Timer State

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


    // Store Latest Timer State

    lastTimerState = {

        initialTime: state.initialTime,

        remainingTime: state.remainingTime,

        isRunning: state.isRunning

    };


    // Forward Timer State

    if (floatingWindow && !floatingWindow.isDestroyed()) {

        floatingWindow.webContents.send(
            "timer:state",
            lastTimerState
        );

    }

});


// ========================================
// 12. Stopwatch Control Commands
// Floating Widget → Main App
// ========================================

ipcMain.on("stopwatch:control", (event, action) => {

    if (
        !floatingWindow ||
        floatingWindow.isDestroyed() ||
        event.sender !== floatingWindow.webContents
    ) {
        return;
    }


    const allowedActions = [
        "start",
        "pause",
        "reset"
    ];

    if (!allowedActions.includes(action)) {
        return;
    }


    // Forward Command to Main Application

    if (mainWindow && !mainWindow.isDestroyed()) {

        mainWindow.webContents.send(
            "stopwatch:control",
            action
        );

    }

});


// ========================================
// 13. Timer Control Commands
// Floating Widget → Main App
// ========================================

ipcMain.on("timer:control", (event, action) => {

    if (
        !floatingWindow ||
        floatingWindow.isDestroyed() ||
        event.sender !== floatingWindow.webContents
    ) {
        return;
    }


    const allowedActions = [
        "start",
        "pause",
        "reset"
    ];

    if (!allowedActions.includes(action)) {
        return;
    }


    // Forward Command to Main Application

    if (mainWindow && !mainWindow.isDestroyed()) {

        mainWindow.webContents.send(
            "timer:control",
            action
        );

    }

});


// ========================================
// 14. Application Initialization
// ========================================

app.whenReady().then(() => {

    createWindow();


    // macOS Window Activation

    app.on("activate", () => {

        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }

    });

});


// ========================================
// 15. Application Closing Behavior
// ========================================

app.on("window-all-closed", () => {

    if (process.platform !== "darwin") {
        app.quit();
    }

});
