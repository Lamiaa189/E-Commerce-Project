import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-spinner.component.html',
  styleUrl: './loading-spinner.component.css'
})
export class LoadingSpinnerComponent {
  size = input<'sm' | 'md' | 'lg'>('md');
  message = input<string>('');
  centered = input<boolean>(true);
  overlay = input<boolean>(false);

  getSpinnerClasses(): string {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-8 h-8',
      lg: 'w-12 h-12'
    };
    return sizeClasses[this.size()];
  }

  getSvgClasses(): string {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-8 h-8',
      lg: 'w-12 h-12'
    };
    return sizeClasses[this.size()];
  }
}
