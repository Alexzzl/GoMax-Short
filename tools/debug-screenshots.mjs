import http from 'node:http';
import fsSync from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

const ROOT_DIR = process.cwd();
const OUTPUT_DIR = path.join(ROOT_DIR, 'debug-screenshots');
const HOST = '127.0.0.1';
const SERVER_PORT = 4175;
const DEBUG_PORT = 9224;
const VIEWPORT = { width: 1920, height: 1080 };

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8'
};

function resolveChromePath() {
  const candidates = [
    process.env.CHROME_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
  ].filter(Boolean);

  return candidates.find(candidate => fsSync.existsSync(candidate));
}

function createStaticServer() {
  return http.createServer(async (req, res) => {
    console.log(`Request: ${req.url}`);
    try {
      const url = new URL(req.url, `http://${HOST}:${SERVER_PORT}`);
      const requestPath = decodeURIComponent(url.pathname);
      const relativePath = requestPath === '/' ? 'index.html' : requestPath.slice(1);
      const normalizedPath = path.normalize(relativePath);
      const fullPath = path.resolve(ROOT_DIR, 'dist', normalizedPath);

      if (!fullPath.startsWith(path.resolve(ROOT_DIR, 'dist'))) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }

      const stat = await fs.stat(fullPath);
      const filePath = stat.isDirectory() ? path.join(fullPath, 'index.html') : fullPath;
      const extension = path.extname(filePath).toLowerCase();
      const contentType = mimeTypes[extension] || 'application/octet-stream';
      const data = await fs.readFile(filePath);

      console.log(`Serving: ${filePath} (${data.length} bytes)`);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    } catch (error) {
      console.error(`Error serving ${req.url}:`, error.message);
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not Found');
    }
  });
}

async function waitForJson(url, timeoutMs = 10000) {
  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return response.json();
      }
    } catch (error) {
      console.log(`Chrome not ready yet: ${error.message}`);
    }

    await delay(200);
  }

  throw new Error(`Timed out waiting for ${url}`);
}

function createCdpClient(wsUrl) {
  const socket = new WebSocket(wsUrl);
  const pending = new Map();
  let nextId = 1;

  const openPromise = new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });

  socket.addEventListener('message', event => {
    const payload = JSON.parse(event.data);
    if (!payload.id || !pending.has(payload.id)) {
      return;
    }

    const { resolve, reject } = pending.get(payload.id);
    pending.delete(payload.id);

    if (payload.error) {
      reject(new Error(payload.error.message));
    } else {
      resolve(payload.result);
    }
  });

  const send = async (method, params = {}) => {
    await openPromise;
    const id = nextId++;

    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      socket.send(JSON.stringify({ id, method, params }));
    });
  };

  return {
    send,
    async close() {
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        socket.close();
      }
    }
  };
}

async function captureCurrentView(cdp, outputPath) {
  console.log(`Capturing screenshot: ${outputPath}`);

  const { data } = await cdp.send('Page.captureScreenshot', {
    format: 'jpeg',
    quality: 85,
    captureBeyondViewport: false,
    clip: {
      x: 0,
      y: 0,
      width: VIEWPORT.width,
      height: VIEWPORT.height,
      scale: 1
    }
  });

  const buffer = Buffer.from(data, 'base64');
  await fs.writeFile(outputPath, buffer);
  console.log(`Screenshot saved: ${outputPath} (${buffer.length} bytes)`);
  return buffer.length;
}

async function main() {
  const chromePath = resolveChromePath();
  if (!chromePath) {
    throw new Error('Chrome or Edge executable not found. Set CHROME_PATH and retry.');
  }

  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const server = createStaticServer();
  await new Promise(resolve => server.listen(SERVER_PORT, HOST, resolve));
  console.log(`Server started on http://${HOST}:${SERVER_PORT}`);

  const chrome = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--autoplay-policy=no-user-gesture-required',
    '--hide-scrollbars',
    '--remote-allow-origins=*',
    `--remote-debugging-port=${DEBUG_PORT}`,
    `--window-size=${VIEWPORT.width},${VIEWPORT.height}`,
    'about:blank'
  ], {
    stdio: 'ignore'
  });

  try {
    const targets = await waitForJson(`http://${HOST}:${DEBUG_PORT}/json/list`);
    const pageTarget = targets.find(target => target.type === 'page');
    if (!pageTarget?.webSocketDebuggerUrl) {
      throw new Error('Could not find a debuggable page target.');
    }

    console.log('Connecting to Chrome DevTools...');
    const cdp = createCdpClient(pageTarget.webSocketDebuggerUrl);
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: VIEWPORT.width,
      height: VIEWPORT.height,
      deviceScaleFactor: 1,
      mobile: false
    });
    await cdp.send('Page.addScriptToEvaluateOnNewDocument', {
      source: 'Math.random = () => 0;'
    });

    // Test basic navigation
    const homeUrl = `http://${HOST}:${SERVER_PORT}/index.html#home`;
    console.log(`Navigating to: ${homeUrl}`);
    await cdp.send('Page.navigate', { url: homeUrl });

    // Wait for page load
    await delay(3000);

    // Check what's on the page
    const result = await cdp.send('Runtime.evaluate', {
      expression: 'document.documentElement.outerHTML.substring(0, 500)',
      returnByValue: true
    });
    console.log('Page HTML (first 500 chars):', result.result.value);

    // Capture screenshot
    await captureCurrentView(cdp, path.join(OUTPUT_DIR, 'debug-home.jpg'));

    await cdp.close();
  } finally {
    server.close();
    if (!chrome.killed) {
      chrome.kill();
    }
  }
}

main().catch(error => {
  console.error('Error:', error.message || error);
  process.exitCode = 1;
});