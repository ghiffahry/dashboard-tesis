import http from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, isAbsolute, join, normalize, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const project = resolve(fileURLToPath(new URL("..", import.meta.url)));
const root = resolve(project, "_site");
const port = Number(process.env.PORT || 8000);
const types = {
  ".css": "text/css; charset=utf-8",
  ".geojson": "application/geo+json",
  ".gz": "application/gzip",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};

if (!existsSync(root)) {
  console.error("Artifact _site belum ada. Jalankan build_site.py dahulu.");
  process.exit(1);
}

const server = http.createServer((request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" }).end("Method not allowed");
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  } catch {
    response.writeHead(400).end("Invalid URL");
    return;
  }
  const candidate = resolve(root, "." + normalize(pathname));
  const pathFromRoot = relative(root, candidate);
  const parentPrefix = ".." + (process.platform === "win32" ? "\\" : "/");
  if (isAbsolute(pathFromRoot) || pathFromRoot === ".." || pathFromRoot.startsWith(parentPrefix)) {
    response.writeHead(403).end("Forbidden");
    return;
  }

  let file = candidate;
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
  if (!existsSync(file) || !statSync(file).isFile()) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("File not found");
    return;
  }
  response.writeHead(200, {
    "Content-Type": types[extname(file).toLowerCase()] || "application/octet-stream",
    "Cache-Control": "no-cache",
    "X-Content-Type-Options": "nosniff",
  });
  if (request.method === "HEAD") {
    response.end();
    return;
  }
  createReadStream(file).pipe(response);
});

server.listen(port, "127.0.0.1", () => {
  console.log("Dashboard Tesis tersedia di http://localhost:" + port + "/");
});

