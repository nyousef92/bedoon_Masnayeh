import { ChangeDetectorRef, Component, inject, OnInit, output } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, of, forkJoin } from 'rxjs';
import { exhaustMap, switchMap } from 'rxjs/operators';
import { InputFieldComponent } from '../../shared/input-field/input-field.component';
import { SelectDropdownComponent, SelectOption } from '../../shared/select-dropdown/select-dropdown.component';
import { HelperService } from '../../core/service/helper.service';
import { SessionService } from '../../core/service/session.service';
import { OffersService, Offer } from '../../core/service/offers';
import { OfferTypesService } from '../../core/service/offer-types';
import citiesJson from '../../core/data/jordan-cities.json';
import { CloudinaryService } from '../../core/service/cloudinary';

@Component({
  selector: 'app-add-offer',
  imports: [ReactiveFormsModule, CommonModule, InputFieldComponent, SelectDropdownComponent],
  templateUrl: './add-offer.html'
})
export class AddOffer implements OnInit {
  readonly offerCreated = output<Offer>();

  fb = inject(FormBuilder);
  helper = inject(HelperService);
  session = inject(SessionService);
  offersService = inject(OffersService);
  cloudinaryService = inject(CloudinaryService);
  offerTypesService = inject(OfferTypesService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  cdr = inject(ChangeDetectorRef);

  form!: FormGroup;
  submitClick = new Subject<void>();
  deleteClick = new Subject<void>();
  isLoading = false;
  offerTypeOptions: SelectOption[] = [];
  images: string[] = [];
  uploadingItems: { preview: string; error: boolean }[] = [];
  editMode = false;
  editOfferId: string | null = null;

  readonly karatOptions: SelectOption[] = [
    { value: 18, label: '18K' },
    { value: 21, label: '21K' },
    { value: 24, label: '24K' },
  ];

  readonly conditionOptions: SelectOption[] = [
    { value: 'new', label: 'New' },
    { value: 'used', label: 'Used' },
  ];

  readonly cityOptions: SelectOption[] = citiesJson.map(c => ({ value: c.id, label: c.label }));

  ngOnInit(): void {
    this.editOfferId = this.route.snapshot.paramMap.get('id');
    this.editMode = !!this.editOfferId;

    this.form = this.fb.group({
      title: ['', [Validators.required]],
      description: [''],
      offerTypeId: ['', [Validators.required]],
      karat: [null, [Validators.required]],
      weight: [null, [Validators.required, Validators.min(0.01)]],
      manufacturingWagePerGram: [null, [Validators.required, Validators.min(0)]],
      condition: ['new', [Validators.required]],
      cityId: [null, [Validators.required]],
      phone: ['+9627', [Validators.required, Validators.pattern(/^\+9627[0-9]{8}$/)]],
    });

    this.submitClick.pipe(exhaustMap(() => this.submit())).subscribe();
    this.deleteClick.pipe(exhaustMap(() => this.delete())).subscribe();

    const types$ = this.offerTypesService.getOfferTypes();

    if (this.editMode && this.editOfferId) {
      forkJoin([types$, this.offersService.getOffer(this.editOfferId)]).subscribe({
        next: ([types, offer]) => {
          this.offerTypeOptions = types.map(t => ({ value: t.id, label: t.name }));
          this.form.patchValue({
            title: offer.title,
            description: offer.description,
            offerTypeId: offer.offerTypeId,
            karat: offer.karat,
            weight: offer.weight,
            manufacturingWagePerGram: offer.manufacturingWagePerGram,
            condition: offer.condition,
            cityId: offer.cityId,
            phone: offer.phone,
          });
          this.images = offer.images ?? [];
        },
        error: (err) => console.error('Failed to load offer for editing', err)
      });
    } else {
      types$.subscribe({
        next: (types) => {
          this.offerTypeOptions = types.map(t => ({ value: t.id, label: t.name }));
        },
        error: (err) => console.error('Failed to load offer types', err)
      });
    }
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const files = Array.from(input.files);
    input.value = '';

    files.forEach(async (file) => {
      if (file.size > 5 * 1024 * 1024) {
        console.warn('File too large:', file.name);
        return;
      }

      const preview = URL.createObjectURL(file);
      const item = { preview, error: false };
      this.uploadingItems.push(item);

      try {
        const url = await this.cloudinaryService.uploadImage(file);
        this.images.push(url);
        this.uploadingItems = this.uploadingItems.filter(i => i !== item);
        URL.revokeObjectURL(preview);
        this.cdr.detectChanges();
      } catch (error) {
        item.error = true;
        this.cdr.detectChanges();
        console.error('Upload failed:', file.name, error);
      }
    });
  }

  removeImage(url: string): void {
    this.images = this.images.filter(i => i !== url);
  }

  get uploadingCount(): number {
    return this.uploadingItems.filter(i => !i.error).length;
  }


  err(controlName: string, label: string): string {
    if (this.form.get(controlName)?.touched) {
      return this.form.get(controlName)?.invalid
        ? this.helper.getErrorsMessage(this.form, controlName, label)
        : '';
    }
    return '';
  }

  private delete() {
    if (this.editOfferId) {
      return this.offersService.deleteOffer(this.editOfferId).pipe(
        switchMap(() => {
          this.isLoading = false;
          this.router.navigate(['/my-offers']);
          return of(null);
        })
      )
    } else {
      return of(true);
    }
  }
  private submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return of(null);
    }
    if (this.uploadingCount > 0) return of(null);

    const { karat, weight, manufacturingWagePerGram, cityId, phone, ...rest } = this.form.value;
    const payload = {
      ...rest,
      karat: Number(karat),
      weight: Number(weight),
      manufacturingWagePerGram: Number(manufacturingWagePerGram),
      cityId: Number(cityId),
      phone,
      images: this.images,
    };

    this.isLoading = true;

    if (this.editMode && this.editOfferId) {
      return this.offersService.updateOffer(this.editOfferId, payload).pipe(
        switchMap((offer) => {
          this.isLoading = false;
          this.offerCreated.emit(offer);
          this.router.navigate(['/my-offers']);
          return of(null);
        })
      );
    }

    const userId = this.session.decodedToken$()?.user_id ?? 'test-user';
    return this.offersService.createOffer({ ...payload, userId }).pipe(
      switchMap((offer) => {
        this.isLoading = false;
        this.images = [];
        this.form.reset({ condition: 'new', phone: '+9627' });
        this.offerCreated.emit(offer);
        return of(null);
      })
    );
  }
}
