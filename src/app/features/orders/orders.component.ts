import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CheckoutService } from '../../core/services/checkout/checkout.service';
import { Order, ApiResponse } from '../../core/models/order.interface';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent implements OnInit {
  private readonly checkoutService = inject(CheckoutService);
  public readonly router = inject(Router);

  orders = signal<Order[]>([]);
  loading = signal<boolean>(true);
  errorMessage = signal<string>('');
  currentPage = signal<number>(1);
  totalPages = signal<number>(1);
  totalOrders = signal<number>(0);

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(page: number = 1): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.checkoutService.getUserOrders().subscribe({
      next: (response: ApiResponse<Order[]>) => {
        console.log('Orders response:', response);
        
        if (response.data) {
          this.orders.set(response.data);
          this.totalOrders.set(response.results || response.data.length);
          
          if (response.pagination) {
            this.currentPage.set(response.pagination.currentPage);
            this.totalPages.set(response.pagination.numberOfPages);
          }
        } else {
          this.orders.set([]);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.errorMessage.set('Failed to load orders. Please try again.');
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

  viewOrderDetails(orderId: string): void {
    this.router.navigate(['/orders', orderId]);
  }

  trackOrder(orderId: string): void {
    // This would typically open a tracking page or modal
    console.log('Tracking order:', orderId);
    // For now, just show an alert
    alert('Tracking functionality would be implemented here');
  }

  reorderItems(order: Order): void {
    // This would add items from the order back to cart
    console.log('Reordering items from order:', order);
    // For now, just show an alert
    alert('Reorder functionality would be implemented here');
  }

  cancelOrder(orderId: string): void {
    if (confirm('Are you sure you want to cancel this order?')) {
      // This would call an API to cancel the order
      console.log('Cancelling order:', orderId);
      // For now, just show an alert
      alert('Cancel order functionality would be implemented here');
    }
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadOrders(page);
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const total = this.totalPages();
    const current = this.currentPage();
    
    // Show up to 5 page numbers
    let start = Math.max(1, current - 2);
    let end = Math.min(total, start + 4);
    
    // Adjust start if we're near the end
    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  refreshOrders(): void {
    this.loadOrders(this.currentPage());
  }
}
