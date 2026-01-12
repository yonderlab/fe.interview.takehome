import { spawn, ChildProcess } from "child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

let serverProcess: ChildProcess | null = null;
const API_URL = "http://localhost:3002";

export async function startTestServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const apiRoot = join(__dirname, "..");
    
    // Set test database
    process.env.DATABASE_URL = "file:.data/test.db";
    process.env.PORT = "3002";

    serverProcess = spawn("tsx", ["watch", "src/index.ts"], {
      cwd: apiRoot,
      stdio: "pipe",
      shell: true,
      env: {
        ...process.env,
        DATABASE_URL: "file:.data/test.db",
        PORT: "3002",
      },
    });

    let serverReady = false;

    const checkOutput = (data: Buffer) => {
      const output = data.toString();
      if (output.includes("Server is running") || output.includes("port 3002")) {
        if (!serverReady) {
          serverReady = true;
          // Give server a moment to fully start
          setTimeout(() => resolve(), 2000);
        }
      }
    };

    serverProcess.stdout?.on("data", checkOutput);
    serverProcess.stderr?.on("data", checkOutput);

    serverProcess.on("error", (error) => {
      reject(error);
    });

    // Timeout after 15 seconds
    setTimeout(() => {
      if (!serverReady) {
        reject(new Error("Server failed to start within 15 seconds"));
      }
    }, 15000);
  });
}

export async function stopTestServer(): Promise<void> {
  return new Promise((resolve) => {
    if (serverProcess) {
      serverProcess.kill();
      serverProcess.on("exit", () => {
        serverProcess = null;
        resolve();
      });
    } else {
      resolve();
    }
  });
}

// Wait for server to be ready
export async function waitForServer(maxAttempts = 30): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(`${API_URL}/health`);
      if (response.ok) {
        return;
      }
    } catch {
      // Server not ready yet
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("Server did not become ready");
}
