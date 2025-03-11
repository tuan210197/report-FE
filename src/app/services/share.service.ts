import { Injectable, numberAttribute } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { catchError, throwError } from 'rxjs';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class ShareService {

  private apiUrl = '/api';
  // private apiUrl = 'http://10.81.160.29:8080/api'

  constructor(private http: HttpClient, private router: Router) { }

  private handleError(error: HttpErrorResponse) {
    // Xử lý lỗi và trả về thông báo lỗi cho frontend


    Swal.fire('Error', error.error.message || 'Có lỗi xảy ra, vui lòng thử lại.', 'error');
    return throwError(() => error); // Đảm bảo không dừng hệ thống
  }

  login(employeeCode: string, password: string): Promise<boolean> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(this.apiUrl + '/user/login', { employeeCode, password }, { headers, withCredentials: true })
      .toPromise()
      .then(response => {
        console.log('Login successful:', response);
        this.router.navigate(['/home']);
        return true;
      })
      .catch(err => {
        console.error('Login error:', err);
        return false;
      });
  }

  logout() {
    return this.http.post(this.apiUrl + '/user/logout', {}, { withCredentials: true, responseType: 'text' });
  }

  checkAuthentication() {
    // Kiểm tra sự tồn tại của cookie với tên 'token'
    return this.http.post(this.apiUrl + '/user/check-auth', {}, { withCredentials: true });
  }
  getCharts() {
    return this.http.get(this.apiUrl + "/project/dashboard", { withCredentials: true });
  }

  getChartFromTo(data: any) {
    return this.http.post(this.apiUrl + "/project/dashboard-from-to", data, { withCredentials: true });
  }
  /* Start Project*/
  getProject() {
    return this.http.get(this.apiUrl + '/project/get-by-userid', { withCredentials: true });
  }
  getProjectChart(data: any) {
    return this.http.post(this.apiUrl + '/project/search-chart', data, { withCredentials: true });
  }
  getProjectChartFromTo(data: any) {
    return this.http.post(this.apiUrl + '/project/search-chart-from-to', data, { withCredentials: true });
  }
  getCompletedProject() {
    return this.http.get(this.apiUrl + '/project/get-completed2', { withCredentials: true });
  }

  getCompletedProjectFromTo(data: any) {
    return this.http.post(this.apiUrl + '/project/get-from-to', data, { withCredentials: true });
  }
  getProjectName() {
    return this.http.get(this.apiUrl + '/project/get-project-name', { withCredentials: true });
  }
  getStaff() {
    return this.http.get(this.apiUrl + '/staff/get-staff', { withCredentials: true });
  }
  getAllStaff() {
    return this.http.get(this.apiUrl + '/staff/get-all', { withCredentials: true });
  }
  addProject(data: any) {
    return this.http.post(this.apiUrl + '/project/add', data, { withCredentials: true });
  }

  addSubMember(data: any) {
    return this.http.post(this.apiUrl + '/sub-member/add', data, { withCredentials: true });
  }
  getProjectById(id: number) {
    return this.http.get(this.apiUrl + '/project/' + id, { withCredentials: true });
  }

  updateProject(data: any) {
    return this.http.post(this.apiUrl + '/project/update', data, { withCredentials: true });
  }

  updateStatus(data: any) {
    return this.http.post(this.apiUrl + '/project/update-status', data, { withCredentials: true });
  }
  search(data: any) {
    return this.http.post(this.apiUrl + '/project/search', data, { withCredentials: true });
  }
  searchByName(data: any) {
    return this.http.post(this.apiUrl + '/project/search-by-name', data, { withCredentials: true });
  }

  deleteProject(data: any) {
    return this.http.post(this.apiUrl + '/project/delete', data, { withCredentials: true });
  }
  /* End Project*/

  /*start category */

  getCategory() {
    return this.http.get(this.apiUrl + '/cate/get-all', { withCredentials: true });
  }
  /* Emd category */

  /*start sub-member */
  getProjectByUserId() {
    return this.http.get(this.apiUrl + '/sub-member/get-by-user', { withCredentials: true });
  }
  /*end sub member */


  /*start daily report */

  addNewDailyReport(data: any) {
    return this.http.post(this.apiUrl + '/daily-report/add', data, { withCredentials: true });
  }
  getDailyReport() {
    return this.http.get(this.apiUrl + '/daily-report/find-by-uuid', { withCredentials: true });
  }
  getDailyReportByProjecetId(data: any) {
    return this.http.post(this.apiUrl + '/daily-report/get-by-project', data, { withCredentials: true });
  }

  getExportDailyReport(data: any) {
    return this.http.post(this.apiUrl + '/daily-report/export', data, { withCredentials: true });
  }

  getMaxDateExport() {
    return this.http.get(this.apiUrl + '/daily-report/get-max-export-date', { withCredentials: true });
  }
  /*end daily report */
  /*implement */

  getAllImplement() {
    return this.http.get(this.apiUrl + '/implement/get-all', { withCredentials: true });
  }
  getImplementById(id: number) {
    return this.http.get(this.apiUrl + '/implement/get/' + id, { withCredentials: true });
  }
  getImplementByProjectId(data: any) {
    return this.http.post(this.apiUrl + '/implement/get-implement-by-project', data, { withCredentials: true });
  }

  /**Start user */
  getCurrentUser() {
    return this.http.get(this.apiUrl + '/staff/get-current', { withCredentials: true });
  }
  updateUser(data: any) {
    return this.http.post(this.apiUrl + '/user/update', data, { withCredentials: true });
  }
  updatePassword(data: any) {
    return this.http.post(this.apiUrl + '/user/password/change', data, { withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }

  checkPassword(data: any) {
    return this.http.post(this.apiUrl + '/user/password/check', data, { withCredentials: true });
  }


  /**pasword */
  sendOTP(data: any) {
    return this.http.post(this.apiUrl + '/user/password/forget', data, { withCredentials: true });
  }

  resetPassword(data: any) {
    return this.http.post(this.apiUrl + '/user/password/change', data, { withCredentials: true });
  }

  /**file upload */
  uploadFile(data: any) {

    return this.http.post(this.apiUrl + '/files/upload', data, { withCredentials: true });
  }

  loadFiles() {
    return this.http.get(this.apiUrl + '/files/get-all', { withCredentials: true })
  }
  loadDocument() {
    return this.http.get(this.apiUrl + '/files/get-all', { withCredentials: true });
  }
  downloadFile(fileName: string) {
    return this.http.get(this.apiUrl + '/files/download/' + fileName, {
      responseType: 'blob', withCredentials: true // Quan trọng để tải file nhị phân
    });
  }
}



