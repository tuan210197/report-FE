import { Component, OnInit, inject } from '@angular/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS, MAT_NATIVE_DATE_FORMATS, MatNativeDateModule, NativeDateAdapter } from '@angular/material/core'; // Hoặc MatMomentDateModule nếu dùng Moment.js
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ShareService } from '../../services/share.service';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { MatDialogRef } from '@angular/material/dialog';

import { TranslateModule } from '@ngx-translate/core';
import { AppTranslateService } from '../../services/translate.service';


@Component({
  selector: 'app-add-project',
  standalone: true,
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatGridListModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule, // Nếu dùng Moment.js thì thay bằng MatMomentDateModule
    FormsModule,
    MatSelectModule,
    ReactiveFormsModule,
    CommonModule,
    TranslateModule
  ],
  providers: [{ provide: DateAdapter, useClass: NativeDateAdapter },
  { provide: MAT_DATE_FORMATS, useValue: MAT_NATIVE_DATE_FORMATS },],

  templateUrl: './add-project.component.html',
  styleUrl: './add-project.component.css',

})
export class AddProjectComponent implements OnInit {

  ngOnInit(): void {
    this.getCategory();
    this.getStaff();
  }
  // toppings = new FormControl('');
  // toppingList: string[] = ['Extra cheese', 'Mushroom', 'Onion', 'Pepperoni', 'Sausage', 'Tomato'];
  categories: any[] = []; // Mảng lưu danh sách danh mục
  selectedCategory: string | null = null; // Lưu ID danh mục được chọn

  users: any[] = [];
  selectedUser: string | null = null;

  form: FormGroup;
  constructor(private fb: FormBuilder, private share: ShareService,
    private dialogRef: MatDialogRef<AddProjectComponent> // Tham chiếu đến dialog
  ) {
    this.form = this.fb.group({
      projectName: [''],
      pic: [''],
      description: [''],
      categoryId: [],
      startDate: [],
      location: [''],
    });
  }
  translateService = inject(AppTranslateService);

  // switchLanguage() {
  //   this.translateService.switchLanguage();
  // }
  getCategory() {
    this.share.getCategory().subscribe((data: any) => {
      this.categories = data; // Gán dữ liệu vào mảng categories
    },
      (error) => {
        console.error('Lỗi khi tải danh mục:', error);

      });
  }

  getStaff() {
    this.share.getStaff().subscribe((data: any) => {
      this.users = data;
    }, (error) => {
      console.error('lỗi khi load staff', error);
    })
  }
  async createProject() {
    var val = {
      projectName: this.form.value.projectName,
      categoryId: this.form.value.categoryId,
      startDate: this.convertToCustomFormat(this.form.value.startDate),
      description: this.form.value.description,
      year: this.form.value.startDate.getFullYear(),
      location: this.form.value.location,
      pic: this.form.value.pic.uid,
    }
 
    this.share.addProject(val).subscribe(async (data: any) => {
      if (data != null) {
        // Hiển thị thông báo sau khi tất cả các API thành công
        Swal.fire({
          title: 'Thành công',
          text: 'Dự án và thành viên đã được thêm thành công.',
          icon: 'success',
          confirmButtonText: 'OK',
        }).then((result) => {
          if (result.isConfirmed) {
            // Hành động sau khi người dùng nhấn "OK"
            this.dialogRef.close(true); // Bạn có thể truyền dữ liệu gì đó về dialog cha nếu cần
          }
        });
      }
    })
  };

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
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');

      // Kết hợp thành chuỗi định dạng "YYYY-MM-DD HH:mm"
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error("Invalid date string:", error);
      return null;
    }
  }


}
