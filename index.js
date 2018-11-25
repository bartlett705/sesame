const Gpio = require("onoff").Gpio;
const http = require("http");
const path = require("path");
const fs = require("fs");
const LED = new Gpio(4, "out");
const uuidv4 = require("uuid/v4");

require("dotenv").config();

let secret = "";

const PORT = 1337; // B)

let state = LED.readSync();

function parseCookies(request) {
  var list = {},
    rc = request.headers.cookie;

  rc &&
    rc.split(";").forEach(function(cookie) {
      var parts = cookie.split("=");
      list[parts.shift().trim()] = decodeURI(parts.join("="));
    });

  return list;
}

const server = http.createServer((req, res) => {
  console.log("got a REQ", req.url);

  /** JUICY BITS */
  if (req.url === "/open") {
    const { auth } = parseCookies(req);
    if (!auth || auth !== secret) {
      res.writeHead(403);
      res.end("Nah-uh");
      return;
    }

    state = state === 0 ? 1 : 0;
    LED.writeSync(state);
    res.writeHead(200);
    res.end(`set ${state} thxkbai`);
  } else if (req.url === "/auth") {
    let data = [];
    req.on("data", (chunk) => {
      data.push(chunk);
    });
    req.on("end", () => {
      const key = JSON.parse(data).key;
      console.log(`got key ${key}`);
      if (key === process.env.AUTH_SECRET) {
        console.log("Auth'd! Setting cookie");
        secret = uuidv4();
        res.writeHead(204, {
          "Set-Cookie": `auth=${secret}`,
          Location: "/"
        });
        res.end("ok");
      } else {
        res.writeHead(403);
        res.end("Nope.");
      }
    });
  }

  /** END JUICY BITS; BEGIN MDN BOILERPLATE */
  var filePath = "." + req.url;
  if (filePath == "./") {
    filePath = "./index.html";
  } else if (filePath === "./login") {
    filePath = "./login.html";
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
