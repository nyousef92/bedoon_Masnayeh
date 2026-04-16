import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-agreement',
  imports: [FormsModule,CurrencyPipe],
  templateUrl: './agreement.html'
})
export class Agreement {
  agreed = false;

  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate(['/offers']);
  }

  proceed(): void {
    if (this.agreed) {
      this.router.navigate(['/offers/add']);
    }
  }
}
