import { Router, type IRouter } from "express";
import { pool } from "@workspace/db";
import { cache } from "../lib/cache.js";
import { workerState } from "../lib/worker.js";

const router: IRouter = Router();

router.get("/healthz", async (_req, res) => {
  let dbStatus = "healthy";
  try {
    await pool.query("SELECT 1");
  } catch {
    dbStatus = "unhealthy";
  }

  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    services: {
      database: dbStatus,
      cache: `in-memory (${cache.stats().keys} keys, ${cache.stats().hitRate} hit rate)`,
      worker: workerState.status,
    },
  });
});

export default router;
