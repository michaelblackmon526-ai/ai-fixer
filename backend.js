const { ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

const HISTORY_PATH = path.join(__dirname, "history.json");

if (!fs.existsSync(HISTORY_PATH)) {
  fs.writeFileSync(HISTORY_PATH, JSON.stringify([]));
}

ipcMain.handle("load-history", async () => {
  const data = fs.readFileSync(HISTORY_PATH, "utf8");
  return JSON.parse(data);
});

ipcMain.handle("save-history", async (_, text) => {
  const data = fs.readFileSync(HISTORY_PATH, "utf8");
  const arr = JSON.parse(data);
  arr.push(text);
  fs.writeFileSync(HISTORY_PATH, JSON.stringify(arr, null, 2));
});

ipcMain.handle("toggle-pause", async (event, isPaused) => {
  try {
    const { setPause } = await import("./backend_patchengine.mjs");
    setPause(isPaused);
    return { ok: true, paused: isPaused };
  } catch (err) {
    return { ok: false, error: err.message };
  }
});

// UPDATED: Now accepts a 'type' (chat vs compile)
ipcMain.handle("send-command", async (event, text, type = "cmd") => {
  console.log(`Backend received ${type}:`, text);

  try {
    const { handleCommand } = await import("./index.mjs");

    const response = await handleCommand(text, (chunk) => {
      // Send chunk back with the original type so the UI can route it
      event.sender.send("command-chunk", { chunk, type });
    });

    return response;
  } catch (err) {
    console.error("Command error:", err);
    event.sender.send("command-chunk", { chunk: "\n[ERROR]: " + err.message + "\n", type });
    return { error: err.message };
  }
});
