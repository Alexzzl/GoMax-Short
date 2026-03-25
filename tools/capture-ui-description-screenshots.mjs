import http from 'node:http';
import fsSync from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

const ROOT_DIR = process.cwd();
const OUTPUT_DIR = path.join(ROOT_DIR, 'ui-description-screenshots');
const HOST = '127.0.0.1';
const SERVER_PORT = 4174;
const DEBUG_PORT = 9223;
const VIEWPORT = { width: 1920, height: 1080 };
const MAX_BYTES = 500 * 1024;

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
    } catch {
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
      // Browser not ready yet.
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

async function evaluate(cdp, expression, awaitPromise = true) {
  return cdp.send('Runtime.evaluate', {
    expression,
    awaitPromise,
    returnByValue: true
  });
}

async function waitForCondition(cdp, conditionJs, timeoutMs = 10000) {
  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    const result = await evaluate(cdp, `Boolean(${conditionJs})`);
    if (result?.result?.value === true) {
      return;
    }
    await delay(150);
  }

  throw new Error(`Timed out waiting for condition: ${conditionJs}`);
}

async function waitForPageReady(cdp) {
  await evaluate(
    cdp,
    `
      new Promise(resolve => {
        const done = () => {
          const loadingHidden = document.getElementById('loading-page')
            ? document.getElementById('loading-page').classList.contains('hidden')
            : true;
          const imagesReady = Array.from(document.images).every(img => img.complete);
          if (loadingHidden && imagesReady) {
            requestAnimationFrame(() => requestAnimationFrame(() => resolve(true)));
            return;
          }
          setTimeout(done, 100);
        };
        done();
      })
    `
  );
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

    const homeUrl = `http://${HOST}:${SERVER_PORT}/index.html#home`;
    await cdp.send('Page.navigate', { url: homeUrl });
    await waitForPageReady(cdp);
    await delay(250);

    await evaluate(
      cdp,
      `
        (() => {
          window.scrollTo(0, 0);
          const card = document.querySelector('#popular-dramas .home-drama-card')
            || document.querySelector('#home-page .home-drama-card')
            || document.querySelector('.home-drama-card');
          if (!card) {
            throw new Error('No drama card found on the Home page.');
          }
          card.click();
          return true;
        })()
      `
    );
    await waitForCondition(
      cdp,
      `
        location.hash.startsWith('#detail')
        && document.getElementById('detail-page')?.classList.contains('active')
        && document.querySelector('#detail-page .action-btn.primary')
      `
    );
    await delay(400);

    const detailSize = await captureCurrentView(cdp, path.join(OUTPUT_DIR, '05-detail-page.jpg'));
    console.log(`05-detail-page.jpg ${(detailSize / 1024).toFixed(1)}KB`);

    await evaluate(
      cdp,
      `
        (() => {
          const playBtn = document.querySelector('#detail-page .action-btn.primary');
          if (!playBtn) {
            throw new Error('Play button not found on the detail page.');
          }
          playBtn.click();
          return true;
        })()
      `
    );
    await waitForCondition(
      cdp,
      `
        location.hash.startsWith('#player')
        && document.getElementById('player-page')?.classList.contains('active')
        && document.getElementById('video-player')
      `
    );
    await delay(1200);

    const playerSize = await captureCurrentView(cdp, path.join(OUTPUT_DIR, '06-player-page.jpg'));
    console.log(`06-player-page.jpg ${(playerSize / 1024).toFixed(1)}KB`);

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
