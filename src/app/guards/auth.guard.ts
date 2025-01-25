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
  // constructor(private router: Router, private authService: AuthService) {}



  //   canActivate(): boolean {
  //     // Kiểm tra xem người dùng có token trong cookie không
  //     const isAuthenticated = this.authService.checkAuthentication();
  //     // Nếu không có token hoặc không xác thực
  //     if (!isAuthenticated) {
  //       // Kiểm tra nếu người dùng đã ở trang login thì không điều hướng lại vào login
  //       if (this.router.url !== '/login') {
  //         this.router.navigate(['/login']);  // Điều hướng về trang login
  //       }
  //       return false;
  //     }

  //     // Nếu đã đăng nhập, cho phép truy cập vào route
  //     return true;
  //   }
  // }



  constructor(private http: HttpClient, private router: Router) { }

  private excludedUrls: string[] = [
    '/forgot-password',
    '/resetPassword',
    '/verifyEmail',
    '/register',
    '/login',
  ]; // Các URL bạn muốn loại bỏ kiểm tra

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {

        const currentUrl = state.url;

    // Bỏ qua AuthGuard cho các URL trong danh sách loại trừ
    const isExcluded = this.excludedUrls.some(url => currentUrl.includes(url));

    if (isExcluded) {
      return of(true);
    }
    return this.http.post<string>('/api/user/check-auth', {}).pipe(
      map((response: any) => {
        if (response.message === 'Successfully') {
          // this.router.navigate(['/home']); // Chuyển hướng đến /home nếu đã đăng nhập
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