import { Component, Input, Output, EventEmitter, forwardRef, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { Subscription } from 'rxjs';

export interface SelectOption {
  id?: number | string,
  value?: number | string,
  label: string
}

@Component({
  selector: 'app-select-dropdown',
  imports: [FormsModule, ReactiveFormsModule,NgSelectModule],
  templateUrl: './select-dropdown.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectDropdownComponent),
      multi: true
    }
  ]
})
export class SelectDropdownComponent implements ControlValueAccessor, OnInit, OnDestroy {
  @Input() options: SelectOption[] = [];
  @Input() placeholder: string = 'Select';
  @Input() label?: string;
  @Input() required?: boolean;
  @Input() multiple: boolean = false;
  @Input() errorMessage?: string;
  @Input() touched?: boolean;
  @Output() selectionChange = new EventEmitter<any>();

  @Input() set selectedValue(value: string | number) {
    this.value = value;
    if (!this.multiple) {
      this.formControl.setValue(value?.toString() || '', { emitEvent: false });
    }
  }
  get selectedValue(): string | number {
    return this.value as string | number;
  }

  private _disabled = false;

  @Input()
  set disabled(value: boolean) {
    this._disabled = value;
    if (value) {
      this.formControl.disable({ emitEvent: false });
    } else {
      this.formControl.enable({ emitEvent: false });
    }
  }
  get disabled(): boolean {
    return this._disabled;
  }

  // Single select state
  value: any = '';
  formControl = new FormControl<string>('');

  // Multi select state
  isOpen = false;
  selectedValues: string[] = [];

  onChange = (value: any) => { };
  onTouched = () => { };

  private valueChangesSub?: Subscription;

  constructor(private el: ElementRef) { }

  // Bug fix #3: use a getter instead of mutating the @Input in ngOnInit
  get effectivePlaceholder(): string {
    return this.placeholder === 'Select' ? `Select ${this.label || ''}` : this.placeholder;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (this.multiple && !this.el.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  writeValue(value: any): void {
    if (this.multiple) {
      this.selectedValues = Array.isArray(value) ? value : (value ? [value] : []);
    } else {
      this.value = value || '';
      setTimeout(() => {
        this.formControl.setValue(this.value?.toString() || '', { emitEvent: false });
      });
    }
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
    if (!this.multiple) {
      // Bug fix #2: store the subscription so it can be cleaned up
      this.valueChangesSub = this.formControl.valueChanges.subscribe((value: string | null) => {
        this.onChange(value || '');
      });
    }
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // Single select
  onSelectionChange(event: any) {
    // Bug fix #4: event.value is always undefined on a DOM Event — value lives on event.target.value
    // Bug fix #1: do NOT call this.onChange() here — formControl.valueChanges subscription handles it
    const value = event?.target?.value;
    this.value = value;
    this.onTouched();
    this.selectionChange.emit(value);
    this.formControl.markAsTouched();
  }

  onBlur() {
    this.onTouched();
    this.formControl.markAsTouched();
  }

  onFocus() {
    this.formControl.markAsTouched();
  }

  // Multi select
  toggleDropdown(event: Event) {
    event.stopPropagation();
    if (!this._disabled) {
      this.isOpen = !this.isOpen;
      this.onTouched();
    }
  }

  toggleOption(event: Event, optionValue: string) {
    event.stopPropagation();
    const idx = this.selectedValues.indexOf(optionValue);
    if (idx === -1) {
      this.selectedValues = [...this.selectedValues, optionValue];
    } else {
      this.selectedValues = this.selectedValues.filter(v => v !== optionValue);
    }
    this.onChange(this.selectedValues);
    this.selectionChange.emit(this.selectedValues);
  }

  removeOption(event: Event, optionValue: string) {
    event.stopPropagation();
    this.selectedValues = this.selectedValues.filter(v => v !== optionValue);
    this.onChange(this.selectedValues);
    this.selectionChange.emit(this.selectedValues);
  }

  isSelected(optionValue: string): boolean {
    return this.selectedValues.includes(optionValue);
  }

  getLabelForValue(val: string): string {
    return this.options.find(o => o.value?.toString() === val)?.label ?? val;
  }

  getTriggerLabel(): string {
    if (this.selectedValues.length === 0) return '';
    if (this.selectedValues.length <= 2) {
      return this.selectedValues.map(v => this.getLabelForValue(v)).join(', ');
    }
    return `${this.selectedValues.length} selected`;
  }

  ngOnInit() { }

  // Bug fix #2: unsubscribe to prevent memory leak
  ngOnDestroy(): void {
    this.valueChangesSub?.unsubscribe();
  }

  showError(): boolean {
    return !!((this.touched || this.formControl.touched) && this.errorMessage);
  }
}
