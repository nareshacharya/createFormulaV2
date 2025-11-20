/**
 * RequestBatcher - Deduplicates and batches API requests
 * 
 * Features:
 * - Automatic deduplication of identical requests
 * - Priority-based request ordering
 * - Configurable debounce delay
 * - Parallel execution of unique requests
 * 
 * @example
 * const result = await requestBatcher.add(
 *   'ingredient-123',
 *   () => DxApiService.getIngredientDetails('123'),
 *   2 // priority
 * );
 */

interface BatchRequest<T> {
    key: string;
    factory: () => Promise<T>;
    resolve: (value: T) => void;
    reject: (reason?: unknown) => void;
    priority: number;
}

export class RequestBatcher {
    private static instance: RequestBatcher;

    private queue: BatchRequest<unknown>[] = [];

    private debounceTimer: NodeJS.Timeout | null = null;

    private readonly debounceDelay: number = 300; // ms

    private constructor() {
        // Singleton - use getInstance()
    }

    /**
     * Get singleton instance
     */
    static getInstance(): RequestBatcher {
        if (!RequestBatcher.instance) {
            RequestBatcher.instance = new RequestBatcher();
        }
        return RequestBatcher.instance;
    }

    /**
     * Add a request to the batch queue
     * @param key Unique identifier for deduplication
     * @param factory Function that returns the request promise
     * @param priority Priority level (lower = higher priority, default: 2)
     * @returns Promise that resolves when request completes
     */
    add<T>(
        key: string,
        factory: () => Promise<T>,
        priority: number = 2
    ): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            this.queue.push({ key, factory, resolve, reject, priority });
            this.schedule();
        });
    }

    /**
     * Schedule batch processing with debounce
     * @private
     */
    private schedule(): void {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        this.debounceTimer = setTimeout(() => {
            this.flush();
        }, this.debounceDelay);
    }

    /**
     * Process all queued requests
     * @private
     */
    private async flush(): Promise<void> {
        const batch = this.queue.splice(0);
        if (batch.length === 0) return;

        // Sort by priority (ascending: lower number = higher priority)
        batch.sort((a, b) => a.priority - b.priority);

        // Group by key to deduplicate
        const grouped = new Map<string, BatchRequest<unknown>>();
        const duplicateMap = new Map<string, BatchRequest<unknown>[]>();

        for (const req of batch) {
            if (!grouped.has(req.key)) {
                grouped.set(req.key, req);
            } else {
                if (!duplicateMap.has(req.key)) {
                    duplicateMap.set(req.key, []);
                }
                duplicateMap.get(req.key)?.push(req);
            }
        }

        // Execute all unique requests in parallel
        const requests = Array.from(grouped.values());
        const results = await Promise.allSettled(
            requests.map((req) => req.factory())
        );

        // Resolve/reject all promises
        requests.forEach((req, idx) => {
            const result = results[idx];
            if (result.status === 'fulfilled') {
                req.resolve(result.value);

                // Also resolve duplicates with the same result
                const duplicates = duplicateMap.get(req.key) || [];
                duplicates.forEach((dup) => {
                    dup.resolve(result.value);
                });
            } else {
                req.reject(result.reason);

                // Also reject duplicates with the same error
                const duplicates = duplicateMap.get(req.key) || [];
                duplicates.forEach((dup) => {
                    dup.reject(result.reason);
                });
            }
        });
    }

    /**
     * Get current queue size (for debugging/monitoring)
     */
    getQueueSize(): number {
        return this.queue.length;
    }

    /**
     * Clear the queue (WARNING: pending promises will remain unresolved)
     */
    clearQueue(): void {
        this.queue.splice(0);
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = null;
        }
    }
}

// Export singleton instance
export const requestBatcher = RequestBatcher.getInstance();
