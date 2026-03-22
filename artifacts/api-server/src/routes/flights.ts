import { Router, type IRouter } from "express";
import { cache } from "../lib/cache.js";
import { generateFlights, sortFlights, AIRPORTS } from "../lib/flightData.js";

const router: IRouter = Router();

router.get("/search", async (req, res) => {
  const start = Date.now();
  const { from, to, date, passengers = "1", cabin = "economy", sort = "best" } = req.query as Record<string, string>;

  if (!from || !to || !date) {
    res.status(400).json({ error: "ValidationError", message: "from, to, and date are required" });
    return;
  }

  const pax = parseInt(passengers, 10) || 1;
  const cacheKey = `flights:${from.toUpperCase()}-${to.toUpperCase()}-${date}-${cabin}-${pax}-${sort}`;

  // Try cache first (Redis equivalent)
  const cached = cache.get<{ flights: ReturnType<typeof generateFlights>; meta: Record<string, unknown> }>(cacheKey);
  if (cached) {
    res.json({
      ...cached,
      meta: { ...cached.meta, cacheHit: true, searchDurationMs: Date.now() - start },
    });
    return;
  }

  // Cache miss — simulate airline API aggregation
  const rawFlights = generateFlights(from.toUpperCase(), to.toUpperCase(), date, cabin, pax);
  const flights = sortFlights(rawFlights, sort);

  const result = {
    flights,
    meta: {
      total: flights.length,
      from: from.toUpperCase(),
      to: to.toUpperCase(),
      date,
      sort,
      cacheHit: false,
      searchDurationMs: Date.now() - start,
    },
  };

  // Store in cache (TTL: 10 minutes)
  cache.set(cacheKey, result, 600);

  res.json(result);
});

router.get("/airports", (req, res) => {
  const q = (req.query["q"] as string || "").toLowerCase();
  const airports = Object.entries(AIRPORTS).map(([code, info]) => ({
    code,
    name: `${info.city} Airport`,
    city: info.city,
    country: info.country,
  }));

  if (!q) {
    res.json(airports);
    return;
  }

  const filtered = airports.filter(
    (a) =>
      a.code.toLowerCase().includes(q) ||
      a.city.toLowerCase().includes(q) ||
      a.country.toLowerCase().includes(q)
  );
  res.json(filtered);
});

export default router;
