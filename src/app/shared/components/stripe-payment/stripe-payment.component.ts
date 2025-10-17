import { Component, input, output, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StripeService } from '../../../core/services/stripe/stripe.service';
import { StripeCardElement, StripePaymentElement } from '@stripe/stripe-js';

@Component({
  selector: 'app-stripe-payment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stripe-payment.component.html',
  styleUrl: './stripe-payment.component.css'
})
export class StripePaymentComponent implements OnInit, OnDestroy {
  private readonly stripeService = inject(StripeService);

  // Inputs
  amount = input.required<number>();
  currency = input<string>('usd');
  clientSecret = input<string>('');
  usePaymentElement = input<boolean>(true);
  containerId = input<string>('stripe-payment-element');

  // Outputs
  paymentSuccess = output<{ success: boolean; paymentIntentId?: string; error?: string }>();
  paymentError = output<string>();

  // Signals
  isProcessing = signal<boolean>(false);
  isInitialized = signal<boolean>(false);
  errorMessage = signal<string>('');

  private cardElement: StripeCardElement | null = null;
  private paymentElement: StripePaymentElement | null = null;

  ngOnInit(): void {
    this.initializePayment();
  }

  ngOnDestroy(): void {
    this.stripeService.destroyElements();
  }

  private async initializePayment(): Promise<void> {
    try {
      if (this.usePaymentElement() && this.clientSecret()) {
        this.paymentElement = await this.stripeService.createPaymentElement(
          this.containerId(),
          this.clientSecret()
        );
      } else {
        this.cardElement = await this.stripeService.createCardElement(this.containerId());
      }
      
      this.isInitialized.set(true);
    } catch (error) {
      console.error('Error initializing Stripe payment:', error);
      this.errorMessage.set('Failed to initialize payment form');
      this.paymentError.emit('Failed to initialize payment form');
    }
  }

  async processPayment(): Promise<void> {
    if (!this.isInitialized()) {
      this.errorMessage.set('Payment form not ready');
      return;
    }

    this.isProcessing.set(true);
    this.errorMessage.set('');

    try {
      let result: { success: boolean; error?: string };

      if (this.usePaymentElement() && this.paymentElement) {
        result = await this.stripeService.processPaymentWithElement();
      } else if (this.cardElement) {
        // For card element, we need to create a payment intent first
        // This would typically be done by the parent component
        this.errorMessage.set('Card payment requires payment intent creation');
        this.paymentError.emit('Card payment requires payment intent creation');
        return;
      } else {
        this.errorMessage.set('No payment method available');
        this.paymentError.emit('No payment method available');
        return;
      }

      if (result.success) {
        this.paymentSuccess.emit({ success: true });
      } else {
        this.errorMessage.set(result.error || 'Payment failed');
        this.paymentError.emit(result.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      this.errorMessage.set('Payment processing failed');
      this.paymentError.emit('Payment processing failed');
    } finally {
      this.isProcessing.set(false);
    }
  }

  clearError(): void {
    this.errorMessage.set('');
  }
}
