import express from "express";
import { existsSync } from "node:fs";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const dataDir = path.join(__dirname, "data");
const dataFile = path.join(dataDir, "museum.json");
const distDir = path.join(rootDir, "dist");
const port = Number(process.env.PORT || 4178);

const app = express();

app.use(express.json({ limit: "35mb" }));

app.get("/api/health", (request, response) => {
  response.json({ ok: true });
});

app.get("/api/museum", async (request, response) => {
  const stored = await readMuseumFile();
  response.json(stored);
});

app.put("/api/museum", async (request, response) => {
  const content = request.body?.content;

  if (!content || typeof content !== "object") {
    response.status(400).json({ error: "content is required" });
    return;
  }

  const nextData = {
    content,
    updatedAt: new Date().toISOString(),
  };

  await writeMuseumFile(nextData);
  response.json(nextData);
});

if (existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get("*", (request, response) => {
    response.sendFile(path.join(distDir, "index.html"));
  });
}

app.listen(port, "0.0.0.0", () => {
  console.log(`Time Museum server running on http://localhost:${port}`);
});

async function readMuseumFile() {
  try {
    const value = await readFile(dataFile, "utf-8");
    return JSON.parse(value);
  } catch {
    return {
      content: null,
      updatedAt: null,
    };
  }
}

async function writeMuseumFile(data) {
  await mkdir(dataDir, { recursive: true });
  const tempFile = `${dataFile}.tmp`;
  await writeFile(tempFile, JSON.stringify(data, null, 2), "utf-8");
  await rename(tempFile, dataFile);
}
