// ===============================
// PANEL COLLAPSE LOGIC
// ===============================
document.querySelectorAll(".collapse-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const target = document.getElementById(btn.dataset.target);
        target.classList.toggle("collapsed");
    });
});

// ===============================
// DOM ELEMENTS
// ===============================
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const outputContent = document.getElementById("outputContent");
const historyList = document.getElementById("historyList");
const logArea = document.getElementById("logArea");

// ===============================
// ENABLE PASTE SUPPORT
// ===============================
input.addEventListener("paste", e => {
    e.stopPropagation();
});

// ===============================
// LOAD HISTORY
// ===============================
window.api.loadHistory().then(history => {
    history.forEach(item => addHistoryItem(item));
});

// ===============================
// SEND COMMAND
// ===============================
sendBtn.addEventListener("click", sendCommand);

input.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendCommand();
    }
});

function sendCommand() {
    const text = input.value.trim();
    if (!text) return;

    addHistoryItem(text);
    window.api.saveHistory(text);

    appendOutput(`> ${text}\n`);
    appendLog(`Sent command: ${text}`);

    input.value = "";

    // STREAM RESPONSE
    window.api.sendCommand(text, chunk => {
        appendOutput(chunk);
    });
}

// ===============================
// OUTPUT HELPERS
// ===============================
function appendOutput(text) {
    outputContent.textContent += text;
    outputContent.scrollTop = outputContent.scrollHeight;
}

function appendLog(text) {
    const entry = document.createElement("div");
    entry.textContent = `[${new Date().toLocaleTimeString()}] ${text}`;
    logArea.appendChild(entry);
    logArea.scrollTop = logArea.scrollHeight;
}

// ===============================
// HISTORY UI
// ===============================
function addHistoryItem(text) {
    const li = document.createElement("li");
    li.textContent = text;
    li.addEventListener("click", () => {
        input.value = text;
    });
    historyList.appendChild(li);
}
