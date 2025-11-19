import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skeleton.component.html',
  styleUrls: ['./skeleton.component.scss']
})
export class SkeletonComponent {
  @Input() width = '100%';
  @Input() height = '1rem';
  @Input() borderRadius = '0.25rem';
  @Input() variant: 'text' | 'circular' | 'rectangular' = 'rectangular';

  get computedStyles(): { [key: string]: string } {
    const styles: { [key: string]: string } = {
      width: this.width,
      height: this.height,
      'border-radius': this.borderRadius
    };

    if (this.variant === 'circular') {
      styles['border-radius'] = '50%';
    }

    return styles;
  }
}
