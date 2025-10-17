import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment.development';
import { Order, CreateOrderRequest, PaymentMethod } from '../../models/order.interface';
import { CartItem } from '../cart/cart.service';
import { StripeService } from '../stripe/stripe.service';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private readonly httpClient = inject(HttpClient);
  private readonly stripeService = inject(StripeService);
  private readonly baseUrl = environment.baseUrl;

  private orderSubject = new BehaviorSubject<Order | null>(null);
  public order$ = this.orderSubject.asObservable();

  // Payment methods available
  paymentMethods: PaymentMethod[] = [
    {
      id: 'cash',
      name: 'Cash on Delivery',
      type: 'cash',
      icon: '💵',
      description: 'Pay when your order is delivered'
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      type: 'card',
      icon: '💳',
      description: 'Pay securely with your card'
    }
  ];

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  createOrder(cartItems: CartItem[], orderData: CreateOrderRequest): Observable<any> {
    const orderPayload = {
      shippingAddress: orderData.shippingAddress,
      paymentMethodType: orderData.paymentMethodType,
      cartItems: cartItems.map(item => ({
        product: item.product.id,
        quantity: item.quantity,
        price: item.product.price
      }))
    };

    return this.httpClient.post(`${this.baseUrl}orders`, orderPayload, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response),
      catchError(error => {
        console.error('Error creating order:', error);
        return throwError(() => error);
      })
    );
  }

  getOrderById(orderId: string): Observable<any> {
    return this.httpClient.get(`${this.baseUrl}orders/${orderId}`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response),
      catchError(error => {
        console.error('Error fetching order:', error);
        return throwError(() => error);
      })
    );
  }

  getUserOrders(): Observable<any> {
    return this.httpClient.get(`${this.baseUrl}orders/user/orders`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response),
      catchError(error => {
        console.error('Error fetching user orders:', error);
        return throwError(() => error);
      })
    );
  }

  updateOrderToPaid(orderId: string): Observable<any> {
    return this.httpClient.put(`${this.baseUrl}orders/${orderId}/pay`, {}, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response),
      catchError(error => {
        console.error('Error updating order to paid:', error);
        return throwError(() => error);
      })
    );
  }

  updateOrderToDelivered(orderId: string): Observable<any> {
    return this.httpClient.put(`${this.baseUrl}orders/${orderId}/deliver`, {}, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response),
      catchError(error => {
        console.error('Error updating order to delivered:', error);
        return throwError(() => error);
      })
    );
  }

  setCurrentOrder(order: Order): void {
    this.orderSubject.next(order);
  }

  getCurrentOrder(): Order | null {
    return this.orderSubject.value;
  }

  clearCurrentOrder(): void {
    this.orderSubject.next(null);
  }

  // Process payment based on payment method
  processPayment(orderId: string, paymentMethod: string, amount?: number): Observable<any> {
    if (paymentMethod === 'cash') {
      // For cash on delivery, just mark as paid
      return this.updateOrderToPaid(orderId);
    } else if (paymentMethod === 'card') {
      // For card payments, return a simple success response
      // The actual URL will be fetched separately
      return new Observable(observer => {
        observer.next({ success: true, paymentMethod: 'card' });
        observer.complete();
      });
    } else {
      return throwError(() => new Error('Invalid payment method'));
    }
  }

  // Create Stripe payment intent and return checkout URL
  private createStripePaymentIntent(orderId: string): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}payments/create-checkout-session`, {
      orderId: orderId
    }, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response),
      catchError(error => {
        console.error('Error creating Stripe payment intent:', error);
        return throwError(() => error);
      })
    );
  }

  // Create payment URL for any payment gateway
  createPaymentUrl(orderId: string, paymentMethod: string, amount: number): Observable<any> {
    const payload = {
      orderId: orderId,
      paymentMethod: paymentMethod,
      amount: amount,
      returnUrl: `${window.location.origin}/checkout/success?orderId=${orderId}`,
      cancelUrl: `${window.location.origin}/checkout`
    };

    return this.httpClient.post(`${this.baseUrl}payments/create-payment-url`, payload, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response),
      catchError(error => {
        console.error('Error creating payment URL:', error);
        return throwError(() => error);
      })
    );
  }

  // Get checkout session URL from the specific API endpoint
  getCheckoutSessionUrl(orderId: string): Observable<any> {
    const url = `${this.baseUrl}orders/checkout-session/${orderId}?url=${encodeURIComponent(window.location.origin)}`;
    console.log('Calling checkout session URL:', url);
    
    return this.httpClient.get(url, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response),
      catchError(error => {
        console.error('Error getting checkout session URL:', error);
        return throwError(() => error);
      })
    );
  }

  // Calculate order summary
  calculateOrderSummary(cartItems: CartItem[], shippingCost: number = 0) {
    const subtotal = cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax + shippingCost;

    return {
      subtotal,
      tax,
      shipping: shippingCost,
      total
    };
  }
}
