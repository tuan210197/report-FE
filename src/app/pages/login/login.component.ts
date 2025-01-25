import { Component, } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';



@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],

})
export class LoginComponent {

  loginForm!: FormGroup;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Initialize the form with FormBuilder
    this.loginForm = this.fb.group({
      email: [''],
      password: ['']
    });
  }

  async onLogin() {
    const { email, password } = this.loginForm.value;
    try {
      const success = await this.authService.login(email, password);
      if (success) {
        this.router.navigateByUrl('/home');
      } else {
        this.errorMessage = 'Login failed. Please check your credentials.';
      }
    } catch (error) {
      console.error('Login error', error);
      this.errorMessage = 'An error occurred. Please try again later.';
    }
  }
}