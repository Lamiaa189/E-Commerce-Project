import { Component, input, inject, signal } from '@angular/core';
import { Product } from '../../../core/models/product.interface';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart/cart.service';
import { WishlistService } from '../../../core/services/wishlist/wishlist.service';

@Component({
  selector: 'app-card',
  imports: [RouterLink],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css'
})
export class CardComponent {
  product = input.required<Product>();
  private cartService = inject(CartService);
  private wishlistService = inject(WishlistService);

  addingToCart = signal<boolean>(false);
  addingToWishlist = signal<boolean>(false);

  addToCart() {
    const product = this.product();
    const productId = product._id || product.id;
    if (!productId) {
      console.error('Product ID not found');
      return;
    }

    this.addingToCart.set(true);

    // Simulate API call delay for better UX
    setTimeout(() => {
      try {
        this.cartService.addToCart(product, 1);
        console.log('Product added to cart:', product.title);
      } catch (error) {
        console.error('Error adding to cart:', error);
      } finally {
        this.addingToCart.set(false);
      }
    }, 500);
  }

  toggleWishlist() {
    const product = this.product();
    this.addingToWishlist.set(true);

    // Simulate API call delay for better UX
    setTimeout(() => {
      try {
        const added = this.wishlistService.toggleWishlist(product);
        console.log(added ? 'Added to wishlist' : 'Removed from wishlist', product.title);
      } catch (error) {
        console.error('Error toggling wishlist:', error);
      } finally {
        this.addingToWishlist.set(false);
      }
    }, 300);
  }

  isInCart(): boolean {
    const product = this.product();
    const productId = product._id || product.id;
    return this.cartService.isInCart(productId);
  }

  isInWishlist(): boolean {
    const product = this.product();
    const productId = product._id || product.id;
    return this.wishlistService.isInWishlist(productId);
  }

  getCartQuantity(): number {
    const product = this.product();
    const productId = product._id || product.id;
    return this.cartService.getItemQuantity(productId);
  }
}
