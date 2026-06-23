/** Represents a single question-answer pair from the JSON data */
export interface QaItem {
    question: string;
    answer: string;
    interviewBestShortAnswer: string;
    example?: string;
    codeSnippet?: string;
    steps?: string[];
}

/** Top-level shape of learning.json — keyed by skill */
export interface LearningData {
    [skillKey: string]: QaItem[];
}

/** Search result wrapping a QaItem with its relevance score */
export interface QaSearchResult {
    item: QaItem;
    score: number;
    matchedKeywords: string[];
}
