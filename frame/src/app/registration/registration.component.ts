import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Service } from '../service/service';
import { User } from '../Models/interfaces';
import { HttpClientModule } from '@angular/common/http';
import { format, isValid, parse } from 'date-fns';

@Component({
    selector: 'app-registration',
    templateUrl: './registration.component.html',
    styleUrl: './registration.component.css',
    standalone: false
})
export class RegistrationComponent {

  constructor(private service: Service, private router: Router, private http: HttpClientModule){}

  formErrors = { firstName: '', lastName: '', email: '', password: '', rPassword: '',
    phone: '', dob: ''};
  users: User[] = [];
  user: User = {firstName: '', lastName: '', email: '', password: '', dob: undefined, phone: ''}
  success = '';

  register(f: NgForm): void {
    // Reset form errors
    this.formErrors = { firstName: '', lastName: '', email: '', password: '', rPassword: '', phone: '', dob: '' };
  
    if (f.valid) {
      this.user = {
        firstName: f.value['firstName'],
        lastName: f.value['lastName'],
        email: f.value['email'],
        dob: new Date(f.value['dob']), // Directly use the date value
        phone: f.value['phone'],
        password: f.value['password'],
      };
  
      console.log('Submitted:', this.user);
  
      this.service.register(this.user).subscribe(
        (response: User) => {
          this.users.push(response);
          console.log('Registration successful')
          this.success = 'Registration successful';
          this.router.navigate(['signin']);
        },
        (err) => {
          console.error('Error:', err.error.error);
          this.formErrors['email'] = err.error.error;
        }
      );
    }
  }

}