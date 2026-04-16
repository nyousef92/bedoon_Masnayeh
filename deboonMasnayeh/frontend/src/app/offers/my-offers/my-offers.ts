import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Offer, OffersService } from '../../core/service/offers';
import { SessionService } from '../../core/service/session.service';
import { PaginatorComponent } from '../../shared/paginator/paginator.component';
import { forkJoin } from 'rxjs';
import citiesJson from '../../core/data/jordan-cities.json';
import { OfferItem } from "../offer-item/offer-item";

@Component({
  selector: 'app-my-offers',
  imports: [CommonModule, RouterModule, PaginatorComponent, OfferItem],
  templateUrl: './my-offers.html',
})
export class MyOffers implements OnInit {
  offers = signal<Offer[]>([]);
  isLoading = signal(true);

  pageNumber = 1;
  readonly pageSize = 12;
  totalItems = 0;

  private userId = '';

  private readonly cityMap = new Map(citiesJson.map(c => [c.id, c.label]));

  constructor(
    private offersService: OffersService,
    private session: SessionService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    const userId = this.session.decodedToken$()?.user_id;
    if (!userId) {
      this.router.navigate(['auth/login']);
      return;
    }
    this.userId = userId;
    this.loadOffers();
  }

  loadOffers(): void {
    this.isLoading.set(true);
    forkJoin({
      page: this.offersService.getMyOffers(this.userId, this.pageNumber, this.pageSize),
      priceMap: this.offersService.getGoldPriceMap(),
    }).subscribe({
      next: ({ page, priceMap }) => {
        const offers = page.items.map(o => ({
          ...o,
          imageActiveIndex: 0,
          calculatedPrice: this.offersService.computePrice(o, priceMap),
        }));
        this.offers.set(offers);
        this.totalItems = page.total;
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load my offers', err);
        this.isLoading.set(false);
      }
    });
  }

  onPageChange(page: number): void {
    this.pageNumber = page;
    this.loadOffers();
  }

  getCityLabel(cityId: number): string {
    return this.cityMap.get(cityId) ?? '';
  }
}
