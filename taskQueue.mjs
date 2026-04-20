import { randomId, sleep } from "./utils.mjs";

export class TaskQueue {
    constructor() {
        this.queue = [];
        this.running = false;
    }

    addTask(fn, meta = {}) {
        const task = {
            id: randomId(),
            fn,
            meta,
            status: "pending",
            createdAt: Date.now()
        };
        this.queue.push(task);
        this.run();
        return task.id;
    }

    async run() {
        if (this.running) return;
        this.running = true;

        while (this.queue.length > 0) {
            const task = this.queue.shift();
            task.status = "running";
            task.startedAt = Date.now();

            try {
                task.result = await task.fn();
                task.status = "done";
            } catch (err) {
                task.status = "error";
                task.error = err.message;
            }

            task.finishedAt = Date.now();
            await sleep(10);
        }

        this.running = false;
    }
}