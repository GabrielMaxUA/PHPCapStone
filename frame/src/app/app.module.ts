import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RegistrationComponent } from './registration/registration.component';
import { LoginComponent } from './login/login.component';
import { AboutComponent } from './about/about.component';
import { FooterComponent } from './base/footer/footer.component';
import { HeaderComponent } from './base/header/header.component';
import { LogoutComponent } from './logout/logout.component';
import { AdminComponent } from './admin/admin.component';
import { CustomerComponent } from './customer/customer.component';
import { ProductsComponent } from './products/products.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ListComponent } from './list/list.component';
import { NavBarComponent } from './base/navbar/navbar.component';
import { GalleryComponent } from './gallery/gallery.component';
import { NatureComponent } from './gallery/nature/nature.component';
import { ArchitechtureComponent } from './gallery/architechture/architechture.component';
import { StagedComponent } from './gallery/staged/staged.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    NavBarComponent,
    FooterComponent,
    AboutComponent,
    AdminComponent,
    CustomerComponent,
    ProductsComponent,
    RegistrationComponent,
    LogoutComponent,
    LoginComponent,
    ListComponent,
    GalleryComponent,
    NatureComponent,
    ArchitechtureComponent,
    StagedComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
