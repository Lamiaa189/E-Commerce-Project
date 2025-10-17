import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CategoriesService } from '../../core/services/categories/categories.service';
import { Category } from '../../core/models/category.interface';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-categories',
  imports: [CommonModule, FormsModule, NgxPaginationModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css'
})
export class CategoriesComponent implements OnInit {
  private readonly categoriesService = inject(CategoriesService);
  private readonly router = inject(Router);

  categories = signal<Category[]>([]);
  filteredCategories = signal<Category[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  searchTerm = signal<string>('');
  currentPage = signal<number>(1);
  pageSize = signal<number>(12);
  totalCategories = signal<number>(0);

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading.set(true);
    this.error.set(null);

    this.categoriesService.getAllCategories().subscribe({
      next: (response) => {
        if (response.data) {
          console.log('Categories loaded:', response.data);
          // Log first few categories to debug image URLs
          response.data.slice(0, 3).forEach((category: any) => {
            console.log(`Category: ${category.name}`);
            console.log(`Original image URL: ${category.image}`);
            console.log(`Processed image URL: ${this.getImageUrl(category.image)}`);
          });
          this.categories.set(response.data);
          this.filteredCategories.set(response.data);
          this.totalCategories.set(response.data.length);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.error.set('Failed to load categories. Please try again.');
        this.loading.set(false);
      }
    });
  }

  onSearchChange(): void {
    const term = this.searchTerm().toLowerCase().trim();
    
    if (!term) {
      this.filteredCategories.set(this.categories());
      return;
    }

    const filtered = this.categories().filter(category =>
      category.name.toLowerCase().includes(term) ||
      category.slug.toLowerCase().includes(term)
    );

    this.filteredCategories.set(filtered);
    this.currentPage.set(1);
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.filteredCategories.set(this.categories());
    this.currentPage.set(1);
  }

  viewCategory(category: Category): void {
    this.router.navigate(['/categories', category.slug, category._id]);
  }

  getPaginatedCategories(): Category[] {
    const startIndex = (this.currentPage() - 1) * this.pageSize();
    const endIndex = startIndex + this.pageSize();
    return this.filteredCategories().slice(startIndex, endIndex);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredCategories().length / this.pageSize());
  }

  onImageError(event: any): void {
    console.warn('Image failed to load:', event.target.src);
    // Set a fallback image
    event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04MCA4MEgxMjBWMTIwSDgwVjgwWiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNODUgODVIMTE1VjExNUg4NVY4NVoiIGZpbGw9IiM2QjcyODAiLz4KPC9zdmc+';
  }

  onImageLoad(): void {
    // Image loaded successfully - no action needed
  }

  getImageUrl(imagePath: string): string {
    if (!imagePath) return '';
    
    // If the image path is already a full URL, return it as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // If it's a relative path, prepend the base URL
    if (imagePath.startsWith('/')) {
      return `https://ecommerce.routemisr.com${imagePath}`;
    }
    
    // If it's just a filename or relative path, prepend the base URL with proper path
    return `https://ecommerce.routemisr.com/api/v1/${imagePath}`;
  }
}

