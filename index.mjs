import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";
import { scanFiles } from "./scanner.mjs";
import { applyPatches } from "./backend_patchengine.mjs";
import { preprocess } from "./fixer/repair/index.js"; // IMPORTING V2 ENGINE

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// THE MASTER PATH
const MARKETPLACE_ROOT = "C:/Users/micha/Documents/ai-fixer-desktop/TENZA_PURE/";

function pickModel(command) {
    const lower = command.toLowerCase();
    if (lower.includes("fix") || lower.includes("patch") || lower.includes("repair") || lower.includes("compile")) return "deepseek-coder";
    return "llama3";
}

export async function handleCommand(text, onChunk) {
    const lowerText = text.toLowerCase().trim();
    
    // NEW: V2 AST REPAIR TRIGGER
    if (lowerText.startsWith("deep fix") || lowerText.startsWith("ast repair")) {
        onChunk("\n[System]: Activating V2 High-Level AST Repair Engine...\n");
        await preprocess(MARKETPLACE_ROOT, onChunk);
        return "Deep fix complete.";
    }

    if (lowerText === "launch") {
        onChunk("\n[System]: Launching Marketplace App...\n");
        onChunk("INTERNAL_EXEC_LAUNCH"); 
        return "Launch command initiated.";
    }

    if (text.startsWith("compile")) {
        const count = await applyPatches(MARKETPLACE_ROOT, onChunk);
        return `Processed ${count} files.`;
    }

    const model = pickModel(text);
    return await new Promise(resolve => {
        let buffer = "";
        const proc = spawn("ollama", ["run", model], { stdio: ["pipe", "pipe", "pipe"] });
        proc.stdin.write(text);
        proc.stdin.end();
        proc.stdout.on('data', chunk => {
            const t = chunk.toString();
            buffer += t;
            onChunk(t);
        });
        proc.on('close', () => resolve(buffer));
    });
}
