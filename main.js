// main.js (root)
const { app, BrowserWindow, ipcMain, shell, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const { spawn, exec, execSync } = require("child_process");

try {
    require("./backend.js");
} catch (err) {
    console.error("Failed to load backend.js:", err);
}

let mainWindow;
const childProcesses = new Set();
const persistentProcesses = new Set();

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200, height: 800,
        backgroundColor: "#050509",
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false
        }
    });
    mainWindow.loadFile(path.join(__dirname, "renderer", "index.html"));
}

function killPort(port) {
    try {
        if (process.platform === 'win32') {
            const cmd = `for /f "tokens=5" %a in ('netstat -aon ^| findstr :${port}') do taskkill /f /pid %a`;
            execSync(cmd, { stdio: 'ignore' });
        }
    } catch (e) {}
}

function runNpmCommand(command, args, cwd, event) {
    return new Promise((resolve) => {
        const fullCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
        const proc = spawn(fullCmd, [command, ...args], { cwd, shell: true });
        childProcesses.add(proc);
        
        proc.stdout.on('data', (data) => event.sender.send("command-chunk", { chunk: data.toString(), type: "cmd" }));
        proc.stderr.on('data', (data) => event.sender.send("command-chunk", { chunk: data.toString(), type: "cmd" }));

        proc.on('close', (code) => {
            childProcesses.delete(proc);
            resolve(code);
        });
    });
}

ipcMain.handle("go-live", async (event, folderPath) => {
    if (!folderPath) return { success: false };
    const targetPath = folderPath.replace(/\//g, "\\");
    
    try {
        // SMART CHECK: Ensure Payments & Core tools are actually installed
        const modulesPath = path.join(targetPath, "node_modules");
        const stripePath = path.join(modulesPath, "@stripe");
        const vitePath = path.join(modulesPath, ".bin", "vite.cmd");

        if (!fs.existsSync(stripePath) || !fs.existsSync(vitePath)) {
            event.sender.send("command-chunk", { chunk: "\n[System]: Critical payment tools missing. Running Quick Repair...\n", type: "cmd" });
            const code = await runNpmCommand("install", ["--no-audit", "--no-fund"], targetPath, event);
            if (code !== 0) return { success: false };
            event.sender.send("command-chunk", { chunk: "[System]: Repair successful. Engine synchronized.\n", type: "cmd" });
        }

        event.sender.send("command-chunk", { chunk: "\n[System]: Clearing ports 8080-8085...\n", type: "cmd" });
        [8080, 8081, 8082, 8083, 8084, 8085].forEach(killPort);
        
        if (process.platform === 'win32') {
            try { execSync("taskkill /F /IM esbuild.exe /T", { stdio: 'ignore' }); } catch(e) {}
        }

        event.sender.send("command-chunk", { chunk: "[System]: Launching Tenza Retail Engine...\n", type: "cmd" });
        const fullCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
        const devServer = spawn(fullCmd, ["run", "dev"], { cwd: targetPath, shell: true });
        childProcesses.add(devServer);
        
        devServer.stdout.on('data', (data) => {
            const output = data.toString();
            event.sender.send("command-chunk", { chunk: output, type: "cmd" });
            if (output.includes("Local:") || output.includes("http://localhost:") || output.includes("http://127.0.0.1:")) {
                const match = output.match(/http:\/\/(127\.0\.0\.1|localhost):\d+/);
                if (match) shell.openExternal(match[0]);
            }
        });

        devServer.stderr.on('data', (data) => event.sender.send("command-chunk", { chunk: data.toString(), type: "cmd" }));
        return { success: true };
    } catch (err) { return { success: false, message: err.message }; }
});

ipcMain.handle("start-ai-engine", async (event) => {
    try {
        exec("tasklist", (err, stdout) => {
            if (stdout.toLowerCase().includes("ollama.exe")) {
                event.sender.send("command-chunk", { chunk: "[System]: AI Engine already awake.\n", type: "cmd" });
                return;
            }
            const ollama = spawn("ollama", ["serve"], { shell: true, stdio: 'ignore', detached: true });
            ollama.unref();
            persistentProcesses.add(ollama);
            event.sender.send("command-chunk", { chunk: "[System]: AI Engine waking up...\n", type: "cmd" });
        });
        return { success: true };
    } catch (err) { return { success: false }; }
});

ipcMain.handle("open-folder", async (event, folderPath) => { if (folderPath) shell.openPath(folderPath); });

app.whenReady().then(createWindow);

function killChildren() {
    for (const proc of childProcesses) {
        if (proc && proc.pid && !persistentProcesses.has(proc)) {
            try {
                if (process.platform === 'win32') {
                    execSync(`taskkill /F /T /PID ${proc.pid}`, { stdio: 'ignore' });
                } else {
                    proc.kill();
                }
            } catch (e) {}
        }
    }
    childProcesses.clear();
}

app.on("before-quit", killChildren);
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
process.on("exit", killChildren);
