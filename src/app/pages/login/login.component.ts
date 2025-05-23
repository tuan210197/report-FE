import { Component, } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { ShareService } from '../../services/share.service';



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
    private share: ShareService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Initialize the form with FormBuilder
    this.loginForm = this.fb.group({
      employeeCode: [''],
      password: ['']
    });
  }

  async onLogin() {
    const { employeeCode, password } = this.loginForm.value;
    try {
      const success = await this.share.login(employeeCode, password);
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