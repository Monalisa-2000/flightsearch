/**
 * Mock flight data generator.
 * In production, this would aggregate from multiple airline APIs:
 * - Direct airline APIs (British Airways, Air India, Emirates, etc.)
 * - GDS systems (Amadeus, Sabre, Travelport)
 * - Metasearch feeds (Kayak API, Skyscanner API)
 * 
 * Retry strategy: exponential backoff with 3 retries per provider.
 * Circuit breaker: if a provider fails >50% in 5min, mark as degraded.
 * Timeout: 5s per provider, run all in parallel, merge results.
 */

export interface FlightResult {
  id: string;
  airline: string;
  airlineCode: string;
  flightNumber: string;
  from: string;
  fromCity: string;
  to: string;
  toCity: string;
  departureTime: string;
  arrivalTime: string;
  duration: number;
  stops: number;
  price: number;
  currency: string;
  cabin: string;
  seatsLeft: number;
  score: number;
}

const AIRPORTS: Record<string, { city: string; country: string }> = {
  DEL: { city: "New Delhi", country: "India" },
  LON: { city: "London", country: "UK" },
  LHR: { city: "London", country: "UK" },
  BOM: { city: "Mumbai", country: "India" },
  JFK: { city: "New York", country: "USA" },
  DXB: { city: "Dubai", country: "UAE" },
  SIN: { city: "Singapore", country: "Singapore" },
  SYD: { city: "Sydney", country: "Australia" },
  CDG: { city: "Paris", country: "France" },
  FRA: { city: "Frankfurt", country: "Germany" },
  NRT: { city: "Tokyo", country: "Japan" },
  HKG: { city: "Hong Kong", country: "China" },
  LAX: { city: "Los Angeles", country: "USA" },
  ORD: { city: "Chicago", country: "USA" },
  MIA: { city: "Miami", country: "USA" },
  BKK: { city: "Bangkok", country: "Thailand" },
};

const AIRLINES = [
  { name: "Air India", code: "AI" },
  { name: "British Airways", code: "BA" },
  { name: "Emirates", code: "EK" },
  { name: "Lufthansa", code: "LH" },
  { name: "Singapore Airlines", code: "SQ" },
  { name: "Qatar Airways", code: "QR" },
  { name: "United Airlines", code: "UA" },
  { name: "Delta Air Lines", code: "DL" },
  { name: "Air France", code: "AF" },
  { name: "Thai Airways", code: "TG" },
];

function generateId(): string {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

function addMinutes(dateStr: string, minutes: number): string {
  const d = new Date(dateStr);
  d.setMinutes(d.getMinutes() + minutes);
  return d.toISOString();
}

function calcScore(price: number, duration: number, stops: number, maxPrice: number, maxDuration: number): number {
  const priceScore = 1 - price / maxPrice;
  const durationScore = 1 - duration / maxDuration;
  const stopsScore = stops === 0 ? 1 : stops === 1 ? 0.6 : 0.2;
  return (priceScore * 0.4 + durationScore * 0.35 + stopsScore * 0.25) * 100;
}

export function generateFlights(from: string, to: string, date: string, cabin: string, passengers: number): FlightResult[] {
  const fromInfo = AIRPORTS[from] || { city: from, country: "Unknown" };
  const toInfo = AIRPORTS[to] || { city: to, country: "Unknown" };

  // Deterministic seed based on route+date so same search returns same results
  const seed = (from + to + date).split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const rng = (i: number) => Math.abs(Math.sin(seed + i) * 10000) % 1;

  const numFlights = Math.floor(rng(0) * 5) + 6; // 6-10 flights
  const basePrice = cabin === "economy" ? 300 + rng(1) * 400 : cabin === "business" ? 1500 + rng(1) * 2000 : 4000 + rng(1) * 5000;
  const baseDuration = 300 + rng(2) * 600; // 5-15 hours in minutes

  const flights: FlightResult[] = [];

  for (let i = 0; i < numFlights; i++) {
    const airline = AIRLINES[Math.floor(rng(i * 3) * AIRLINES.length)];
    const price = Math.floor(basePrice * (0.8 + rng(i * 4) * 0.4) * passengers);
    const duration = Math.floor(baseDuration * (0.9 + rng(i * 5) * 0.3));
    const stops = rng(i * 6) < 0.35 ? 0 : rng(i * 7) < 0.7 ? 1 : 2;
    const durationWithStops = duration + stops * Math.floor(rng(i * 8) * 120 + 60);

    const departHour = Math.floor(rng(i * 9) * 20) + 4; // 4am - midnight
    const departDate = new Date(`${date}T${String(departHour).padStart(2, "0")}:${String(Math.floor(rng(i * 10) * 60)).padStart(2, "0")}:00Z`);
    const departureTime = departDate.toISOString();
    const arrivalTime = addMinutes(departureTime, durationWithStops);

    flights.push({
      id: generateId(),
      airline: airline.name,
      airlineCode: airline.code,
      flightNumber: `${airline.code}${Math.floor(rng(i * 11) * 9000) + 1000}`,
      from,
      fromCity: fromInfo.city,
      to,
      toCity: toInfo.city,
      departureTime,
      arrivalTime,
      duration: durationWithStops,
      stops,
      price,
      currency: "USD",
      cabin,
      seatsLeft: Math.floor(rng(i * 12) * 15) + 1,
      score: 0,
    });
  }

  const maxPrice = Math.max(...flights.map((f) => f.price));
  const maxDuration = Math.max(...flights.map((f) => f.duration));
  for (const f of flights) {
    f.score = Math.round(calcScore(f.price, f.duration, f.stops, maxPrice, maxDuration) * 10) / 10;
  }

  return flights;
}

export function sortFlights(flights: FlightResult[], sort: string): FlightResult[] {
  switch (sort) {
    case "cheapest":
      return [...flights].sort((a, b) => a.price - b.price);
    case "fastest":
      return [...flights].sort((a, b) => a.duration - b.duration);
    case "best":
    default:
      return [...flights].sort((a, b) => b.score - a.score);
  }
}

export function getLowestPrice(from: string, to: string): number {
  const flights = generateFlights(from, to, new Date().toISOString().split("T")[0]!, "economy", 1);
  return Math.min(...flights.map((f) => f.price));
}

export { AIRPORTS };
