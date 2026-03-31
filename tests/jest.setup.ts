import dotenv from "dotenv";

dotenv.config();

if (process.env.RUN_PRISMA_TESTS !== "true") {
  process.env.DATA_SOURCE_MODE = "mock";
}
