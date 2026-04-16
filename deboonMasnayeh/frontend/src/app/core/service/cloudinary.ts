import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface GoldPriceEntry {
  karatName: string;
  sellPricePerGram: number;
  buyPricePerGram: number;
  karatId: number;
  karatDisplayName: string;
  sellEffectiveDate: string;
  buyEffectiveDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class CloudinaryService {

  private cloudName = environment.cloudinary.cloudName;
  private uploadPreset = environment.cloudinary.uploadPreset;

  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
      { method: 'POST', body: formData }
    );

    const data = await response.json();
    return data.secure_url;
  }

  async getLatestGoldPrices(): Promise<GoldPriceEntry[]> {
    const response = await fetch(
      `https://hawkingservice.onrender.com/api/v1/gold-price/latest-by-karat`,
      { method: 'GET' }
    );
    return response.json();
  }
}