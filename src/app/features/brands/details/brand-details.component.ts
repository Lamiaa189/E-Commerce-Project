import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { BrandsService } from '../../../core/services/brands/brands.service';
import { CartService } from '../../../core/services/cart/cart.service';
import { Brand } from '../../../core/models/brand.interface';
import { Product } from '../../../core/models/product.interface';
import { CardComponent } from '../../../shared/components/card/card.component';

@Component({
  selector: 'app-brand-details',
  imports: [CommonModule, FormsModule, NgxPaginationModule, CardComponent, RouterModule],
  templateUrl: './brand-details.component.html',
  styleUrl: './brand-details.component.css'
})
export class BrandDetailsComponent implements OnInit {
  private readonly brandsService = inject(BrandsService);
  private readonly cartService = inject(CartService);
  readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  brand = signal<Brand | null>(null);
  products = signal<Product[]>([]);
  loading = signal<boolean>(false);
  productsLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  currentPage = signal<number>(1);
  pageSize = signal<number>(12);
  totalProducts = signal<number>(0);
  searchTerm = signal<string>('');
  sortBy = signal<string>('name');
  sortOrder = signal<string>('asc');

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const brandId = params['id'];
      if (brandId) {
        this.loadBrandDetails(brandId);
        this.loadBrandProducts(brandId);
      }
    });
  }

  loadBrandDetails(brandId: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.brandsService.getBrandById(brandId).subscribe({
      next: (response) => {
        if (response.data) {
          this.brand.set(response.data);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading brand details:', error);
        this.error.set('Failed to load brand details. Please try again.');
        this.loading.set(false);
      }
    });
  }

  loadBrandProducts(brandId: string, pageNumber: number = 1): void {
    this.productsLoading.set(true);

    this.brandsService.getBrandProducts(
      brandId, 
      pageNumber, 
      this.searchTerm(), 
      this.sortBy(), 
      this.sortOrder()
    ).subscribe({
      next: (response) => {
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

        // Map API response to Product interface
        const mappedProducts = products.map((product: any) => this.mapToProduct(product));
        this.products.set(mappedProducts);
        this.totalProducts.set(totalCount);

        this.productsLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading brand products:', error);
        this.products.set([]);
        this.totalProducts.set(0);
        this.productsLoading.set(false);
      }
    });
  }

  onSearchChange(): void {
    this.currentPage.set(1);
    const brandId = this.route.snapshot.params['id'];
    if (brandId) {
      this.loadBrandProducts(brandId, 1);
    }
  }

  onSortChange(): void {
    this.currentPage.set(1);
    const brandId = this.route.snapshot.params['id'];
    if (brandId) {
      this.loadBrandProducts(brandId, 1);
    }
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    const brandId = this.route.snapshot.params['id'];
    if (brandId) {
      this.loadBrandProducts(brandId, page);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getTotalPages(): number {
    return Math.ceil(this.totalProducts() / this.pageSize());
  }

  viewProduct(product: any): void {
    this.router.navigate(['/products', product.slug, product._id]);
  }

  mapToProduct(apiProduct: any): Product {
    return {
      sold: apiProduct.sold || 0,
      images: apiProduct.images || [],
      subcategory: apiProduct.subcategory || [],
      ratingsQuantity: apiProduct.ratingsQuantity || 0,
      _id: apiProduct._id || apiProduct.id,
      title: apiProduct.title || '',
      slug: apiProduct.slug || '',
      description: apiProduct.description || '',
      quantity: apiProduct.quantity || 0,
      price: apiProduct.price || 0,
      priceAfterDiscount: apiProduct.priceAfterDiscount || undefined,
      imageCover: apiProduct.imageCover || '',
      category: apiProduct.category || { _id: '', name: '', slug: '', image: '' },
      brand: apiProduct.brand || { _id: '', name: '', slug: '', image: '' },
      ratingsAverage: apiProduct.ratingsAverage || 0,
      createdAt: apiProduct.createdAt || '',
      updatedAt: apiProduct.updatedAt || '',
      id: apiProduct._id || apiProduct.id
    };
  }

}
