import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CartItem {
  cod_producto: string;
  nombre: string;
  precio_venta: number;
  cantidad: number;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  private cart = new BehaviorSubject<CartItem[]>([]);
  cart$ = this.cart.asObservable();

  private totals = new BehaviorSubject({
    subtotal: 0,
    itbis: 0,
    discount: 0,
    total: 0
  });
  totals$ = this.totals.asObservable();
  
  private isFiscal = new BehaviorSubject<boolean>(false);
  isFiscal$ = this.isFiscal.asObservable();

  // Observable específico para vincular con el Sidebar
  private totalVenta = new BehaviorSubject<number>(0);
  totalVenta$ = this.totalVenta.asObservable();

  discountPercent: number = 0;

  addToCart(product: any) {
    const current = this.cart.value;
    const existing = current.find(item => item.cod_producto === product.cod_producto);

    if (existing) {
      existing.cantidad += 1;
      existing.total = existing.cantidad * existing.precio_venta;
      this.cart.next([...current]);
    } else {
      const newItem: CartItem = {
        cod_producto: product.cod_producto,
        nombre: product.nombre,
        precio_venta: product.precio_venta,
        cantidad: 1,
        total: product.precio_venta
      };
      this.cart.next([...current, newItem]);
    }
    this.calculateTotals();
  }

  removeFromCart(index: number) {
    const current = this.cart.value;
    current.splice(index, 1);
    this.cart.next([...current]);
    this.calculateTotals();
  }

  updateQuantity(index: number, qty: number) {
    const current = this.cart.value;
    if (qty <= 0) {
      this.removeFromCart(index);
      return;
    }
    current[index].cantidad = qty;
    current[index].total = current[index].cantidad * current[index].precio_venta;
    this.cart.next([...current]);
    this.calculateTotals();
  }

  setDiscount(percent: number) {
    if (percent > 20) percent = 20;
    if (percent < 0) percent = 0;
    this.discountPercent = percent;
    this.calculateTotals();
  }

  setFiscal(value: boolean) {
    this.isFiscal.next(value);
    this.calculateTotals();
  }

  calculateTotals() {
    const subtotal = this.cart.value.reduce((acc, item) => acc + item.total, 0);
    const itbis = this.isFiscal.value ? (subtotal * 0.18) : 0; 
    const discountAmount = (subtotal + itbis) * (this.discountPercent / 100);
    const total = (subtotal + itbis) - discountAmount;

    this.totals.next({
      subtotal,
      itbis,
      discount: discountAmount,
      total
    });

    this.totalVenta.next(total);
  }

  clearCart() {
    this.cart.next([]);
    this.discountPercent = 0;
    this.calculateTotals();
  }
}
