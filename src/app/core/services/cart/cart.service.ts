import { Injectable, signal, computed } from '@angular/core';
import { Product } from '../../models/product.interface';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems = signal<CartItem[]>([]);

  // Computed signals for cart state
  cartItemsCount = computed(() => 
    this.cartItems().reduce((total, item) => total + item.quantity, 0)
  );

  cartTotal = computed(() => 
    this.cartItems().reduce((total, item) => total + (item.product.price * item.quantity), 0)
  );

  getCartItems = this.cartItems;

  addToCart(product: Product, quantity: number = 1) {
    const currentItems = this.cartItems();
    const existingItem = currentItems.find(item => item.product.id === product.id);

    if (existingItem) {
      // Update quantity if item already exists
      this.updateQuantity(product.id, existingItem.quantity + quantity);
    } else {
      // Add new item to cart
      this.cartItems.set([...currentItems, { product, quantity }]);
    }
  }

  removeFromCart(productId: string) {
    const currentItems = this.cartItems();
    this.cartItems.set(currentItems.filter(item => item.product.id !== productId));
  }

  updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    const currentItems = this.cartItems();
    this.cartItems.set(
      currentItems.map(item => 
        item.product.id === productId 
          ? { ...item, quantity }
          : item
      )
    );
  }

  clearCart() {
    this.cartItems.set([]);
  }

  isInCart(productId: string): boolean {
    return this.cartItems().some(item => item.product.id === productId);
  }

  getItemQuantity(productId: string): number {
    const item = this.cartItems().find(item => item.product.id === productId);
    return item ? item.quantity : 0;
  }
}
