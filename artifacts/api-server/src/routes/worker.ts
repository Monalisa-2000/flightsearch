import { Router, type IRouter } from "express";
import { workerState, runWorkerCycle } from "../lib/worker.js";

const router: IRouter = Router();

router.get("/status", (_req, res) => {
  res.json({
    status: workerState.status,
    lastRun: workerState.lastRun?.toISOString() ?? null,
    nextRun: workerState.nextRun?.toISOString() ?? null,
    alertsChecked: workerState.alertsChecked,
    alertsTriggered: workerState.alertsTriggered,
    runCount: workerState.runCount,
  });
});

router.post("/trigger", async (_req, res) => {
  try {
    const result = await runWorkerCycle();
    res.json({
      triggered: true,
      message: `Worker completed: checked ${result.alertsChecked} alerts, triggered ${result.alertsTriggered}`,
      alertsChecked: result.alertsChecked,
      alertsTriggered: result.alertsTriggered,
    });
  } catch (err) {
    res.status(500).json({ error: "WorkerError", message: "Worker run failed" });
  }
});

export default router;
