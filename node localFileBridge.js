import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json({ limit: "200mb" }));

// Root of your Fixer Desktop project
const ROOT = process.cwd();

// Normalize and secure paths
function safe(p) {
  return path.normalize(path.join(ROOT, p));
}

// READ FILE
app.get("/read", (req, res) => {
  try {
    const filePath = safe(req.query.path);
    const data = fs.readFileSync(filePath, "utf8");
    res.json({ success: true, data });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// WRITE FILE
app.post("/write", (req, res) => {
  try {
    const filePath = safe(req.body.path);
    fs.writeFileSync(filePath, req.body.content, "utf8");
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// LIST DIRECTORY
app.get("/list", (req, res) => {
  try {
    const dirPath = safe(req.query.path);
    const items = fs.readdirSync(dirPath, { withFileTypes: true }).map(i => ({
      name: i.name,
      type: i.isDirectory() ? "dir" : "file"
    }));
    res.json({ success: true, items });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// CREATE DIRECTORY
app.post("/mkdir", (req, res) => {
  try {
    const dirPath = safe(req.body.path);
    fs.mkdirSync(dirPath, { recursive: true });
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// DELETE FILE
app.post("/delete", (req, res) => {
  try {
    const filePath = safe(req.body.path);
    fs.unlinkSync(filePath);
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// START SERVER
app.listen(7777, () => {
  console.log("Fixer Local Bridge running at http://localhost:7777");
});
