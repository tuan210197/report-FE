import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';  // Thư viện giải mã JWT
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = '/api'; // Replace with your API URL
  // private apiUrl = 'http://10.81.160.29:8080/api'

  public isRefreshing = false; // Trạng thái kiểm tra việc làm mới token
  public refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);



  constructor(private http: HttpClient, private router: Router) { }
  login(email: string, password: string): Promise<boolean> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post<any>(this.apiUrl + '/user/login', { email, password }, { headers, withCredentials: true })
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
    return this.http.post(this.apiUrl + '/user/logout', {}, { withCredentials: true });
  }

  // Gọi API refreshToken
  // refreshToken(): Observable<string> {
  //   return this.http.get<any>(this.apiUrl + '/user/refresh-token');
  // }

 

  // checkAuthentication() {

  //   // Kiểm tra sự tồn tại của cookie với tên 'token'
  //   return this.http.post(this.apiUrl + '/user/check-auth', {}, { withCredentials: true });
  // }

  // Hàm lấy giá trị cookie
  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }
}

