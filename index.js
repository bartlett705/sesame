const Gpio = require("onoff").Gpio;
const http = require("http");
const path = require("path");
const fs = require("fs");
const LED = new Gpio(4, "out");

const PORT = 1337; // B)

let state = LED.readSync();

const server = http.createServer((req, res) => {
  console.log("got a REQ", req.url);

  /** JUICY BITS */
  if (req.url === "/open") {
    state = state === 0 ? 1 : 0;
    LED.writeSync(state);
    res.writeHead(200);
    res.end(`set ${state} thxkbai`);
  }

  /** END JUICY BITS; BEGIN MDN BOILERPLATE */
  var filePath = "." + req.url;
  if (filePath == "./") {
    filePath = "./index.html";
  }

  var extname = String(path.extname(filePath)).toLowerCase();
  var mimeTypes = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css",
    ".jpg": "image/jpg",
    ".svg": "application/image/svg+xml"
  };

  var contentType = mimeTypes[extname] || "application/octet-stream";

  fs.readFile(filePath, function(error, content) {
    if (error) {
      if (error.code == "ENOENT") {
        fs.readFile("./404.html", function(_, content) {
          res.writeHead(200, { "Content-Type": contentType });
          res.end(content, "utf-8");
        });
      } else {
        res.writeHead(500);
        res.end("Gross, we got a " + error.code + " ..\n");
        res.end();
      }
    } else {
      res.writeHead(200, { "Content-Type": contentType });
      res.end(content, "utf-8");
    }
  });
});

server.listen(PORT);
console.log("running on:", PORT);
