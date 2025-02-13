import { Component, computed, Input, signal } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { catchError, finalize, switchMap } from 'rxjs/operators';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';

export type MenuItem = {
  icon: string,
  label: string,
  route?: string,
  action?: () => void,
}

@Component({
  selector: 'app-sidebar-component',
  standalone: true,
  imports: [MatListModule, MatIconModule, CommonModule, RouterLink],
  templateUrl: './sidebar-component.component.html',
  styleUrl: './sidebar-component.component.css'
})
export class SidebarComponentComponent {


  menuItems = signal<MenuItem[]>([
    {
      icon: 'home',
      label: 'Home',
      route: '/home'
    },
    {
      icon: 'account_circle',
      label: 'Profile',
      route: '/profile'
    },

    {
      icon: 'work',
      label: 'Project',
      route: '/project'
    },
    {
      icon: 'speaker_notes',
      label: 'Daily Report',
      route: '/daily-report'
    },
    // {
    //   icon: 'business_center',
    //   label: 'Weekly Report',
    //   route: '/weekly-report'
    // },

    {
      icon: 'logout',
      label: 'Logout',
      action: () => this.logout()
    }


  ])
  //  logout() {
  //  this.auth.logout().pipe(

  //     catchError((error) => {
  //       // Bỏ qua lỗi hoặc xử lý nếu cần
  //       console.warn('Error during logout', error);
  //       return of(null); // Trả về Observable rỗng để không gây gián đoạn
  //     })
  //   )
  //     .subscribe(() => {
  //       // Logic sau khi logout thành công
  //       console.log('Logout successful');
  //     });
  //     // window.location.reload();
  //     this.router.navigate(['/login']).then(() => {
  //       window.location.reload();
  //     });
  // }
  logout() {
    this.auth.logout().pipe(
      finalize(() => {
        console.log('Logout successful');
  
        // Xóa toàn bộ dữ liệu người dùng trong frontend
        localStorage.clear();
        sessionStorage.clear();
  
        // Điều hướng về login sau khi API xử lý xong
        this.router.navigateByUrl('/login');
        // .then(() => {
        //   window.location.reload(); // Đảm bảo cookie được backend xóa hoàn toàn trước khi reload
        // });
      }),
      catchError((error) => {
        console.warn('Error during logout', error);
        return of(null); // Trả về Observable rỗng để không gây gián đoạn
      })
    ).subscribe();
  }
  
  
  sideNavCollapsed = signal(false);
  activeRoute = signal('');

  constructor(private router: Router, private auth: AuthService) {
    // Listen to router events to update the active route signal
    this.router.events.subscribe(() => {
      this.activeRoute.set(this.router.url);
    });
  }

  @Input() set collapsed(val: boolean) {
    this.sideNavCollapsed.set(val);
  }

  profileSize = computed(() => this.sideNavCollapsed() ? '32' : '10000')
}


