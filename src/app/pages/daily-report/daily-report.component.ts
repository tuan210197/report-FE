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
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import PptxGenJS from 'pptxgenjs';

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
      exportDate: ['']
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
      // console.error('Lỗi khi tải dự án:', error);
    });
  }

  getProjectByUserId() {
    this.share.getProjectByUserId().subscribe((data: any) => {
      this.projects = data; // Gán dữ liệu vào mảng projects
    }, (error) => {
      // console.error('Lỗi khi tải dự án:', error);
    });
  }
  getCategory() {
    this.share.getCategory().subscribe((data: any) => {
      this.categories = data; // Gán dữ liệu vào mảng categories
      // console.log(data);
    },
      (error) => {
        // console.error('Lỗi khi tải danh mục:', error);

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
        if (data.code === '200') {
          Swal.fire('Success', 'Tạo Báo Cáo Thành Công', 'info')
        }
      });
    } else {
      // console.log("Form invalid");
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
      // console.error("Invalid date string:", error);
      return null;
    }
  }
  convertToCustomFormatDate(dateString: string): string | null {
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
      // console.error("Invalid date string:", error);
      return null;
    }
  }
  async setlectionChange(event: any) {
    // this.selectedCategory = event.value;
    var val = {
      projectId: event.value
    }
    const report: any = await firstValueFrom(this.share.getDailyReportByProjecetId(val));

    if (report.data !== null && 'reportId' in report.data) {
      this.form.patchValue(
        {
          requester: report.data.requester, // Bắt buộc nhập
          address: report.data.address, // Bắt buộc nhập
          projectId: report.data.project.projectId, // Bắt buộc nhập
          progress: report.data.progress, // Bắt buộc ngày bắt đầu
          quantity: report.data.quantity, // Phải lớn hơn 0
          categoryId: report.data.category.categoryId, // Bắt buộc chọn
          quantityCompleted: report.data.quantityCompleted, // Bắt buộc nhập
          quantityRemain: report.data.quantityRemain, // Bắt buộc nhập
          contractor: report.data.contractor, // Bắt buộc nhập
          numberWorker: report.data.numberWorker, // Bắt buộc nhập
          startDate: report.data.startDate, // Bắt buộc nhập
          endDate: report.data.endDate, // Bắt buộc nhập
          implement: report.data.implement, // Bắt buộc nhập
        }
      );
    }
    if (report.data !== null && 'projectId' in report.data) {
      this.form.patchValue(
        {
          projectId: report.data.projectId, // Bắt buộc nhập
          categoryId: report.data.category.categoryId, // Bắt buộc chọn
          requester: null, // Bắt buộc nhập
          address: null,
          progress: null,
          quantity: null,
          quantityCompleted: null,
          quantityRemain: null,
          contractor: null,
          numberWorker: null,
          startDate: null,
          endDate: null,
          implement: null,

        }
      );
    }
  }

  async exportToExcel() {
    var val = {
      date: this.convertToCustomFormatDate(this.form.value.exportDate)
    }
    const data: any = await firstValueFrom(this.share.getExportDailyReport(val));
    if (this.convertToCustomFormatDate(this.form.value.exportDate) !== null) {
      this.generateExcel(data);
      // this.exportToPptx(data);
    } else {
      Swal.fire('Error', 'Vui lòng chọn ngày xuất báo cáo', 'error');
    }
  }

  private generateExcel(data: any[]) {

    const customHeaders = [
      ['STT', 'Ngày báo cáo', 'Người báo cáo', 'Bên Yêu Cầu', 'Tên Dự án', 'Loại Dự Án', 'Địa Điểm Làm Việc', 'Nhà thầu',
        'Số Công Nhân', 'Tiến Độ (%)', 'Số Lượng', 'Hoàn Thành', 'Còn Lại', 'Ngày Bắt Đầu',
        'Ngày Kết Thúc', 'Báo Cáo Công Việc Hàng Ngày']
    ];
    // 2️⃣ Chuyển đổi dữ liệu thành định dạng mảng theo đúng thứ tự cột
    console.log(data);
    const exportData = data.map((item, index) => [
      index + 1,
      this.convertToCustomFormatDate(item.createAt),  // Chuyển đổi format ngày
      item.fullName,
      item.requester,
      item.projectName,
      item.categoryName,
      item.address,
      item.contractor,
      item.numberWorker,
      item.progress,
      item.quantity,
      item.quantityCompleted,
      item.quantityRemain,
      this.convertToCustomFormatDate(item.startDate),
      this.convertToCustomFormatDate(item.endDate),
      item.implement,


    ]);
    const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([...customHeaders, ...exportData]);

    // 4️⃣ Định dạng cột (Độ rộng)
    worksheet['!cols'] = [
      { wch: 5 },   // STT
      { wch: 20 },  // Ngày báo cáo
      { wch: 20 },  // Ngày báo cáo
      { wch: 20 },  // Người báo cáo
      { wch: 50 },  // Dự án
      { wch: 30 },  // Loại công việc
      { wch: 30 },  // Địa chỉ
      { wch: 20 },  // Nhà thầu
      { wch: 20 },  // Số công nhân
      { wch: 20 },  // Tiến độ
      { wch: 15 },  // Số lượng
      { wch: 15 },  // Hoàn thành
      { wch: 15 },  // Còn lại
      { wch: 30 },  // Ngày bắt đầu
      { wch: 30 },  // Ngày kết thúc
      { wch: 100 }   // Thực thi dự án
    ];

    // 5️⃣ Xuất file Excel
    const workbook: XLSX.WorkBook = { Sheets: { 'Báo cáo': worksheet }, SheetNames: ['Báo cáo'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const dataBlob: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

    // 6️⃣ Lưu file xuống máy với tên rõ ràng
    saveAs(dataBlob, 'Daily_Report_' + this.convertToCustomFormatDate(this.form.value.exportDate) + '.xlsx');
  }

  exportToPptx(data: any[]) {
    console.log('Dữ liệu nhận được:', data);
  
    if (!data || data.length === 0) {
      console.warn('Không có dữ liệu để xuất PowerPoint.');
      return;
    }
  
    let pptx = new PptxGenJS();
    let slide = pptx.addSlide();
  
    // Tiêu đề slide
    slide.addText('BÁO CÁO DAILY REPORT', {
      x: 1, y: 0.3, w: 8, h: 0.5, fontSize: 24, bold: true, align: 'center'
    });
  
    // Định dạng dữ liệu bảng
    let tableData: any[] = [];
  
    // Header
    tableData.push([
      { text: 'STT', bold: true }, { text: 'Ngày báo cáo', bold: true }, { text: 'Người báo cáo', bold: true },
      { text: 'Bên Yêu Cầu', bold: true }, { text: 'Tên Dự án', bold: true }, { text: 'Loại Dự Án', bold: true },
      { text: 'Địa Điểm', bold: true }, { text: 'Nhà thầu', bold: true }, { text: 'Số Công Nhân', bold: true },
      { text: 'Tiến Độ (%)', bold: true }, { text: 'Số Lượng', bold: true }, { text: 'Hoàn Thành', bold: true },
      { text: 'Còn Lại', bold: true }, { text: 'Ngày Bắt Đầu', bold: true }, { text: 'Ngày Kết Thúc', bold: true },
      { text: 'Thực Thi', bold: true }
    ]);
  
    // Dữ liệu từng dòng
    data.forEach((item, index) => {
      tableData.push([
        { text: (index + 1).toString() },
        { text: item.createAt ? this.convertToCustomFormatDate(item.createAt) : 'N/A' },
        { text: item.fullName || 'N/A' },
        { text: item.requester || 'N/A' },
        { text: item.projectName || 'N/A' },
        { text: item.categoryName || 'N/A' },
        { text: item.address || 'N/A' },
        { text: item.contractor || 'N/A' },
        { text: item.numberWorker?.toString() || '0' },
        { text: item.progress?.toString() || '0' },
        { text: item.quantity?.toString() || '0' },
        { text: item.quantityCompleted?.toString() || '0' },
        { text: item.quantityRemain?.toString() || '0' },
        { text: item.startDate ? this.convertToCustomFormatDate(item.startDate) : 'N/A' },
        { text: item.endDate ? this.convertToCustomFormatDate(item.endDate) : 'N/A' },
        { text: item.implement || 'N/A' },
      ]);
    });
  
    // Thêm bảng vào slide
    slide.addTable(tableData, {
      x: 0.3, y: 1, w: 9,
      colW: [0.5, 1, 1.5, 1.5, 2, 1.5, 2, 1.5, 1, 1, 1, 1, 1, 1, 1, 2], // Kích thước cột
      border: { type: 'solid', color: '000000' },
      fontSize: 12,
      align: 'left',
    });
  
    // Xuất file PowerPoint
    pptx.writeFile({ fileName: 'Daily_Report.pptx' })
      .then(() => console.log('Xuất file thành công'))
      .catch(error => console.error('Lỗi khi xuất file:', error));
  }
  
  
}





