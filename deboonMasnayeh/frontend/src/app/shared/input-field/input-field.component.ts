import { Component, Input, Output, EventEmitter, forwardRef, OnInit, input } from '@angular/core';

import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor, ReactiveFormsModule, FormControl } from '@angular/forms';

@Component({
    selector: 'app-input-field',
    imports: [FormsModule, ReactiveFormsModule],
    templateUrl: './input-field.component.html',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => InputFieldComponent),
            multi: true
        }
    ]
})
export class InputFieldComponent implements ControlValueAccessor, OnInit {
  @Input() label?: string;
  @Input() placeholder: string = '';
  @Input() value: string = '';
  @Input() type: string = 'text';
  @Input() errorMessage?: string;
  @Input() touched?: boolean;
  @Input() required: boolean = false;
  @Input() set disabled(value: boolean) {
    this._disabled = value;
    if (value) {
      this.formControl.disable();
    } else {
      this.formControl.enable();
    }
  }
  get disabled(): boolean {
    return this._disabled;
  }

  @Output() valueChange = new EventEmitter<string>();

  private _disabled = false;
  formControl = new FormControl();

  ngOnInit() {
    if (this._disabled) {
      this.formControl.disable();
    }
  }

  onChange = (value: string) => { };
  onTouched = () => { };

  writeValue(value: string): void {
    this.formControl.setValue(value, { emitEvent: false });
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
    this.formControl.valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInputChange(event: any): void {
    const value = event.target.value;
    this.onChange(value);
    this.valueChange.emit(value);
  }

  onBlur(): void {
    this.onTouched();
    this.formControl.markAsTouched();
  }

  showError(): boolean {
    return (this.formControl.touched || !!this.touched) && !!this.errorMessage;
  }

  onFocus(): void {
    this.formControl.markAsTouched();
  }
}
