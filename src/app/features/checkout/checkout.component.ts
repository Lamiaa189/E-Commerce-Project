import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService, CartItem } from '../../core/services/cart/cart.service';
import { CheckoutService } from '../../core/services/checkout/checkout.service';
import { Order, CreateOrderRequest, PaymentMethod, ApiResponse } from '../../core/models/order.interface';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit {
  private readonly cartService = inject(CartService);
  private readonly checkoutService = inject(CheckoutService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  checkoutForm!: FormGroup;
  paymentMethods: PaymentMethod[] = [];
  selectedPaymentMethod = signal<string>('cash');
  cartItems = signal<CartItem[]>([]);
  orderSummary = signal<any>(null);
  isProcessing = signal<boolean>(false);
  currentStep = signal<number>(1);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  ngOnInit(): void {
    this.initializeForm();
    this.loadCartItems();
    this.paymentMethods = this.checkoutService.paymentMethods;
  }

  private initializeForm(): void {
    this.checkoutForm = this.fb.group({
      shippingAddress: this.fb.group({
        details: ['', [Validators.required, Validators.minLength(10)]],
        phone: ['', [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]],
        city: ['', [Validators.required, Validators.minLength(2)]],
        postalCode: ['']
      }),
      paymentMethod: ['cash', Validators.required]
    });
  }

  private loadCartItems(): void {
    const items = this.cartService.getCartItems;
    console.log('Loading cart items:', items());
    this.cartItems.set(items());
    
    if (items().length === 0) {
      console.log('Cart is empty, redirecting to cart page');
      this.router.navigate(['/cart']);
      return;
    }

    const summary = this.checkoutService.calculateOrderSummary(items());
    console.log('Order summary calculated:', summary);
    this.orderSummary.set(summary);
  }

  selectPaymentMethod(methodId: string): void {
    this.selectedPaymentMethod.set(methodId);
    this.checkoutForm.patchValue({ paymentMethod: methodId });
  }

  nextStep(): void {
    if (this.currentStep() === 1 && this.checkoutForm.get('shippingAddress')?.valid) {
      this.currentStep.set(2);
    } else if (this.currentStep() === 2) {
      this.currentStep.set(3);
    }
  }

  previousStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.set(this.currentStep() - 1);
    }
  }

  processOrder(): void {
    console.log('processOrder called');
    console.log('Form valid:', this.checkoutForm.valid);
    console.log('Form errors:', this.checkoutForm.errors);
    console.log('Cart items length:', this.cartItems().length);
    console.log('Form value:', this.checkoutForm.value);
    
    if (!this.checkoutForm.valid || this.cartItems().length === 0) {
      console.log('Form validation failed');
      this.errorMessage.set('Please fill in all required fields and ensure your cart is not empty.');
      return;
    }

    console.log('Starting order processing...');
    this.isProcessing.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const orderData: CreateOrderRequest = {
      shippingAddress: this.checkoutForm.value.shippingAddress,
      paymentMethodType: this.checkoutForm.value.paymentMethod
    };

    // Create order
    this.checkoutService.createOrder(this.cartItems(), orderData).subscribe({
      next: (response: ApiResponse<Order>) => {
        if (response.data) {
          const order: Order = response.data;
          this.checkoutService.setCurrentOrder(order);

          // Process payment
          this.checkoutService.processPayment(
            order.id || order._id || '',
            this.checkoutForm.value.paymentMethod,
            this.orderSummary()?.total
          ).subscribe({
            next: (paymentResponse) => {
              console.log('Payment response received:', paymentResponse);
              console.log('Payment method:', this.checkoutForm.value.paymentMethod);
              
              // Handle different payment methods
              if (this.checkoutForm.value.paymentMethod === 'cash') {
                // For cash payments, show success message and proceed normally
                this.successMessage.set('Order placed successfully! You will pay when your order is delivered.');
                this.cartService.clearCart();
                
                // Navigate to success page after a short delay
                setTimeout(() => {
                  this.router.navigate(['/checkout/success'], { 
                    queryParams: { orderId: order.id || order._id } 
                  });
                }, 2000);
              } else if (this.checkoutForm.value.paymentMethod === 'card') {
                // For credit card payments, get checkout session URL
                this.getCheckoutSessionUrl(order.id || order._id || '');
              } else {
                // For other payment methods, check if response contains a URL
                if (paymentResponse?.url || paymentResponse?.data?.url) {
                  const url = paymentResponse?.url || paymentResponse?.data?.url;
                  console.log('Opening payment URL:', url);
                  this.openPaymentUrl(url, this.checkoutForm.value.paymentMethod);
                } else {
                  // Clear cart after successful order
                  this.cartService.clearCart();
                  
                  // Navigate to success page
                  this.router.navigate(['/checkout/success'], { 
                    queryParams: { orderId: order.id || order._id } 
                  });
                }
              }
            },
            error: (paymentError) => {
              console.error('Payment processing failed:', paymentError);
              this.errorMessage.set('Payment processing failed. Please try again.');
              this.isProcessing.set(false);
            }
          });
        }
      },
      error: (error) => {
        console.error('Order creation failed:', error);
        this.errorMessage.set('Failed to create order. Please try again.');
        this.isProcessing.set(false);
      }
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.checkoutForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength']) return `${fieldName} is too short`;
      if (field.errors['pattern']) return `Invalid ${fieldName} format`;
    }
    return '';
  }

  getNestedFieldError(groupName: string, fieldName: string): string {
    const group = this.checkoutForm.get(groupName);
    const field = group?.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength']) return `${fieldName} is too short`;
      if (field.errors['pattern']) return `Invalid ${fieldName} format`;
    }
    return '';
  }

  clearError(): void {
    this.errorMessage.set('');
  }

  clearSuccess(): void {
    this.successMessage.set('');
  }

  onCompleteButtonClick(): void {
    console.log('Complete button clicked');
    this.processOrder();
  }

  // Debug method to check form validation
  checkFormValidation(): void {
    console.log('=== Form Validation Debug ===');
    console.log('Form valid:', this.checkoutForm.valid);
    console.log('Form value:', this.checkoutForm.value);
    console.log('Form errors:', this.checkoutForm.errors);
    
    // Check individual field errors
    const shippingAddress = this.checkoutForm.get('shippingAddress');
    console.log('Shipping address valid:', shippingAddress?.valid);
    console.log('Shipping address errors:', shippingAddress?.errors);
    
    const details = this.checkoutForm.get('shippingAddress.details');
    console.log('Details valid:', details?.valid);
    console.log('Details errors:', details?.errors);
    console.log('Details value:', details?.value);
    
    const phone = this.checkoutForm.get('shippingAddress.phone');
    console.log('Phone valid:', phone?.valid);
    console.log('Phone errors:', phone?.errors);
    console.log('Phone value:', phone?.value);
    
    const city = this.checkoutForm.get('shippingAddress.city');
    console.log('City valid:', city?.valid);
    console.log('City errors:', city?.errors);
    console.log('City value:', city?.value);
    
    const paymentMethod = this.checkoutForm.get('paymentMethod');
    console.log('Payment method valid:', paymentMethod?.valid);
    console.log('Payment method errors:', paymentMethod?.errors);
    console.log('Payment method value:', paymentMethod?.value);
    
    console.log('Cart items:', this.cartItems());
    console.log('=============================');
  }

  private openPaymentUrl(url: string, paymentMethod: string): void {
    console.log('Attempting to open payment URL:', url);
    console.log('Payment method:', paymentMethod);
    
    if (paymentMethod === 'stripe' || paymentMethod === 'card') {
      // For Stripe/card payments, navigate directly to the URL
      console.log('Navigating to payment URL:', url);
      this.successMessage.set('Redirecting to payment page...');
      
      // Clear cart before navigation
      this.cartService.clearCart();
      
      // Navigate to the payment URL
      window.location.href = url;
    } else {
      // For other payment methods, open in new tab
      const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
      
      if (newWindow) {
        console.log('Payment window opened successfully');
        // Show success message
        this.successMessage.set('Redirecting to payment page...');
        
        // Listen for the window to close or focus change
        const checkClosed = setInterval(() => {
          if (newWindow.closed) {
            console.log('Payment window was closed');
            clearInterval(checkClosed);
            // Payment window was closed, check payment status
            this.checkPaymentStatus();
          }
        }, 1000);
        
        // Also listen for focus events
        window.addEventListener('focus', () => {
          console.log('Window focus detected');
          clearInterval(checkClosed);
          this.checkPaymentStatus();
        });
      } else {
        console.log('Failed to open payment window - popup blocked');
        // Popup was blocked, show error
        this.errorMessage.set('Please allow popups for this site to complete payment');
      }
    }
  }

  private checkPaymentStatus(): void {
    // This method would check the payment status
    // For now, we'll just navigate to success page
    this.router.navigate(['/checkout/success']);
  }

  private getTestPaymentUrl(paymentMethod: string): string {
    const baseUrl = 'https://example-payment-gateway.com/checkout';
    const orderId = this.checkoutService.getCurrentOrder()?.id || this.checkoutService.getCurrentOrder()?._id || 'test-order';
    
    switch (paymentMethod) {
      case 'stripe':
        return `${baseUrl}/stripe?orderId=${orderId}&amount=${this.orderSummary()?.total}`;
      case 'paypal':
        return `${baseUrl}/paypal?orderId=${orderId}&amount=${this.orderSummary()?.total}`;
      case 'razorpay':
        return `${baseUrl}/razorpay?orderId=${orderId}&amount=${this.orderSummary()?.total}`;
      default:
        return `${baseUrl}/generic?orderId=${orderId}&amount=${this.orderSummary()?.total}`;
    }
  }

  // Test method to verify URL opening functionality
  testUrlOpening(): void {
    console.log('Testing URL opening functionality...');
    
    // Test with different URLs
    const testUrls = [
      'https://www.google.com',
      'https://www.stripe.com',
      'https://www.paypal.com',
      'https://www.razorpay.com'
    ];
    
    const randomUrl = testUrls[Math.floor(Math.random() * testUrls.length)];
    console.log('Opening test URL:', randomUrl);
    
    this.openPaymentUrl(randomUrl, 'test');
  }

  // Alternative URL opening method for testing
  testSimpleUrlOpening(): void {
    const testUrl = 'https://www.google.com';
    console.log('Testing simple URL opening:', testUrl);
    
    try {
      const newWindow = window.open(testUrl, '_blank', 'noopener,noreferrer');
      if (newWindow) {
        console.log('URL opened successfully');
        this.successMessage.set('Test URL opened successfully!');
      } else {
        console.log('Failed to open URL - popup blocked');
        this.errorMessage.set('Popup blocked! Please allow popups for this site.');
      }
    } catch (error) {
      console.error('Error opening URL:', error);
      this.errorMessage.set('Error opening URL: ' + error);
    }
  }

  // Get checkout session URL from API
  private getCheckoutSessionUrl(orderId: string): void {
    console.log('Getting checkout session URL for order:', orderId);
    
    this.checkoutService.getCheckoutSessionUrl(orderId).subscribe({
      next: (response) => {
        console.log('Checkout session response:', response);
        
        if (response?.url) {
          console.log('Opening checkout session URL:', response.url);
          this.openPaymentUrl(response.url, 'stripe');
        } else {
          console.error('No URL found in checkout session response');
          this.errorMessage.set('Failed to get payment URL. Please try again.');
          this.isProcessing.set(false);
        }
      },
      error: (error) => {
        console.error('Error getting checkout session URL:', error);
        this.errorMessage.set('Failed to get payment URL. Please try again.');
        this.isProcessing.set(false);
      }
    });
  }
}
