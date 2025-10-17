import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService, CartItem } from '../../core/services/cart/cart.service';

@Component({
  selector: 'app-cart',
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent {
  private cartService = inject(CartService);
  private router = inject(Router);

  cartItems = this.cartService.getCartItems;
  cartTotal = this.cartService.cartTotal;
  cartItemsCount = this.cartService.cartItemsCount;

  removeFromCart(productId: string) {
    this.cartService.removeFromCart(productId);
  }

  updateQuantity(productId: string, quantity: number) {
    this.cartService.updateQuantity(productId, quantity);
  }

  clearCart() {
    this.cartService.clearCart();
  }

  incrementQuantity(item: CartItem) {
    this.updateQuantity(item.product.id, item.quantity + 1);
  }

  decrementQuantity(item: CartItem) {
    this.updateQuantity(item.product.id, item.quantity - 1);
  }

  proceedToCheckout() {
    if (this.cartItems().length > 0) {
      this.router.navigate(['/checkout']);
    }
  }
}
