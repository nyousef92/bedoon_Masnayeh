import { Component, Input } from '@angular/core';
import { Offer } from '../../core/service/offers';

@Component({
  selector: 'app-contact-seller',
  standalone: true,
  templateUrl: './contact-seller.html'
})
export class ContactSeller {
  @Input() offer!: Offer; 

  formatPhoneForWhatsApp(phone: string): string {
    if (!phone) return '';
    return phone.replace(/\D/g, '');
  }
}