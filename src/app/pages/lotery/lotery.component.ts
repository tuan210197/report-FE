import { Component } from '@angular/core';

@Component({
  selector: 'app-lotery',
  standalone: true,
  imports: [],
  templateUrl: './lotery.component.html',
  styleUrl: './lotery.component.css'
})
export class LoteryComponent {
  names: string[] = Array.from({ length: 20000 }, (_, i) => `Person ${i + 1}`);
  winners: string[] = [];

  pickWinner() {
    const winnerElement = document.getElementById('winner');
    if (!winnerElement) return;

    let interval = setInterval(() => {
      winnerElement.textContent = this.names[Math.floor(Math.random() * this.names.length)];
    }, 20);

    setTimeout(() => {
      clearInterval(interval);
      const winner = this.names[Math.floor(Math.random() * this.names.length)];
      winnerElement.textContent = winner;
      this.winners.push(winner);
    }, 10000);
  }

}
