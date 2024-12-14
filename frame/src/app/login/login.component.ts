import { ChangeDetectorRef, Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Service } from '../service/service';
import { UserService } from '../service/user.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrl: './login.component.css',
    standalone: false
})

export class LoginComponent {
  formErrors = { email: '', password: '' };
  email: string = '';
  password: string = '';
  success ='';
  status: string = '';

constructor(private service: Service, private router: Router, private userService: UserService, private cdr: ChangeDetectorRef){}


login(f: NgForm): void {
  if (f.valid) {
    this.service.login(f.value).subscribe(
      (response: {
        success: boolean; 
        token: string; 
        userType: string;
        userStatus: string;
}) => {
        console.log('Login successful:', response);
        this.success = 'Login successful';
        this.status = response.userStatus;
        
           // Save the user type and token
        const user = {
          email: f.value.email,
          type: response.userType,
          status: response.userStatus
        };
        this.userService.setUser(user);
        localStorage.setItem('token', response.token);

        // Navigate to the appropriate page
        this.router.navigate(['about']);
    
      },
      (err) => {
        // Reset errors first
        this.formErrors = { email: '', password: '' };

        // Assign errors based on backend response
        if (err.error.error.email) {
          this.formErrors.email = err.error.error.email;
        }
        if (err.error.error.password) {
          this.formErrors.password = err.error.error.password;
        }
      }//error
      );//subscribe
    }//response
  }//login
}//main
