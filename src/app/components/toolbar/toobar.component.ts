import { Component, computed, signal } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [MatToolbarModule,MatButtonModule,MatIconModule],
  templateUrl: './toobar.component.html',
  styleUrl: './toobar.component.css'
})
export class ToobarComponent {

  collapsed = signal(true);

  sidenavWidth = computed(()=> this.collapsed() ? '65px' : '250px');

  
}
