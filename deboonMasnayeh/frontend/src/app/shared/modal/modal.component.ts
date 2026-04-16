import { Component, ViewChild, ViewContainerRef, Type, ComponentRef, OnDestroy } from '@angular/core';
import { NgClass } from '@angular/common';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ModalOptions {
  disableBackdropClose?: boolean;
}

const SIZE_CLASSES: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  xl: 'max-w-7xl',
};


@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [NgClass],
  templateUrl: './modal.component.html'
})
export class ModalComponent implements OnDestroy {
  isOpen = false;
  panelClass = SIZE_CLASSES['md'];
  disableBackdropClose = false;

  @ViewChild('dynamicContainer', { read: ViewContainerRef, static: true })
  private container!: ViewContainerRef;

  private componentRef: ComponentRef<any> | null = null;

  open<T>(component: Type<T>, inputs?: Record<string, any>, size: ModalSize = 'md', options?: ModalOptions): void {
    this.panelClass = SIZE_CLASSES[size];
    this.disableBackdropClose = options?.disableBackdropClose ?? false;
    this.container.clear();
    this.componentRef = this.container.createComponent(component);
    const instance = this.componentRef.instance as any;
    instance['close'] = () => this.close();
    if (inputs) {
      Object.assign(instance, inputs);
    }
    this.componentRef.changeDetectorRef.detectChanges();
    this.isOpen = true;
  }

  close(): void {
    this.isOpen = false;
    this.container.clear();
    this.componentRef = null;
  }

  ngOnDestroy(): void {
    this.container?.clear();
  }

}
