// Local dev server for `npm run dev`. Serves this folder using only Node's built-ins, so there's nothing to install.
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const HOST = "127.0.0.1";
const START_PORT = Number(process.env.PORT) || 5173;
const MAX_TRIES = 10;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
};

function resolveFile(url) {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(url, "http://localhost").pathname);
  } catch {
    return null;
  }
  const file = path.join(ROOT, pathname.endsWith("/") ? pathname + "index.html" : pathname);
  // Stay inside the project folder.
  return file === ROOT || file.startsWith(ROOT + path.sep) ? file : null;
}

const server = http.createServer((req, res) => {
  const send = (status, message) => {
    res.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(message);
  };

  if (req.method !== "GET" && req.method !== "HEAD") return send(405, "Method not allowed");
  const file = resolveFile(req.url);
  if (!file) return send(400, "Bad request");

  fs.stat(file, (err, stat) => {
    if (err || !stat.isFile()) return send(404, "Not found");
    res.writeHead(200, {
      "Content-Type": TYPES[path.extname(file).toLowerCase()] || "application/octet-stream",
      "Content-Length": stat.size,
      "Cache-Control": "no-store", // so edits show up on refresh
    });
    if (req.method === "HEAD") return res.end();
    fs.createReadStream(file).pipe(res);
  });
});

let port = START_PORT;
server.on("error", (err) => {
  if (err.code === "EADDRINUSE" && port < START_PORT + MAX_TRIES - 1) {
    console.log(`Port ${port} is in use, trying ${port + 1}...`);
    server.listen(++port, HOST);
  } else {
    console.error(`Could not start the server: ${err.message}`);
    process.exit(1);
  }
});
server.on("listening", () => {
  console.log(`FitPlan is running at http://localhost:${port}`);
  console.log("Press Ctrl+C to stop.");
});
server.listen(port, HOST);
