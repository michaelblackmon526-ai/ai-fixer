FILE: localFileBridge.js
CONTENT:
import express from "express";
import fs from "fs";
import path from "path";

const app = express();
app.use(express.json());

const ROOT = process.cwd(); // your project root

function safePath(p) {
  const full = path.join(ROOT, p);
  if (!full.startsWith(ROOT)) throw new Error("Invalid path");
  return full;
}

app.post("/file", (req, res) => {
  try {
    const { action, path: filePath, content } = req.body;
    const full = safePath(filePath);

    if (action === "write") {
      fs.writeFileSync(full, content, "utf8");
    } else if (action === "append") {
      fs.appendFileSync(full, content, "utf8");
    } else if (action === "delete") {
      fs.unlinkSync(full);
    } else if (action === "mkdir") {
      fs.mkdirSync(full, { recursive: true });
    } else {
      throw new Error("Unknown action");
    }

    res.json({ ok: true });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

app.listen(7777, () => {
  console.log("Local File Bridge running on http://localhost:7777");
});