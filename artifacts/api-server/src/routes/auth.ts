import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { createToken, hashPassword } from "../lib/jwt.js";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/auth.js";

const router: IRouter = Router();

router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body as { email: string; password: string; name: string };

    if (!email || !password || !name) {
      res.status(400).json({ error: "ValidationError", message: "email, password, and name are required" });
      return;
    }
    if (password.length < 8) {
      res.status(400).json({ error: "ValidationError", message: "Password must be at least 8 characters" });
      return;
    }

    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existing.length > 0) {
      res.status(409).json({ error: "ConflictError", message: "Email already registered" });
      return;
    }

    const passwordHash = hashPassword(password);
    const [user] = await db.insert(usersTable).values({ email, passwordHash, name }).returning();

    if (!user) {
      res.status(500).json({ error: "InternalError", message: "Failed to create user" });
      return;
    }

    const token = createToken({ userId: user.id, email: user.email });
    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt.toISOString(),
      },
    });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body as { email: string; password: string };

    if (!email || !password) {
      res.status(400).json({ error: "ValidationError", message: "email and password are required" });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (!user || user.passwordHash !== hashPassword(password)) {
      res.status(401).json({ error: "AuthError", message: "Invalid email or password" });
      return;
    }

    const token = createToken({ userId: user.id, email: user.email });
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt.toISOString(),
      },
    });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: "Login failed" });
  }
});

router.get("/me", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
    if (!user) {
      res.status(401).json({ error: "AuthError", message: "User not found" });
      return;
    }
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: "InternalError", message: "Failed to fetch user" });
  }
});

export default router;
