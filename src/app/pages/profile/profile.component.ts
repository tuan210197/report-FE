import { Component, OnInit, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatGridListModule } from '@angular/material/grid-list';
import { ShareService } from '../../services/share.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core'; // Hoặc MatMomentDateModule nếu dùng Moment.js
import { FormBuilder, FormGroup } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { PasswordComponent } from '../password/password.component';
import { TranslateModule } from '@ngx-translate/core';
import { AppTranslateService } from '../../services/translate.service';



export interface List {
  fullName: string,
  employeeCode: string,
  deptName: string,
  gender: number,
  birthday: Date,
  mobile: string,
  role: number,
  email: string,
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [MatCardModule, MatInputModule, MatFormFieldModule, MatGridListModule, MatDatepickerModule,
    MatNativeDateModule, ReactiveFormsModule, MatSelectModule, MatOptionModule, CommonModule,TranslateModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {

  genders = [
    { value: 0, viewValue: 'Nữ/女 ' },
    { value: 1, viewValue: 'Nam/男' },
    { value: 2, viewValue: 'Khác/其他' }
  ];

  formList: List[] = [];
  ngOnInit(): void {
    this.getCurrentUser();
  }
  form: FormGroup;
  constructor(private fb: FormBuilder, private dialog: MatDialog, private share: ShareService,) {
    this.form = this.fb.group({
      uid: [''],
      employeeCode: [''],
      fullName: [''],
      email: [''],
      isActive: [0],
      isDeleted: [0],
      avatar: [null],
      gender: [null],
      birthday: [null],
      mobile: [null],
      statusUpdate: [null],
      role: this.fb.group({
        role_id: [null],
        name: ['']
      }),
      department: this.fb.group({
        deptId: [''],
        deptName: ['']
      })
    });
  }
    translateService = inject(AppTranslateService);
  
    switchLanguage() {
      this.translateService.switchLanguage();
    }
  async openChangePassword() {
    const rawData: any = await firstValueFrom(this.share.getCurrentUser());
    this.dialog.open(PasswordComponent, {
      width: '60vw',
      height: 'auto',
      data: rawData.email,
    });

  }

  async getCurrentUser() {
    const rawData: any = await firstValueFrom(this.share.getCurrentUser());
    
    this.form.patchValue({
      uid: rawData.uid.trim(),
      employeeCode: rawData.employeeCode,
      fullName: rawData.fullName,
      isActive: rawData.isActive,
      isDeleted: rawData.isDeleted,
      avatar: rawData.avatar,
      gender: rawData.gender,
      birthday: rawData.birthday,
      mobile: rawData.mobile,
      statusUpdate: rawData.statusUpdate,
      role: {
        role_id: rawData.role.role_id,
        name: rawData.role.name
      },
      department: {
        deptId: rawData.department.deptId.trim(),
        deptName: rawData.department.deptName
      },
      email: rawData.email
    });

  }
  update() {
    const rawData = this.form.value;
    var val = {
      birthday: this.convertToCustomFormat(rawData.birthday),
      fullName: rawData.fullName,
      gender: rawData.gender,
      employeeCode: rawData.employeeCode,
      mobile: rawData.mobile
    };

    console.log(val)
    this.share.updateUser(val).subscribe((data: any) => {
      if (data.code === '200') {
        Swal.fire('Success', data.message, 'success')
        this.getCurrentUser();
      } else {
        Swal.fire('Fail', data.message, 'error')
      }
    })
  }
  convertToCustomFormat(dateString: string): string | null {
    // Kiểm tra đầu vào có hợp lệ không
    if (!dateString) return null;

    try {
      // Tạo đối tượng Date từ chuỗi đầu vào
      const date = new Date(dateString);

      // Lấy các thành phần ngày, giờ, phút
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Tháng bắt đầu từ 0
      const day = String(date.getDate()).padStart(2, '0');


      // Kết hợp thành chuỗi định dạng "YYYY-MM-DD HH:mm"
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error("Invalid date string:", error);
      return null;
    }
  }
}
