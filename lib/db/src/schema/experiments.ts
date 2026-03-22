import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const experimentAssignmentsTable = pgTable("experiment_assignments", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  experimentId: text("experiment_id").notNull(),
  group: text("group").notNull(),
  assignedAt: timestamp("assigned_at").notNull().defaultNow(),
});

export const experimentEventsTable = pgTable("experiment_events", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  experimentId: text("experiment_id").notNull(),
  group: text("group").notNull(),
  event: text("event").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAssignmentSchema = createInsertSchema(experimentAssignmentsTable).omit({ id: true, assignedAt: true });
export const insertEventSchema = createInsertSchema(experimentEventsTable).omit({ id: true, createdAt: true });
export type InsertAssignment = z.infer<typeof insertAssignmentSchema>;
export type ExperimentAssignment = typeof experimentAssignmentsTable.$inferSelect;

export const workerRunsTable = pgTable("worker_runs", {
  id: serial("id").primaryKey(),
  alertsChecked: integer("alerts_checked").notNull().default(0),
  alertsTriggered: integer("alerts_triggered").notNull().default(0),
  runAt: timestamp("run_at").notNull().defaultNow(),
});

export const insertWorkerRunSchema = createInsertSchema(workerRunsTable).omit({ id: true, runAt: true });
export type InsertWorkerRun = z.infer<typeof insertWorkerRunSchema>;
export type WorkerRun = typeof workerRunsTable.$inferSelect;
