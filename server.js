import { createReadStream } from "node:fs";
import {
  mkdir,
  readFile,
  writeFile,
} from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, relative } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const dataDir = join(rootDir, "data");
const scoresPath = join(dataDir, "highscores.json");
const port = Number(process.env.PORT) || 3000;
const maxScores = 10;
const maxBodyBytes = 4 * 1024;
const allowedDifficulties = new Set([30, 60, 90]);
let scoresWrite = Promise.resolve();

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(body));
}

function parseScoreEntry(entry) {
  if (
    !entry ||
    typeof entry.name !== "string" ||
    !Number.isInteger(entry.score) ||
    !allowedDifficulties.has(entry.difficulty)
  ) {
    return null;
  }

  const name = entry.name.trim();
  if (!name || name.length > 20 || entry.score < 0 || entry.score > 1_000_000) {
    return null;
  }

  return {
    name,
    score: entry.score,
    difficulty: entry.difficulty,
    createdAt: new Date().toISOString(),
  };
}

async function readScores() {
  try {
    const contents = await readFile(scoresPath, "utf8");
    const parsed = JSON.parse(contents);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

function sortedScores(scores) {
  return scores
    .filter((entry) => entry && Number.isInteger(entry.score))
    .sort((a, b) => b.score - a.score)
    .slice(0, maxScores);
}

async function saveScores(scores) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(scoresPath, `${JSON.stringify(scores, null, 2)}\n`, "utf8");
}

function queueScoreSave(scores) {
  const nextWrite = scoresWrite.then(() => saveScores(scores));
  scoresWrite = nextWrite.catch(() => {});
  return nextWrite;
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
      if (Buffer.byteLength(body) > maxBodyBytes) {
        reject(new Error("Request body is too large"));
        request.destroy();
      }
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

async function handleApi(request, response, pathname) {
  if (pathname === "/api/highscores" && request.method === "GET") {
    sendJson(response, 200, sortedScores(await readScores()));
    return true;
  }

  if (pathname === "/api/highscores" && request.method === "POST") {
    let body;
    try {
      body = JSON.parse(await readRequestBody(request));
    } catch {
      sendJson(response, 400, { error: "Request body must be valid JSON." });
      return true;
    }

    const entry = parseScoreEntry(body);
    if (!entry) {
      sendJson(response, 400, {
        error: "Name, score, or difficulty is invalid.",
      });
      return true;
    }

    const scores = sortedScores([...(await readScores()), entry]);
    await queueScoreSave(scores);
    sendJson(response, 201, scores);
    return true;
  }

  return false;
}

function serveStatic(request, response, pathname) {
  const requestedPath = pathname === "/" ? "/index.html" : pathname;
  const filePath = normalize(join(rootDir, requestedPath));
  const relativePath = relative(rootDir, filePath);

  if (relativePath.startsWith("..") || relativePath.includes(`..${"/"}`)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  const contentType = mimeTypes[extname(filePath)] || "application/octet-stream";
  createReadStream(filePath)
    .on("error", (error) => {
      if (error.code === "ENOENT") {
        response.writeHead(404);
        response.end("Not found");
        return;
      }
      response.writeHead(500);
      response.end("Internal server error");
    })
    .on("open", () => {
      response.writeHead(200, { "Content-Type": contentType });
    })
    .pipe(response);
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);

  try {
    if (url.pathname.startsWith("/api/")) {
      const handled = await handleApi(request, response, url.pathname);
      if (!handled) sendJson(response, 404, { error: "API route not found." });
      return;
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      response.writeHead(405, { Allow: "GET, HEAD" });
      response.end("Method not allowed");
      return;
    }

    serveStatic(request, response, url.pathname);
  } catch (error) {
    console.error(error);
    if (!response.headersSent) {
      sendJson(response, 500, { error: "Internal server error." });
    } else {
      response.destroy();
    }
  }
});

server.listen(port, () => {
  console.log(`Shrimp Toss is running at http://localhost:${port}`);
});
