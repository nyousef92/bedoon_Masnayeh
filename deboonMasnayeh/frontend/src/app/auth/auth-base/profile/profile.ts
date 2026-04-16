import { Component, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputFieldComponent } from '../../../shared/input-field/input-field.component';
import { SelectDropdownComponent, SelectOption } from '../../../shared/select-dropdown/select-dropdown.component';
import { SessionService } from '../../../core/service/session.service';
import { HelperService } from '../../../core/service/helper.service';
import citiesJson from '../../../core/data/jordan-cities.json';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, InputFieldComponent, SelectDropdownComponent],
  templateUrl: './profile.html',
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  public session = inject(SessionService);
  public helper = inject(HelperService);

  profileForm!: FormGroup;
  saved = false;

  readonly cities: SelectOption[] = citiesJson.map(c => ({ id: c.id, value: c.id, label: c.label }));

  getCityLabel(id: number | string | null): string {
    return this.cities.find(c => c.id == id)?.label ?? '';
  }

  ngOnInit(): void {
    const user = this.session.decodedToken$();
    this.profileForm = this.fb.group({
      fullName: [user?.name || '', [Validators.required, Validators.minLength(3)]],
      email: [user?.email || '', [Validators.required, Validators.email]],
      phone: [user?.phone || '+9627', [
        Validators.required,
        Validators.pattern(/^\+9627[0-9]{8}$/)
      ]],
      cityId: [user?.cityId ?? null, [Validators.required]],
    });
  }

  getError(control: string, label: string): string {
    return this.helper.getErrorsMessage(this.profileForm, control, label);
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    // TODO: call profile update API — payload includes cityId (number), not the label
    console.log('Profile update payload:', this.profileForm.value);
    this.saved = true;
    setTimeout(() => this.saved = false, 3000);
  }
}
