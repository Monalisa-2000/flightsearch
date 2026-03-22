/**
 * Price Monitoring Worker
 * 
 * Architecture: Simulates a distributed message queue worker.
 * In production:
 *   - Kafka/RabbitMQ consumer listens on "price-check" topic
 *   - Workers are stateless, horizontally scalable
 *   - Multiple worker instances can run in parallel
 *   - Dead letter queue (DLQ) for failed jobs with retry logic
 *   - Jobs are processed using exponential backoff
 *
 * Flow:
 *   1. Worker polls active price alerts from DB
 *   2. Fetches current prices (aggregated from airline APIs)
 *   3. Compares against user's target price
 *   4. If price dropped below target: enqueues notification job
 *   5. Updates alert status in DB, publishes event to Kafka
 *   6. Notification service consumes events and sends email/push
 */

import { db } from "@workspace/db";
import { priceAlertsTable, notificationsTable, workerRunsTable } from "@workspace/db/schema";
import { eq, and, sql, lte } from "drizzle-orm";
import { getLowestPrice } from "./flightData.js";
import { logger } from "./logger.js";

interface WorkerState {
  status: "running" | "idle" | "error";
  lastRun: Date | null;
  nextRun: Date | null;
  alertsChecked: number;
  alertsTriggered: number;
  runCount: number;
  intervalId: ReturnType<typeof setInterval> | null;
}

export const workerState: WorkerState = {
  status: "idle",
  lastRun: null,
  nextRun: null,
  alertsChecked: 0,
  alertsTriggered: 0,
  runCount: 0,
  intervalId: null,
};

export async function runWorkerCycle(): Promise<{ alertsChecked: number; alertsTriggered: number }> {
  workerState.status = "running";
  let alertsChecked = 0;
  let alertsTriggered = 0;

  try {
    // Fetch all active alerts
    const activeAlerts = await db
      .select()
      .from(priceAlertsTable)
      .where(
        and(
          eq(priceAlertsTable.status, "active"),
          sql`(${priceAlertsTable.expiresAt} IS NULL OR ${priceAlertsTable.expiresAt} > NOW())`
        )
      )
      .limit(100);

    logger.info({ count: activeAlerts.length }, "Worker: checking alerts");
    alertsChecked = activeAlerts.length;

    for (const alert of activeAlerts) {
      try {
        // Fetch current best price for this route
        const currentPrice = getLowestPrice(alert.fromAirport, alert.toAirport);

        // Update current price and lastCheckedAt
        await db
          .update(priceAlertsTable)
          .set({
            currentPrice: currentPrice.toString(),
            lastCheckedAt: new Date(),
          })
          .where(eq(priceAlertsTable.id, alert.id));

        const targetPrice = parseFloat(alert.targetPrice.toString());

        // Check if price dropped below target
        if (currentPrice <= targetPrice) {
          await db
            .update(priceAlertsTable)
            .set({ status: "triggered", triggeredAt: new Date() })
            .where(eq(priceAlertsTable.id, alert.id));

          // Enqueue notification (simulated message queue publish)
          await db.insert(notificationsTable).values({
            userId: alert.userId,
            type: "price_drop",
            title: `Price Alert Triggered: ${alert.fromAirport} → ${alert.toAirport}`,
            message: `Great news! The price dropped to $${currentPrice} — below your target of $${targetPrice}. Book now before it goes back up!`,
            read: false,
            metadata: {
              alertId: alert.id,
              fromAirport: alert.fromAirport,
              toAirport: alert.toAirport,
              targetPrice,
              currentPrice,
              channel: "email", // In production: also push via FCM/APNs
            },
          });

          alertsTriggered++;
          logger.info(
            { alertId: alert.id, fromAirport: alert.fromAirport, toAirport: alert.toAirport, currentPrice, targetPrice },
            "Worker: alert triggered!"
          );
        }
      } catch (err) {
        logger.error({ err, alertId: alert.id }, "Worker: error processing alert");
      }
    }

    // Record worker run in DB
    await db.insert(workerRunsTable).values({ alertsChecked, alertsTriggered });

    workerState.alertsChecked += alertsChecked;
    workerState.alertsTriggered += alertsTriggered;
    workerState.runCount++;
    workerState.lastRun = new Date();
    workerState.nextRun = new Date(Date.now() + 5 * 60 * 1000);
    workerState.status = "idle";

    return { alertsChecked, alertsTriggered };
  } catch (err) {
    workerState.status = "error";
    logger.error({ err }, "Worker: cycle failed");
    throw err;
  }
}

export function startWorker(): void {
  if (workerState.intervalId) return; // already running

  // Run every 5 minutes
  const INTERVAL_MS = 5 * 60 * 1000;

  workerState.nextRun = new Date(Date.now() + 10000); // first run in 10s

  // Initial delayed start
  setTimeout(() => {
    runWorkerCycle().catch((err) => logger.error({ err }, "Worker initial run failed"));
    workerState.intervalId = setInterval(() => {
      runWorkerCycle().catch((err) => logger.error({ err }, "Worker interval run failed"));
    }, INTERVAL_MS);
  }, 10000);

  logger.info("Price monitoring worker started");
}
