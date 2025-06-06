import {ChangeDetectionStrategy, Component, EventEmitter, Output,ViewChild, } from '@angular/core';
import {provideNativeDateAdapter} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatDateRangeInput } from '@angular/material/datepicker';

@Component({
  selector: 'app-date-range',
  standalone: true,
  imports: [
    MatFormFieldModule, MatDatepickerModule
  ],
  providers: [provideNativeDateAdapter()],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './date-range.component.html',
  styleUrl: './date-range.component.css'
})
export class DateRangeComponent {
  @Output() dateRangeChange = new EventEmitter<{ start: Date; end: Date }>();

  @ViewChild('rangeInput') rangeInput!: MatDateRangeInput<Date>;

  // // Gọi khi có thay đổi start hoặc end
  // onDateChange() {
  //   const val = this.rangeInput.value;
  //   if (val && val.start && val.end) {
  //     this.dateRangeChange.emit({ start: val.start, end: val.end });
  //   }
  // }
    // Hàm gọi khi người dùng nhấn vào nút lấy ngày
    getSelectedDateRange() {
      const val = this.rangeInput.value;
      if (val && val.start && val.end) {
        this.dateRangeChange.emit({ start: val.start, end: val.end });
      }
    }
}

