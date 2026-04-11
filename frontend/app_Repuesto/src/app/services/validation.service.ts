import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  formatCedula(value: string): string {
    if (!value) return '';
    const nums = value.replace(/\D/g, ''); // Solo números
    let formatted = nums;
    if (nums.length > 3) formatted = nums.substring(0, 3) + '-' + nums.substring(3);
    if (nums.length > 10) formatted = formatted.substring(0, 11) + '-' + nums.substring(10);
    return formatted.substring(0, 13); // Máximo 000-0000000-0
  }

  formatPhone(value: string): string {
    if (!value) return '';
    const nums = value.replace(/\D/g, '');
    let formatted = nums;
    if (nums.length > 3) formatted = nums.substring(0, 3) + '-' + nums.substring(3);
    if (nums.length > 6) formatted = formatted.substring(0, 7) + '-' + nums.substring(6);
    return formatted.substring(0, 12); // Máximo 000-000-0000
  }

  formatCurrency(value: any): string {
    if (value === null || value === undefined || value === '') return '';
    
    // Si viene como string sucio, limpiar a número
    const cleanValue = typeof value === 'string' 
      ? parseFloat(value.replace(/[^0-9.]/g, '')) 
      : value;

    if (isNaN(cleanValue)) return '';

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(cleanValue);
  }

  unformat(value: string): string {
    if (!value) return '';
    return value.replace(/[^0-9.]/g, '');
  }
}
