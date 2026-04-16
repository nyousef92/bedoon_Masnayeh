import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Offer, OffersService } from '../../core/service/offers';
import { PaginatorComponent } from '../../shared/paginator/paginator.component';
import { SessionService } from '../../core/service/session.service';
import { forkJoin } from 'rxjs';
import { OfferItem } from '../offer-item/offer-item';

@Component({
  selector: 'app-offers-list',
  imports: [CommonModule, RouterModule, PaginatorComponent, OfferItem],
  templateUrl: './offers-list.html'
})
export class OffersList implements OnInit {
  offersList = signal<Offer[]>([]);
  isLoading = signal(true);
  pageNumber = 1;
  pageSize = 10;
  totalItems = 0;

  constructor(
    private offersService: OffersService,
    private session: SessionService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadOffers();
  }

  navigateToAddOffer() {
    if (this.session.isLoggedIn()) {
      this.router.navigate(['offers/agreement']);
    } else {
      this.router.navigate(['auth/login']);
    }
  }

  loadOffers(): void {
    this.isLoading.set(true);
    forkJoin({
      page: this.offersService.getOffers(this.pageNumber, this.pageSize),
      priceMap: this.offersService.getGoldPriceMap(),
    }).subscribe({
      next: ({ page, priceMap }) => {
        const items = page.items.map(item => ({
          ...item,
          imageActiveIndex: 0,
          calculatedPrice: this.offersService.computePrice(item, priceMap),
        }));
        this.offersList.set(items);
        this.totalItems = page.total;
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load offers', err);
        this.isLoading.set(false);
      }
    });
  }

  onPageChange(page: number): void {
    this.pageNumber = page;
    this.loadOffers();
  }
}
