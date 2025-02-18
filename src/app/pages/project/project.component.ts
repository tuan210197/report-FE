import { AfterViewInit, Component, ViewChild, ChangeDetectionStrategy, OnDestroy, OnInit , inject } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS, MAT_NATIVE_DATE_FORMATS, MatNativeDateModule, NativeDateAdapter } from '@angular/material/core';
import { FormsModule, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { AddProjectComponent } from '../add-project/add-project.component';
import { ImplementComponent } from '../implement/implement.component';
import { ShareService } from '../../services/share.service';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common'; // ✅ Import CommonModule
import { AppTranslateService } from '../../services/translate.service';
import { TranslateModule } from '@ngx-translate/core';
export interface table {
  projectName: string;
  pic: string;
  category: string;
  description: string;
  projectId: number;
  completed: boolean;
  canceled: boolean;
}

@Component({
  selector: 'app-project',
  standalone: true,
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatGridListModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule,
    ReactiveFormsModule, 
    CommonModule,
    TranslateModule
  ],
  providers: [{ provide: DateAdapter, useClass: NativeDateAdapter },
  { provide: MAT_DATE_FORMATS, useValue: MAT_NATIVE_DATE_FORMATS },],

  templateUrl: './project.component.html',
  styleUrl: './project.component.css',

})
export class ProjectComponent implements AfterViewInit, OnInit, OnDestroy {
  tableList: table[] = [];
  displayedColumns: string[] = ['position', 'projectName', 'pic', 'category', 'description', 'status', 'actions'];
  dataSource = new MatTableDataSource<table>(this.tableList);
  model: any;
  color = '#ADD8E6';
  selectedProjectId: number | null = null; // Biến lưu id của dự án
  inputText: string = '';
  form: FormGroup;
  searchForm: FormGroup;
  private searchSubject = new Subject<string>();

  private readonly debounceTimeMs = 500; // Set the debounce time (in milliseconds)
  constructor(private dialog: MatDialog, private share: ShareService, private authService: AuthService, private fb: FormBuilder) {
    this.form = this.fb.group({
      startReceiveRequest: [null],
      endReceiveRequest: [null],
      startRequestPurchase: [null],
      endRequestPurchase: [null],
      startEstimate: [null],
      endEstimate: [null],
      startQuotation: [null],
      endQuotation: [null],
      startSubmitBudget: [null],
      endSubmitBudget: [null],
      startPR: [null],
      endPR: [null],
      startDate: [null],
      endDate: [null],
      startPO: [null],
      endPO: [null]
    });

    this.searchForm = this.fb.group({
      search: ['']
    });
  }
  categories: any[] = []; // Mảng lưu danh sách danh mục
  selectedCategory: string | null = null; // Lưu ID danh mục được chọn


  ngOnInit() {
    this.searchSubject.pipe(debounceTime(this.debounceTimeMs)).subscribe((searchValue) => {
      this.performSearch(searchValue);
    });
  }
  translateService = inject(AppTranslateService);

  switchLanguage() {
    this.translateService.switchLanguage();
  }

