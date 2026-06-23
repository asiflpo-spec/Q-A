import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay, observeOn, asyncScheduler } from 'rxjs';
import { LearningData, QaItem, QaSearchResult } from '../models/qa.model';

@Injectable({ providedIn: 'root' })
export class QaService {
    private http = inject(HttpClient);

    private learningData$: Observable<LearningData> = this.http
        .get<LearningData>('assets/learning.json')
        .pipe(shareReplay(1));

    /** Get all items for a specific skill key */
    getBySkill(skillKey: string): Observable<QaItem[]> {
        return this.learningData$.pipe(
            map(data => data[skillKey] ?? [])
        );
    }

    /** Get item count for every skill key */
    getAllCounts(): Observable<Record<string, number>> {
        return this.learningData$.pipe(
            map(data =>
                Object.fromEntries(
                    Object.entries(data).map(([key, items]) => [key, items.length])
                )
            )
        );
    }

    /**
     * Search within the given skill's items.
     * Results are sorted by relevance score (best match first).
     */
    search(query: string, skillKey: string): Observable<QaSearchResult[]> {
        const keywords = this.extractKeywords(query);

        return this.getBySkill(skillKey).pipe(
            observeOn(asyncScheduler),
            map(items => {
                if (keywords.length === 0) return [];

                const results: QaSearchResult[] = [];

                for (const item of items) {
                    const questionLower = item.question.toLowerCase();
                    const answerLower = item.answer.toLowerCase();
                    let score = 0;
                    const matchedKeywords: string[] = [];

                    for (const keyword of keywords) {
                        const kw = keyword.toLowerCase();

                        if (questionLower.includes(kw)) {
                            score += 10;
                            matchedKeywords.push(keyword);
                        }

                        if (answerLower.includes(kw)) {
                            score += 3;
                            if (!matchedKeywords.includes(keyword)) {
                                matchedKeywords.push(keyword);
                            }
                        }
                    }

                    if (score > 0) {
                        results.push({ item, score, matchedKeywords });
                    }
                }

                return results.sort((a, b) => b.score - a.score);
            })
        );
    }

    private extractKeywords(query: string): string[] {
        const stopWords = new Set([
            'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been',
            'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
            'would', 'could', 'should', 'may', 'might', 'can', 'shall',
            'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from',
            'it', 'its', 'this', 'that', 'these', 'those', 'i', 'me',
            'my', 'we', 'our', 'you', 'your', 'he', 'she', 'they',
            'them', 'what', 'which', 'who', 'whom', 'how', 'when',
            'where', 'why', 'and', 'or', 'but', 'not', 'so', 'if',
            'about', 'tell', 'explain', 'describe', 'define'
        ]);

        return query
            .split(/\s+/)
            .map(w => w.replace(/[^a-zA-Z0-9]/g, ''))
            .filter(w => w.length > 1 && !stopWords.has(w.toLowerCase()));
    }
}
