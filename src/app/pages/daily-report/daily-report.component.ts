import { AfterViewInit, Component, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core'; // Hoặc MatMomentDateModule nếu dùng Moment.js
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ShareService } from '../../services/share.service';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';

interface dataTable {
  user: string;
  requester: string;
  project: string;
  category: string;
  address: string;
  progress: string;
  quantityCompleted: number;
  quantityRemain: number;
  contractor: string;
  create_at: string;
  quantity: number;
  numberWorker: number;


}

@Component({
  selector: 'app-daily-report',
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
    FormsModule, MatSelectModule, ReactiveFormsModule, CommonModule,
  ],
  templateUrl: './daily-report.component.html',
  styleUrl: './daily-report.component.css'
})
export class DailyReportComponent {
  displayedColumns: string[] = [
    'position', 'userName', 'requester',
    'projectName', 'categoryName', 'address', 'progress',
    'quantityCompleted', 'quantityRemain', 'contractor',
    'quantity', 'numberWorker', 'create_at'];
  dataSource = new MatTableDataSource<dataTable>([]);
  model: any;
  color = '#ADD8E6';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  ngAfterViewInit() {
    this.getProjectName();
    // this.getProjectByUserId();
    this.getCategory();
    this.getAllDailyReport();
    this.dataSource.paginator = this.paginator;
  }


  categories: any[] = []; // Mảng lưu danh sách danh mục
  selectedCategory: string | null = null; // Lưu ID danh mục được chọn
  selectedProject: string | null = null; // Lưu ID dự án được chọn
  projects: any[] = []; // Mảng lưu danh sách dự án
  listData: dataTable[] = [];
  form: FormGroup;
  constructor(private fb: FormBuilder, private dialog: MatDialog, private share: ShareService) {
    this.form = this.fb.group({
      requester: ['', Validators.required], // Bắt buộc nhập
      address: ['', Validators.required], // Bắt buộc nhập
      projectId: ['', [Validators.required]], // Bắt buộc nhập
      progress: ['', [Validators.required, Validators.min(1), Validators.max(100)]], // Bắt buộc ngày bắt đầu
      quantity: ['', [Validators.required, Validators.min(1)]], // Phải lớn hơn 0
      categoryId: ['', Validators.required], // Bắt buộc chọn
      quantityCompleted: ['', [Validators.required, Validators.min(0)]], // Bắt buộc nhập
      quantityRemain: ['', [Validators.required, Validators.min(0)]],
      contractor: ['', Validators.required],
      numberWorker: ['', [Validators.required, Validators.min(0)]], // Không được âm
      startDate: [''],
      endDate: [''],
      implement: ['', [Validators.required]],
    });
  }
  checkFormErrors(formGroup: FormGroup): boolean {
    let isValid = true;
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);

      // Đánh dấu control là touched để hiển thị lỗi
      if (control) {
        control.markAsTouched();

        // Kiểm tra nếu có lỗi
        if (control.invalid) {
          isValid = false;
        }
      }
    });

    return isValid;
  }

  getProjectName() {
    this.share.getProjectName().subscribe((data: any) => {
      this.projects = data; // Gán dữ liệu vào mảng projects
    }, (error) => {
      console.error('Lỗi khi tải dự án:', error);
    });
  }

  getProjectByUserId() {
    this.share.getProjectByUserId().subscribe((data: any) => {
      this.projects = data; // Gán dữ liệu vào mảng projects
    }, (error) => {
      console.error('Lỗi khi tải dự án:', error);
    });
  }
  getCategory() {
    this.share.getCategory().subscribe((data: any) => {
      this.categories = data; // Gán dữ liệu vào mảng categories
      console.log(data);
    },
      (error) => {
        console.error('Lỗi khi tải danh mục:', error);

      });
  }

  async getAllDailyReport() {
    this.listData = []
    const list = await firstValueFrom(this.share.getDailyReport()) as dataTable[];

    list.forEach((item: dataTable) => this.listData.push({
      user: item.user,
      requester: item.requester,
      project: item.project,
      category: item.category,
      address: item.address,
      progress: item.progress,
      quantityCompleted: item.quantityCompleted,
      quantityRemain: item.quantityRemain,
      contractor: item.contractor,
      create_at: item.create_at,
      quantity: item.quantity,
      numberWorker: item.numberWorker,
    }));
    this.dataSource.data = this.listData;
  }
  onSubmit() {
    if (this.checkFormErrors(this.form)) {

      var val = {
        requester: this.form.value.requester,
        address: this.form.value.address,
        projectId: this.form.value.projectId,
        progress: this.form.value.progress,
        quantity: this.form.value.quantity,
        categoryId: this.form.value.categoryId,
        quantityCompleted: this.form.value.quantityCompleted,
        quantityRemain: this.form.value.quantityRemain,
        contractor: this.form.value.contractor,
        numberWorker: this.form.value.numberWorker,
        startDate: this.form.value.startDate,
        endDate: this.form.value.endDate,
        implement: this.form.value.implement,

      }
      console.log(val);
      this.share.addNewDailyReport(val).subscribe((data: any) => {
        this.getAllDailyReport();
        if(data.code === '200'){
          Swal.fire('Success', 'Tạo Báo Cáo Thành Công', 'info')
        }
      });
    } else {
      console.log("Form invalid");
    }


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
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');

      // Kết hợp thành chuỗi định dạng "YYYY-MM-DD HH:mm"
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    } catch (error) {
      console.error("Invalid date string:", error);
      return null;
    }
  }
}






