/**
 * CacheManager - In-memory cache with TTL and LRU eviction
 * 
 * Features:
 * - Automatic TTL-based expiration
 * - LRU (Least Recently Used) eviction when capacity exceeded
 * - Size tracking (50MB limit)
 * - Singleton pattern for global access
 * 
 * @example
 * const cacheManager = CacheManager.getInstance();
 * cacheManager.set('user-123', userData, 5 * 60 * 1000); // 5 min TTL
 * const data = cacheManager.get('user-123');
 */

interface CacheEntry<T> {
    value: T;
    createdAt: number;
    ttl: number;
    accessCount: number;
    lastAccessedAt: number;
}

export class CacheManager {
    private static instance: CacheManager;

    private cache: Map<string, CacheEntry<unknown>>;

    private timers: Map<string, NodeJS.Timeout>;

    private readonly maxSize = 50 * 1024 * 1024; // 50MB

    private currentSize = 0;

    private constructor() {
        this.cache = new Map();
        this.timers = new Map();
        // Singleton - use getInstance()
    }

    /**
     * Get singleton instance
     */
    static getInstance(): CacheManager {
        if (!CacheManager.instance) {
            CacheManager.instance = new CacheManager();
        }
        return CacheManager.instance;
    }

    /**
     * Set a value in cache with TTL
     * @param key Cache key
     * @param value Value to cache
     * @param ttl Time to live in milliseconds (default: 5 minutes)
     */
    set<T>(key: string, value: T, ttl: number = 5 * 60 * 1000): void {
        try {
            const serialized = JSON.stringify(value);
            const size = serialized.length;

            // Check if we need to evict entries
            if (this.currentSize + size > this.maxSize) {
                this.evictLRU();
            }

            // If removing old entry, free up space
            if (this.cache.has(key)) {
                const oldEntry = this.cache.get(key);
                if (oldEntry) {
                    this.currentSize -= JSON.stringify(oldEntry.value).length;
                }
            }

            // Clear existing timer if any
            const existingTimer = this.timers.get(key);
            if (existingTimer) {
                clearTimeout(existingTimer);
            }

            // Add new entry
            const entry: CacheEntry<T> = {
                value,
                createdAt: Date.now(),
                ttl,
                accessCount: 0,
                lastAccessedAt: Date.now()
            };

            this.cache.set(key, entry);
            this.currentSize += size;

            // Set expiration timer
            const timer = setTimeout(() => this.delete(key), ttl);
            this.timers.set(key, timer);
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(`[Cache] Failed to set key "${key}":`, error);
        }
    }

    /**
     * Get a value from cache
     * @param key Cache key
     * @returns Cached value or null if not found or expired
     */
    get<T>(key: string): T | null {
        const entry = this.cache.get(key);
        if (!entry) {
            return null;
        }

        const age = Date.now() - entry.createdAt;
        if (age > entry.ttl) {
            this.delete(key);
            return null;
        }

        // Update access statistics
        entry.accessCount += 1;
        entry.lastAccessedAt = Date.now();

        return entry.value as T;
    }

    /**
     * Check if key exists and is not expired
     */
    has(key: string): boolean {
        const entry = this.cache.get(key);
        if (!entry) return false;

        const age = Date.now() - entry.createdAt;
        if (age > entry.ttl) {
            this.delete(key);
            return false;
        }

        return true;
    }

    /**
     * Delete a specific cache entry
     */
    delete(key: string): void {
        const entry = this.cache.get(key);
        if (entry) {
            const size = JSON.stringify(entry.value).length;
            this.currentSize -= size;
            this.cache.delete(key);
        }

        const timer = this.timers.get(key);
        if (timer) {
            clearTimeout(timer);
            this.timers.delete(key);
        }
    }

    /**
     * Clear all cache entries
     */
    clear(): void {
        this.cache.forEach((_, key) => this.delete(key));
    }

    /**
     * Get cache statistics
     */
    getStats(): {
        size: number;
        maxSize: number;
        entries: number;
        utilizationPercent: number;
    } {
        return {
            size: this.currentSize,
            maxSize: this.maxSize,
            entries: this.cache.size,
            utilizationPercent: (this.currentSize / this.maxSize) * 100
        };
    }

    /**
     * Evict least recently used entries until under capacity
     * @private
     */
    private evictLRU(): void {
        const targetSize = this.maxSize * 0.8; // Free up to 80% capacity

        // Sort by lastAccessedAt (least recent first)
        const sorted = Array.from(this.cache.entries())
            .sort(([, a], [, b]) => a.lastAccessedAt - b.lastAccessedAt);

        for (const [key] of sorted) {
            if (this.currentSize <= targetSize) break;
            this.delete(key);
        }
    }

    /**
     * Get cache entries (for debugging)
     */
    getEntries(): Array<{ key: string; age: number; ttl: number; accessCount: number }> {
        return Array.from(this.cache.entries()).map(([key, entry]) => ({
            key,
            age: Date.now() - entry.createdAt,
            ttl: entry.ttl,
            accessCount: entry.accessCount
        }));
    }
}

// Export singleton instance
export const cacheManager = CacheManager.getInstance();
