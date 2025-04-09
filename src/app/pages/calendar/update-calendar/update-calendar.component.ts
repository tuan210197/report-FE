import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { firstValueFrom } from 'rxjs';
import { ShareService } from '../../../services/share.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatGridListModule } from '@angular/material/grid-list';
interface User {
  uid: number;
  fullName: string;
}
@Component({
  selector: 'app-update-calendar',
  standalone: true,
  imports: [
    MatDialogModule,
    CommonModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatGridListModule],
  templateUrl: './update-calendar.component.html',
  styleUrl: './update-calendar.component.css'
})
export class UpdateCalendarComponent implements OnInit {
  eventTitle: string = '';
  users: User[] = []; // Danh sách user từ API
  selectedUser: number | null = null;
  selectedOption: string | null = null;
  userForm!: FormGroup;
  id: number = 0
  constructor(
    public dialogRef: MatDialogRef<UpdateCalendarComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { date: string, id: number },
    private share: ShareService,
    private fb: FormBuilder
  ) {
    this.id = data.id;    // Khởi tạo FormGroup
    this.userForm = this.fb.group({
      selectedUser: [''],
      selectedOption: [''],
    });
  }
  ngOnInit() {
    this.getAllStaff();
    this.getUserByDate();
  }

  close(): void {
    this.dialogRef.close();
  }

  async getAllStaff() {
    const all = await firstValueFrom(this.share.getAllStaff()) as any[];
    this.users = all.map((user: any) => ({
      uid: user.uid,
      fullName: user.fullName
    }) as User);
  }
  onSubmit() {
    var val = {
      id: this.id,
      uid: this.userForm.get('selectedUser')?.value,
      task: this.userForm.get('selectedOption')?.value
    }
    console.log(val)
    this.share.updateCalendar(val).subscribe(
      (response) => {
        console.log('Cập nhật thành công:', response);
        this.dialogRef.close(true); // Đóng dialog và trả về true nếu cập nhật thành công
        window.location.reload(); // Reload lại trang

      },
      (error) => {
        console.error('Lỗi khi cập nhật:', error);
      }
    );
    
  }
  async getUserByDate() {
    const response: any = await firstValueFrom(this.share.getUserById(this.id));

    if (response?.data) {
      this.users = [{
        uid: response.data.uid.trim(), // Loại bỏ khoảng trắng nếu có và chuyển thành số
        fullName: response.data.fullName
      }];
      this.userForm.setValue({
        selectedUser: response.data.uid.trim(), // Loại bỏ khoảng trắng nếu có và chuyển thành số 
        selectedOption: '1'
      })
    }
  }

}
