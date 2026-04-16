import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';


@Injectable({ providedIn: 'root' })
export class HelperService {
    getErrorsMessage(form: FormGroup, controlName: string = '', fieldLabel: string, showFormError = false): string {
        const control = form.get(controlName);
        const touched = control?.touched;
        let errors = control?.errors && touched ?
            control.errors
            : showFormError ?
                form.errors ?
                    form.errors
                    : null
                : null;
        if (errors) {
            if (errors['required']) return `${fieldLabel} is required`;
            if (errors['minlength']) return `${fieldLabel} must be at least ${errors['minlength'].requiredLength} characters`;
            if (errors['maxlength']) return `${fieldLabel} must not exceed ${errors['maxlength'].requiredLength} characters`;
            if (errors['min']) return `${fieldLabel} must be at least ${errors['min'].min}`;
            if (errors['max']) return `${fieldLabel} must not exceed ${errors['max'].max}`;
            if (errors['email']) return `${fieldLabel} must be a valid email address`;
            if (errors['pattern']) return `${fieldLabel} format is invalid`;
            if (errors['numberOnly']) return `${fieldLabel} must contain only numbers`;
            if (errors['arabicOnly']) return `${fieldLabel} must contain Arabic text only`;
            if (errors['dependantOn']) return `Fill ${errors['dependantOn'].depndeeFieldLabel} befor filling ${fieldLabel}`;
            if (errors['dateCompare']) return `${fieldLabel} must be ${errors['dateCompare'].place} ${errors['dateCompare'].depndeeFieldLabel}`;
        }
        return '';
    }


    toIsoDate(dateStr: string): string {
        if (!dateStr) return '';
        const parts = dateStr.split('/');
        if (parts.length === 3) return `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
        return dateStr;
    }

}
