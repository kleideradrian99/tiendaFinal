import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'star-rating',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="star-rating-container" [style.fontSize]="size || '24px'">
      <span *ngFor="let star of stars" 
            (click)="setRating(star)" 
            [style.color]="star <= value ? checkedcolor : uncheckedcolor"
            style="cursor: pointer; margin-right: 5px; user-select: none;">
        ★
      </span>
    </div>
  `,
  styles: [`
    .star-rating-container {
      display: inline-flex;
      align-items: center;
    }
  `]
})
export class StarRatingComponent {
  @Input() value: number = 5;
  @Input() size: string = '24px';
  @Input() checkedcolor: string = 'gold';
  @Input() uncheckedcolor: string = 'gray';
  @Input() totalstars: number = 5;
  @Output() rate = new EventEmitter<any>();

  get stars(): number[] {
    const total = Number(this.totalstars) || 5;
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  setRating(newValue: number) {
    this.value = newValue;
    this.rate.emit({ newValue });
  }
}
