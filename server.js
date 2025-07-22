
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const http = require("http");
const geturl = require("./utils/get_connection_url.js");
const app = require("./app.js");
const server = http.createServer(app);
const host = process.env.host;
const port = process.env.port;
const redisClient=require("./redisConnect.js")
const {colorBright,colorFgCyan,colorRed,colorReset,colorPurple, colorFgGreen}=require("./color_codes.js")

console.log(`${colorFgCyan}mode:${colorReset} ${colorBright}${colorPurple}${process.env.mode}${colorReset}`);
// if there is an unhadled promise then we have an even registered for it here
process.on("unhandledRejection", (err) => {
  console.log(err);
  server.close(() => {
    process.exit();
  });
});
// if there is an unacaught exception,then we have an event registered for it
process.on("uncaughtException", (err) => {
  console.log(err);
  server.close(() => {
    process.exit();
  });
});



  server.listen(port, host, (err) => {
  if (err) {
    console.error(`Error starting the server: ${err}`);
  } else {
    console.log(
      `${colorBright}${colorFgGreen}Server is listening on ${colorFgCyan}http://${host}:${port}${colorReset}`
    );
  }
});
