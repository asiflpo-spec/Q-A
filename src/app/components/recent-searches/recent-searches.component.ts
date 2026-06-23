import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-recent-searches',
    standalone: true,
    imports: [CommonModule],
    template: `
    @if (searches.length > 0) {
      <div class="recent-container">
        <div class="header">
          <span class="title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="clock-icon">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            Recent Searches
          </span>
          <button class="clear-all" (click)="clearAll.emit()">Clear all</button>
        </div>
        <div class="tags">
          @for (search of searches; track search) {
            <button class="tag" (click)="selectSearch.emit(search)">
              {{ search }}
            </button>
          }
        </div>
      </div>
    }
  `,
    styles: [`
    .recent-container {
      width: 100%;
      max-width: 700px;
      margin: 16px auto 0;
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
    }

    .title {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #64748b;
      font-weight: 500;
    }

    .clock-icon {
      width: 14px;
      height: 14px;
    }

    .clear-all {
      font-size: 12px;
      color: #94a3b8;
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 6px;
      transition: all 0.2s;
    }

    .clear-all:hover {
      color: #ef4444;
      background: #fef2f2;
    }

    .tags {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .tag {
      font-size: 13px;
      color: #475569;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      padding: 6px 14px;
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.2s;
      font-family: inherit;
    }

    .tag:hover {
      background: #eef2ff;
      border-color: #c7d2fe;
      color: #6366f1;
    }

    @media (max-width: 480px) {
      .recent-container {
        margin-top: 12px;
      }

      .title {
        font-size: 12px;
      }

      .tags {
        gap: 6px;
      }

      .tag {
        font-size: 12px;
        padding: 5px 12px;
      }
    }

    @media (max-width: 360px) {
      .tag {
        font-size: 11px;
        padding: 4px 10px;
      }
    }
  `]
})
export class RecentSearchesComponent {
    @Input() searches: string[] = [];
    @Output() selectSearch = new EventEmitter<string>();
    @Output() clearAll = new EventEmitter<void>();
}
