/**
 * State History Manager for Undo/Redo functionality
 * Maintains a history of application states for audit and undo purposes
 * Maximum of 5 undo operations allowed as per requirements
 */

export interface HistoryEntry<T = any> {
    state: T;
    timestamp: Date;
    action: string;
    description?: string;
}

export class StateHistoryManager<T = any> {
    private history: HistoryEntry<T>[] = [];
    private currentIndex = -1;
    private maxHistorySize = 6; // Current state + 5 undos

    /**
     * Push a new state to history
     * @param state Current state snapshot
     * @param action Action type/name
     * @param description Optional description for audit
     */
    push(state: T, action: string, description?: string): void {
        // Remove any states after current index (if we've undone)
        this.history = this.history.slice(0, this.currentIndex + 1);

        // Add new entry
        this.history.push({
            state: JSON.parse(JSON.stringify(state)), // Deep clone
            timestamp: new Date(),
            action,
            description,
        });

        // Maintain max size
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        } else {
            this.currentIndex++;
        }
    }

    /**
     * Undo to previous state
     * @returns Previous state or null if at beginning
     */
    undo(): T | null {
        if (!this.canUndo()) {
            return null;
        }
        this.currentIndex--;
        return this.getCurrentState();
    }

    /**
     * Redo to next state
     * @returns Next state or null if at end
     */
    redo(): T | null {
        if (!this.canRedo()) {
            return null;
        }
        this.currentIndex++;
        return this.getCurrentState();
    }

    /**
     * Check if undo is possible
     */
    canUndo(): boolean {
        return this.currentIndex > 0;
    }

    /**
     * Check if redo is possible
     */
    canRedo(): boolean {
        return this.currentIndex < this.history.length - 1;
    }

    /**
     * Get current state
     */
    getCurrentState(): T | null {
        if (this.currentIndex < 0 || this.currentIndex >= this.history.length) {
            return null;
        }
        return JSON.parse(JSON.stringify(this.history[this.currentIndex].state));
    }

    /**
     * Get current entry with metadata
     */
    getCurrentEntry(): HistoryEntry<T> | null {
        if (this.currentIndex < 0 || this.currentIndex >= this.history.length) {
            return null;
        }
        return this.history[this.currentIndex];
    }

    /**
     * Get full history for audit purposes
     */
    getFullHistory(): HistoryEntry<T>[] {
        return this.history.map((entry) => ({
            state: JSON.parse(JSON.stringify(entry.state)),
            timestamp: entry.timestamp,
            action: entry.action,
            description: entry.description,
        }));
    }

    /**
     * Get undo count remaining
     */
    getUndoCount(): number {
        return this.currentIndex;
    }

    /**
     * Get redo count remaining
     */
    getRedoCount(): number {
        return this.history.length - this.currentIndex - 1;
    }

    /**
     * Clear all history
     */
    clear(): void {
        this.history = [];
        this.currentIndex = -1;
    }

    /**
     * Export history for audit/persistence
     */
    exportHistory(): string {
        return JSON.stringify(
            this.history.map((entry) => ({
                timestamp: entry.timestamp.toISOString(),
                action: entry.action,
                description: entry.description,
                state: entry.state,
            })),
            null,
            2
        );
    }

    /**
     * Import history from exported data
     */
    importHistory(jsonData: string): void {
        try {
            const data = JSON.parse(jsonData);
            this.history = data.map((entry: any) => ({
                state: entry.state,
                timestamp: new Date(entry.timestamp),
                action: entry.action,
                description: entry.description,
            }));
            this.currentIndex = this.history.length - 1;
        } catch (error) {
            console.error("Failed to import history:", error);
        }
    }
}

// Global instance for application-wide state management
export const appStateHistory = new StateHistoryManager();
