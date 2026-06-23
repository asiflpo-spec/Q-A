import { Component, Input, signal, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QaSearchResult } from '../../models/qa.model';

@Component({
    selector: 'app-answer-card',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './answer-card.component.html',
    styleUrl: './answer-card.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnswerCardComponent implements OnChanges {
    @Input({ required: true }) result!: QaSearchResult;
    @Input() isBestMatch = false;

    isExpanded = signal(false);
    highlightedAnswer = '';

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['result']) {
            this.highlightedAnswer = this.computeHighlight();
        }
    }

    toggleExpand(): void {
        this.isExpanded.update(v => !v);
    }

    private computeHighlight(): string {
        let text = this.escapeHtml(this.result.item.interviewBestShortAnswer);
        for (const kw of this.result.matchedKeywords) {
            const escapedKw = this.escapeHtml(kw);
            const regex = new RegExp(`(${this.escapeRegex(escapedKw)})`, 'gi');
            text = text.replace(regex, '<span class="highlight">$1</span>');
        }
        return text;
    }

    private escapeHtml(text: string): string {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    private escapeRegex(str: string): string {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}
