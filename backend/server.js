
console.log("VEDAI server file is running!");

const http = require("node:http");

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("VEDAI is online!");
});

server.listen(3000, "127.0.0.1", () => {
  console.log("VEDAI is running at http://127.0.0.1:3000");
});
