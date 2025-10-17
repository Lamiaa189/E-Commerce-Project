import { Injectable, signal, computed, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { WishlistItem, WishlistState } from '../../models/wishlist-item.interface';
import { Product } from '../../models/product.interface';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private readonly WISHLIST_STORAGE_KEY = 'ecommerce_wishlist';

  // Signals for reactive state management
  private wishlistItems = signal<WishlistItem[]>([]);

  // Computed signals
  wishlist = computed(() => this.wishlistItems());
  totalItems = computed(() => this.wishlistItems().length);
  isEmpty = computed(() => this.wishlistItems().length === 0);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Initialize wishlist from storage only in browser
    if (isPlatformBrowser(this.platformId)) {
      this.wishlistItems.set(this.loadWishlistFromStorage());
      
      // Listen for storage changes from other tabs
      window.addEventListener('storage', (event) => {
        if (event.key === this.WISHLIST_STORAGE_KEY) {
          this.wishlistItems.set(this.loadWishlistFromStorage());
        }
      });
    }
  }

  /**
   * Add a product to the wishlist
   */
  addToWishlist(product: Product): void {
    const productId = product._id || product.id;
    if (!productId) {
      console.error('Product ID not found');
      return;
    }

    // Check if product is already in wishlist
    if (this.isInWishlist(productId)) {
      console.log('Product already in wishlist');
      return;
    }

    const wishlistItem: WishlistItem = {
      id: productId,
      product: product,
      addedAt: new Date()
    };

    const currentItems = this.wishlistItems();
    const updatedItems = [...currentItems, wishlistItem];
    
    this.wishlistItems.set(updatedItems);
    this.saveWishlistToStorage(updatedItems);
    
    console.log('Product added to wishlist:', product.title);
  }

  /**
   * Remove a product from the wishlist
   */
  removeFromWishlist(productId: string): void {
    const currentItems = this.wishlistItems();
    const updatedItems = currentItems.filter(item => item.id !== productId);
    
    this.wishlistItems.set(updatedItems);
    this.saveWishlistToStorage(updatedItems);
    
    console.log('Product removed from wishlist');
  }

  /**
   * Toggle product in wishlist (add if not present, remove if present)
   */
  toggleWishlist(product: Product): boolean {
    const productId = product._id || product.id;
    if (!productId) {
      console.error('Product ID not found');
      return false;
    }

    if (this.isInWishlist(productId)) {
      this.removeFromWishlist(productId);
      return false; // Removed
    } else {
      this.addToWishlist(product);
      return true; // Added
    }
  }

  /**
   * Check if a product is in the wishlist
   */
  isInWishlist(productId: string): boolean {
    return this.wishlistItems().some(item => item.id === productId);
  }

  /**
   * Get wishlist item by product ID
   */
  getWishlistItem(productId: string): WishlistItem | undefined {
    return this.wishlistItems().find(item => item.id === productId);
  }

  /**
   * Clear the entire wishlist
   */
  clearWishlist(): void {
    this.wishlistItems.set([]);
    this.saveWishlistToStorage([]);
    console.log('Wishlist cleared');
  }

  /**
   * Load wishlist from localStorage
   */
  private loadWishlistFromStorage(): WishlistItem[] {
    if (!isPlatformBrowser(this.platformId)) {
      return [];
    }
    
    try {
      const stored = localStorage.getItem(this.WISHLIST_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert addedAt strings back to Date objects
        return parsed.map((item: any) => ({
          ...item,
          addedAt: new Date(item.addedAt)
        }));
      }
    } catch (error) {
      console.error('Error loading wishlist from storage:', error);
    }
    return [];
  }

  /**
   * Save wishlist to localStorage
   */
  private saveWishlistToStorage(items: WishlistItem[]): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    try {
      localStorage.setItem(this.WISHLIST_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving wishlist to storage:', error);
    }
  }

  /**
   * Get wishlist state for debugging
   */
  getWishlistState(): WishlistState {
    return {
      items: this.wishlistItems(),
      totalItems: this.totalItems()
    };
  }
}
