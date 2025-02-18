import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class AppTranslateService {
  private translate = inject(TranslateService);
  currentLang = 'zh'; // Mặc định là tiếng Việt

  constructor() {
    this.translate.setDefaultLang(this.currentLang);
  }

  switchLanguage() {
    this.currentLang = this.currentLang === 'vi' ? 'zh' : 'vi';
    this.translate.use(this.currentLang);
  }

  getCurrentLanguage() {
    return this.currentLang;
  }
}
