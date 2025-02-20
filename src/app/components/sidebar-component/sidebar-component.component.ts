// import { Component, computed, Input, signal } from '@angular/core';
// import { MatListModule } from '@angular/material/list';
// import { MatIconModule } from '@angular/material/icon';
// import { CommonModule } from '@angular/common';
// import { Router, RouterLink, RouterLinkActive } from '@angular/router';
// import { AuthService } from '../../services/auth.service';
// import { catchError, finalize, switchMap } from 'rxjs/operators';
// import { BehaviorSubject, Observable, of, throwError } from 'rxjs';

// export type MenuItem = {
//   icon: string,
//   label: string,
//   route?: string,
//   action?: () => void,
// }

// @Component({
//   selector: 'app-sidebar-component',
//   standalone: true,
//   imports: [MatListModule, MatIconModule, CommonModule, RouterLink],
//   templateUrl: './sidebar-component.component.html',
//   styleUrl: './sidebar-component.component.css'
// })
// export class SidebarComponentComponent {


//   menuItems = signal<MenuItem[]>([
//     {
//       icon: 'home',
//       label: 'Home',
//       route: '/home'
//     },
//     {
//       icon: 'account_circle',
//       label: 'Profile',
//       route: '/profile'
//     },

//     {
//       icon: 'work',
//       label: 'Project',
//       route: '/project'
//     },
//     {
//       icon: 'speaker_notes',
//       label: 'Daily Report',
//       route: '/daily-report'
//     },
//     // {
//     //   icon: 'business_center',
//     //   label: 'Weekly Report',
//     //   route: '/weekly-report'
//     // },

//     {
//       icon: 'logout',
//       label: 'Logout',
//       action: () => this.logout()
//     }


//   ])
//   //  logout() {
//   //  this.auth.logout().pipe(

//   //     catchError((error) => {
//   //       // Bỏ qua lỗi hoặc xử lý nếu cần
//   //       console.warn('Error during logout', error);
//   //       return of(null); // Trả về Observable rỗng để không gây gián đoạn
//   //     })
//   //   )
//   //     .subscribe(() => {
//   //       // Logic sau khi logout thành công
//   //       console.log('Logout successful');
//   //     });
//   //     // window.location.reload();
//   //     this.router.navigate(['/login']).then(() => {
//   //       window.location.reload();
//   //     });
//   // }
//   logout() {
//     this.auth.logout().pipe(
//       finalize(() => {
//         console.log('Logout successful');
  
//         // Xóa toàn bộ dữ liệu người dùng trong frontend
//         localStorage.clear();
//         sessionStorage.clear();
  
//         // Điều hướng về login sau khi API xử lý xong
//         this.router.navigateByUrl('/login');
//         // .then(() => {
//         //   window.location.reload(); // Đảm bảo cookie được backend xóa hoàn toàn trước khi reload
//         // });
//       }),
//       catchError((error) => {
//         console.warn('Error during logout', error);
//         return of(null); // Trả về Observable rỗng để không gây gián đoạn
//       })
//     ).subscribe();
//   }
  
  
//   sideNavCollapsed = signal(false);
//   activeRoute = signal('');

//   constructor(private router: Router, private auth: AuthService) {
//     // Listen to router events to update the active route signal
//     this.router.events.subscribe(() => {
//       this.activeRoute.set(this.router.url);
//     });
//   }

//   @Input() set collapsed(val: boolean) {
//     this.sideNavCollapsed.set(val);
//   }

//   profileSize = computed(() => this.sideNavCollapsed() ? '32' : '10000')
// }


import { Component, computed, Input, signal, inject } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppTranslateService } from '../../services/translate.service';
import { forkJoin } from 'rxjs';

export type MenuItem = {
  icon: string,
  label: string,
  route?: string,
  action?: () => void,
};

@Component({
  selector: 'app-sidebar-component',
  standalone: true,
  imports: [MatListModule, MatIconModule, CommonModule, RouterLink, TranslateModule],
  templateUrl: './sidebar-component.component.html',
  styleUrl: './sidebar-component.component.css'
})
export class SidebarComponentComponent {
  constructor(
    private router: Router,
    private auth: AuthService,
    private ngxTranslate: TranslateService
  ) {
    // Lắng nghe sự kiện đổi ngôn ngữ để cập nhật menu
    this.ngxTranslate.onLangChange.subscribe(() => {
      this.updateMenuItems();
    });

    this.updateMenuItems(); // Gọi khi khởi tạo component để lấy dữ liệu ban đầu
  }

  translateService = inject(AppTranslateService);
  sideNavCollapsed = signal(false);
  activeRoute = signal('');

  switchLanguage() {
    this.translateService.switchLanguage();
    this.updateMenuItems(); // Cập nhật lại menu ngay sau khi đổi ngôn ngữ
  }

  // Khai báo menuItems là một signal để có thể cập nhật động
  menuItems = signal<MenuItem[]>([]);

  updateMenuItems() {
    // Lấy tất cả key cần dịch
    forkJoin({
      home: this.ngxTranslate.get('Home'),
      profile: this.ngxTranslate.get('Profile'),
      project: this.ngxTranslate.get('control'),
      dailyReport: this.ngxTranslate.get('DAILY_REPORT'),
      logout: this.ngxTranslate.get('logout')
    }).subscribe(translations => {
      this.menuItems.set([
        { icon: 'home', label: translations.home, route: '/home' },
        { icon: 'account_circle', label: translations.profile, route: '/profile' },
        { icon: 'work', label: translations.project, route: '/project' },
        { icon: 'speaker_notes', label: translations.dailyReport, route: '/daily-report' },
        { icon: 'logout', label: translations.logout, action: () => this.logout() }
      ]);
    });
  }

  logout() {
    
    this.auth.logout().subscribe(() => {
      console.log('Logout successful');
      localStorage.clear();
      sessionStorage.clear();
      this.router.navigateByUrl('/login');
      window.location.reload();
    });
  
  }

  @Input() set collapsed(val: boolean) {
    this.sideNavCollapsed.set(val);
  }

  profileSize = computed(() => this.sideNavCollapsed() ? '32' : '10000');
}
