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
import { TranslateModule } from '@ngx-translate/core';
import { AppTranslateService } from '../../services/translate.service';
import { debounceTime, switchMap } from 'rxjs/operators';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { HttpClient } from '@angular/common/http';
import { Data, Router } from '@angular/router';
import { DataService } from '../../services/data.service';

export interface table {
  projectName: string;
  fileName: string;
  uploadAt: string;
  category: string;



}
@Component({
  selector: 'app-file-upload',
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
    TranslateModule,
    MatAutocompleteModule

  ],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.css'
})


export class FileUploadComponent implements OnInit {
  selectedFile: File | null = null;
  tableList: table[] = [];
  selectedProject: any = null; // Biến để lưu object được chọn
  projectsSearch: any[] = []; // Danh sách kết quả từ API
  displayedColumns: string[] = ['position', 'projectName', 'category', 'fileName', 'uploadAt', 'actions'];
  dataSource = new MatTableDataSource<table>(this.tableList);
  model: any;
  color = '#ADD8E6';
  receivedProjectId: number | null = null;

  constructor(
    private share: ShareService,
    private dataService: DataService,
    private router: Router) { }
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  ngAfterViewInit() {

    this.receivedProjectId = this.dataService.getProjectId(); // Nhận dữ liệu
    if (this.receivedProjectId != null) {
      this.SearchByUrlProject(this.receivedProjectId);
      this.dataSource.paginator = this.paginator;
    } else {
      this.dataSource.paginator = this.paginator;
      this.getAllDocument();

    }



  }
  ngOnInit(): void {
    this.getProjectName(); // Gọi khi load trang để lấy toàn bộ dự án
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300), // Đợi 500ms sau khi nhập để tránh gọi API quá nhiều lần
        switchMap(value => {
          const searchValue = typeof value === 'string' ? value.trim() : ''; // Kiểm tra giá trị đầu vào

          if (!searchValue) {
            this.getProjectName(); // Nếu nhập rỗng, load lại toàn bộ
            return []; // Không gọi searchProjects
          }
          return this.searchProjects(searchValue); // Gọi API tìm kiếm
        })
      )
      .subscribe((data: any) => {
        this.projectsSearch = data?.data ?? [];
      });
  }


  formGroup = new FormGroup({
    projectId: new FormControl('') // Lưu projectId vào FormGroup
  });
  searchControl = new FormControl(''); // Dùng để nhập và tìm kiếm
  // projects: any[] = []; // Danh sách kết quả từ API


  searchProjects(query: string) {
    var data = { projectName: query };
    return this.share.searchByName(data);
  }
  selectionChange(event: any) {
    // const selectedProject = this.projects.find(p => p.projectId === event.option.value);
    this.selectedProject = this.projectsSearch.find(p => p.projectId === event.option.value);

    if (this.selectedProject) {
      this.formGroup.controls['projectId'].setValue(this.selectedProject.projectId); // Lưu projectId
      this.searchControl.setValue(this.selectedProject.projectName, { emitEvent: false }); // Hiển thị projectName
    }
  }
  getProjectName() {
    this.share.getProjectName().subscribe((data: any) => {
      this.projectsSearch = data; // Gán dữ liệu vào mảng projects
    }, (error) => {
      // console.error('Lỗi khi tải dự án:', error);
    });
  }

  // Khi người dùng chọn file
  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    console.log(event.target.files[0])
    if (event.target.files) {
      document.getElementById("fileName")!.innerText = event.target.files[0].name;
    } else {
      document.getElementById("fileName")!.innerText = '';
    }
  }


  // Upload file lên server
  uploadFile(): void {
    if (!this.selectedFile) {
      alert('Vui lòng chọn file trước!');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    const fileUpload = {
      projectId: this.selectedProject.projectId
    }
    formData.append('fileUploadDTO', new Blob([JSON.stringify(fileUpload)], { type: "application/json" }));


    this.share.uploadFile(formData)
      .subscribe(() => {
        alert('Tải lên thành công!');
        //   this.loadFiles(); // Refresh danh sách file
        this.getAllDocument();
      }, error => {
        alert('Lỗi khi tải lên!');
      });

  }

  // Lấy danh sách file từ server
  loadFiles(): void {

    this.share.loadFiles()
      .subscribe();
  }

  downloadFile(data: any) {
    // const url = `/api/files/download/${data.fileName}`;

    this.share.downloadFile(data.fileName).subscribe(response => {
      // Xác định loại file
      const contentType = response.type || 'application/octet-stream';

      // Tạo blob
      const blob = new Blob([response], { type: contentType });
      const objectUrl = URL.createObjectURL(blob);

      // Tạo link tải về
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = data.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
    }, error => {
      console.error("Lỗi khi tải file:", error);
    });


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


  async getAllDocument() {
    this.tableList = [];
    const data = await firstValueFrom(this.share.loadDocument());
    if (Array.isArray(data) && data.length > 0) {
      data.forEach(item => this.tableList.push({
        projectName: item.projectId.projectName,
        fileName: item.fileName,
        uploadAt: item.uploadTime,
        category: item.projectId.category.categoryName,

      }))
    }

    this.dataSource.data = this.tableList;
  }
  async searchFile() {
    let projectId: number = Number(this.formGroup.value.projectId) || 0;
    console.log(projectId)
    if (projectId == 0) {
      debugger;
      this.getAllDocument();
    } else {
      const data: any = await firstValueFrom(this.share.SearchFileByProject(projectId));

      if (Array.isArray(data.data) && data.data.length > 0) {
        this.tableList = [];
        data.data.forEach((item: { projectId: { projectName: string; category: { categoryName: string } }; fileName: string; uploadTime: string }) =>
          this.tableList.push({
            projectName: item.projectId.projectName,
            fileName: item.fileName,
            uploadAt: item.uploadTime,
            category: item.projectId.category.categoryName,
          })
        );
        this.dataSource.data = this.tableList;
      } else {
        Swal.fire('Thông báo', 'Không có dữ liệu nào được tìm thấy!', 'info');
      }
    }

  }
  clearData() {
    this.formGroup.reset(); // Đặt lại giá trị của formGroup về mặc định
    this.searchControl.reset(); // Đặt lại giá trị của searchControl về mặc định
    this.selectedProject = null; // Đặt lại giá trị của selectedProject về null 
    this.selectedFile = null; // Đặt lại giá trị của selectedFile về null
    document.getElementById("fileName")!.innerText = ''; // Đặt lại tên file hiển thị về rỗng
    this.getAllDocument(); // Tải lại danh sách tài liệu
  }
  triggerFileInput() {
    document.getElementById("fileInput")!.click();
  }

  async SearchByUrlProject(projectId: number) {
    const data: any = await firstValueFrom(this.share.SearchFileByProject(projectId));
    this.tableList = [];
    if (Array.isArray(data.data) && data.data.length > 0) {
      data.data.forEach((item: { projectId: { projectName: string; category: { categoryName: string } }; fileName: string; uploadTime: string }) =>
        this.tableList.push({
          projectName: item.projectId.projectName,
          fileName: item.fileName,
          uploadAt: item.uploadTime,
          category: item.projectId.category.categoryName,
        })
      );
      this.dataSource.data = this.tableList;
    }
  }

}
