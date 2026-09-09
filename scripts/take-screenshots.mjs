import puppeteer from "puppeteer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "../public/screenshots");

// Ensure output directory exists
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1440,900"],
});

async function waitForApp(page) {
  await page.waitForSelector(".excalidraw", { timeout: 20000 });
  await new Promise((r) => setTimeout(r, 2500));
}

async function shot(name, theme = "light") {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 });

  // Set theme before loading
  await page.evaluateOnNewDocument((t) => {
    localStorage.setItem("excalidraw-theme", t);
  }, theme);

  await page.goto("http://localhost:3001/", {
    waitUntil: "networkidle2",
    timeout: 30000,
  });
  await waitForApp(page);

  const outPath = `${OUT}/${name}.png`;
  await page.screenshot({ path: outPath, fullPage: false });
  console.log(`✓ ${name}.png saved`);
  await page.close();
}

try {
  await shot("opendraw-welcome-light", "light");
  await shot("opendraw-canvas-dark", "dark");
  console.log("All screenshots captured successfully!");
} finally {
  await browser.close();
}
