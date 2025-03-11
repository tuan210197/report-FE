import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { HttpClient } from '@angular/common/http';
import { ShareService } from '../../services/share.service';
import { FullCalendarModule } from '@fullcalendar/angular';

import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import {CommonModule } from '@angular/common';
interface User {
  uid: string;
  fullName: string;
}

@Component({
  standalone: true,
  imports: [FullCalendarModule,MatSelectModule,MatFormFieldModule,CommonModule],
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit, AfterViewInit {
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    datesSet: this.injectSelectBoxes.bind(this), // Khi chuyển tháng sẽ inject lại
  };

  users: User[] = []; // Danh sách user từ API
  selectedUsers: { [key: string]: string } = {}; // Lưu user trực theo ngày

  constructor(private http: HttpClient, private share: ShareService) {}

  ngOnInit() {
    this.loadUsers();
  }

  ngAfterViewInit() {
    this.injectSelectBoxes(); // Thêm Mat-Select vào từng ô ngày
  }

  // Load danh sách user từ API
  loadUsers() {
    this.share.getStaff().subscribe(data => {
      this.users = data as User[];
    });
  }

  // Inject Mat-Select vào từng ngày trong FullCalendar
  injectSelectBoxes() {
    setTimeout(() => {
      document.querySelectorAll('.fc-daygrid-day').forEach(dayCell => {
        const date = (dayCell as HTMLElement).dataset['date'];
        if (!date) return;

        // Xóa Mat-Select cũ (nếu có)
        const existingContainer = dayCell.querySelector('.user-select-container');
        if (existingContainer) {
          existingContainer.remove();
        }

        // Tạo thẻ div chứa Mat-Select
        const container = document.createElement('div');
        container.classList.add('user-select-container');
        container.innerHTML = `
          <mat-form-field appearance="outline"  class="full-width"> 
            <mat-select >
                <mat-option *ngFor="let user of users" [value]="user.uid">
                {{ user.fullName }}
            </mat-select>
          </mat-form-field>
        `;

        dayCell.appendChild(container);

        // Gán sự kiện khi chọn user
        setTimeout(() => {
          const selectElement = document.querySelector(`#select-${date}`) as HTMLSelectElement;
          if (selectElement) {
            selectElement.addEventListener('change', (event: any) => {
              const selectedUser = event.target.value;
              this.updateUserForDate(date, selectedUser);
            });
          }
        });
      });
    }, 500);
  }

  // Cập nhật user trực khi chọn từ Mat-Select
  updateUserForDate(date: string, userId: string) {
    this.selectedUsers[date] = userId;
    console.log('Cập nhật lịch trực:', this.selectedUsers);
  }
}
