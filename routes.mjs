export const routes = {
    run: {
        method: "POST",
        path: "/run",
        description: "Main AI execution endpoint"
    },
    read: {
        method: "POST",
        path: "/read",
        description: "Read a file from the project"
    },
    fix: {
        method: "POST",
        path: "/fix",
        description: "Run the AI fixer on a target"
    }
};