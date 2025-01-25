import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  // constructor(private router: Router, private auth: AuthService) { }

  // intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  //   // Sao chép yêu cầu và thêm thuộc tính withCredentials để gửi cookie cùng với request
  //   const clonedRequest = req.clone({
  //     withCredentials: true, // Đảm bảo gửi cookie kèm theo yêu cầu HTTP
  //   });


  //   return next.handle(clonedRequest).pipe(
  //     catchError((error: HttpErrorResponse) => {
  //       if (error.status === 401) {
  //         console.log('Token expired. Attempting refresh...');
  //         this.router.navigate(['/login']);
  //       }
  //       return throwError(error);
  //     })
  //   );
  // }
  private isRefreshing = false; // Tránh gửi nhiều yêu cầu refresh token cùng lúc
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private authService: AuthService, private router: Router) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Token hết hạn hoặc không hợp lệ
          // return this.handle401Error(req, next);
        Swal.fire(error.error.status, error.error.message, 'error');
        }
        return throwError(() => error); // Các lỗi khác trả về bình thường
      })
    );
  }
  // private handle401Error(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  //   if (!this.isRefreshing) {
  //     this.isRefreshing = true;
  //     this.refreshTokenSubject.next(null); // Reset token subject

  //     return this.authService.refreshToken().pipe(
  //       switchMap((response: any) => {
  //         this.isRefreshing = false;

  //         // Lấy token mới từ response và lưu (nếu cần thiết)
  //         this.refreshTokenSubject.next(response.data.token);

  //         // Gửi lại request gốc với token mới
  //         return next.handle(req);
  //       }),
  //       catchError((refreshError) => {
  //         this.isRefreshing = false;

  //         // Nếu refresh token thất bại, logout người dùng
  //         this.authService.logout();
  //         this.router.navigate(['/login']);
  //         return throwError(() => refreshError);
  //       })
  //     );
  //   } else {
  //     // Nếu refresh đang diễn ra, đợi quá trình đó hoàn thành
  //     return this.refreshTokenSubject.pipe(
  //       filter((token) => token != null), // Chỉ tiếp tục khi token đã được cập nhật
  //       take(1),
  //       switchMap(() => {
  //         // Gửi lại request gốc với token mới
  //         return next.handle(req);
  //       })
  //     );
  //   }
  // }
}