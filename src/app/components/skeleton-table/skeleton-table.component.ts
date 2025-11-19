import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonComponent } from '../skeleton/skeleton.component';

@Component({
  selector: 'app-skeleton-table',
  standalone: true,
  imports: [CommonModule, SkeletonComponent],
  templateUrl: './skeleton-table.component.html',
  styleUrls: ['./skeleton-table.component.scss']
})
export class SkeletonTableComponent {
  @Input() rows = 10;
  @Input() columns = 6;

  get rowArray(): number[] {
    return Array(this.rows).fill(0);
  }

  get columnArray(): number[] {
    return Array(this.columns).fill(0);
  }
}
