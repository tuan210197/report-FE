import { AfterViewInit, Component, ViewChild, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
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
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ShareService } from '../../services/share.service';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { TranslateModule } from '@ngx-translate/core';
import { AppTranslateService } from '../../services/translate.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { debounceTime, switchMap } from 'rxjs/operators';

interface dataTable {
  reportId: number;
  user: string;
  requester: string;
  project: string;
  category: string;
  address: string;
  // progress: string;
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
    TranslateModule,
    MatAutocompleteModule
  ],
  templateUrl: './daily-report.component.html',
  styleUrl: './daily-report.component.css'
})
// 'userName','progress',, 'create_at'
export class DailyReportComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'position', 'requester',
    'projectName', 'categoryName', 'address', 'quantity',
    'quantityCompleted', 'quantityRemain', 'contractor',
     'numberWorker'];
  dataSource = new MatTableDataSource<dataTable>([]);
  model: any;
  color = '#ADD8E6';
  translateService = inject(AppTranslateService);
  categories: any[] = []; // Mảng lưu danh sách danh mục
  selectedCategory: string | null = null; // Lưu ID danh mục được chọn
  selectedProject: string | null = null; // Lưu ID dự án được chọn
  projects: any[] = []; // Mảng lưu danh sách dự án
  listData: dataTable[] = [];
  selectedProjectSearch: any = null; // Biến để lưu object được chọn

  form: FormGroup;
  formGroup = new FormGroup({
    projectId: new FormControl('') // Lưu projectId vào FormGroup
  });
  searchControl = new FormControl(''); // Dùng để nhập và tìm kiếm
  projectsSearch: any[] = []; // Danh sách kết quả từ API
  constructor(private fb: FormBuilder, private dialog: MatDialog, private share: ShareService) {
    this.form = this.fb.group({
      requester: ['', Validators.required], // Bắt buộc nhập
      address: ['', Validators.required], // Bắt buộc nhập
      projectId: ['', [Validators.required]], // Bắt buộc nhập
      // progress: ['', [Validators.required, Validators.min(1), Validators.max(100)]], // Bắt buộc ngày bắt đầu
      quantity: ['', [Validators.required, Validators.min(1)]], // Phải lớn hơn 0
      categoryId: ['', Validators.required], // Bắt buộc chọn
      quantityCompleted: ['', [Validators.required, Validators.min(0)]], // Bắt buộc nhập
      quantityRemain: ['', [Validators.required, Validators.min(0)]],
      contractor: ['', Validators.required],
      numberWorker: ['', [Validators.required, Validators.min(0)]], // Không được âm
      startDate: [''],
      endDate: [''],
      implement: ['', [Validators.required]],
      exportDate: [''],
      search: [''],

    });

  }
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  ngAfterViewInit() {
    this.getProjectByUserId();
    this.getCategory();
    this.getAllDailyReport();
    this.dataSource.paginator = this.paginator;
  }

  ngOnInit(): void {
    this.getProjectName(); // Gọi khi load trang để lấy toàn bộ dự án

    this.searchControl.valueChanges
      .pipe(
        debounceTime(300), // Đợi 500ms sau khi nhập để tránh gọi API quá nhiều lần
        switchMap(value => {
          if (!value || value.toString().trim() === '') {
            this.getProjectName(); // Nếu nhập rỗng, load lại toàn bộ
            return []; // Không gọi searchProjects
          }
          return this.searchProjects(value); // Gọi API tìm kiếm
        })
      )
      .subscribe((data: any) => {
        this.projectsSearch = data?.data ?? [];
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
      this.projectsSearch = data; // Gán dữ liệu vào mảng projects
    }, (error) => {
      console.error('Lỗi khi tải dự án:', error);
    });
  }

  getProjectByUserId() {

    this.share.getProjectName().subscribe((data: any) => {
      this.projects = data; // Gán dữ liệu vào mảng projects
    }, (error) => {
      console.error('Lỗi khi tải dự án:', error);
    });
  }
  getCategory() {
    this.share.getCategory().subscribe((data: any) => {
      this.categories = data; // Gán dữ liệu vào mảng categories
    },
      (error) => {

      });
  }

  async getAllDailyReport() {
    this.listData = []
    const list = await firstValueFrom(this.share.getDailyReport()) as dataTable[];
    // console.log(list);
    list.forEach((item: dataTable) => this.listData.push({
      reportId: item.reportId,
      user: item.user,
      requester: item.requester,
      project: item.project,
      category: item.category,
      address: item.address,
      // progress: item.progress,
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
        // progress: this.form.value.progress,
        quantity: this.form.value.quantity,
        categoryId: this.form.value.categoryId,
        quantityCompleted: this.form.value.quantityCompleted,
        quantityRemain: this.form.value.quantityRemain,
        contractor: this.form.value.contractor,
        numberWorker: this.form.value.numberWorker,
        startDate: this.convertToCustomFormatDate(this.form.value.startDate),
        endDate: this.convertToCustomFormatDate(this.form.value.endDate),
        implement: this.form.value.implement,

      }
      console.log(val);
      this.share.addNewDailyReport(val).subscribe((data: any) => {
        this.getAllDailyReport();
        if (data.code === '200') {
          Swal.fire('Success', 'Tạo Báo Cáo Thành Công </br> 建立成功報告', 'info')
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
  async selectionChangeCategory(event: any) {

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
  selectionChange(event: any) {
    this.selectedProjectSearch = this.projectsSearch.find(p => p.projectId === event.option.value);
    if (this.selectedProjectSearch) {
      this.formGroup.controls['projectId'].setValue(this.selectedProjectSearch.projectId); // Lưu projectId
      this.searchControl.setValue(this.selectedProjectSearch.projectName, { emitEvent: false }); // Hiển thị projectName
    }
    this.selectionChangeCategory(event.option);
  }
  searchProjects(query: string) {
    var data = { projectName: query };
    return this.share.searchByName(data);
  }
  searchReport() {
    var val = {
      keyword: this.form.value.search.toUpperCase()
    }
    console.log(val);
    this.share.seardchDailyReport(val).subscribe((data: any) => {
      this.dataSource.data = [];
      this.dataSource.data = data.data;
    });
  }
  showDetail(data:any){
    console.log(data);
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

      const date: any = await firstValueFrom(this.share.getMaxDateExport());

      var val2 = {
        date: date.data
      }
      const data: any = await firstValueFrom(this.share.getExportDailyReport(val2));
      this.generateExcel(data);

    }
  }

  private generateExcel(data: any[]) {

    const customHeaders = [
      ['序号', '需求用户', '项目名称',
        '项目类型', '工作地点', '已完成', '未完成', '供应商',
        '数量', '人工数量',
        '结束日期', '每日工作报告','负责人'
      ]
    ];
    // 2️⃣ Chuyển đổi dữ liệu thành định dạng mảng theo đúng thứ tự cột

    const exportData = data.map((item, index) => [
      index + 1,
      item.requester,
      item.projectName,
      item.categoryName,
      item.address,
      item.quantityCompleted,
      item.quantityRemain,
      item.contractor,
      item.quantity,
      item.numberWorker,
      // this.convertToCustomFormatDate(item.createAt),  // Chuyển đổi format ngày
      // item.progress,
      // this.convertToCustomFormatDate(item.startDate),
      this.convertToCustomFormatDate(item.endDate),
      item.implement.toLowerCase(),
      item.fullName,


    ]);
    const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([...customHeaders, ...exportData]);

    // 4️⃣ Định dạng cột (Độ rộng)
    worksheet['!cols'] = [
      { wch: 10 },   // STT
      { wch: 30 },  // Ngày báo cáo
      { wch: 20 },  // Ngày báo cáo
      { wch: 30 },  // Người báo cáo
      { wch: 30 },  // Dự án
      { wch: 30 },  // Loại công việc
      { wch: 30 },  // Địa chỉ
      { wch: 30 },  // Nhà thầu
      { wch: 30 },  // Số công nhân
      { wch: 30 },  // Tiến độ
      { wch: 25 },  // Số lượng
      { wch: 25 },  // Hoàn thành
      { wch: 25 },  // Hoàn thành

    ];

    // 5️⃣ Xuất file Excel
    const workbook: XLSX.WorkBook = { Sheets: { 'Báo cáo': worksheet }, SheetNames: ['Báo cáo'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const dataBlob: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

    if (this.form.value.exportDate === '' || this.form.value.exportDate === null) {
      saveAs(dataBlob, 'Daily_Report_' + this.convertToCustomFormatDate(data[0].createAt) + '.xlsx');
    } else {
      saveAs(dataBlob, 'Daily_Report_' + this.convertToCustomFormatDate(this.form.value.exportDate) + '.xlsx');

    }
  }

  getCategoryName(id: number): string {
    const cat = this.categories.find(c => c.categoryId === id);
    return cat ? cat.categoryName : '';
  }
  


}





