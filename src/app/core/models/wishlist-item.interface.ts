import { Product } from './product.interface';

export interface WishlistItem {
  id: string;
  product: Product;
  addedAt: Date;
}

export interface WishlistState {
  items: WishlistItem[];
  totalItems: number;
}
