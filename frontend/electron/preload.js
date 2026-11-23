
const { contextBridge } = require("electron");

// Expose a limited and secure API to the renderer.
contextBridge.exposeInMainWorld("beFocus", {
    appName: "BeFocus",
    platform: process.platform
});

console.log("BeFocus Preload Bridge Initialized");
