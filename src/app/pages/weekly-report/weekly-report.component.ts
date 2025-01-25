import { AfterViewInit, Component, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core'; // Hoặc MatMomentDateModule nếu dùng Moment.js
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-weekly-report',
  standalone: true,
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatGridListModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule, // Nếu dùng Moment.js thì thay bằng MatMomentDateModule
    FormsModule, MatSelectModule, ReactiveFormsModule, CommonModule,],
  templateUrl: './weekly-report.component.html',
  styleUrl: './weekly-report.component.css'
})
export class WeeklyReportComponent {
  displayedColumns: string[] = ['position', 'projectName', 'category', 'progress', 'description'];
  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
  model: any;
  color = '#ADD8E6';
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }


  toppings = new FormControl('');
  toppingList: string[] = ['Extra cheese', 'Mushroom', 'Onion', 'Pepperoni', 'Sausage', 'Tomato'];


  constructor(private fb: FormBuilder, private dialog: MatDialog) {
    this.form = this.fb.group({
      requester: [''],
      toppings: [[]],
      address: [''],
      // progress:[],
      projectName: [''],
      start: [''],
      quantity: [''],
      category: [''],
      quantityCompleted: [''],
      quantityRemain: [''],
      contractor: [''],
      numberWorker: [''],


    });
  }
  form: FormGroup;
}

export interface PeriodicElement {
  position: number;
  projectName: string;
  progress: string;
  category: string;
  description: string;
  // action:any;

}

const ELEMENT_DATA: PeriodicElement[] = [
  { position: 1, projectName: 'Hydrogen', progress: '100', category: 'He', description: 'he' },
  { position: 2, projectName: 'Helium', progress: '100', category: 'He', description: 'oke' },
  { position: 3, projectName: 'Lithium', progress: '100', category: 'Li', description: 'okla' },
  { position: 4, projectName: 'Beryllium', progress: '100', category: 'Be', description: 'lo' },
  { position: 5, projectName: 'Boron', progress: '100', category: 'B', description: 'kjk' },
  { position: 6, projectName: 'Carbon', progress: '100', category: 'C', description: 'knakls' },
  { position: 7, projectName: 'Nitrogen', progress: '100', category: 'N', description: 'klk' },
  { position: 8, projectName: 'Oxygen', progress: '100', category: 'O', description: 'njask' },
  { position: 9, projectName: 'Fluorine', progress: '100', category: 'F', description: 'ldsadas' },
  { position: 10, projectName: 'Neon', progress: '100', category: 'Ne', description: 'sdnas' },
  { position: 11, projectName: 'Sodium', progress: '100', category: 'Na', description: 'mnasd' },
  { position: 12, projectName: 'Magnesium', progress: '100', category: 'Mg', description: 'dasdas' },
  { position: 13, projectName: 'Aluminum', progress: '100', category: 'Al', description: 'dasdsa' },
  { position: 14, projectName: 'Silicon', progress: '100', category: 'Si', description: 'sdsad' },
  { position: 15, projectName: 'Phosphorus', progress: '100', category: 'P', description: 'sadas' },
  { position: 16, projectName: 'Sulfur', progress: '100', category: 'S', description: 'sbd' },
  { position: 17, projectName: 'Chlorine', progress: '100', category: 'Cl', description: 'jdsanjkd' },
  { position: 18, projectName: 'Argon', progress: '100', category: 'Ar', description: 'dsadjaks' },
  { position: 19, projectName: 'Potassium', progress: '100', category: 'K', description: 'knasdkjasn' },
  { position: 20, projectName: 'Calcium', progress: '100', category: 'Ca', description: 'daskjdnjk' },
];




