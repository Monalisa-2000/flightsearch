import { pgTable, serial, integer, text, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const priceAlertsTable = pgTable("price_alerts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  fromAirport: text("from_airport").notNull(),
  toAirport: text("to_airport").notNull(),
  targetPrice: numeric("target_price", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),
  currentPrice: numeric("current_price", { precision: 10, scale: 2 }).notNull().default("0"),
  status: text("status").notNull().default("active"),
  triggeredAt: timestamp("triggered_at"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastCheckedAt: timestamp("last_checked_at"),
});

export const insertAlertSchema = createInsertSchema(priceAlertsTable).omit({ id: true, createdAt: true });
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type PriceAlert = typeof priceAlertsTable.$inferSelect;
