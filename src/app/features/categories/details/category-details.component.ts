import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoriesService } from '../../../core/services/categories/categories.service';
import { Category } from '../../../core/models/category.interface';
import { Product } from '../../../core/models/product.interface';
import { CardComponent } from '../../../shared/components/card/card.component';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-category-details',
  imports: [CommonModule, CardComponent, NgxPaginationModule],
  templateUrl: './category-details.component.html',
  styleUrl: './category-details.component.css'
})
export class CategoryDetailsComponent implements OnInit {
  private readonly categoriesService = inject(CategoriesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  category = signal<Category | null>(null);
  products = signal<Product[]>([]);
  loading = signal<boolean>(false);
  productsLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  currentPage = signal<number>(1);
  pageSize = signal<number>(12);
  totalProducts = signal<number>(0);
  categoryId = signal<string | null>(null);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.categoryId.set(id);
        this.loadCategoryDetails(id);
        this.loadCategoryProducts(id);
      }
    });
  }

  loadCategoryDetails(categoryId: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.categoriesService.getCategoryById(categoryId).subscribe({
      next: (response) => {
        if (response.data) {
          this.category.set(response.data);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading category details:', error);
        this.error.set('Failed to load category details. Please try again.');
        this.loading.set(false);
      }
    });
  }

  loadCategoryProducts(categoryId: string, pageNumber: number = 1): void {
    this.productsLoading.set(true);

    this.categoriesService.getCategoryProducts(categoryId, pageNumber).subscribe({
      next: (response) => {
        console.log('Category products response:', response);
        
        // Handle different possible response structures
        let products = [];
        let totalCount = 0;

        if (response.data && Array.isArray(response.data)) {
          products = response.data;
          totalCount = response.results || response.data.length;
        } else if (Array.isArray(response)) {
          // If response is directly an array
          products = response;
          totalCount = response.length;
        } else if (response.products && Array.isArray(response.products)) {
          // If products are in a 'products' property
          products = response.products;
          totalCount = response.total || response.products.length;
        }

        this.products.set(products);
        this.totalProducts.set(totalCount);
        
        console.log(`Loaded ${products.length} products for category ${categoryId}`);
        this.productsLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading category products:', error);
        this.products.set([]);
        this.totalProducts.set(0);
        this.productsLoading.set(false);
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    if (this.categoryId()) {
      this.loadCategoryProducts(this.categoryId()!, page);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getTotalPages(): number {
    return Math.ceil(this.totalProducts() / this.pageSize());
  }

  goBackToCategories(): void {
    this.router.navigate(['/categories']);
  }

  // Debug method to test API endpoints
  testApiEndpoints(): void {
    console.log('Testing API endpoints...');
    
    // Test 1: Get all products
    this.categoriesService.getCategoryProducts('', 1).subscribe({
      next: (response) => console.log('All products response:', response),
      error: (error) => console.error('All products error:', error)
    });

    // Test 2: Get products with category filter
    if (this.categoryId()) {
      this.categoriesService.getCategoryProducts(this.categoryId()!, 1).subscribe({
        next: (response) => console.log('Category products response:', response),
        error: (error) => console.error('Category products error:', error)
      });
    }
  }

  onImageError(event: any): void {
    console.warn('Category image failed to load:', event.target.src);
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