  ngOnDestroy() {
    this.searchSubject.complete();
  }
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.loadProject();
  }
  showDetails(data: number): void {
    this.dialog.open(ImplementComponent, {
      width: '60vw',
      height: 'auto',
      data: data,
    });
  }

  openDialog() {
    this.dialog.open(AddProjectComponent, {
      width: '50vw', // Đặt kích thước dialog
      height: 'auto',
      data: {} // Nếu cần truyền thêm dữ liệu vào form
    });
  }

  async loadProject() {
    this.tableList = [];
    const data = await firstValueFrom(this.share.getProject());
    if (Array.isArray(data) && data.length > 0) {
      data.forEach(item => this.tableList.push({
        projectName: item.projectName,
        category: item.category,
        pic: item.pic,
        description: item.description,
        projectId: item.projectId,
        completed: item.completed,
        canceled: item.canceled
      }))
    }

    this.dataSource.data = this.tableList;
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
  async getRecord(row: any) {
    const dataRow: any = await firstValueFrom(this.share.getProjectById(row.projectId));
    this.form.patchValue(dataRow.data);
    this.selectedProjectId = row.projectId;
    console.log(dataRow)
  }
  clearData() {
    this.form.reset();
  }
  update() {
    var val = {
      startReceiveRequest: this.form.value.startReceiveRequest,
      endReceiveRequest: this.form.value.endReceiveRequest,
      startRequestPurchase: this.form.value.startRequestPurchase,
      endRequestPurchase: this.form.value.endRequestPurchase,
      startEstimate: this.form.value.startEstimate,
      endEstimate: this.form.value.endEstimate,
      startQuotation: this.form.value.startQuotation,
      endQuotation: this.form.value.endQuotation,
      startSubmitBudget: this.form.value.startSubmitBudget,
      endSubmitBudget: this.form.value.endSubmitBudget,
      startPR: this.form.value.startPR,
      endPR: this.form.value.endPR,
      startDate: this.form.value.startDate,
      endDate: this.form.value.endDate,
      startPO: this.form.value.startPO,
      endPO: this.form.value.endPO,
      projectId: this.selectedProjectId
    }

    this.share.updateProject(val).subscribe((data: any) => {
      console.log(data)
      if (data.code === '200') {
        Swal.fire('update', 'update success', 'info')
      }
    })
  }
  async updateStatus(element: any, event: any) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-success me-2",
        cancelButton: "btn btn-danger ms-2"
      },
      buttonsStyling: false
    });
    if (element.projectId !== null) {
      const initialCompleted = element.completed;

      swalWithBootstrapButtons.fire({
        title: `Xác Nhận Dự Án ${element.projectName} Đã Hoàn Thành`,
        icon: 'question', // Biểu tượng cảnh báo
        showCancelButton: true, // Hiển thị nút Cancel
        confirmButtonText: 'Có', // Nút xác nhận
        cancelButtonText: 'Không', // Nút hủy
        reverseButtons: false // Đảo ngược thứ tự nút (nút "Có" sẽ ở bên trái)

      }).then(async (result) => {
        if (result.isConfirmed) {
          // element.completed = event.checked ? true : false;
          var val = {
            projectId: element.projectId,
            completed: element.completed,
          }
          console.log(val)
          await firstValueFrom(this.share.updateStatus(val));
          this.loadProject();
        } else {

          this.loadProject();
        }
      });
    }
  }

  onSearch() {
    this.searchSubject.next(this.inputText);
  }
  async performSearch(searchValue: string) {

    var val = {
      projectName: searchValue.toUpperCase(),
      categoryName: searchValue.toLocaleUpperCase()
    }
    console.log(val)
    const data = await firstValueFrom(this.share.search(val));
    this.tableList = [];

    if (Array.isArray(data) && data.length > 0) {
      data.forEach(item => this.tableList.push({
        projectName: item.projectName,
        category: item.category,
        pic: item.pic,
        description: item.description,
        projectId: item.projectId,
        completed: item.completed,
        canceled: item.canceled
      }))
    }

    this.dataSource.data = this.tableList;
    this.paginator.firstPage()
  }


  // Hàm lấy class theo trạng thái
  getStatusClass(project: any): string {

    if (project.canceled) {
      return 'btn-danger'; // Màu đỏ
    }
    if (project.completed) {
      return 'btn-success'; // Màu xanh
    }
    return 'btn-warning'; // Màu vàng
  }

  // Hàm lấy text theo trạng thái
  getStatusText(project: any): string {
    if (project.canceled) {
      return 'Cancelled';
    }
    if (project.completed) {
      return 'Completed';
    }
    return 'In Progress';
  }
  confirmChange(data: any) {

    Swal.fire({
      title: 'Confirm Status Change?',
      text: 'Do you want to change the status of this project?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Change Status',
      cancelButtonText: 'Cancelled',
      customClass: {
        confirmButton: 'btn btn-success me-2',
        cancelButton: 'btn btn-danger ms-2',
      }
    }).then((result) => {
      if (result.isConfirmed) {
        // Danh sách tất cả trạng thái
        const allStatusOptions: { [key: string]: string } = {
          remain: 'In Progress',
          completed: 'Completed',
          canceled: 'Cancelled',
        };

        let currentStatus: string = '';
        if (data.completed === true) {
          currentStatus = 'completed';
        } else if (data.canceled === true) {
          currentStatus = 'canceled';
        } else {
          currentStatus = 'remain';
        }

        // Tạo một object mới, lọc bỏ trạng thái hiện tại
        const statusOptions = Object.fromEntries(
          Object.entries(allStatusOptions).filter(([key]) => key !== currentStatus)
        );
        Swal.fire({
          title: 'Update Status',
          input: 'select',
          inputOptions: statusOptions, // Truyền danh sách trạng thái đã loại bỏ trạng thái hiện tại
          inputPlaceholder: 'Choose a status',
          showCancelButton: true,
          confirmButtonText: 'Update',
          cancelButtonText: 'Cancelled',
          customClass: {
            confirmButton: 'btn btn-success me-2',
            cancelButton: 'btn btn-danger ms-2',
          }
        }).then((newStatus) => {
          if (newStatus.isConfirmed && newStatus.value) {
            this.updateProjectStatus(newStatus.value, data.projectId);
          }
        });
      }
    });
  }
  async updateProjectStatus(status: any, projectId: any) {

    var val = {
      projectId: projectId,
      status: status
    }
    const update: any = await firstValueFrom(this.share.updateStatus(val));
   
    Swal.fire('update', update.message, 'info')
    this.loadProject();
  }

}



