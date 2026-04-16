import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { environment } from '../../../environments/environment';

export interface OfferType {
  id: string;
  name: string;
  order: number;
}

@Injectable({
  providedIn: 'root',
})
export class OfferTypesService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private api: ApiService) {}

  getOfferTypes(): Observable<OfferType[]> {
    return this.api.get<OfferType[]>(`${this.apiUrl}/offer-types`);
  }
}
