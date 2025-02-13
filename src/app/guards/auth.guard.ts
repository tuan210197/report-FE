// src/app/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private http: HttpClient, private router: Router) { }
  private excludedUrls: string[] = [
    '/forgot-password',
    '/resetPassword',
    '/verifyEmail',
    '/register',
    '/login',
    '/logout'
  ]; // Các URL bạn muốn loại bỏ kiểm tra
  private apiUrl = '/api'; // Replace with your API URL

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    const currentUrl = state.url;
    const isExcluded = this.excludedUrls.some(url => currentUrl.includes(url));
    if (isExcluded) {
      if (currentUrl === '/login') {
        return this.http.post<string>(this.apiUrl + '/user/check-auth', {}, { withCredentials: true }).pipe(
          map((response: any) => {
            if (response.message === 'Successfully') {
              this.router.navigate(['/home']); // Nếu đã đăng nhập, chuyển hướng về trang home
              return false;
            }
            return true; // Nếu chưa đăng nhập, cho phép truy cập trang login
          }),
          catchError(() => {
            return of(true); // Nếu API lỗi, vẫn cho phép truy cập login
          })
        );
      }
      return of(true);
    }

    return this.http.post<string>(this.apiUrl + '/user/check-auth', {}, { withCredentials: true }).pipe(
      map((response: any) => {
        if (response.message === 'Successfully') {
          // this.router.navigate(['/home']); // Chuyển hướng đến /home nếu đã đăng nhập
          if (currentUrl === '/login') {
            this.router.navigate(['/home']);
            return false;
          }
          return true; // Không cho phép truy cập vào trang khác (ví dụ: /login)
        }
        this.router.navigate(['/login']);
        return false;
      }),
      catchError((e) => {
        console.error('Authentication error:', e);
        this.router.navigate(['/login']); // Chuyển hướng tới /login nếu xác thực thất bại
        return of(false);
      })
    );
  }
}