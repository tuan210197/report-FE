import { Component, OnInit, Inject, inject } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ShareService } from '../../services/share.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { customPasswordValidator } from '../../services/password.validator';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';
import { AppTranslateService } from '../../services/translate.service';



export interface List {
  password: string,
  newPassword: string,
  reNewPassword: number,
  email: string,
}

@Component({
  selector: 'app-password',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, ReactiveFormsModule, CommonModule,TranslateModule],
  templateUrl: './password.component.html',
  styleUrl: './password.component.css'
})


export class PasswordComponent implements OnInit {

  ngOnInit(): void {
    this.getEmail();
  }
  form: FormGroup;
  constructor(private fb: FormBuilder, private share: ShareService, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.form = this.fb.group({
      password: ['', [Validators.required, customPasswordValidator()]],
      newPassword: ['', [Validators.required, customPasswordValidator()]],
      reNewPassword: ['', [Validators.required, customPasswordValidator()]],
      email: [''],
    });
  }
    translateService = inject(AppTranslateService);
  
    switchLanguage() {
      this.translateService.switchLanguage();
    }

  getEmail() {
    this.form.patchValue({
      email: this.data
    });
  }
  errorMessage: string | null = null;
   updatePassword() {
  
    const rawData = this.form.value;
    var val = {
      email: rawData.email,
      password: rawData.password,
      newPassword: rawData.newPassword,
      reNewPassword: rawData.reNewPassword
    }
    if (this.form.valid) {
       this.share.checkPassword(val).subscribe((check:any) =>{
       
        if (check === 200) {
          debugger
          this.share.updatePassword(val).subscribe((data: any) => {
            if (data.success == true ){
              Swal.fire('Success', data.message,'success')
            }else{
              Swal.fire('Fail', data.message,'warning')
            }
          });
        } else {
          Swal.fire('Fail', 'Mật Khẩu Bạn Nhập Không Đúng', 'error')
  
        }
       })

    
    }
  }
}



