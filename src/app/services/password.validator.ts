import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function customPasswordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return { required: true }; // Trường hợp mật khẩu bị để trống
    }

    // Biểu thức chính quy
    const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{6,255}$/;
    const valid = passwordRegex.test(value);

    // Nếu không khớp, trả về lỗi
    return valid ? null : { passwordInvalid: true };
  };
}
