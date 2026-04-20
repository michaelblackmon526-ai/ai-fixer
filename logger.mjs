FILE: logger.mjs
CONTENT:
```javascript
export function log(type, message) {
    const timestamp = new Date().toISOString();

    const colors = {
        info: "\x1b[36m", // cyan
        success: "\x1b[32m", // green
        warn: "\x1b[33m", // yellow
        error: "\x1b[31m" // red
    };

    const color = colors[type] || "";
    const reset = "\x1b[0m";

    console.log(`${color}[${type.toUpperCase()}] ${timestamp} - ${message}${reset}`);
}

export const info = (msg) => log("info", msg);
export const success = (msg) => log("success", msg);
export const warn = (msg) => log("warn", msg);
export const error = (msg) => log("error", msg);
```