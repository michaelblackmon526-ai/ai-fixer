import fs from "fs";
import path from "path";
import http from "http";
import url from "url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const BRIDGE_PORT = 5050;

function log(msg) {
    console.log(`[BRIDGE] ${msg}`);
}

function writeFileSafe(relativePath, content) {
    try {
        const fullPath = path.join(__dirname, relativePath);
        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
        fs.writeFileSync(fullPath, content, "utf8");
        log(`Wrote file: ${relativePath}`);
        return { ok: true };
    } catch (err) {
        return { ok: false, error: err.message };
    }
}

function readFileSafe(relativePath) {
    try {
        const fullPath = path.join(__dirname, relativePath);
        const data = fs.readFileSync(fullPath, "utf8");
        log(`Read file: ${relativePath}`);
        return { ok: true, data };
    } catch (err) {
        return { ok: false, error: err.message };
    }
}

const server = http.createServer(async (req, res) => {
    if (req.method === "POST" && req.url === "/write") {
        let body = "";
        req.on("data", chunk => (body += chunk));
        req.on("end", () => {
            const { file, content } = JSON.parse(body);
            const result = writeFileSafe(file, content);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(result));
        });
        return;
    }

    if (req.method === "POST" && req.url === "/read") {
        let body = "";
        req.on("data", chunk => (body += chunk));
        req.on("end", () => {
            const { file } = JSON.parse(body);
            const result = readFileSafe(file);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(result));
        });
        return;
    }

    res.writeHead(404);
    res.end("Bridge endpoint not found");
});

server.listen(BRIDGE_PORT, () => {
    log(`Bridge running on http://localhost:${BRIDGE_PORT}`);
});
