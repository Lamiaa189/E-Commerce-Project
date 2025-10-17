import { LoginComponent } from './core/auth/login/login.component';
import { RegisterComponent } from './core/auth/register/register.component';
import { ForgotPasswordComponent } from './core/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './core/auth/reset-password/reset-password.component';
import { AuthLayoutComponent } from './core/layouts/auth-layout/auth-layout.component';
import { Routes } from '@angular/router';
import { BlankLayoutComponent } from './core/layouts/blank-layout/blank-layout.component';
import { HomeComponent } from './features/home/home.component';
import { BrandsComponent } from './features/brands/brands.component';
import { BrandDetailsComponent } from './features/brands/details/brand-details.component';
import { CartComponent } from './features/cart/cart.component';
import { CategoriesComponent } from './features/categories/categories.component';
import { CategoryDetailsComponent } from './features/categories/details/category-details.component';
import { ProductsComponent } from './features/products/products.component';
import { CheckoutComponent } from './features/checkout/checkout.component';
import { CheckoutSuccessComponent } from './features/checkout/success/checkout-success.component';
import { DetailsComponent } from './features/details/details.component';
import { WishlistComponent } from './features/wishlist/wishlist.component';
import { OrdersComponent } from './features/orders/orders.component';
import { OrderDetailsComponent } from './features/orders/order-details/order-details.component';
import { NotfoundComponent } from './features/notfound/notfound.component';
import { authGuard } from './core/guards/auth-guard';
import { isLoggedGuard } from './core/guards/is-logged-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: '',
    component: AuthLayoutComponent,
    canActivate: [isLoggedGuard],
    children: [
      {
        path: 'login',
        component: LoginComponent,
        title: 'Login page',
      },
      {
        path: 'register',
        component: RegisterComponent,
        title: 'Register page',
      },
      {
        path: 'forgot-password',
        component: ForgotPasswordComponent,
        title: 'Forgot Password',
      },
      {
        path: 'reset-password',
        component: ResetPasswordComponent,
        title: 'Reset Password',
      },
    ],
  },
  {
    path: '',
    component: BlankLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'home', component: HomeComponent, title: 'Home page' },
      { path: 'brands', component: BrandsComponent, title: 'Brands page' },
      { path: 'brands/:slug/:id', component: BrandDetailsComponent, title: 'Brand Details' },
      { path: 'cart', component: CartComponent, title: 'Cart page' },
      { path: 'wishlist', component: WishlistComponent, title: 'Wishlist page' },
      { path: 'categories', component: CategoriesComponent, title: 'Categories page' },
      { path: 'categories/:slug/:id', component: CategoryDetailsComponent, title: 'Category Details' },
      { path: 'products', component: ProductsComponent, title: 'Products page' },
      { path: 'checkout', component: CheckoutComponent, title: 'Checkout page' },
      { path: 'checkout/success', component: CheckoutSuccessComponent, title: 'Order Confirmation' },
      { path: 'orders', component: OrdersComponent, title: 'My Orders' },
      { path: 'orders/:id', component: OrderDetailsComponent, title: 'Order Details' },
      { path: 'details/:slug/:id', component: DetailsComponent, title: 'Details page' },
      { path: 'details/:id', component: DetailsComponent, title: 'Details page' },
    ],
  },
  { path: '**', component: NotfoundComponent, title: 'NotFound page' },
];
