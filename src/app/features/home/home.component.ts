import { Component, inject, OnInit, signal } from '@angular/core';
import { ProductsService } from '../../core/services/products/products.service';
import { Product } from '../../core/models/product.interface';
import { MainSliderComponent } from "./components/main-slider/main-slider.component";
import { PopularCategoriesComponent } from "./components/popular-categories/popular-categories.component";
import { PopularProductsComponent } from "./components/popular-products/popular-products.component";

@Component({
  selector: 'app-home',
  imports: [MainSliderComponent, PopularCategoriesComponent, PopularProductsComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
}
