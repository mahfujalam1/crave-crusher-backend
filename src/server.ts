import mongoose from "mongoose";
import { Server } from "http";
import config from "./app/config";
import app from "./app";
let server: Server | null = null;

async function main() {
  try {
    await mongoose.connect(config.database_url as string);
    server = app.listen(config.port, () => {
      console.log(`app is listening on port ${config.port}`);
    });
  } catch (err) {
    console.log(err);
  }
}

main();

process.on("unhandledRejection", () => {
  console.log(`unhandleRejection on is detected, sutting down server`);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on("uncaughtException", () => {
  console.log(`uncaughtException on is detected, sutting down server`);
  process.exit(1);
});
