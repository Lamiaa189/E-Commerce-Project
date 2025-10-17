import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WishlistService } from '../../core/services/wishlist/wishlist.service';
import { WishlistItem } from '../../core/models/wishlist-item.interface';
import { CartService } from '../../core/services/cart/cart.service';
import { Product } from '../../core/models/product.interface';
import { CardComponent } from '../../shared/components/card/card.component';

@Component({
  selector: 'app-wishlist',
  imports: [CommonModule, RouterModule, CardComponent],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.css'
})
export class WishlistComponent implements OnInit {
  private readonly wishlistService = inject(WishlistService);
  private readonly cartService = inject(CartService);

  wishlist = this.wishlistService.wishlist;
  loading = signal<boolean>(false);

  ngOnInit(): void {
    this.loadWishlist();
  }

  loadWishlist(): void {
    this.loading.set(true);
    
    // Get initial wishlist data
    this.wishlist = this.wishlistService.wishlist;
    this.loading.set(false);
  }

  removeFromWishlist(productId: string): void {
    this.wishlistService.removeFromWishlist(productId);
    // The wishlist signal will automatically update due to reactivity
  }

  clearWishlist(): void {
    this.wishlistService.clearWishlist();
    // The wishlist signal will automatically update due to reactivity
  }

  trackByWishlistItemId(index: number, item: WishlistItem): string {
    return item.id;
  }
}
