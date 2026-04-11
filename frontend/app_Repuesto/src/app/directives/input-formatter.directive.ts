import { Directive, Input, HostListener, ElementRef, Renderer2 } from '@angular/core';
import { ValidationService } from '../services/validation.service';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appFormatter]',
  standalone: true
})
export class InputFormatterDirective {
  @Input('appFormatter') type: 'cedula' | 'phone' | 'currency' = 'cedula';

  constructor(
    private el: ElementRef,
    private validationService: ValidationService,
    private control: NgControl
  ) {}

  @HostListener('ionInput', ['$event'])
  onInput(event: any) {
    const input = event.target;
    let value = input.value;

    if (!value) return;

    let formatted = value;

    if (this.type === 'cedula') {
      formatted = this.validationService.formatCedula(value);
    } else if (this.type === 'phone') {
      formatted = this.validationService.formatPhone(value);
    } else if (this.type === 'currency') {
      // Para moneda solo limpiamos caracteres no válidos mientras escribe
      // El formateo final ($0.00) se aplica preferiblemente en el blur o al terminar
      formatted = value.replace(/[^0-9.]/g, '');
    }

    // Actualizar el valor en el input y en el modelo de Angular
    this.control.control?.setValue(formatted, { emitEvent: false });
    input.value = formatted;
  }

  @HostListener('ionBlur', ['$event'])
  onBlur(event: any) {
    if (this.type === 'currency') {
      const input = event.target;
      const formatted = this.validationService.formatCurrency(input.value);
      this.control.control?.setValue(formatted, { emitEvent: false });
      input.value = formatted;
    }
  }

  @HostListener('ionFocus', ['$event'])
  onFocus(event: any) {
    if (this.type === 'currency') {
      const input = event.target;
      const clean = this.validationService.unformat(input.value);
      this.control.control?.setValue(clean, { emitEvent: false });
      input.value = clean;
    }
  }
}
