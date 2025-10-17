import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, from } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { loadStripe, Stripe, StripeElements, StripeCardElement, StripePaymentElement } from '@stripe/stripe-js';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  private readonly httpClient = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;
  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;
  private cardElement: StripeCardElement | null = null;
  private paymentElement: StripePaymentElement | null = null;

  constructor() {
    this.initializeStripe();
  }

  private async initializeStripe(): Promise<void> {
    this.stripe = await loadStripe(environment.stripePublishableKey);
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Create payment intent on the server
  createPaymentIntent(amount: number, currency: string = 'usd'): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}payments/create-payment-intent`, {
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency
    }, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error creating payment intent:', error);
        return throwError(() => error);
      })
    );
  }

  // Confirm payment intent
  confirmPaymentIntent(paymentIntentId: string, clientSecret: string): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}payments/confirm-payment-intent`, {
      paymentIntentId,
      clientSecret
    }, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error confirming payment intent:', error);
        return throwError(() => error);
      })
    );
  }

  // Create Stripe Elements for card input
  async createCardElement(containerId: string): Promise<StripeCardElement | null> {
    if (!this.stripe) {
      await this.initializeStripe();
    }

    if (!this.stripe) {
      throw new Error('Stripe failed to initialize');
    }

    this.elements = this.stripe.elements({
      appearance: {
        theme: 'stripe',
        variables: {
          colorPrimary: '#0570de',
          colorBackground: '#ffffff',
          colorText: '#30313d',
          colorDanger: '#df1b41',
          fontFamily: 'Ideal Sans, system-ui, sans-serif',
          spacingUnit: '2px',
          borderRadius: '4px',
        }
      }
    });

    this.cardElement = this.elements.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#424770',
          '::placeholder': {
            color: '#aab7c4',
          },
        },
        invalid: {
          color: '#9e2146',
        },
      },
    });

    const cardContainer = document.getElementById(containerId);
    if (cardContainer) {
      this.cardElement.mount(cardContainer);
    }

    return this.cardElement;
  }

  // Create Payment Element (recommended by Stripe)
  async createPaymentElement(containerId: string, clientSecret: string): Promise<StripePaymentElement | null> {
    if (!this.stripe) {
      await this.initializeStripe();
    }

    if (!this.stripe) {
      throw new Error('Stripe failed to initialize');
    }

    this.elements = this.stripe.elements({
      clientSecret: clientSecret,
      appearance: {
        theme: 'stripe',
        variables: {
          colorPrimary: '#0570de',
          colorBackground: '#ffffff',
          colorText: '#30313d',
          colorDanger: '#df1b41',
          fontFamily: 'Ideal Sans, system-ui, sans-serif',
          spacingUnit: '2px',
          borderRadius: '4px',
        }
      }
    });

    this.paymentElement = this.elements.create('payment');

    const paymentContainer = document.getElementById(containerId);
    if (paymentContainer) {
      this.paymentElement.mount(paymentContainer);
    }

    return this.paymentElement;
  }

  // Process payment with card element
  async processPaymentWithCard(clientSecret: string): Promise<{ success: boolean; error?: string }> {
    if (!this.stripe || !this.cardElement) {
      return { success: false, error: 'Stripe not initialized' };
    }

    try {
      const { error, paymentIntent } = await this.stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: this.cardElement,
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (paymentIntent.status === 'succeeded') {
        return { success: true };
      }

      return { success: false, error: 'Payment failed' };
    } catch (error) {
      return { success: false, error: 'Payment processing failed' };
    }
  }

  // Process payment with payment element
  async processPaymentWithElement(): Promise<{ success: boolean; error?: string }> {
    if (!this.stripe || !this.paymentElement) {
      return { success: false, error: 'Stripe not initialized' };
    }

    try {
      const { error } = await this.stripe.confirmPayment({
        elements: this.elements!,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Payment processing failed' };
    }
  }

  // Get payment methods for a customer
  getPaymentMethods(customerId: string): Observable<any> {
    return this.httpClient.get(`${this.baseUrl}payments/payment-methods/${customerId}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error fetching payment methods:', error);
        return throwError(() => error);
      })
    );
  }

  // Create customer
  createCustomer(email: string, name: string): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}payments/create-customer`, {
      email,
      name
    }, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error creating customer:', error);
        return throwError(() => error);
      })
    );
  }

  // Clean up elements
  destroyElements(): void {
    if (this.cardElement) {
      this.cardElement.destroy();
      this.cardElement = null;
    }
    if (this.paymentElement) {
      this.paymentElement.destroy();
      this.paymentElement = null;
    }
    this.elements = null;
  }

  // Get Stripe instance
  getStripe(): Stripe | null {
    return this.stripe;
  }
}
