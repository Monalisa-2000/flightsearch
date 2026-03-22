import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import flightsRouter from "./flights.js";
import alertsRouter from "./alerts.js";
import recommendationsRouter from "./recommendations.js";
import experimentsRouter from "./experiments.js";
import notificationsRouter from "./notifications.js";
import workerRouter from "./worker.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/flights", flightsRouter);
router.use("/alerts", alertsRouter);
router.use("/recommendations", recommendationsRouter);
router.use("/experiments", experimentsRouter);
router.use("/notifications", notificationsRouter);
router.use("/worker", workerRouter);

export default router;
