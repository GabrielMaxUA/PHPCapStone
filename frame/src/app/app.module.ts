import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RegistrationComponent } from './registration/registration.component';
import { LoginComponent } from './login/login.component';
import { AboutComponent } from './about/about.component';
import { FooterComponent } from './base/footer/footer.component';
import { HeaderComponent } from './base/header/header.component';
import { FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NavBarComponent } from './base/navbar/navbar.component';
import { GalleryComponent } from './gallery/gallery.component';
import { NatureComponent } from './gallery/nature/nature.component';
import { StagedComponent } from './gallery/staged/staged.component';
import { CustomersComponent } from './customers/customers.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DialogComponent } from './dialog/dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import { DialogOkComponent } from './dialog-ok/dialog-ok.component';
import { ArchitectureComponent } from './gallery/architecture/architecture.component';
import { CardComponent } from './gallery/imageCard/card/card.component';
import { CartComponent } from './cart/cart/cart.component';
import { AuthInterceptor } from './service/auth.interceptor';
import { OrdersComponent } from './orders/orders.component';
import { OrderDetailsComponent } from './order-details/order-details.component';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    NavBarComponent,
    FooterComponent,
    AboutComponent,
    RegistrationComponent,
    LoginComponent,
    GalleryComponent,
    NatureComponent,
    ArchitectureComponent,
    StagedComponent,
    CustomersComponent,
    DialogComponent,
    DialogOkComponent,
    CardComponent,
    CartComponent,
    OrdersComponent,
    OrderDetailsComponent,
    LoadingSpinnerComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatButtonModule
  ],
  providers: [
    provideAnimationsAsync(),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
