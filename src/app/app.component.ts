import { Component, signal, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { SidebarComponentComponent } from "./components/sidebar-component/sidebar-component.component";
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { trigger, state, style, animate, transition } from '@angular/animations';



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

  collapsed = signal(true);

  sidenavWidth = computed(() => this.collapsed() ? '35px' : 'auto')
}
