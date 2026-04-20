import fs from 'fs';
import path from 'path';
import { normalizePath } from './utils.mjs';

export function readFileSafe(filePath) {
    try {
        const full = path.join(process.cwd(), normalizePath(filePath));
        const content = fs.readFileSync(full, 'utf8');
        return { ok: true, content };
    } catch (err) {
        return { ok: false, error: err.message };
    }
}

export function writeFileSafe(filePath, data) {
    try {
        const full = path.join(process.cwd(), normalizePath(filePath));
        fs.writeFileSync(full, data, 'utf8');
        return { ok: true };
    } catch (err) {
        return { ok: false, error: err.message };
    }
}

export function fileExists(filePath) {
    try {
        const full = path.join(process.cwd(), normalizePath(filePath));
        return fs.existsSync(full);
    } catch {
        return false;
    }
}

export function listDirectory(dirPath = './') {
    try {
        const full = path.join(process.cwd(), normalizePath(dirPath));
        const items = fs.readdirSync(full);
        return { ok: true, items };
    } catch (err) {
        return { ok: false, error: err.message };
    }
}

export function deleteFile(filePath) {
    try {
        const full = path.join(process.cwd(), normalizePath(filePath));
        fs.unlinkSync(full);
        return { ok: true };
    } catch (err) {
        return { ok: false, error: err.message };
    }
}