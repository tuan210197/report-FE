// import { Injectable } from '@angular/core';
// import {
//   HttpEvent,
//   HttpHandler,
//   HttpInterceptor,
//   HttpRequest,
//   HttpErrorResponse,
// } from '@angular/common/http';
// import { Observable, BehaviorSubject, throwError } from 'rxjs';
// import { catchError, switchMap, filter, take } from 'rxjs/operators';
// import { Router } from '@angular/router';
// import { AuthService } from '../services/auth.service';
// import Swal from 'sweetalert2';

// @Injectable()
// export class AuthInterceptor implements HttpInterceptor {

//   private isRefreshing = false; // Tránh gửi nhiều yêu cầu refresh token cùng lúc
//   private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

//   constructor(private authService: AuthService, private router: Router) { }

//   intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
//     return next.handle(req).pipe(
//       catchError((error: HttpErrorResponse) => {
//         if (error.status === 401) {

//         Swal.fire(error.error.status, error.error.message, 'error');
//         }
//         return throwError(() => error); // Các lỗi khác trả về bình thường
//       })
//     );
//   }
// }

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
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private router: Router) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 200) return throwError(() => error); // Nếu status code là 200 thì không xử lý lỗi
        let errorMessage = 'ERROR'; // Mặc định thông báo lỗi
        console.log(error.status);
        debugger;
        if (error.status === 400) {
          errorMessage = error.error.message;
        } else if (error.status === 401) {
          errorMessage = error.error.message;
          this.authService.logout(); // Tự động đăng xuất
          this.router.navigate(['/login']);
        } else if (error.status === 403) {
          errorMessage = error.error.message;
        } else if (error.status === 404) {
          errorMessage = error.error.message;
        } else if (error.status === 500) {
          errorMessage = error.error.message;
        }

        // Hiển thị thông báo lỗi lên giao diện bằng SweetAlert2
        Swal.fire('Infomation', errorMessage, 'error');

        return throwError(() => error);
      })
    );
  }
}
