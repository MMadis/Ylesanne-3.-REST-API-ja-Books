import dotenv from "dotenv";
import { buildApp } from "./app";

dotenv.config();

const app = buildApp();
const port = Number(process.env.PORT ?? 3001);

async function start() {
  try {
    await app.listen({ port, host: "0.0.0.0" });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

void start();
