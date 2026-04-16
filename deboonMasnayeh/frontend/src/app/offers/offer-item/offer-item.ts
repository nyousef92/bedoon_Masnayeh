import { Component, Input, ViewChild } from '@angular/core';
import { Offer } from '../../core/service/offers';
import citiesJson from '../../core/data/jordan-cities.json';
import { ContactSeller } from '../contact-seller/contact-seller';
import { ModalComponent } from "../../shared/modal/modal.component";
import { CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-offer-item',
  imports: [ModalComponent, CurrencyPipe],
  templateUrl: './offer-item.html'
})
export class OfferItem {
  @Input() offer!: Offer
  @Input() editMode: boolean = false
  @ViewChild(ModalComponent) modal!: ModalComponent;

  constructor(private router: Router) { }
  showContactInfoModal(offerId: string | number) {
    this.modal.open(
      ContactSeller, {
      offer: this.offer
    });
  }

  getCityLabel(cityId: number): string {
    return citiesJson.find(c => c.id === cityId)?.label ?? '';
  }

  prevImage() {
    const item = this.offer;
    if (item) {
      
      if (item.imageActiveIndex === 0) {
        item.imageActiveIndex = item.images.length - 1;
      } else {
        item.imageActiveIndex = (item.imageActiveIndex??0) - 1;
      }
    }
  }

  nextImage() {
    const item = this.offer;
    if (item) {
      if (item.imageActiveIndex === item.images.length - 1) {
        item.imageActiveIndex = 0;
      } else {
        item.imageActiveIndex = (item.imageActiveIndex??0) + 1;
      }
    }
  }

  editOffer(id: string): void {
    this.router.navigate(['/edit', id]);
  }
}
