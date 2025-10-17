import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CheckoutService } from '../../../core/services/checkout/checkout.service';
import { Order } from '../../../core/models/order.interface';

@Component({
  selector: 'app-checkout-success',
  imports: [CommonModule],
  templateUrl: './checkout-success.component.html',
  styleUrl: './checkout-success.component.css'
})
export class CheckoutSuccessComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly checkoutService = inject(CheckoutService);

  order = signal<Order | null>(null);
  orderId = signal<string | null>(null);
  loading = signal<boolean>(true);

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const orderId = params['orderId'];
      if (orderId) {
        this.orderId.set(orderId);
        this.loadOrderDetails(orderId);
      } else {
        // If no order ID, try to get current order from service
        const currentOrder = this.checkoutService.getCurrentOrder();
        if (currentOrder) {
          this.order.set(currentOrder);
          this.loading.set(false);
        } else {
          this.router.navigate(['/']);
        }
      }
    });
  }

  private loadOrderDetails(orderId: string): void {
    this.checkoutService.getOrderById(orderId).subscribe({
      next: (response) => {
        if (response.data) {
          this.order.set(response.data);
        } else {
          console.error('No order data found in response:', response);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading order details:', error);
        this.loading.set(false);
      }
    });
  }

  continueShopping(): void {
    this.router.navigate(['/products']);
  }

  viewOrders(): void {
    this.router.navigate(['/orders']);
  }

  printOrder(): void {
    window.print();
  }
}
