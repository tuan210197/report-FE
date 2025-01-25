import { Component, ViewChild,Inject } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
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
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ShareService } from '../../services/share.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
export interface table {
  projectName: string;
  implementer: string;
  category: string;
  date: string;
  implement: string;

}

@Component({
  selector: 'app-implement',
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
    FormsModule, MatSelectModule, ReactiveFormsModule, CommonModule
  ],
  providers: [{ provide: DateAdapter, useClass: NativeDateAdapter },
  { provide: MAT_DATE_FORMATS, useValue: MAT_NATIVE_DATE_FORMATS },],

  templateUrl: './implement.component.html',
  styleUrl: './implement.component.css'
})
export class ImplementComponent {

  model: any;
  tableList: table[] = [];
  displayedColumns: string[] = ['position', 'projectName', 'category', 'implementer', 'implement', 'date'];
  dataSource = new MatTableDataSource<table>(this.tableList);
  form: FormGroup;


  @ViewChild(MatPaginator) paginator!: MatPaginator;
  ngAfterViewInit() {
    this.getAll();
    this.dataSource.paginator = this.paginator;
  }

  constructor(private fb: FormBuilder, private share: ShareService, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.form = this.fb.group({
      projectName: [''],
      toppings: [[]],
      description: ['']
    });
    console.log(this.data)
  }

  async getAll() {
    this.share.getImplementById(this.data).subscribe((data: any) => {
      console.log(data)
      if (Array.isArray(data) && data.length > 0) {
        data.forEach(item => this.tableList.push({
          projectName: item.projects.projectName,
          category: item.projects.category.categoryName,
          implementer: item.users.fullName,
          date: item.createAt,
          implement: item.implement
        }))
      }
      this.dataSource.data = this.tableList;
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
