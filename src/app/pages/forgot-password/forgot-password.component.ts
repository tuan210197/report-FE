import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { ShareService } from '../../services/share.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  constructor(
    private fb: FormBuilder,
    private share: ShareService,
    private router: Router
  ) {
    this.form = this.fb.group({
      otp: [''],
      password: [''],
      confirmPassword: [''],
      email: [''],
    });
  }
  form: FormGroup;

  async sendOTP() {
    var val = {
      email: this.form.value.email
    }

    console.log(val)
    const otp: any = await firstValueFrom(this.share.sendOTP(val));
    Swal.fire('Thông Báo', otp.message, 'info');

  }

  async resetPassword() {
    var val = {
      email: this.form.value.email,
      tokenCode: this.form.value.otp,
      newPassword: this.form.value.password,
      reNewPassword: this.form.value.confirmPassword
    }
    console.log(val)

    const check:any = await firstValueFrom(this.share.resetPassword(val));

    Swal.fire('Thông Báo', check.message,'info')
  }
}
