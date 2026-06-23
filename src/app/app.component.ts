import { Component, inject, signal, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchInputComponent } from './components/search-input/search-input.component';
import { AnswerCardComponent } from './components/answer-card/answer-card.component';
import { RecentSearchesComponent } from './components/recent-searches/recent-searches.component';
import { QaService } from './services/qa.service';
import { HistoryService } from './services/history.service';
import { QaSearchResult } from './models/qa.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    SearchInputComponent,
    AnswerCardComponent,
    RecentSearchesComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  private qaService = inject(QaService);
  private historyService = inject(HistoryService);
  private elRef = inject(ElementRef);

  results = signal<QaSearchResult[]>([]);
  isLoading = signal(false);
  hasSearched = signal(false);
  currentQuery = signal('');
  recentSearches = this.historyService.recentSearches;
  isDropdownOpen = false;
  isSearchMode = false;

  skills = [
    { key: 'frontEnd',    name: 'Front End',    count: 0, id: 11111 },
    { key: 'backEnd',     name: 'Back End',      count: 0, id: 22222 },
    { key: 'unitTesting', name: 'Unit Testing',  count: 0, id: 33333 },
    { key: 'genAi',       name: 'Gen AI',        count: 0, id: 44444 },
    { key: 'practical',   name: 'Practical',     count: 0, id: 55555 },
  ];

  selectedSkill = this.skills[0];

  ngOnInit(): void {
    this.qaService.getAllCounts().subscribe(counts => {
      this.skills = this.skills.map(s => ({ ...s, count: counts[s.key] ?? 0 }));
      const savedKey = localStorage.getItem('skills');
      const match = this.skills.find(x => x.key === savedKey);
      if (match) this.selectedSkill = match;
      this.loadAllForSkill(this.selectedSkill.key);
    });
  }

  loadAllForSkill(key: string): void {
    this.isLoading.set(true);
    this.isSearchMode = false;
    this.hasSearched.set(true);
    this.qaService.getBySkill(key).subscribe({
      next: (items) => {
        this.results.set(items.map(item => ({ item, score: 0, matchedKeywords: [] })));
        this.isLoading.set(false);
      },
      error: () => {
        this.results.set([]);
        this.isLoading.set(false);
      }
    });
  }

  onSearchCleared(): void {
    this.currentQuery.set('');
    this.loadAllForSkill(this.selectedSkill.key);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elRef.nativeElement.querySelector('.dropdown-wrapper')?.contains(event.target)) {
      this.isDropdownOpen = false;
    }
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectSkill(skill: typeof this.skills[0]): void {
    this.selectedSkill = skill;
    localStorage.setItem('skills', skill.key);
    this.isDropdownOpen = false;
    this.currentQuery.set('');
    this.loadAllForSkill(skill.key);
  }

  onSearch(query: string): void {
    this.currentQuery.set(query);
    this.isLoading.set(true);
    this.isSearchMode = true;
    this.hasSearched.set(true);
    this.historyService.add(query);

    this.qaService.search(query, this.selectedSkill.key).subscribe({
      next: (results) => {
        this.results.set(results);
        this.isLoading.set(false);
      },
      error: () => {
        this.results.set([]);
        this.isLoading.set(false);
      }
    });
  }

  onSelectRecent(query: string): void {
    this.currentQuery.set(query);
    this.onSearch(query);
  }

  onClearHistory(): void {
    this.historyService.clear();
  }
}
