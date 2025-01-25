import { Injectable, numberAttribute } from '@angular/core';
import { HttpClient ,HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { catchError, throwError } from 'rxjs';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class ShareService {

  private apiUrl = '/api';

  constructor(private http: HttpClient, private router: Router) { }

  private handleError(error: HttpErrorResponse) {
 // Xử lý lỗi và trả về thông báo lỗi cho frontend


 Swal.fire('Error', error.error.message || 'Có lỗi xảy ra, vui lòng thử lại.', 'error');
 return throwError(() => error); // Đảm bảo không dừng hệ thống
  }
  getCharts(): Observable<Object> {
    return this.http.get(this.apiUrl + "/project/dashboard");
  }
  /* Start Project*/
  getProject() {
    return this.http.get(this.apiUrl + '/project/get-by-userid');
  }
  getCompletedProject() {
    return this.http.get(this.apiUrl + '/project/get-completed2');
  }
  getProjectName() {
    return this.http.get(this.apiUrl + '/project/get-project-name');
  }

  getStaff() {
    return this.http.get(this.apiUrl + '/staff/get-staff');
  }
  addProject (data : any){
    return this.http.post(this.apiUrl + '/project/add', data)
  }

  addSubMember(data: any){
    return this.http.post(this.apiUrl + '/sub-member/add', data)
  }
  getProjectById(id:number){
    return this.http.get(this.apiUrl + '/project/' + id)
  }
  updateProject(data:any){
    return this.http.post(this.apiUrl+ '/project/update', data)
  }

  updateStatus(data:any){
    return this.http.post(this.apiUrl + '/project/update-status', data)
  }
  search(data : any){
    return this.http.post(this.apiUrl + '/project/search', data)
  }
  /* End Project*/

  /*start category */

  getCategory() {
    return this.http.get(this.apiUrl + '/cate/get-all');
  }
  /* Emd category */

  /*start sub-member */
  getProjectByUserId() {
    return this.http.get(this.apiUrl + '/sub-member/get-by-user');
  }
  /*end sub member */


  /*start daily report */

  addNewDailyReport(data: any) {
    return this.http.post(this.apiUrl + '/daily-report/add', data);
  }
  getDailyReport() {
    return this.http.get(this.apiUrl + '/daily-report/find-by-uuid');
  }
  /*end daily report */

/*implement */

getAllImplement(){
  return this.http.get(this.apiUrl + '/implement/get-all')
}
getImplementById(id:number){
return this.http.get(this.apiUrl + '/implement/get/'+ id)
}

/**Start user */
getCurrentUser(){
  return this.http.get(this.apiUrl+ '/staff/get-current')
}
updateUser(data:any){
  return this.http.post(this.apiUrl +'/user/update',data)
}
updatePassword(data:any){
  return this.http.post(this.apiUrl + '/user/password/change', data).pipe(
    catchError(this.handleError)
  );
}

checkPassword(data: any){
  return this.http.post(this.apiUrl + '/user/password/check', data)
}


/**pasword */
sendOTP(data: any){
return this.http.post(this.apiUrl + '/user/password/forget', data)
}

resetPassword(data : any){
  return this.http.post(this.apiUrl + '/user/password/change', data)
}
}



