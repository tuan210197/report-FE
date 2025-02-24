

import { Component, computed, Input, signal, inject } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppTranslateService } from '../../services/translate.service';
import { forkJoin } from 'rxjs';
import { ShareService } from '../../services/share.service';

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
    private ngxTranslate: TranslateService,
    private share: ShareService
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
      document: this.ngxTranslate.get('document'),
      logout: this.ngxTranslate.get('logout')
    }).subscribe(translations => {
      this.menuItems.set([
        { icon: 'home', label: translations.home, route: '/home' },
        { icon: 'account_circle', label: translations.profile, route: '/profile' },
        { icon: 'work', label: translations.project, route: '/project' },
        { icon: 'speaker_notes', label: translations.dailyReport, route: '/daily-report' },
        { icon: 'folder', label: translations.document, route: '/files' },
        { icon: 'logout', label: translations.logout, action: () => this.logout() }
      ]);
    });
  }

  logout() {
    
    this.share.logout().subscribe(() => {
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
