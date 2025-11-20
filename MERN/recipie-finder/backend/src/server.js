require("dotenv").config();
const app = require("./app");
const connectToDb = require("../config/db.config");

const PORT = process.env.PORT || 4000;
let server;

async function start() {
  try {
    await connectToDb();
    server = app.listen(PORT, () => {
      console.log(
        `Server listening on http://localhost:${PORT} in ${
          process.env.NODE_ENV || "development"
        }`
      );
    });
  } catch (err) {
    console.error("Failed to start server", err);
    process.exit(1);
  }
}

start();

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

function shutdown() {
  console.log("Shutting down...");
  if (server) {
    server.close(() => {
      console.log("HTTP server closed");
      process.exit(0);
    });
    setTimeout(() => {
      console.error("Forcing shutdown");
      process.exit(1);
    }, 10000);
  } else process.exit(0);
}
