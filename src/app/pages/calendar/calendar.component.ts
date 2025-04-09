import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CalendarOptions, DatesSetArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { HttpClient } from '@angular/common/http';
import { ShareService } from '../../services/share.service';
import { FullCalendarModule } from '@fullcalendar/angular';

import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { UpdateCalendarComponent } from './update-calendar/update-calendar.component';
import { firstValueFrom, from } from 'rxjs';
interface User {
  uid: string;
  fullName: string;
}

@Component({
  standalone: true,
  imports: [FullCalendarModule, MatSelectModule, MatFormFieldModule, CommonModule],
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit, AfterViewInit {
  event: any[] = []; // Khởi tạo mảng trước khi sử dụng
  users: User[] = []; // Danh sách user từ API
  selectedUsers: { [key: string]: string } = {}; // Lưu user trực theo ngày
  file: File | null = null;
  year: number = 0;
  month: number = 0;
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      center: 'title',
    },
    firstDay: 1, // Bắt đầu từ Thứ Hai

    events: this.event, // Sự kiện từ API
    dateClick: this.onDateClick.bind(this), // Bắt sự kiện click vào ngày
    dayCellDidMount: (info) => {
      const dayNumber = info.date.getDate(); // Lấy ngày trong tháng
      const dayOfWeek = info.date.getDay(); // Lấy thứ trong tuần (0 = Chủ nhật, 1 = Thứ 2,...)

      // Kiểm tra xem phần tử ô ngày có tồn tại không
      const frameEl = info.el.querySelector('.fc-daygrid-day-frame'); // Tìm phần tử .fc-daygrid-day-frame
      if (frameEl) {
        if (dayOfWeek === 0) {
          frameEl.classList.add('sunday-holiday'); // Ngày Chủ nhật (lễ)
        }
        //  else if (dayOfWeek % 2 === 0) {
        //   frameEl.classList.add('even-day'); // Thứ 2, 4, 6
        // } else {
        //   frameEl.classList.add('odd-day'); // Thứ 3, 5, 7
        // }
      }
    },
    datesSet: this.onDatesSet.bind(this), // Gắn sự kiện
    eventContent: (arg) => {
      const [vietnameseName, chineseName] = this.splitVietnameseAndChinese(arg.event.title);

      const innerHtml = `
        <div>
        <div style="font-size: 1.5em; font-weight: bold; color: #000000; text-align: center;">${chineseName}</div>
          <div style="font-weight: bold; font-size: 1.5em; text-align: center;">${vietnameseName}</div>
          
        </div>
      `;

      return { html: innerHtml };
    }

  };
  constructor(
    private http: HttpClient, 
    private share: ShareService, 
    public dialog: MatDialog, 
    private cd: ChangeDetectorRef) {
  }
  ngOnInit() {
  }
  ngAfterViewInit() { }
  // Load danh sách user từ API
  loadUsers() {
    this.share.getStaff().subscribe(data => {
      this.users = data as User[];
    }); // End of subscription
  }

  async loadEvents(data: any): Promise<any[]> {

    const rawData = await firstValueFrom(this.share.getCalendar(data));

    this.event = Array.isArray(rawData) ? rawData.flatMap(item => {
      const eventList = [];
      eventList.push({
        id: item.id,
        title: item.title,
        start: item.date,
      });
      return eventList;
    }) : [];
    this.calendarOptions = {
      ...this.calendarOptions, // Giữ lại các cấu hình khác
      events: this.event, // Gán sự kiện mới
      eventOrder: 'order'
    };
    return this.event;
  }
  onDateClick(info: any) {
    const selectedDateEvents = this.event?.filter(event => event.start === info.dateStr);
    // Phân loại dữ liệu
    const title = selectedDateEvents.map(event => event.title);
    const id = selectedDateEvents.filter(event => event.id).map(event => event.id);
    if (title.length > 0 && !title.includes('Điện thoại trực ban電話值班')) {
      const dialogRef = this.dialog.open(UpdateCalendarComponent, {
        width: '500px',
        height: '300px',
        data: {
          date: info.dateStr,
          id: id[0],
        },
      });
    }
    // });
  }
  onFileChange(event: any) {
    this.file = event.target.files[0];  // Lưu file vào biến `this.file`
    this.uploadFile()
  }
  uploadFile() {
    if (!this.file) {
      alert('Vui lòng chọn file trước khi upload.');
      return;
    }
    const formData = new FormData();
    formData.append('file', this.file);  // Thêm file vào FormData

    this.share.importFile(formData).subscribe({
      next: (res) => alert('Upload thành công'),
      error: (err) => alert('Lỗi: ' + JSON.stringify(err.error))
    });
  }
  onDatesSet(arg: DatesSetArg) {
    const currentMonthDate = arg.view.currentStart; // ngày trong tháng hiện tại
    this.year = currentMonthDate.getFullYear(); // năm hiện tại
    this.month = currentMonthDate.getMonth() + 1; // tháng hiện tại (0-11)
    console.log(currentMonthDate)
    const startDate = arg.start; // đầu tháng hiện tại
    const endDate = arg.end; // cuối tháng hiện tại

    var val = {
      from: this.convertToCustomFormat(startDate.toString()),
      to: this.convertToCustomFormat(endDate.toString())
    }
    this.loadEvents(val);
    this.cd.detectChanges(); // force cập nhật lại để Angular không báo lỗi

  }
  convertToCustomFormat(dateString: string): string | null {
    // Kiểm tra đầu vào có hợp lệ không
    if (!dateString) return null;

    try {
      // Tạo đối tượng Date từ chuỗi đầu vào
      const date = new Date(dateString);

      // Lấy các thành phần ngày, giờ, phút
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Tháng bắt đầu từ 0
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');

      // Kết hợp thành chuỗi định dạng "YYYY-MM-DD HH:mm"
      return `${year}-${month}-${day}`;
    } catch (error) {
      // console.error("Invalid date string:", error);
      return null;
    }
  }
  splitVietnameseAndChinese(title: string): [string, string] {
    const chineseRegex = /[\u4E00-\u9FFF]+/g;
    const chineseMatch = title.match(chineseRegex);
    if (!chineseMatch) return [title, ''];

    const chinese = chineseMatch.join(' ');
    const vietnamese = title.replace(chineseRegex, '').trim();
    return [vietnamese, chinese];
  }

}
