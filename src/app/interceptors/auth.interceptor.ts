import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ShareService } from '../services/share.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private share : ShareService, private router: Router) { }


  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
   
    if (req.url.includes('/user/check-auth')) {
      return next.handle(req);
    }
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 200) return throwError(() => error); // Nếu status code là 200 thì không xử lý lỗi
        let errorMessage = 'ERROR'; // Mặc định thông báo lỗi
        console.log(error.status);

        if (error.status === 400) {
          errorMessage = error.error.message;
        } else if (error.status === 401) {
          errorMessage = error.error.message;
          this.share.logout(); // Tự động đăng xuất
          this.router.navigate(['/login']);
        } else if (error.status === 403) {
          errorMessage = error.error.message;
        } else if (error.status === 404) {
          errorMessage = error.error.message;
        } else if (error.status === 500) {
          errorMessage = error.error.message;
        }

        // Hiển thị thông báo lỗi lên giao diện bằng SweetAlert2
        Swal.fire('System Notification', errorMessage, 'info');

        return throwError(() => error);
      })
    );
  }
}
