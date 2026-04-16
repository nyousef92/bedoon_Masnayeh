import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { ApiService } from './api.service';
import { environment } from '../../../environments/environment';
import { CloudinaryService } from './cloudinary';

export interface Offer {
  id: string;
  title: string;
  description: string;
  offerTypeId: string;
  karat: number;
  weight: number;
  manufacturingWagePerGram: number;
  calculatedPrice?: number;
  condition: string;
  images: string[];
  status: string;
  userId: string;
  cityId: number;
  phone: string;
  createdAt: string;
  updatedAt: string;
  imageActiveIndex?: number
}

export interface OffersPage {
  items: Offer[];
  total: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
}

export interface CreateOfferPayload {
  title: string;
  description?: string;
  offerTypeId: string;
  karat: number;
  weight: number;
  manufacturingWagePerGram: number;
  condition?: string;
  images?: string[];
  userId: string;
  cityId: number;
  phone: string;
}

@Injectable({
  providedIn: 'root',
})
export class OffersService {
  
  private readonly apiUrl = environment.apiUrl;

  constructor(private api: ApiService, private cloudinary: CloudinaryService) {}

  getGoldPriceMap(): Observable<Record<number, number>> {
    return from(
      this.cloudinary.getLatestGoldPrices().then(entries => {
        const map: Record<number, number> = {};
        for (const entry of entries) {
          const karat = Number(entry.karatName);
          if ([18, 21, 24].includes(karat)) {
            map[karat] = entry.sellPricePerGram;
          }
        }
        return map;
      })
    );
  }

  computePrice(offer: Offer, priceMap: Record<number, number>): number {
    const pricePerGram = priceMap[offer.karat] ?? 0;
    return Math.round((offer.weight * pricePerGram + offer.weight * offer.manufacturingWagePerGram) * 100) / 100;
  }
  
  createOffer(payload: CreateOfferPayload): Observable<Offer> {
    return this.api.post<Offer>(`${this.apiUrl}/offers`, payload);
  }

  getOffers(pageNumber: number = 1, pageSize: number = 10): Observable<OffersPage> {
    return this.api.get<OffersPage>(`${this.apiUrl}/offers?pageNumber=${pageNumber}&pageSize=${pageSize}`);
  }

  getMyOffers(userId: string, pageNumber: number = 1, pageSize: number = 12): Observable<OffersPage> {
    return this.api.get<OffersPage>(`${this.apiUrl}/offers?userId=${encodeURIComponent(userId)}&pageNumber=${pageNumber}&pageSize=${pageSize}`)
  }

  getOffer(id: string): Observable<Offer> {
    return this.api.get<Offer>(`${this.apiUrl}/offers/${id}`);
  }

  updateOffer(id: string, payload: Partial<CreateOfferPayload>): Observable<Offer> {
    return this.api.put<Offer>(`${this.apiUrl}/offers/${id}`, payload);
  }

  deleteOffer(id: string): Observable<Offer> {
    return this.api.delete<Offer>(`${this.apiUrl}/offers/${id}`);
  }
}
