const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("fixer", {
    loadHistory: () => ipcRenderer.invoke("load-history"),
    saveHistory: (text) => ipcRenderer.invoke("save-history", text),

    sendCommand: (text, type = "cmd") => {
        ipcRenderer.invoke("send-command", text, type);
    },

    togglePause: (isPaused) => {
        return ipcRenderer.invoke("toggle-pause", isPaused);
    },

    openFolder: (path) => {
        return ipcRenderer.invoke("open-folder", path);
    },

    startAI: () => {
        return ipcRenderer.invoke("start-ai-engine");
    },

    installTools: (path) => {
        return ipcRenderer.invoke("install-tools", path);
    },

    goLive: (path) => {
        return ipcRenderer.invoke("go-live", path);
    },

    importFiles: (target) => {
        return ipcRenderer.invoke("import-files", target);
    },

    exportFiles: (source) => {
        return ipcRenderer.invoke("export-files", source);
    },

    launchProgram: (path) => {
        return ipcRenderer.invoke("launch-program", path);
    },

    onLog: (callback) => {
        ipcRenderer.on("command-chunk", (_, data) => callback(data));
    }
});
