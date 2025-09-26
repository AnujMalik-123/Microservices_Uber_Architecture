const http = require("http");
const app = require("./app");
const server = http.createServer(app);

server.listen(process.env.PORT, () => {
  console.log("Server is running on port 3001");
});

module.exports = server;
