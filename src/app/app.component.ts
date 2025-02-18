import { Component, signal, computed,inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { SidebarComponentComponent } from "./components/sidebar-component/sidebar-component.component";
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { TranslateService } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    MatSidenavModule,
    SidebarComponentComponent,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule, 
    MatSelectModule,CommonModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',

  animations: [
    trigger('sidenavToggle', [
      state(
        'collapsed',
        style({
          width: '65px', // Chiều rộng khi collapsed
        })
      ),
      state(
        'expanded',
        style({
          width: '250px', // Chiều rộng khi expanded
        })
      ),
      transition('collapsed <=> expanded', [animate('300ms ease-in-out')]), // Thời gian và hiệu ứng chuyển tiếp
    ]),
    trigger('contentShift', [
      state(
        'collapsed',
        style({
          marginLeft: '65px', // margin-left khi collapsed
        })
      ),
      state(
        'expanded',
        style({
          marginLeft: '250px', // margin-left khi expanded
        })
      ),
      transition('collapsed <=> expanded', [animate('300ms ease-in-out')]), // Thời gian và hiệu ứng chuyển tiếp
    ]),
  ],
})

export class AppComponent {
  translateService = inject(TranslateService);

  // Danh sách ngôn ngữ hỗ trợ
  languages = [
   
    { code: 'vi', label: 'Tiếng Việt' },
    { code: 'zh', label: '繁體中文' }
  ];

  // Ngôn ngữ hiện tại
  selectedLanguage = signal(this.translateService.currentLang || 'zh');

  constructor() {
    // Đặt ngôn ngữ mặc định nếu chưa có
    this.translateService.use(this.selectedLanguage());
  }

  // Hàm đổi ngôn ngữ
  changeLanguage(lang: string) {
    this.selectedLanguage.set(lang);
    this.translateService.use(lang);
  }
  collapsed = signal(true);

  sidenavWidth = computed(() => this.collapsed() ? '35px' : 'auto')
}
