import { Router, type IRouter } from "express";

const router: IRouter = Router();

/**
 * Recommendation Service
 * 
 * In production, this would use:
 * - Collaborative filtering (users who searched A→B also booked A→C)
 * - Seasonal trend analysis (ML model on historical booking data)
 * - User behavior: recent searches, price alerts, viewed flights
 * - Geo-based personalization
 * - A/B tested ranking models
 */

const TRENDING_DESTINATIONS = [
  {
    code: "BKK",
    city: "Bangkok",
    country: "Thailand",
    imageUrl: "/images/empty-state.png",
    avgPrice: 520,
    currency: "USD",
    trendScore: 95,
    tags: ["Beach", "Culture", "Food"],
  },
  {
    code: "NRT",
    city: "Tokyo",
    country: "Japan",
    imageUrl: "/images/empty-state.png",
    avgPrice: 890,
    currency: "USD",
    trendScore: 92,
    tags: ["Culture", "Tech", "Food"],
  },
  {
    code: "DXB",
    city: "Dubai",
    country: "UAE",
    imageUrl: "/images/empty-state.png",
    avgPrice: 450,
    currency: "USD",
    trendScore: 88,
    tags: ["Luxury", "Shopping", "Business"],
  },
  {
    code: "CDG",
    city: "Paris",
    country: "France",
    imageUrl: "/images/empty-state.png",
    avgPrice: 720,
    currency: "USD",
    trendScore: 85,
    tags: ["Romance", "Art", "Culture"],
  },
  {
    code: "SIN",
    city: "Singapore",
    country: "Singapore",
    imageUrl: "/images/empty-state.png",
    avgPrice: 680,
    currency: "USD",
    trendScore: 83,
    tags: ["Business", "Food", "Modern"],
  },
  {
    code: "SYD",
    city: "Sydney",
    country: "Australia",
    imageUrl: "/images/empty-state.png",
    avgPrice: 1100,
    currency: "USD",
    trendScore: 80,
    tags: ["Beach", "Nature", "Adventure"],
  },
  {
    code: "HKG",
    city: "Hong Kong",
    country: "China",
    imageUrl: "/images/empty-state.png",
    avgPrice: 580,
    currency: "USD",
    trendScore: 78,
    tags: ["Shopping", "Food", "Business"],
  },
  {
    code: "MIA",
    city: "Miami",
    country: "USA",
    imageUrl: "/images/empty-state.png",
    avgPrice: 380,
    currency: "USD",
    trendScore: 76,
    tags: ["Beach", "Nightlife", "Art"],
  },
];

const REASONS = [
  "Trending destination this season",
  "Great value for your search history",
  "Popular with travelers from your region",
  "Best time to visit is coming up",
  "Prices at a 3-month low",
  "Highly rated by recent travelers",
];

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

router.get("/", (req, res) => {
  const { limit = "6" } = req.query as { from?: string; limit?: string };
  const lim = Math.min(parseInt(limit, 10) || 6, 8);

  const recommendations = TRENDING_DESTINATIONS.slice(0, lim).map((dest, i) => ({
    destination: dest,
    reason: REASONS[i % REASONS.length],
    estimatedPrice: dest.avgPrice,
    bestMonthToVisit: MONTHS[(new Date().getMonth() + 3 + i) % 12],
  }));

  res.json({
    recommendations,
    basedOn: "trending destinations and seasonal patterns",
  });
});

router.get("/trending", (_req, res) => {
  res.json(TRENDING_DESTINATIONS);
});

export default router;
