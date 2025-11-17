/**
 * Test server utilities for integration testing
 * Provides programmatic control over json-server lifecycle
 */

import { ChildProcess, spawn } from 'child_process';
import * as path from 'path';

interface ServerInstance {
  process: ChildProcess;
  port: number;
  baseUrl: string;
}

let serverInstance: ServerInstance | null = null;

const DEFAULT_PORT = 5001; // Use different port than dev server
const SERVER_STARTUP_TIMEOUT = 10000; // 10 seconds

/**
 * Starts the json-server for integration testing
 * @param port - Port to run server on (default: 5001)
 * @returns Promise that resolves when server is ready
 */
export async function startTestServer(port: number = DEFAULT_PORT): Promise<string> {
  if (serverInstance) {
    console.log(`[TestServer] Server already running on port ${serverInstance.port}`);
    return serverInstance.baseUrl;
  }

  return new Promise((resolve, reject) => {
    const serverPath = path.join(__dirname, '../../server/server.js');

    const serverProcess = spawn('node', [serverPath], {
      env: { ...process.env, PORT: port.toString(), NODE_ENV: 'test' },
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: path.join(__dirname, '../..')
    });

    const baseUrl = `http://localhost:${port}`;
    let startupOutput = '';

    const timeout = setTimeout(() => {
      serverProcess.kill();
      reject(
        new Error(
          `Server failed to start within ${SERVER_STARTUP_TIMEOUT}ms. Output: ${startupOutput}`
        )
      );
    }, SERVER_STARTUP_TIMEOUT);

    serverProcess.stdout?.on('data', (data: Buffer) => {
      const output = data.toString();
      startupOutput += output;
      console.log(`[TestServer] ${output.trim()}`);

      // Check if server is ready
      if (output.includes('JSON Server is running')) {
        clearTimeout(timeout);
        serverInstance = {
          process: serverProcess,
          port,
          baseUrl
        };
        resolve(baseUrl);
      }
    });

    serverProcess.stderr?.on('data', (data: Buffer) => {
      const error = data.toString();
      startupOutput += error;
      console.error(`[TestServer Error] ${error.trim()}`);
    });

    serverProcess.on('error', (error: Error) => {
      clearTimeout(timeout);
      reject(new Error(`Failed to start server: ${error.message}`));
    });

    serverProcess.on('close', (code: number | null) => {
      if (code !== 0 && serverInstance?.process === serverProcess) {
        serverInstance = null;
      }
    });
  });
}

/**
 * Stops the running test server
 * @returns Promise that resolves when server is stopped
 */
export async function stopTestServer(): Promise<void> {
  if (!serverInstance) {
    console.log('[TestServer] No server running');
    return;
  }

  return new Promise(resolve => {
    const { process: serverProcess } = serverInstance;

    serverProcess.on('close', () => {
      console.log('[TestServer] Server stopped');
      serverInstance = null;
      resolve();
    });

    console.log('[TestServer] Stopping server...');
    serverProcess.kill('SIGTERM');

    // Force kill after 5 seconds if graceful shutdown fails
    setTimeout(() => {
      if (serverInstance) {
        serverProcess.kill('SIGKILL');
      }
    }, 5000);
  });
}

/**
 * Resets the server data to baseline via the reset endpoint
 * @param baseUrl - Base URL of the running server (optional, uses cached if available)
 * @returns Promise that resolves when data is reset
 */
export async function resetTestData(baseUrl?: string): Promise<void> {
  const url = baseUrl || serverInstance?.baseUrl;

  if (!url) {
    throw new Error('No server URL available. Start the server first or provide baseUrl.');
  }

  const response = await fetch(`${url}/__reset`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Failed to reset data: ${response.status} ${response.statusText}. ${errorBody}`
    );
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(`Reset failed: ${result.message}`);
  }

  console.log('[TestServer] Data reset to baseline');
}

/**
 * Gets the base URL of the running test server
 * @returns Base URL or null if server is not running
 */
export function getServerBaseUrl(): string | null {
  return serverInstance?.baseUrl || null;
}

/**
 * Checks if the test server is running
 * @returns True if server is running
 */
export function isServerRunning(): boolean {
  return serverInstance !== null;
}

/**
 * Waits for the server to be healthy (responds to requests)
 * @param baseUrl - Base URL to check
 * @param maxRetries - Maximum number of retry attempts (default: 10)
 * @param retryDelay - Delay between retries in ms (default: 500)
 */
export async function waitForServerHealth(
  baseUrl?: string,
  maxRetries: number = 10,
  retryDelay: number = 500
): Promise<void> {
  const url = baseUrl || serverInstance?.baseUrl;

  if (!url) {
    throw new Error('No server URL available');
  }

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(`${url}/api/products?page=0&size=1`);
      if (response.ok) {
        console.log('[TestServer] Server health check passed');
        return;
      }
    } catch {
      // Server not ready yet
    }

    if (i < maxRetries - 1) {
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }

  throw new Error(`Server failed health check after ${maxRetries} attempts`);
}
