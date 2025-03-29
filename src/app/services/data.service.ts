import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private dataSource = new BehaviorSubject<any>(null);
  currentData = this.dataSource.asObservable();

  constructor() {}

  changeData(data: any) {
    this.dataSource.next(data);
  }
  private projectId: number | null = null; // Lưu giá trị projectId

  setProjectId(id: number) {
    this.projectId = id;
  }

  getProjectId(): number | null {
    return this.projectId;
  }

  clearProjectId() {
    this.projectId = null; // Xóa dữ liệu khi không cần thiết
  }
}
