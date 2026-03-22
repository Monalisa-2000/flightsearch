/**
 * In-memory cache layer simulating Redis caching strategy.
 * 
 * In production, this would be replaced with a Redis client:
 *   import { createClient } from 'redis';
 *   const redis = createClient({ url: process.env.REDIS_URL });
 * 
 * Cache strategy:
 * - Key pattern: {from}-{to}-{date}-{cabin}-{passengers}
 * - TTL: 10 minutes (600 seconds)
 * - On miss: fetch from airline APIs, store in cache
 * - On hit: return cached result, skip API calls
 * - Invalidation: TTL-based expiry (passive invalidation)
 * - Write-through: cache updated whenever fresh data is fetched
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  hits: number;
}

class InMemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private totalHits = 0;
  private totalMisses = 0;

  get<T>(key: string): T | null {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    if (!entry) {
      this.totalMisses++;
      return null;
    }
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.totalMisses++;
      return null;
    }
    entry.hits++;
    this.totalHits++;
    return entry.data;
  }

  set<T>(key: string, data: T, ttlSeconds = 600): void {
    this.store.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
      hits: 0,
    });
  }

  del(key: string): void {
    this.store.delete(key);
  }

  stats() {
    return {
      keys: this.store.size,
      totalHits: this.totalHits,
      totalMisses: this.totalMisses,
      hitRate: this.totalHits + this.totalMisses > 0
        ? (this.totalHits / (this.totalHits + this.totalMisses) * 100).toFixed(1) + "%"
        : "0%",
    };
  }
}

export const cache = new InMemoryCache();
