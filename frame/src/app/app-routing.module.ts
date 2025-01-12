import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AboutComponent } from './about/about.component';
import { RegistrationComponent } from './registration/registration.component';
import { GalleryComponent } from './gallery/gallery.component';
import { NatureComponent } from './gallery/nature/nature.component';
import { ArchitectureComponent } from './gallery/architecture/architecture.component'; // Fixed typo in path
import { StagedComponent } from './gallery/staged/staged.component';
import { CustomersComponent } from './customers/customers.component';
import { CartComponent } from './cart/cart/cart.component';
import { OrdersComponent } from './orders/orders.component';
import { OrderDetailsComponent } from './order-details/order-details.component';

const routes: Routes = [
  // Redirect to 'about' if no route is specified
  { path: '', redirectTo: '/about', pathMatch: 'full' },

  // Main application routes
  { path: 'signin', component: LoginComponent },
  { path: 'register', component: RegistrationComponent },
  { path: 'about', component: AboutComponent },
  { path: 'cart', component: CartComponent },
  { path: 'customers', component: CustomersComponent },

  // Gallery with child routes
  { 
    path: 'gallery', 
    component: GalleryComponent,
    children: [
      { path: 'nature', component: NatureComponent },
      { path: 'architecture', component: ArchitectureComponent },
      { path: 'staged', component: StagedComponent },
    ]
  },

  // Orders and details
  { path: 'orders', component: OrdersComponent },
  { path: 'order-details', component: OrderDetailsComponent },

  // Catch-all for undefined routes
  { path: '**', redirectTo: '/about' } // Redirect to 'about' for undefined routes
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
