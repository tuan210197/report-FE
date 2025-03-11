import { Component, Input, Output, EventEmitter } from '@angular/core';

import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import {CommonModule } from '@angular/common';
@Component({
  selector: 'app-calendar-day',
  standalone: true,
  imports: [MatSelectModule,MatFormFieldModule,CommonModule],
  templateUrl: './calendar-day.component.html',
  styleUrl: './calendar-day.component.css'
})
export class CalendarDayComponent {
  @Input() date!: string;
  @Input() users: any[] = [];
  @Input() selectedUser!: string;
  @Output() userChanged = new EventEmitter<{ date: string, user: string }>();

  onUserSelect(userId: string) {
    this.userChanged.emit({ date: this.date, user: userId });
  }
}
