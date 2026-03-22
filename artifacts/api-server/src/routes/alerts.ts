import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { priceAlertsTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/auth.js";
import { getLowestPrice } from "../lib/flightData.js";

const router: IRouter = Router();

router.get("/", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const alerts = await db
      .select()
      .from(priceAlertsTable)
      .where(eq(priceAlertsTable.userId, req.userId!))
      .orderBy(priceAlertsTable.createdAt);

    res.json(
      alerts.map((a) => ({
        id: a.id,
        userId: a.userId,
        fromAirport: a.fromAirport,
        toAirport: a.toAirport,
        targetPrice: parseFloat(a.targetPrice.toString()),
        currency: a.currency,
        currentPrice: parseFloat(a.currentPrice?.toString() || "0"),
        status: a.status,
        triggeredAt: a.triggeredAt?.toISOString() ?? null,
        expiresAt: a.expiresAt?.toISOString() ?? null,
        createdAt: a.createdAt.toISOString(),
        lastCheckedAt: a.lastCheckedAt?.toISOString() ?? null,
      }))
    );
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: "Failed to fetch alerts" });
  }
});

router.post("/", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { fromAirport, toAirport, targetPrice, currency = "USD", expiresAt } = req.body as {
      fromAirport: string;
      toAirport: string;
      targetPrice: number;
      currency?: string;
      expiresAt?: string;
    };

    if (!fromAirport || !toAirport || !targetPrice) {
      res.status(400).json({ error: "ValidationError", message: "fromAirport, toAirport, and targetPrice are required" });
      return;
    }

    const currentPrice = getLowestPrice(fromAirport.toUpperCase(), toAirport.toUpperCase());

    const [alert] = await db
      .insert(priceAlertsTable)
      .values({
        userId: req.userId!,
        fromAirport: fromAirport.toUpperCase(),
        toAirport: toAirport.toUpperCase(),
        targetPrice: targetPrice.toString(),
        currency,
        currentPrice: currentPrice.toString(),
        status: currentPrice <= targetPrice ? "triggered" : "active",
        triggeredAt: currentPrice <= targetPrice ? new Date() : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        lastCheckedAt: new Date(),
      })
      .returning();

    if (!alert) {
      res.status(500).json({ error: "InternalError", message: "Failed to create alert" });
      return;
    }

    res.status(201).json({
      id: alert.id,
      userId: alert.userId,
      fromAirport: alert.fromAirport,
      toAirport: alert.toAirport,
      targetPrice: parseFloat(alert.targetPrice.toString()),
      currency: alert.currency,
      currentPrice: parseFloat(alert.currentPrice?.toString() || "0"),
      status: alert.status,
      triggeredAt: alert.triggeredAt?.toISOString() ?? null,
      expiresAt: alert.expiresAt?.toISOString() ?? null,
      createdAt: alert.createdAt.toISOString(),
      lastCheckedAt: alert.lastCheckedAt?.toISOString() ?? null,
    });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: "Failed to create alert" });
  }
});

router.get("/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const id = parseInt(req.params["id"]!, 10);
    const [alert] = await db
      .select()
      .from(priceAlertsTable)
      .where(and(eq(priceAlertsTable.id, id), eq(priceAlertsTable.userId, req.userId!)))
      .limit(1);

    if (!alert) {
      res.status(404).json({ error: "NotFound", message: "Alert not found" });
      return;
    }

    res.json({
      id: alert.id,
      userId: alert.userId,
      fromAirport: alert.fromAirport,
      toAirport: alert.toAirport,
      targetPrice: parseFloat(alert.targetPrice.toString()),
      currency: alert.currency,
      currentPrice: parseFloat(alert.currentPrice?.toString() || "0"),
      status: alert.status,
      triggeredAt: alert.triggeredAt?.toISOString() ?? null,
      expiresAt: alert.expiresAt?.toISOString() ?? null,
      createdAt: alert.createdAt.toISOString(),
      lastCheckedAt: alert.lastCheckedAt?.toISOString() ?? null,
    });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: "Failed to fetch alert" });
  }
});

router.delete("/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const id = parseInt(req.params["id"]!, 10);
    const deleted = await db
      .delete(priceAlertsTable)
      .where(and(eq(priceAlertsTable.id, id), eq(priceAlertsTable.userId, req.userId!)))
      .returning();

    if (deleted.length === 0) {
      res.status(404).json({ error: "NotFound", message: "Alert not found" });
      return;
    }

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: "Failed to delete alert" });
  }
});

export default router;
