import {
    Component,
    EventEmitter,
    Output,
    Input,
    inject,
    effect,
    signal,
    OnDestroy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SpeechService } from '../../services/speech.service';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-search-input',
    standalone: true,
    imports: [FormsModule, CommonModule],
    template: `
    <div class="search-container">
      <div class="input-wrapper">
        <!-- Search icon -->
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>

        <!-- Main input -->
        <input
          type="text"
          [(ngModel)]="query"
          (ngModelChange)="onInputChange($event)"
          (keydown.enter)="onSearch()"
          [placeholder]="speechService.isListening() ? 'Listening...' : 'Ask an interview question...'"
          class="search-input"
          [class.listening]="speechService.isListening()"
          autocomplete="off"
        />

        <!-- Clear button -->
        @if (query) {
          <button class="clear-btn" (click)="clearInput()" title="Clear">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        }

        <!-- Mic button -->
        @if (speechService.isSupported()) {
          <button
            class="mic-btn"
            [class.active]="speechService.isListening()"
            (click)="toggleVoice()"
            [title]="speechService.isListening() ? 'Stop listening' : 'Start voice input'"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              @if (!speechService.isListening()) {
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              } @else {
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" opacity="0.6"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" opacity="0.6"/>
              }
            </svg>
            @if (speechService.isListening()) {
              <span class="pulse-ring"></span>
            }
          </button>
        }

        <!-- Search button -->
        <button class="search-btn" (click)="onSearch()" [disabled]="!query.trim()" title="Search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
      </div>

      <!-- Speech error message -->
      @if (speechService.error()) {
        <p class="speech-error">{{ speechService.error() }}</p>
      }
    </div>
  `,
    styles: [`
    .search-container {
      width: 100%;
      max-width: 700px;
      margin: 0 auto;
    }

    .input-wrapper {
      display: flex;
      align-items: center;
      background: #ffffff;
      border: 2px solid #e2e8f0;
      border-radius: 16px;
      padding: 4px 8px;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    }

    .input-wrapper:focus-within {
      border-color: #6366f1;
      box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1), 0 4px 16px rgba(0, 0, 0, 0.08);
    }

    .input-wrapper:has(.listening) {
      border-color: #ef4444;
      box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.15);
    }

    .search-icon {
      width: 20px;
      height: 20px;
      color: #94a3b8;
      margin: 0 8px;
      flex-shrink: 0;
    }

    .search-input {
      flex: 1;
      border: none;
      outline: none;
      font-size: 16px;
      padding: 14px 4px;
      background: transparent;
      color: #1e293b;
      font-family: inherit;
    }

    .search-input::placeholder {
      color: #94a3b8;
    }

    .search-input.listening::placeholder {
      color: #ef4444;
      animation: blink 1s ease-in-out infinite;
    }

    @keyframes blink {
      50% { opacity: 0.4; }
    }

    button {
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      cursor: pointer;
      border-radius: 12px;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }

    .clear-btn {
      width: 32px;
      height: 32px;
      background: #f1f5f9;
      color: #64748b;
      padding: 6px;
    }

    .clear-btn:hover {
      background: #e2e8f0;
      color: #334155;
    }

    .clear-btn svg {
      width: 16px;
      height: 16px;
    }

    .mic-btn {
      position: relative;
      width: 40px;
      height: 40px;
      background: #f1f5f9;
      color: #64748b;
      margin: 0 4px;
      padding: 8px;
    }

    .mic-btn:hover {
      background: #e2e8f0;
      color: #6366f1;
    }

    .mic-btn.active {
      background: #fef2f2;
      color: #ef4444;
    }

    .mic-btn svg {
      width: 22px;
      height: 22px;
    }

    .pulse-ring {
      position: absolute;
      inset: -4px;
      border: 2px solid #ef4444;
      border-radius: 50%;
      animation: pulse-ring 1.5s ease-out infinite;
    }

    @keyframes pulse-ring {
      0% { transform: scale(0.8); opacity: 1; }
      100% { transform: scale(1.4); opacity: 0; }
    }

    .search-btn {
      width: 44px;
      height: 44px;
      background: #6366f1;
      color: white;
      padding: 10px;
    }

    .search-btn:hover:not(:disabled) {
      background: #4f46e5;
      transform: scale(1.05);
    }

    .search-btn:disabled {
      background: #cbd5e1;
      cursor: not-allowed;
    }

    .search-btn svg {
      width: 20px;
      height: 20px;
    }

    .speech-error {
      color: #ef4444;
      font-size: 13px;
      margin-top: 8px;
      text-align: center;
    }

    /* Tablets */
    @media (max-width: 768px) {
      .input-wrapper {
        padding: 3px 6px;
        border-radius: 14px;
      }

      .search-input {
        font-size: 15px;
        padding: 12px 4px;
      }

      .mic-btn {
        width: 38px;
        height: 38px;
      }

      .search-btn {
        width: 42px;
        height: 42px;
      }
    }

    /* Small phones */
    @media (max-width: 480px) {
      .input-wrapper {
        padding: 2px 4px;
        border-radius: 12px;
      }

      .search-input {
        font-size: 14px;
        padding: 10px 4px;
      }

      .search-icon {
        width: 18px;
        height: 18px;
        margin: 0 4px;
      }

      .clear-btn {
        width: 28px;
        height: 28px;
      }

      .mic-btn {
        width: 34px;
        height: 34px;
        margin: 0 2px;
      }

      .mic-btn svg {
        width: 18px;
        height: 18px;
      }

      .search-btn {
        width: 38px;
        height: 38px;
        border-radius: 10px;
      }

      .search-btn svg {
        width: 18px;
        height: 18px;
      }
    }

    /* Very small phones */
    @media (max-width: 360px) {
      .search-input {
        font-size: 13px;
        padding: 9px 2px;
      }

      .search-icon {
        width: 16px;
        height: 16px;
        margin: 0 3px;
      }

      .mic-btn {
        width: 30px;
        height: 30px;
      }

      .search-btn {
        width: 34px;
        height: 34px;
      }
    }
  `]
})
export class SearchInputComponent implements OnDestroy {
    @Input() initialQuery = '';
    @Output() searchQuery = new EventEmitter<string>();
    @Output() cleared = new EventEmitter<void>();

    speechService = inject(SpeechService);

    query = '';

    private searchSubject = new Subject<string>();
    private sub: Subscription;

    constructor() {
        this.sub = this.searchSubject.pipe(
            debounceTime(400),
            distinctUntilChanged()
        ).subscribe(q => {
            if (q.trim()) {
                this.searchQuery.emit(q.trim());
            } else {
                this.cleared.emit();
            }
        });

        effect(() => {
            const transcript = this.speechService.transcript();
            if (transcript) {
                this.query = transcript;
                this.searchQuery.emit(transcript);
            }
        });
    }

    ngOnDestroy(): void {
        this.sub.unsubscribe();
    }

    onInputChange(value: string): void {
        this.searchSubject.next(value);
    }

    onSearch(): void {
        const trimmed = this.query.trim();
        if (trimmed) {
            this.searchQuery.emit(trimmed);
        }
    }

    toggleVoice(): void {
        if (this.speechService.isListening()) {
            this.speechService.stopListening();
        } else {
            this.speechService.startListening();
        }
    }

    clearInput(): void {
        this.query = '';
        this.cleared.emit();
    }
}
