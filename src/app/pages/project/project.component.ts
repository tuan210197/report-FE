import { AfterViewInit, Component, ViewChild, ChangeDetectionStrategy, OnDestroy, OnInit, inject } from '@angular/core';
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
import { ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common'; // ✅ Import CommonModule
import { AppTranslateService } from '../../services/translate.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { MatSort, Sort, MatSortModule } from '@angular/material/sort';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Colors } from '../../common/color-chart';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export interface table {
  projectName: string;
  pic: string;
  category: string;
  description: string;
  projectId: number;
  completed: boolean;
  canceled: boolean;
  startDate: string;
  endDate: string;
  status: string;
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
    TranslateModule,
    MatOptionModule,
    MatSelectModule,
    MatSortModule
  ],
  providers: [{ provide: DateAdapter, useClass: NativeDateAdapter },
  { provide: MAT_DATE_FORMATS, useValue: MAT_NATIVE_DATE_FORMATS },],

  templateUrl: './project.component.html',
  styleUrl: './project.component.css',

})
export class ProjectComponent implements AfterViewInit, OnInit, OnDestroy {
  tableList: table[] = [];
  displayedColumns: string[] = ['position', 'projectName', 'pic', 'category', 'document', 'status', 'startDate', 'endDate', 'actions', 'delete'];
  dataSource = new MatTableDataSource<table>(this.tableList);
  model: any;
  color = '#ADD8E6';
  selectedProjectId: number | null = null; // Biến lưu id của dự án
  inputText: string = '';
  form: FormGroup;
  projectForm!: FormGroup; // Khai báo FormGroup

  // searchForm: FormGroup;
  users: any[] = [];
  selectedUser: string | null = null;
  private _liveAnnouncer = inject(LiveAnnouncer);
  selectedName: string | null = null;
  selectedCategory: string | null = null;
  selectedCompleted: string | null = null;

  uniqueNames: string[] = [];
  uniqueCategories: string[] = [];
  categories: any[] = []; // Mảng lưu danh sách danh mục
  statusList: any[] = [];


  private searchSubject = new Subject<string>();

