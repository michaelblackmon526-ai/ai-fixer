import fs from "fs";
import path from "path";

// ===============================
// RECURSIVE FILE SCANNER
// ===============================
export async function scanFiles(folder) {
    const results = [];
    const ignoreList = [
        "node_modules", ".git", "dist", ".idea", "bin", "obj", 
        "build", "out", "temp", "tmp", ".vscode", "package-lock.json"
    ];

    async function walk(dir) {
        let entries;
        try {
            entries = fs.readdirSync(dir, { withFileTypes: true });
        } catch (err) {
            return;
        }

        for (const entry of entries) {
            if (ignoreList.includes(entry.name)) continue;

            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                await walk(fullPath);
            } else {
                const ext = path.extname(entry.name).toLowerCase();

                // UPDATED: Added .tsx and .jsx for the Marketplace App
                const validExts = [".js", ".mjs", ".json", ".html", ".css", ".ts", ".tsx", ".jsx", ".txt"];
                
                if (validExts.includes(ext)) {
                    try {
                        const content = fs.readFileSync(fullPath, "utf8");
                        // Ignore empty files
                        if (content.length > 0) { 
                            results.push({
                                path: fullPath,
                                name: entry.name,
                                ext,
                                size: content.length,
                                content
                            });
                        }
                    } catch (e) {}
                }
            }
        }
    }

    await walk(folder);
    return results;
}
