// src/app/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ShareService } from '../services/share.service';


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {



  constructor(private http: HttpClient, private router: Router, private share: ShareService) { }

  private excludedUrls: string[] = [
    '/forgot-password',
    '/resetPassword',
    '/verifyEmail',
    '/register',
    '/login',
  ]; // Các URL bạn muốn loại bỏ kiểm tra


  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {

    const currentUrl = state.url;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    // Bỏ qua AuthGuard cho các URL trong danh sách loại trừ
    const isExcluded = this.excludedUrls.some(url => currentUrl.includes(url));
    if (isExcluded) {
      if (currentUrl === '/login') {
        return this.share.checkAuthentication().pipe(
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
    return this.share.checkAuthentication().pipe(
      map((response: any) => {
        if (response.message === 'Successfully') {
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