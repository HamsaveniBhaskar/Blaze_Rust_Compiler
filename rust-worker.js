const { parentPort } = require("worker_threads");
const { spawnSync } = require("child_process");
const os = require("os");
const fs = require("fs");
const path = require("path");

parentPort.on("message", ({ code, input }) => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "rust-"));
    const rustFile = path.join(tmpDir, "main.rs");
    const executable = path.join(tmpDir, "main");

    try {
        fs.writeFileSync(rustFile, code);

        // Debug: Check if rustc is available
        const rustcCheck = spawnSync("rustc", ["--version"], { encoding: "utf-8" });
        if (rustcCheck.status !== 0) {
            return parentPort.postMessage({ error: { fullError: `Rustc not found: ${rustcCheck.stderr.trim()}` } });
        }

        // Compile Rust code
        const compileProcess = spawnSync("rustc", [rustFile, "-o", executable], { encoding: "utf-8" });
        const compileError = compileProcess.stderr.trim();
        if (compileProcess.status !== 0 || compileError) {
            return parentPort.postMessage({ error: { fullError: `Compilation Error:\n${compileError}` } });
        }

        // Run Rust binary
        const execProcess = spawnSync(executable, { input, encoding: "utf-8", timeout: 2000 });
        const execError = execProcess.stderr.trim();
        const output = execProcess.stdout.trim();

        fs.rmSync(tmpDir, { recursive: true, force: true });

        if (execProcess.status !== 0 || execError) {
            return parentPort.postMessage({ error: { fullError: `Runtime Error:\n${execError}` } });
        }

        parentPort.postMessage({ output: output || "No output received!" });
    } catch (err) {
        parentPort.postMessage({ error: { fullError: `Server error: ${err.message}` } });
    }
});
