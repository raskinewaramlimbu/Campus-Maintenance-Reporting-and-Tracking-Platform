import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import { scheduleReminderDigest } from "./utils/reminders.js";

import reportsRouter from "./routes/reports.js";
import guidanceRouter from "./routes/guidance.js";
import geocodeRouter from "./routes/geocode.js";
import authRouter from "./routes/auth.js";
import analyticsRouter from "./routes/analytics.js";
import exportRouter from "./routes/export.js";
import errorHandler from "./middleware/errorHandler.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 4000;


app.use(helmet());
app.use(
  cors({
    origin: (process.env.CORS_ORIGIN || "http://localhost:5173").split(","),
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(mongoSanitize());
app.use(morgan("dev"));


const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", apiLimiter);


app.use("/guidance-docs", express.static(path.join(__dirname, "public", "guidance-docs")));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.use("/api/auth", authRouter);
app.use("/api/reports", reportsRouter);
app.use("/api/guidance", guidanceRouter);
app.use("/api/geocode", geocodeRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/export", exportRouter);

app.use("/api", (req, res) => {
  res.status(404).json({ error: "Not a route we recognise" });
});

app.use(errorHandler);


async function start() {
  await connectDB();
  scheduleReminderDigest();

  app.listen(PORT, () => {
    console.log(`FixMyCampus API listening on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err.message);
  process.exit(1);
});
