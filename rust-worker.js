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

        // Compile Rust code
        const compileProcess = spawnSync("rustc", [rustFile, "-o", executable], { encoding: "utf-8" });
        if (compileProcess.status !== 0) {
            return parentPort.postMessage({
                error: { fullError: `Compilation Error:\n${compileProcess.stderr}` },
            });
        }

        // Run Rust code
        const execProcess = spawnSync(executable, { input, encoding: "utf-8", timeout: 2000 });

        // Clean up temporary files
        fs.rmSync(tmpDir, { recursive: true, force: true });

        if (execProcess.status !== 0) {
            return parentPort.postMessage({
                error: { fullError: `Runtime Error:\n${execProcess.stderr}` },
            });
        }

        parentPort.postMessage({
            output: execProcess.stdout.trim() || "No output received!",
        });
    } catch (err) {
        parentPort.postMessage({
            error: { fullError: `Server error: ${err.message}` },
        });
    }
});
