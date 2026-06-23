import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'ia_recent_searches';
const MAX_HISTORY = 10;

/**
 * Service to manage recent search history using localStorage.
 */
@Injectable({ providedIn: 'root' })
export class HistoryService {
    recentSearches = signal<string[]>(this.load());

    /** Add a query to history (most recent first, no duplicates) */
    add(query: string): void {
        const trimmed = query.trim();
        if (!trimmed) return;

        let history = this.load();
        // Remove duplicate if exists
        history = history.filter(q => q.toLowerCase() !== trimmed.toLowerCase());
        // Add to front
        history.unshift(trimmed);
        // Keep only last N items
        history = history.slice(0, MAX_HISTORY);

        this.save(history);
        this.recentSearches.set(history);
    }

    /** Clear all history */
    clear(): void {
        localStorage.removeItem(STORAGE_KEY);
        this.recentSearches.set([]);
    }

    private load(): string[] {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    }

    private save(history: string[]): void {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    }
}
