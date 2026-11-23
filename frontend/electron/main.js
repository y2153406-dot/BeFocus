
const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
    const mainWindow = new BrowserWindow({
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

    mainWindow.loadFile(
        path.join(__dirname, "../src/index.html")
    );

    // Prevent navigation to external websites.
    mainWindow.webContents.on("will-navigate", (event, url) => {
        if (url !== mainWindow.webContents.getURL()) {
            event.preventDefault();
        }
    });
}

// Application initialization
app.whenReady().then(() => {
    createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Application closing behavior
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
