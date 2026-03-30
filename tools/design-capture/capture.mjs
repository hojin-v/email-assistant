import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";
import { chromium } from "playwright";
import { generateDesignArtifacts } from "./scaffold.mjs";

const toolDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(toolDir, "../..");
const userAppRoot = path.join(repoRoot, "frontend/App");

const sessionPresets = {
  "signed-out": {
    authenticated: false,
    onboardingCompleted: false,
    role: "USER",
    userName: "",
    userEmail: "",
    clientIp: "",
    adminVpnApproved: false,
    connectedEmail: null,
    connectedEmails: [],
  },
  onboarding: {
    authenticated: true,
    onboardingCompleted: false,
    role: "USER",
    userName: "김호진",
    userEmail: "hojin@company.com",
    clientIp: "192.168.0.42",
    adminVpnApproved: false,
    connectedEmail: null,
    connectedEmails: [],
  },
  app: {
    authenticated: true,
    onboardingCompleted: true,
    role: "USER",
    userName: "김호진",
    userEmail: "hojin@company.com",
    clientIp: "192.168.0.42",
    adminVpnApproved: false,
    connectedEmail: "hojin@gmail.com",
    connectedEmails: ["hojin@gmail.com", "hojin+2@gmail.com"],
  },
  admin: {
    authenticated: true,
    onboardingCompleted: true,
    role: "ADMIN",
    userName: "운영 관리자",
    userEmail: "admin@admin",
    clientIp: "192.168.0.42",
    adminVpnApproved: true,
    connectedEmail: "",
    connectedEmails: [],
  },
};

function buildCommand(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: "inherit",
      shell: false,
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(" ")} exited with code ${code}`));
    });
  });
}

async function waitForServer(url) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // Wait for preview server to start.
    }

    await delay(500);
  }

  throw new Error(`Timed out waiting for ${url}`);
}

async function startPreview(cwd, port) {
  const child = spawn("npm", ["run", "preview", "--", "--host", "127.0.0.1", "--port", String(port)], {
    cwd,
    stdio: "inherit",
    shell: false,
  });

  await waitForServer(`http://127.0.0.1:${port}`);
  return child;
}

async function stopPreview(child) {
  if (!child || child.killed) {
    return;
  }

  child.kill("SIGTERM");
  await delay(300);
}

function getBaseUrl() {
  return "http://127.0.0.1:4173";
}

function getRoutePath(route) {
  return route.split("?")[0] || "/";
}

function resolveSessionPreset(item) {
  if (item.app === "admin") {
    return sessionPresets.admin;
  }

  if (item.sessionPreset && sessionPresets[item.sessionPreset]) {
    return sessionPresets[item.sessionPreset];
  }

  const routePath = getRoutePath(item.route);

  if (routePath === "/") {
    return sessionPresets["signed-out"];
  }

  if (routePath === "/onboarding") {
    return sessionPresets.onboarding;
  }

  return sessionPresets.app;
}

async function readCaptureManifest(outputRoot) {
  const manifestPath = path.join(outputRoot, "capture/manifest.json");
  return JSON.parse(await fs.readFile(manifestPath, "utf8"));
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function createCombinedScreenshotViews(outputRoot, manifest) {
  const combinedRoot = path.join(outputRoot, "screenshots", "combined");
  const orderDigits = String(manifest.length).length;

  await fs.rm(combinedRoot, { recursive: true, force: true });

  const appDirectories = [...new Set(manifest.map((item) => path.join(combinedRoot, item.app)))];
  await Promise.all(appDirectories.map((dirPath) => ensureDir(dirPath)));

  for (const item of manifest) {
    const sourcePath = path.join(outputRoot, item.outputFile);
    const originalName = path.basename(item.outputFile);
    const normalizedPrefix = String(Number(item.orderNumber)).padStart(orderDigits, "0");
    const targetName = originalName.replace(/^\d+\./, `${normalizedPrefix}.`);
    const targetPath = path.join(combinedRoot, item.app, targetName);
    await fs.copyFile(sourcePath, targetPath);
  }
}

async function captureScreens() {
  const { outputRoot } = await generateDesignArtifacts();
  await fs.rm(path.join(outputRoot, "screenshots"), { recursive: true, force: true });
  const manifest = await readCaptureManifest(outputRoot);
  const captureDirectories = [...new Set(
    manifest.map((item) => path.join(outputRoot, path.dirname(item.outputFile))),
  )];
  await Promise.all(captureDirectories.map((dirPath) => ensureDir(dirPath)));

  await buildCommand("npm", ["run", "build"], userAppRoot);

  const userPreview = await startPreview(userAppRoot, 4173);
  let browser = null;

  try {
    browser = await chromium.launch({ headless: true });

    for (const item of manifest) {
      const sessionState = resolveSessionPreset(item);
      const context = await browser.newContext({
        viewport: item.viewport,
        deviceScaleFactor: 1,
      });

      await context.addInitScript((session) => {
        window.sessionStorage.setItem(
          "emailassist-app-session",
          JSON.stringify(session),
        );
      }, sessionState);

      const page = await context.newPage();
      const url = `${getBaseUrl()}${item.url}`;
      await page.goto(url, { waitUntil: "networkidle" });
      await page.screenshot({
        path: path.join(outputRoot, item.outputFile),
        fullPage: item.fullPage === true,
      });
      await context.close();
    }

    await createCombinedScreenshotViews(outputRoot, manifest);
  } finally {
    if (browser) {
      await browser.close();
    }
    await stopPreview(userPreview);
  }

  console.log(`Screenshots captured to ${outputRoot}`);
}

await captureScreens();
