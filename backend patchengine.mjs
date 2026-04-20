FILE: backend patchengine.mjs
CONTENT:
```javascript
import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import { scanFiles } from "./scanner.mjs";

let isPaused = false;

export function setPause(state) {
  isPaused = state;
}

function checkPause() {
  return new Promise(resolve => {
    if (!isPaused) return resolve();
    const interval = setInterval(() => {
      if (!isPaused) {
        clearInterval(interval);
        resolve();
      }
    }, 500);
  });
}

function runModel(model, prompt, onChunk) {
  return new Promise(resolve => {
    let buffer = "";
    const proc = spawn("ollama", ["run", model], {
      stdio: ["pipe", "pipe", "pipe"]
    });

    proc.stdin.write(prompt);
    proc.stdin.end();

    proc.stdout.on("data", chunk => {
      const text = chunk.toString();
      buffer += text;
      onChunk(text);
    });

    proc.on("close", () => resolve(buffer));
  });
}

function applyPatchToFile(filePath, patchText) {
  try {
    const marker = "+++ UPDATED";
    const idx = patchText.indexOf(marker);
    let newContent = "";

    if (idx !== -1) {
      newContent = patchText.slice(idx + marker.length).trim();
    } else {
      const codeBlockRegex = /```(?:\w+)?\n([\s\S]*?)```/;
      const match = patchText.match(codeBlockRegex);
      if (match && match[1]) newContent = match[1].trim();
      else if (patchText.length > 20) newContent = patchText.trim();
    }

    if (newContent.length < 1) return false;
    fs.writeFileSync(filePath, newContent, "utf8");
    return true;
  } catch (err) {
    return false;
  }
}

export async function applyPatches(folder, onChunk, range = null) {
  onChunk(`\n[Scanning: ${folder}]\n`);
  let files;
  try {
    files = await scanFiles(folder);
  } catch (err) {
    onChunk(`\n[ERROR]: ${err.message}\n`);
    return 0;
  }

  if (range) {
    const [start, end] = range.split("-").map(Number);
    files = files.filter(f => {
      const numMatch = f.path.match(/\d+/);
      if (!numMatch) return false;
      const num = parseInt(numMatch[0]);
      return num >= start && num <= end;
    });
    onChunk(`[Range Filter Active: ${range}]\n`);
  }

  const total = files.length;
  onChunk(`[Found ${total} files to process]\n`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < total; i++) {
    const file = files[i];
    if (isPaused) {
      onChunk("\n[PAUSED]\n");
      await checkPause();
      onChunk("\n[RESUMED]\n");
    }

    const progress = `[File ${i + 1} of ${total}]`;
    onChunk(`\n${progress} > Fixing: ${path.basename(file.path)}\n`);

    const prompt = `Update and fix this file. Start your response with +++ UPDATED\n\nFILE: ${file.path}\nCONTENT:\n${file.content}`;
    const response = await runModel("deepseek-coder", prompt, onChunk);
    const success = applyPatchToFile(file.path, response);

    if (success) {
      successCount++;
      onChunk(`\n[SUCCESS: ${path.basename(file.path)} saved]\n`);
    } else {
      failCount++;
      onChunk(`\n[FAILED: ${path.basename(file.path)}]\n`);
    }
  }

  onChunk(`\n=========================================\n`);
  onChunk(`   BATCH COMPLETE\n`);
  onChunk(`   Files Processed: ${total}\n`);
  onChunk(`   Successfully Patched: ${successCount}\n`);
  onChunk(`   Failures: ${failCount}\n`);
  onChunk(`=========================================\n`);

  return total;
}
```