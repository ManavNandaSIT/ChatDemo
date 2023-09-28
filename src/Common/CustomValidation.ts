import { AbstractControl, ValidatorFn } from '@angular/forms';

export class CustomValidation {
  static birthdateValidation: ValidatorFn = (control: AbstractControl): { [key: string]: boolean } | null => {
    const selectedDate = new Date(control.value);
    const currentDate = new Date();

    if (selectedDate.getTime() > currentDate.getTime()) {
      return { futureDate: true };
    }

    return null;
  };
}