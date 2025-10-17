import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CheckoutService } from '../../../core/services/checkout/checkout.service';
import { Order } from '../../../core/models/order.interface';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.css'
})
export class OrderDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly checkoutService = inject(CheckoutService);

  order = signal<Order | null>(null);
  loading = signal<boolean>(true);
  errorMessage = signal<string>('');

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const orderId = params['id'];
      if (orderId) {
        this.loadOrderDetails(orderId);
      } else {
        this.router.navigate(['/orders']);
      }
    });
  }

  private loadOrderDetails(orderId: string): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.checkoutService.getOrderById(orderId).subscribe({
      next: (response) => {
        console.log('Order details response:', response);
        
        if (response.data) {
          this.order.set(response.data);
        } else {
          this.errorMessage.set('Order not found');
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading order details:', error);
        this.errorMessage.set('Failed to load order details. Please try again.');
        this.loading.set(false);
      }
    });
  }

  getOrderStatusClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getOrderStatusText(status: string): string {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'paid':
        return 'Paid';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  }

  getPaymentMethodIcon(paymentMethod: string | undefined): string {
    if (!paymentMethod) return '💳';
    switch (paymentMethod) {
      case 'cash':
        return '💵';
      case 'card':
      case 'stripe':
        return '💳';
      case 'paypal':
        return '🅿️';
      default:
        return '💳';
    }
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCurrency(amount: number | undefined): string {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  goBack(): void {
    this.router.navigate(['/orders']);
  }

  printOrder(): void {
    window.print();
  }

  trackOrder(): void {
    // This would typically open a tracking page or modal
    console.log('Tracking order:', this.order()?.id || this.order()?._id);
    alert('Tracking functionality would be implemented here');
  }

  reorderItems(): void {
    // This would add items from the order back to cart
    console.log('Reordering items from order:', this.order());
    alert('Reorder functionality would be implemented here');
  }

  cancelOrder(): void {
    if (confirm('Are you sure you want to cancel this order?')) {
      // This would call an API to cancel the order
      console.log('Cancelling order:', this.order()?.id || this.order()?._id);
      alert('Cancel order functionality would be implemented here');
    }
  }
}
