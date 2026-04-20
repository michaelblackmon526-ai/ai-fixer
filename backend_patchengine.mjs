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

        proc.on("error", (err) => {
            onChunk(`\n[AI Error]: ${err.message}\n`);
            resolve("");
        });

        proc.on("close", () => resolve(buffer));
    });
}

function applyPatchToFile(filePath, patchText) {
    try {
        if (!patchText || patchText.length < 5) return false;

        // Strip AI junk
        let cleaned = patchText.replace(/<｜.*?｜>/g, "").replace(/▁/g, "");

        let newContent = "";
        const codeBlockRegex = /```(?:typescript|tsx|javascript|jsx|java|json|css|html)?\n?([\s\S]*?)```/i;
        const match = cleaned.match(codeBlockRegex);

        if (match && match[1]) {
            newContent = match[1].trim();
        } else {
            // Leniency: If no backticks, but it looks like code, take it.
            const check = cleaned.trim().substring(0, 200).toLowerCase();
            if (check.includes("import") || check.includes("export") || check.includes("const") || check.includes("function") || check.includes("<!")) {
                newContent = cleaned.trim();
            }
        }

        // Final Filter: if AI chatter is still at the top, strip it
        if (newContent.toLowerCase().includes("i'm sorry") || newContent.toLowerCase().includes("the file provided")) {
            const firstImport = newContent.indexOf("import");
            if (firstImport !== -1) {
                newContent = newContent.slice(firstImport);
            } else {
                return false;
            }
        }

        if (newContent.length < 5) return false;
        fs.writeFileSync(filePath, newContent, "utf8");
        return true;
    } catch (err) {
        return false;
    }
}

export async function applyPatches(folder, onChunk, range = null) {
    // Force path to absolute for Marketplace components if requested
    let targetFolder = folder;
    if (folder === "components") {
        targetFolder = "C:/Users/micha/Documents/ai-fixer-desktop/AI_DROP/ecommerce-automated-personal-1 (1)/src/components/";
    }

    onChunk(`\n[Scanning: ${targetFolder}]\n`);
    let files;
    try {
        files = await scanFiles(targetFolder);
    } catch (err) {
        onChunk(`\n[ERROR]: ${err.message}\n`);
        return 0;
    }

    if (range && range !== "retry") {
        const [start, end] = range.split("-").map(Number);
        files = files.filter(f => {
            const fileName = path.basename(f.path);
            const numMatch = fileName.match(/\d+/);
            if (!numMatch) return false;
            const num = parseInt(numMatch[0]);
            return num >= start && num <= end;
        });
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
        onChunk(`\n${progress} > Processing: ${path.basename(file.path)}\n`);

        const prompt = `
Output the code for this file exactly as it is, but ensure any links to "databasepad.com" are removed.
Return ONLY code inside triple backticks. 
NO explanations. NO apologies. NO greetings. 

FILE: ${file.path}
CONTENT:
${file.content}`;

        try {
            const response = await runModel("deepseek-coder", prompt, onChunk);
            const success = applyPatchToFile(file.path, response);

            if (success) {
                successCount++;
                onChunk(`\n[SUCCESS: ${path.basename(file.path)} saved]\n`);
            } else {
                failCount++;
                onChunk(`\n[FAILED: ${path.basename(file.path)} - Code extraction failed]\n`);
            }
        } catch (e) {
            onChunk(`\n[ERROR]: ${e.message}\n`);
            failCount++;
        }
    }

    onChunk(`\n=========================================\n`);
    onChunk(`   SURGICAL REPAIR COMPLETE\n`);
    onChunk(`   Successfully Saved: ${successCount}\n`);
    onChunk(`   Failed/Needs Review: ${failCount}\n`);
    onChunk(`=========================================\n`);
    
    return total;
}
