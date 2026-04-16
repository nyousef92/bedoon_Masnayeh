import { Injectable, signal } from '@angular/core';

export interface Toast {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  id?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private counter = 0;
  toasts = signal<Toast[]>([]);

  show(toast: Toast): void {
    const id = ++this.counter;
    const duration = toast.duration ?? 5000;
    this.toasts.update(list => [...list, { ...toast, id }]);

    setTimeout(() => {
      this.toasts.update(list => list.filter(t => t.id !== id));
    }, duration);
  }

  hide(): void {
    this.toasts.set([]);
  }

  showSuccess(message: string, duration = 5000): void {
    this.show({ message, type: 'success', duration });
  }

  showError(message: string, duration = 5000): void {
    this.show({ message, type: 'error', duration });
  }

  showInfo(message: string, duration = 5000): void {
    this.show({ message, type: 'info', duration });
  }

  showWarning(message: string, duration = 5000): void {
    this.show({ message, type: 'warning', duration });
  }
}
