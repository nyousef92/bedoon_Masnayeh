import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-paginator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './paginator.component.html'
})
export class PaginatorComponent implements OnChanges {
  @Input() listName = '';
  @Input() currentPage = 1;
  @Input() totalItems = 0;
  @Input() pageSize = 10;

  @Output() pageChange = new EventEmitter<number>();

  totalPages = 0;
  startingIndex = 0;
  endingIndex = 0;
  pages: (number | null)[] = [];

  ngOnChanges(): void {
    this.totalPages = Math.ceil(this.totalItems / this.pageSize) || 1;
    this.startingIndex = this.totalItems === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
    this.endingIndex = Math.min(this.currentPage * this.pageSize, this.totalItems);
    this.pages = this.buildPages();
  }

  private buildPages(): (number | null)[] {
    const total = this.totalPages;
    const cur = this.currentPage;

    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    if (cur <= 4) {
      return [1, 2, 3, 4, 5, null, total];
    }

    if (cur >= total - 3) {
      return [1, null, total - 4, total - 3, total - 2, total - 1, total];
    }

    return [1, null, cur - 1, cur, cur + 1, null, total];
  }

  goTo(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.pageChange.emit(page);
  }
}
