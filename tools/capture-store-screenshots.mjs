import http from 'node:http';
import fsSync from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

const ROOT_DIR = process.cwd();
const OUTPUT_DIR = path.join(ROOT_DIR, 'store-screenshots');
const HOST = '127.0.0.1';
const SERVER_PORT = 4173;
const DEBUG_PORT = 9222;
const VIEWPORT = { width: 1920, height: 1080 };
const MAX_BYTES = 500 * 1024;

const shots = [
  {
    name: '01-home-hero.jpg',
    route: '#home',
    afterLoad: 'window.scrollTo(0, 0);'
  },
  {
    name: '02-home-featured.jpg',
    route: '#home',
    afterLoad: `
      document.getElementById('popular-dramas')
        ?.scrollIntoView({ block: 'start', behavior: 'instant' });
    `
  },
  {
    name: '03-discover-top.jpg',
    route: '#discover',
    afterLoad: 'window.scrollTo(0, 0);'
  },
  {
    name: '04-discover-categories.jpg',
    route: '#discover',
    afterLoad: `
      document.getElementById('discover-categories')
        ?.scrollIntoView({ block: 'start', behavior: 'instant' });
    `
  }
];

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

  return candidates.find(candidate => {
    return fsSync.existsSync(candidate);
  });
}

function createStaticServer() {
  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, `http://${HOST}:${SERVER_PORT}`);
      const requestPath = decodeURIComponent(url.pathname);
      const relativePath = requestPath === '/' ? 'index.html' : requestPath.slice(1);
      const normalizedPath = path.normalize(relativePath);
      const fullPath = path.resolve(ROOT_DIR, normalizedPath);

      if (!fullPath.startsWith(ROOT_DIR)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }

      const stat = await fs.stat(fullPath);
      const filePath = stat.isDirectory() ? path.join(fullPath, 'index.html') : fullPath;
      const extension = path.extname(filePath).toLowerCase();
      const contentType = mimeTypes[extension] || 'application/octet-stream';
      const data = await fs.readFile(filePath);

      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    } catch (error) {
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
    } catch {
      // Chrome not ready yet.
    }
    await delay(200);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

function createCdpClient(wsUrl) {
  const socket = new WebSocket(wsUrl);
  let nextId = 1;
  const pending = new Map();

  const openPromise = new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });

  socket.addEventListener('message', event => {
    const payload = JSON.parse(event.data);

    if (payload.id && pending.has(payload.id)) {
      const { resolve, reject } = pending.get(payload.id);
      pending.delete(payload.id);
      if (payload.error) {
        reject(new Error(payload.error.message));
      } else {
        resolve(payload.result);
      }
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

async function waitForReady(cdp, extraJs = '') {
  const expression = `
    new Promise(resolve => {
      const done = () => {
        const loadingHidden = document.getElementById('loading-page')
          ? document.getElementById('loading-page').classList.contains('hidden')
          : true;
        const imagesReady = Array.from(document.images).every(img => img.complete);
        if (loadingHidden && imagesReady) {
          try {
            ${extraJs}
          } catch (error) {
            console.error(error);
          }
          requestAnimationFrame(() => requestAnimationFrame(() => resolve(true)));
          return;
        }
        setTimeout(done, 100);
      };
      done();
    })
  `;

  await cdp.send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true
  });
}

async function captureCurrentView(cdp, outputPath) {
  const qualityLevels = [85, 78, 72, 66, 60, 54];

  for (const quality of qualityLevels) {
    const { data } = await cdp.send('Page.captureScreenshot', {
      format: 'jpeg',
      quality,
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

    if (buffer.byteLength <= MAX_BYTES) {
      return buffer.byteLength;
    }
  }

  const stat = await fs.stat(outputPath);
  return stat.size;
}

async function main() {
  const chromePath = resolveChromePath();
  if (!chromePath) {
    throw new Error('Chrome or Edge executable not found. Set CHROME_PATH and retry.');
  }

  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  const existingFiles = await fs.readdir(OUTPUT_DIR);
  await Promise.all(
    existingFiles
      .filter(name => name.toLowerCase().endsWith('.jpg'))
      .map(name => fs.unlink(path.join(OUTPUT_DIR, name)))
  );

  const server = createStaticServer();
  await new Promise(resolve => server.listen(SERVER_PORT, HOST, resolve));

  const chrome = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
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
      source: `
        Math.random = () => 0;
      `
    });

    for (const shot of shots) {
      const url = `http://${HOST}:${SERVER_PORT}/index.html${shot.route}`;
      await cdp.send('Page.navigate', { url });
      await waitForReady(cdp, shot.afterLoad);
      await delay(250);
      const fileSize = await captureCurrentView(cdp, path.join(OUTPUT_DIR, shot.name));
      const kb = (fileSize / 1024).toFixed(1);
      console.log(`${shot.name} ${kb}KB`);
    }

    await cdp.close();
  } finally {
    server.close();
    if (!chrome.killed) {
      chrome.kill();
    }
  }
}

main().catch(error => {
  console.error(error.message || error);
  process.exitCode = 1;
});
