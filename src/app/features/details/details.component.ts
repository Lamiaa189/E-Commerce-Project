import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductDetailsService } from './services/product-details.service';
import { Product } from '../../core/models/product.interface';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { CartService } from '../../core/services/cart/cart.service';

@Component({
  selector: 'app-details',
  imports: [CommonModule, CarouselModule],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css',
})
export class DetailsComponent implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly productDetailsService = inject(ProductDetailsService);
  private readonly cartService = inject(CartService);

  id = signal<string | null>(null);
  productDetails = signal<Product>({} as Product);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  quantity = signal<number>(1);

  images = signal<string[]>([]);

  // Owl Carousel options
  carouselOptions = {
    items: 1,
    loop: true,
    nav: true,
    dots: true,
    autoplay: true,
    autoplayTimeout: 3000,
    autoplayHoverPause: true,
    navText: ['<i class="fas fa-chevron-left"></i>', '<i class="fas fa-chevron-right"></i>'],
    responsive: {
      0: {
        items: 1
      },
      768: {
        items: 1
      },
      1024: {
        items: 1
      }
    }
  };



  ngOnInit(): void {
    this.getProductId();
  }

  getProductId(): void {
    this.activatedRoute.paramMap.subscribe({
      next: (urlParams) => {
        this.id.set(urlParams.get('id'));
        if(urlParams.get('id')) {
          this.getProductDetailsData();
        }
      },
    });
  }

  getProductDetailsData(): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.productDetailsService.getProductDetails(this.id()).subscribe({
      next: (res) => {
        this.productDetails.set(res.data);
        // Set images array for Owl Carousel
        this.images.set(res.data.images);
        console.log('Images loaded for Owl Carousel:', res.data.images);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error fetching product details:', err);
        this.error.set('Failed to load product details. Please try again.');
        this.loading.set(false);
      }
    });
  }

  addToCart() {
    this.cartService.addToCart(this.productDetails(), this.quantity());
  }

  isInCart(): boolean {
    return this.cartService.isInCart(this.productDetails().id);
  }

  incrementQuantity() {
    this.quantity.set(this.quantity() + 1);
  }

  decrementQuantity() {
    if (this.quantity() > 1) {
      this.quantity.set(this.quantity() - 1);
    }
  }

}
