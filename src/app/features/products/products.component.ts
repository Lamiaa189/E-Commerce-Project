import { Component, inject, OnInit, signal } from '@angular/core';
import { ProductsService } from '../../core/services/products/products.service';
import { Product } from '../../core/models/product.interface';
import { CardComponent } from '../../shared/components/card/card.component';
import {NgxPaginationModule} from 'ngx-pagination';

@Component({
  selector: 'app-products',
  imports: [CardComponent, NgxPaginationModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
})
export class ProductsComponent implements OnInit {
  private readonly productsService = inject(ProductsService);

  productsList = signal<Product[]>([]);

  pageSize!:number;
  p!:number;
  total!:number;

  ngOnInit(): void {
    this.getAllProductsData();
  }

  getAllProductsData(pageNumber: number = 1): void {
    this.productsService.getAllProducts(pageNumber).subscribe({
      next: (res) => {
        this.productsList.set(res.data);
        this.pageSize = res.metadata.limit;
        this.p = res.metadata.currentPage;
        this.total = res.results;
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}
