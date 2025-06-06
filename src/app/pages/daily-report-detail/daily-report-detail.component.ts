import { Component, ViewChild, inject, AfterViewInit } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { ShareService } from '../../services/share.service';
import { firstValueFrom } from 'rxjs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core'; // Thêm module này
import { FormBuilder, FormGroup } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSort, Sort, MatSortModule } from '@angular/material/sort';
import { LiveAnnouncer } from '@angular/cdk/a11y';

import Swal from 'sweetalert2';

export interface table {
  reporterName: string;
  projectName: string;
  categoryName: string;
  implement: string;
  createdAt: string;
  requester: string;
  contractor: string;
  address: string;

}
@Component({
  selector: 'app-daily-report-detail',
  standalone: true,
  imports: [CommonModule,
    MatPaginatorModule,
    MatTableModule,
    TranslateModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    MatSortModule
  ],
  templateUrl: './daily-report-detail.component.html',
  styleUrl: './daily-report-detail.component.css'
})
export class DailyReportDetailComponent implements AfterViewInit {
  tableList: table[] = [];
  // 'contractor', 'requester', 
  displayedColumns: string[] = ['reporterName', 'projectName', 'category', 'address', 'implement', 'createdAt'];
  dataSource = new MatTableDataSource<table>(this.tableList);
  isLoading = false;
  color = '#ADD8E6';
  private _liveAnnouncer = inject(LiveAnnouncer);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  form: FormGroup;
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
  constructor(private share: ShareService, private fb: FormBuilder,) {
    this.form = this.fb.group({
      date: [null],
    });
  }

  ngOnInit() {
    this.search();
  }

  async search() {
    this.isLoading = true;
    this.tableList = []; // Reset ngay khi click nút

    if (!this.form.value.date) {
      this.form.patchValue({ date: new Date() });
    }
    const val = { date: this.convertToCustomFormatDateTime(this.form.value.date) };

    const list: any = await firstValueFrom(this.share.getDetailDailyReport(val));

    if (Array.isArray(list.data) && list.data.length > 0) {
    this.tableList = [];

      for (const item of list.data) {
        const translatedImplement = await this.freeGoogleTranslate(this.formatText(item.implement));
        this.tableList.push({
          reporterName: item.reporterName.toUpperCase(),
          projectName: item.projectName.toUpperCase(),
          categoryName: item.categoryName.toUpperCase(),
          implement: translatedImplement || this.formatText(item.implement), // Fallback to an empty string if null
          // implement:this.formatText(item.implement), // Fallback to an empty string if null
          createdAt: item.createdAt,
          requester: item.requester.toUpperCase(),
          contractor: item.contractor.toUpperCase(),
          address: item.address.toUpperCase()
        });
      }
      this.isLoading = false;
    } else {
      this.isLoading = false;
      this.tableList = [];
      this.dataSource.data = this.tableList;
      Swal.fire('NO_DATA', '', 'info');
    }
    this.dataSource.data = this.tableList;
    console.log(this.tableList);
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
  convertToCustomFormatDateTime(dateString: string): string | null {
    // Kiểm tra đầu vào có hợp lệ không
    if (!dateString) return null;
    try {
      // Tạo đối tượng Date từ chuỗi đầu vào
      const date = new Date(dateString);
      // Lấy các thành phần ngày, giờ, phút
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Tháng bắt đầu từ 0
      const day = String(date.getDate()).padStart(2, '0');


      // Kết hợp thành chuỗi định dạng "YYYY-MM-DD"
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error("Invalid date string:", error);
      return null;
    }
  }
  formatText(text: string): string {
    return text
      .toLowerCase() // Chuyển toàn bộ về chữ thường trước
      .split('. ') // Tách các câu dựa vào dấu chấm và khoảng trắng
      .map(sentence => sentence.charAt(0).toUpperCase() + sentence.slice(1)) // Viết hoa chữ cái đầu mỗi câu
      .join('. '); // Nối lại thành chuỗi hoàn chỉnh
  }
  async freeGoogleTranslate(text: string | null | undefined, targetLang = "zh-CN"): Promise<string | null> {
    if (!text) {
      return null;
    }
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      return (data[0] as [string, string, any][]).map((sentence: [string, string, any]) => sentence[0]).join(""); // Ghép các phần dịch lại
    } catch (error) {
      return null;
    }
  }

  
}