  private readonly debounceTimeMs = 500; // Set the debounce time (in milliseconds)
  constructor(private dialog: MatDialog,
    private share: ShareService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private translate: TranslateService
  ) {
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
      endPO: [null],
      user: [null],
      inputText: [''],
      typeSearch: [''],
      implement: [''],
      userFilter: [''],
      projectName: [''],
      categoryId: [''],
      status: [''],

    });

  }



  ngOnInit() {
    this.getAllStatus();
    this.form.get('inputText')?.valueChanges.pipe(
      debounceTime(this.debounceTimeMs)
    ).subscribe(searchValue => {
      if (searchValue === '' || searchValue === null) {
        this.loadProject();
      } else {
        this.performSearch(searchValue);
      }
    }
    );
    this.dataService.currentData.subscribe((data) => {
      // console.log(data)
      this.getStaff();
      if (data === null) {
        this.getCategory();
        this.loadProject();
      } else {
        if ('from' in data) {

          this.getCategory();
          this.loadProjectChartFromTo(data);
        } else {

          this.getCategory();
          this.loadProjectChart(data);
        }
      }
    });
  }
  async performSearch(searchValue: string) {

    var val = {
      projectName: searchValue.toUpperCase(),
      categoryName: searchValue.toLocaleUpperCase()
    }
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
        canceled: item.canceled,
        startDate: item.startDate,
        endDate: item.endDate,
        status: item.status.statusId
      }))
    }

    this.dataSource.data = this.tableList;
    this.paginator.firstPage()
  }

  translateService = inject(AppTranslateService);
  selectedRow: any = null;

  selectRow(row: any) {
    this.selectedRow = row;
  }

  ngOnDestroy() {
    this.searchSubject.complete();
  }
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.dataSource.sortingDataAccessor = (item: any, property) => {
      switch (property) {
        case 'pic': return item.pic.fullName.toLowerCase(); // Sắp xếp theo fullName của pic
        case 'category': return item.category.categoryName.toLowerCase(); // Sắp xếp theo fullName của pic
        case 'status': return this.getStatusText(item).toLowerCase(); // Sắp xếp theo trạng thái hiển thị
        default: return item[property]; // Các trường khác xử lý mặc định
      }
    };
  }
  applyFilter() {

    this.loadProject();

    this.dataSource.filterPredicate = (data: any, filter: string) => {
      // console.log(data)
      const matchesName = this.selectedName ? data.pic.fullName === this.selectedName : true;
      const matchesCategory = this.selectedCategory ? data.category.categoryName === this.selectedCategory : true;
      const matchesCompleted = this.selectedCompleted === null || this.selectedCompleted === '' ? true : data.status === this.selectedCompleted;
      return matchesName && matchesCategory && matchesCompleted;
    };

    this.dataSource.filter = Math.random().toString(); // Cần cập nhật để Angular nhận diện filter thay đổi
  }
  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  getStaff() {
    this.share.getAllStaff().subscribe((data: any) => {
      this.users = data;
      this.uniqueNames = data.map((item: any) => item.fullName);
    }, (error) => {
      console.error('lỗi khi load staff', error);
    })
  }

  showDetails(data: number): void {
    this.dialog.open(ImplementComponent, {
      width: '60vw',
      height: 'auto',
      data: data,
    });
  }
  async delete(data: number): Promise<void> {
    const admin: any = await firstValueFrom(this.share.getCurrentUser());
    if (admin.role.role_id === 1) {
      Swal.fire({
        title: 'Bạn có chắc chắn muốn xóa?',
        icon: 'warning',
        showCancelButton: true,

        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy',
        customClass: {
          confirmButton: 'btn btn-danger me-2',
          cancelButton: 'btn btn-success ms-2',
        }
      }).then(async (result) => {
        if (result.isConfirmed) {
          var val = { projectId: data };
          // console.log(val)
          try {
            const isDeleted: any = await firstValueFrom(this.share.deleteProject(val));

            if (isDeleted.code === '200') {
              Swal.fire('Deleted', isDeleted.message, 'success');
              this.loadProject();
            } else {
              Swal.fire('Delete Fail', isDeleted.message, 'info');
            }
          } catch (error) {
            Swal.fire('Lỗi', 'Đã xảy ra lỗi khi xóa!', 'error');
          }
        }
      });
    }
  }


  async openDialog() {
    const admin: any = await firstValueFrom(this.share.getCurrentUser());
    if (admin.role.role_id === 1) {
      this.dialog.open(AddProjectComponent, {
        width: '50vw', // Đặt kích thước dialog
        height: 'auto',
        data: {} // Nếu cần truyền thêm dữ liệu vào form
      });
    } else {
      Swal.fire('Thông báo', 'Bạn không có quyền thêm dự án', 'info');
    }
  }

  async loadProject() {
    this.tableList = [];
    const data = await firstValueFrom(this.share.getProject());
    // console.log(data)
    if (Array.isArray(data) && data.length > 0) {
      data.forEach(item => this.tableList.push({
        projectName: item.projectName,
        category: item.category,
        pic: item.pic,
        description: item.description,
        projectId: item.projectId,
        completed: item.completed,
        canceled: item.canceled,
        startDate: item.startDate,
        endDate: item.endDate,
        status: item.status.statusId
      }))
    }

    this.dataSource.data = this.tableList;
  }

  async loadProjectChart(chart: any) {
    // console.log(chart)
    let total = Colors.TOTAL_PROJECTS;
    let remain = Colors.REMAIN_PROJECTS;
    let acceptance = Colors.ACCEPTANCE_PROJECTS;
    let completed = Colors.COMPLETED_PROJECTS;
    let cancelled = Colors.CANCELED_PROJECTS;

    if (chart.color === completed) {
      var val = {
        type: 'completed',
        categoryName: chart.category,
        status: chart.id
      }
    } else if (chart.color === remain) {
      var val = {
        type: 'remain',
        categoryName: chart.category,
        status: chart.id
      }

    } else if (chart.color === cancelled) {
      var val = {
        type: 'cancelled',
        categoryName: chart.category,
        status: chart.id
      }

    } else if (chart.color === acceptance) {
      val = {
        type: 'acceptance',
        categoryName: chart.category,
        status: chart.id
      }
    }
    else {
      if (chart.isCompleted === 'Completed') {
        var val: { type: string; categoryName: any; status: any } = {
          type: 'completedTotal',
          categoryName: chart.category,
          status: 'completed'
        }
      }
      else if (chart.isCompleted === 'In Progress') {
        var val: { type: string; categoryName: any; status: any } = {
          type: 'remainTotal',
          categoryName: chart.category,
          status: chart.id
        }


      } else if (chart.isCompleted === 'Acceptance') {
        var val: { type: string; categoryName: any; status: any } = {
          type: 'acceptanceTotal',
          categoryName: chart.category,
          status: chart.id
        }
      } else {
        var val: { type: string; categoryName: any; status: any } = {
          type: 'cancelledTotal',
          categoryName: chart.category,
          status: 'cancelled'
        }

      }
    }
    // console.log(val)
    this.tableList = [];
    const data: any = await firstValueFrom(this.share.getProjectChart(val));

    if (Array.isArray(data.data) && data.data.length > 0) {
      data.data.forEach((item: {
        projectName: string;
        category: string;
        pic: string;
        description: string;
        projectId: number;
        completed: boolean;
        canceled: boolean;
        startDate: string;
        endDate: string;
        status: { statusId: string };
      }) => this.tableList.push({
        projectName: item.projectName,
        category: item.category,
        pic: item.pic,
        description: item.description,
        projectId: item.projectId,
        completed: item.completed,
        canceled: item.canceled,
        startDate: item.startDate,
        endDate: item.endDate,
        status: item.status.statusId
      }));
    }
    this.dataSource.data = this.tableList;
  }
  async loadProjectChartFromTo(chart: any) {
    // console.log(chart)


    let total = Colors.TOTAL_PROJECTS;
    let remain = Colors.REMAIN_PROJECTS;
    let acceptance = Colors.ACCEPTANCE_PROJECTS;
    let completed = Colors.COMPLETED_PROJECTS;
    let cancelled = Colors.CANCELED_PROJECTS;
    if (chart.color === completed) {
      var val = {
        type: 'completed',
        categoryName: chart.category,
        from: chart.from,
        to: chart.to,
        status: chart.id
      }

    } else if (chart.color === remain) {

      var val = {
        type: 'remain',
        categoryName: chart.category,
        from: chart.from,
        to: chart.to,
        status: chart.id
      }

    } else if (chart.color === cancelled) {
      var val = {
        type: 'cancelled',
        categoryName: chart.category,
        from: chart.from,
        to: chart.to,
        status: chart.id
      }

    }

    else if (chart.color === acceptance) {
      var val = {
        type: 'acceptance',
        categoryName: chart.category,
        from: chart.from,
        to: chart.to,
        status: chart.id
      }
    }
    else {
      if (chart.isCompleted === 'Completed') {
        var val: { type: string; categoryName: any; from: any, to: any, status: any } = {
          type: 'completedTotal',
          categoryName: chart.category,
          from: chart.from,
          to: chart.to,
          status: 'completed'
        }

      }
      else if (chart.isCompleted === 'In Progress') {
        var val: { type: string; categoryName: any; from: any, to: any, status: any } = {
          type: 'remainTotal',
          categoryName: chart.category,
          from: chart.from,
          to: chart.to,
          status: chart.id
        }


      }
      else if (chart.isCompleted === 'Acceptance') {
        var val: { type: string; categoryName: any; from: any, to: any, status: any } = {
          type: 'acceptanceTotal',
          categoryName: chart.category,
          from: chart.from,
          to: chart.to,
          status: chart.id
        }
      }
      else {
        var val: { type: string; categoryName: any; from: any, to: any, status: any } = {
          type: 'cancelledTotal',
          categoryName: chart.category,
          from: chart.from,
          to: chart.to,
          status: 'cancelled'
        }

      }
    }

    this.tableList = [];
    const data: any = await firstValueFrom(this.share.getProjectChartFromTo(val));

    if (Array.isArray(data.data) && data.data.length > 0) {
      data.data.forEach((item: {
        projectName: string;
        category: string;
        pic: string;
        description: string;
        projectId: number;
        completed: boolean;
        canceled: boolean;
        startDate: string;
        endDate: string;
        status: { statusId: string };
      }) => this.tableList.push({
        projectName: item.projectName,
        category: item.category,
        pic: item.pic,
        description: item.description,
        projectId: item.projectId,
        completed: item.completed,
        canceled: item.canceled,
        startDate: item.startDate,
        endDate: item.endDate,
        status: item.status.statusId
      }));
    }
    this.dataSource.data = this.tableList;
  }
  getCategory() {
    this.share.getCategory().subscribe((data: any) => {
      this.categories = data; // Gán dữ liệu vào mảng categories
      this.uniqueCategories = data.map((item: any) => item.categoryName);
    },
      (error) => {
        console.error('Lỗi khi tải danh mục:', error);

      });
  }
  async getRecord(row: any) {

    const dataRow: any = await firstValueFrom(this.share.getProjectById(row.projectId));
    console.log(dataRow.data)
    const dateImplement: any = await firstValueFrom(this.share.getImplementByProjectId(row.projectId));
    const result = dateImplement.data.join("\n");
    // this.translate.onLangChange.subscribe(() => {
    this.form.patchValue(
      {
        startReceiveRequest: dataRow.data.startReceiveRequest,
        endReceiveRequest: dataRow.data.endReceiveRequest,
        startRequestPurchase: dataRow.data.startRequestPurchase,
        endRequestPurchase: dataRow.data.endRequestPurchase,
        startEstimate: dataRow.data.startEstimate,
        endEstimate: dataRow.data.endEstimate,
        startQuotation: dataRow.data.startQuotation,
        endQuotation: dataRow.data.endQuotation,
        startSubmitBudget: dataRow.data.startSubmitBudget,
        endSubmitBudget: dataRow.data.endSubmitBudget,
        startPR: dataRow.data.startPR,
        endPR: dataRow.data.endPR,
        startDate: dataRow.data.startDate,
        endDate: dataRow.data.endDate,
        startPO: dataRow.data.startPO,
        endPO: dataRow.data.endPO,
        user: dataRow.data.pic?.uid.trim(),
        implement: result,
        projectName: dataRow.data.projectName,
        categoryId: dataRow.data.category.categoryId,


      }


      // dataRow.data
    );
    //  })
    console.log(this.form.value)
    this.selectedProjectId = row.projectId;
    this.selectRow(row);

  }
  clearData() {
    this.form.reset();
    this.selectedCategory = null;
    this.selectedName = null;
    this.selectedCompleted = null;
  }
  update() {
    var val = {
      startReceiveRequest: this.convertToCustomFormat(this.form.value.startReceiveRequest),
      endReceiveRequest: this.convertToCustomFormat(this.form.value.endReceiveRequest),
      startRequestPurchase: this.convertToCustomFormat(this.form.value.startRequestPurchase),
      endRequestPurchase: this.convertToCustomFormat(this.form.value.endRequestPurchase),
      startEstimate: this.convertToCustomFormat(this.form.value.startEstimate),
      endEstimate: this.convertToCustomFormat(this.form.value.endEstimate),
      startQuotation: this.convertToCustomFormat(this.form.value.startQuotation),
      endQuotation: this.convertToCustomFormat(this.form.value.endQuotation),
      startSubmitBudget: this.convertToCustomFormat(this.form.value.startSubmitBudget),
      endSubmitBudget: this.convertToCustomFormat(this.form.value.endSubmitBudget),
      startPR: this.convertToCustomFormat(this.form.value.startPR),
      endPR: this.convertToCustomFormat(this.form.value.endPR),
      startDate: this.convertToCustomFormat(this.form.value.startDate),
      endDate: this.convertToCustomFormat(this.form.value.endDate),
      startPO: this.convertToCustomFormat(this.form.value.startPO),
      endPO: this.convertToCustomFormat(this.form.value.endPO),
      projectId: this.selectedProjectId,
      pic: this.form.value.user,
      projectName: this.form.value.projectName,
      categoryId: this.form.value.categoryId,
    }
    // console.log(val.startDate)
    // console.log(val.endDate)
    // console.log(val)
    this.share.updateProject(val).subscribe((data: any) => {

      if (data.code === '200') {
        Swal.fire('update', 'update success', 'info')
      }
      // this.loadProject();
      // this.clearData();
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
          // console.log(val)
          await firstValueFrom(this.share.updateStatus(val));
          // this.loadProject();
        } else {

          // this.loadProject();
        }
      });
    }
  }

  onSearch() {
    this.searchSubject.next(this.inputText);
  }


  // Hàm lấy class theo trạng thái
  getStatusClass(project: any): string {

    if (project.canceled) {
      return 'btn btn-danger'; // Màu đỏ
    }
    if (project.completed) {
      return 'btn btn-success'; // Màu xanh
    }
    return 'btn btn-warning'; // Màu vàng
  }

  // Hàm lấy text theo trạng thái
  getStatusText(project: any): string {
    return project.status;
  }
  async confirmChange(data: any) {
    const admin: any = await firstValueFrom(this.share.getCurrentUser());
    if (admin.role.role_id === 1) {
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
          const allStatusOptions = this.statusList;
          // console.log(allStatusOptions)
          let currentStatus = data.status;
          const statusOptions = allStatusOptions
            .filter(status => status.statusId !== currentStatus)
            .reduce((acc, status) => {
              acc[status.statusId] = status.statusName;
              return acc;
            }, {} as { [key: string]: string });
          // console.log(statusOptions)
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
              // console.log(newStatus.value)
              this.updateProjectStatus(newStatus.value, data.projectId);
            }
          });
        }
      });
    }

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
      // console.error("Invalid date string:", error);
      return null;
    }
  }
  getAllStatus() {
    this.share.getAllStatus().subscribe((data: any) => {
      // console.log(data.data)
      this.statusList = data.data;
    });
  }
  handleClick(event: MouseEvent, projectId: number) {
    event.preventDefault(); // Ngăn chặn chuyển hướng mặc định

    this.dataService.setProjectId(projectId); // Gửi projectId đến service
    this.router.navigate(['/files']);
  }
  exportExcel() {

    const customHeaders = [
      ['STT', 'Tên dự án', 'Người phụ trách', 'Loại hình dự án',
        'Trạng thái', 'Ngày bắt đầu', 'Ngày kết thúc'
      ]
    ];
    console.log(this.dataSource.filteredData)

    const exportData = this.dataSource.filteredData.map((item: any, index) => [
      index + 1,
      item.projectName,
      item.pic.fullName,
      item.category.categoryName,
      this.translate.instant(item.status),
      item.startDate,
      item.endDate
    ]).filter(row => row.every(cell => cell !== undefined));
    const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([...customHeaders, ...exportData]);

    // 4️⃣ Định dạng cột (Độ rộng)
    worksheet['!cols'] = [
      { wch: 10 },   // STT
      { wch: 70 },  // Ngày báo cáo
      { wch: 30 },  // Ngày báo cáo
      { wch: 30 },  // Người báo cáo
      { wch: 20 },  // Dự án
      { wch: 20 },  // Loại công việc
      { wch: 20 },  // Địa chỉ

    ];

    // 5️⃣ Xuất file Excel
    const workbook: XLSX.WorkBook = { Sheets: { 'Báo cáo': worksheet }, SheetNames: ['Báo cáo'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const dataBlob: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

    saveAs(dataBlob, 'Export project.xlsx');
  }
}