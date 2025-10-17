import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-message.component.html',
  styleUrl: './error-message.component.css'
})
export class ErrorMessageComponent {
  message = input.required<string>();
  title = input<string>('Error');
  showIcon = input<boolean>(true);
  size = input<'sm' | 'md' | 'lg'>('md');
  variant = input<'error' | 'warning' | 'info'>('error');
  dismissible = input<boolean>(false);
  onDismiss = input<() => void>();

  getContainerClasses(): string {
    const baseClasses = 'rounded-md p-4';
    const sizeClasses = {
      'sm': 'p-3 text-sm',
      'md': 'p-4 text-base',
      'lg': 'p-6 text-lg'
    };
    const variantClasses = {
      'error': 'bg-red-50 border border-red-200',
      'warning': 'bg-yellow-50 border border-yellow-200',
      'info': 'bg-blue-50 border border-blue-200'
    };
    
    return `${baseClasses} ${sizeClasses[this.size()]} ${variantClasses[this.variant()]}`;
  }

  getIconClasses(): string {
    const sizeClasses = {
      'sm': 'h-4 w-4',
      'md': 'h-5 w-5',
      'lg': 'h-6 w-6'
    };
    const variantClasses = {
      'error': 'text-red-400',
      'warning': 'text-yellow-400',
      'info': 'text-blue-400'
    };
    
    return `${sizeClasses[this.size()]} ${variantClasses[this.variant()]}`;
  }

  getContentClasses(): string {
    return 'ml-3 flex-1';
  }

  getTitleClasses(): string {
    const sizeClasses = {
      'sm': 'text-sm font-medium',
      'md': 'text-sm font-medium',
      'lg': 'text-base font-medium'
    };
    const variantClasses = {
      'error': 'text-red-800',
      'warning': 'text-yellow-800',
      'info': 'text-blue-800'
    };
    
    return `${sizeClasses[this.size()]} ${variantClasses[this.variant()]}`;
  }

  getMessageClasses(): string {
    const sizeClasses = {
      'sm': 'mt-1 text-sm',
      'md': 'mt-2 text-sm',
      'lg': 'mt-2 text-base'
    };
    const variantClasses = {
      'error': 'text-red-700',
      'warning': 'text-yellow-700',
      'info': 'text-blue-700'
    };
    
    return `${sizeClasses[this.size()]} ${variantClasses[this.variant()]}`;
  }

  getDismissButtonClasses(): string {
    const sizeClasses = {
      'sm': 'p-1.5',
      'md': 'p-1.5',
      'lg': 'p-2'
    };
    const variantClasses = {
      'error': 'bg-red-50 text-red-500 hover:bg-red-100',
      'warning': 'bg-yellow-50 text-yellow-500 hover:bg-yellow-100',
      'info': 'bg-blue-50 text-blue-500 hover:bg-blue-100'
    };
    
    return `inline-flex rounded-md ${sizeClasses[this.size()]} ${variantClasses[this.variant()]} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-gray-600`;
  }
}
