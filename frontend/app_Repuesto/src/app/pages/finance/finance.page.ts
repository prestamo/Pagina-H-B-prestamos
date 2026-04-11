import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-finance',
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Caja y Finanzas</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true" class="ion-padding">
      <div class="empty-state">
        <ion-icon name="wallet-outline"></ion-icon>
        <h2>Control de Caja</h2>
        <p>Gestiona aperturas, cierres y transacciones de efectivo.</p>
      </div>
    </ion-content>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 80%;
      text-align: center;
      ion-icon { font-size: 80px; color: #64748b; margin-bottom: 20px; }
      h2 { color: #ffffff; }
      p { color: #94a3b8; }
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class FinancePage {}
