import { Injectable } from '@angular/core';

interface CacheEntry<T> {
  data: T;
  expiry: number | null;
}

export type keyType = '' | 'auth';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageCacheService {

  private readonly DEFAULT_TTL_MS = 5 * 60 * 60 * 1000;
  private readonly CACHE_KEY = 'app_data_cache';
  private readonly AUTH_CACHE_KEY = 'app_auth_cache';
  constructor() { }

  getMainKey(keyType: keyType = '') {
    if(keyType === 'auth' ) return  this.AUTH_CACHE_KEY 
    return  this.CACHE_KEY
  }

  get<T>(key: string, keyType: keyType = ''): T | null {
    const mainKey = this.getMainKey(keyType)
    const cachedDataStorage = localStorage.getItem(mainKey);
    if (!cachedDataStorage) return null;
    const cachedData: Record<string, CacheEntry<T>> = JSON.parse(cachedDataStorage);

    const entry: CacheEntry<T> | undefined = cachedData[key];

    if (!entry) return null;

    if (!entry.expiry) {
      return entry.data;
    }

    if (Date.now() > entry.expiry) {
      this.remove(key, keyType);
      return null;
    }

    return entry.data;
  }

  set<T>(
    key: string,
    value: T,
    keyType: keyType = '',
    hasExpiry = true,
    ttlMs: number = this.DEFAULT_TTL_MS
  ): void {
    const mainKey = this.getMainKey(keyType);

    try {
      const expiry = hasExpiry
        ? Date.now() + ttlMs
        : null;

      const cachedItem: CacheEntry<T> = { data: value, expiry };

      const cachedDataStorage = localStorage.getItem(mainKey);
      const cachedData = cachedDataStorage
        ? JSON.parse(cachedDataStorage)
        : {};

      cachedData[key] = cachedItem;
      localStorage.setItem(mainKey, JSON.stringify(cachedData));
    } catch (e) {
      console.log(e);
    }
  }

  remove(key: string, keyType: keyType): void {
    const mainKey = this.getMainKey(keyType);
    const cachedDataStorage = localStorage.getItem(mainKey);
    if (!cachedDataStorage) return;
    const cachedData = JSON.parse(cachedDataStorage);
    delete cachedData[key];
    localStorage.setItem(mainKey, JSON.stringify(cachedData));
  }

  clearAll(mainKey = this.CACHE_KEY): void {
    localStorage.removeItem(mainKey);
  }
}
