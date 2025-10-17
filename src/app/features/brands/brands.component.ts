import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { BrandsService } from '../../core/services/brands/brands.service';
import { Brand } from '../../core/models/brand.interface';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-brands',
  imports: [CommonModule, FormsModule, NgxPaginationModule, RouterModule],
  templateUrl: './brands.component.html',
  styleUrl: './brands.component.css'
})
export class BrandsComponent implements OnInit {
  private readonly brandsService = inject(BrandsService);
  private readonly router = inject(Router);

  brands = signal<Brand[]>([]);
  filteredBrands = signal<Brand[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  searchTerm = signal<string>('');
  currentPage = signal<number>(1);
  pageSize = signal<number>(12);
  totalBrands = signal<number>(0);
  imageLoaded = signal<boolean>(false);

  ngOnInit(): void {
    this.loadBrands();
  }

  loadBrands(): void {
    this.loading.set(true);
    this.error.set(null);

    this.brandsService.getAllBrands().subscribe({
      next: (response) => {
        if (response.data) {
          this.brands.set(response.data);
          this.filteredBrands.set(response.data);
          this.totalBrands.set(response.data.length);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading brands:', error);
        this.error.set('Failed to load brands. Please try again.');
        this.loading.set(false);
      }
    });
  }

  onSearchChange(): void {
    const term = this.searchTerm().toLowerCase().trim();
    
    if (!term) {
      this.filteredBrands.set(this.brands());
      return;
    }

    const filtered = this.brands().filter(brand =>
      brand.name.toLowerCase().includes(term) ||
      brand.slug.toLowerCase().includes(term)
    );

    this.filteredBrands.set(filtered);
    this.currentPage.set(1);
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.filteredBrands.set(this.brands());
    this.currentPage.set(1);
  }

  viewBrand(brand: Brand): void {
    this.router.navigate(['/brands', brand.slug, brand._id]);
  }

  getPaginatedBrands(): Brand[] {
    const startIndex = (this.currentPage() - 1) * this.pageSize();
    const endIndex = startIndex + this.pageSize();
    return this.filteredBrands().slice(startIndex, endIndex);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredBrands().length / this.pageSize());
  }

  onImageError(event: any): void {
    console.warn('Brand image failed to load:', event.target.src);
    this.imageLoaded.set(true);
    event.target.style.display = 'none';
  }

  onImageLoad(): void {
    this.imageLoaded.set(true);
  }

  trackByBrandId(index: number, brand: Brand): string {
    return brand._id;
  }
}
