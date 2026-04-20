export function safeJSON(str) {
    try {
        return JSON.parse(str);
    } catch {
        return null;
    }
}

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function normalizePath(p) {
    return p.replace(/\\/g, "/");
}

export function randomId(len = 8) {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let out = "";
    for (let i = 0; i < len; i++) {
        out += chars[Math.floor(Math.random() * chars.length)];
    }
    return out;
}