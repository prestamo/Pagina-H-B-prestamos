import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { addIcons } from 'ionicons';
import { swapHorizontalOutline, arrowUpOutline, arrowDownOutline, calendarOutline } from 'ionicons/icons';

@Component({
  selector: 'app-finance-transactions',
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar class="main-toolbar">
        <ion-buttons slot="start">
          <ion-menu-button color="light"></ion-menu-button>
        </ion-buttons>
        <ion-title>Movimientos de Caja</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <div class="page-container">
        
        <div *ngIf="transactions.length === 0" class="empty-state">
           <ion-icon name="swap-horizontal-outline"></ion-icon>
           <p>No se registran transacciones el día de hoy.</p>
        </div>

        <div class="transaction-list">
          <div *ngFor="let t of transactions" class="transaction-card">
            <div class="tx-main">
              <div class="tx-icon" [ngClass]="t.tipo.toLowerCase()">
                <ion-icon [name]="t.tipo.toLowerCase() === 'entrada' ? 'arrow-up-outline' : 'arrow-down-outline'"></ion-icon>
              </div>
              <div class="tx-details">
                <h4 class="tx-type">{{ t.tipo }}</h4>
                <p class="tx-date"><ion-icon name="calendar-outline"></ion-icon> {{ t.fecha | date:'shortTime' }}</p>
              </div>
            </div>
            <div class="tx-amount" [ngClass]="t.tipo.toLowerCase()">
               {{ t.tipo.toLowerCase() === 'entrada' ? '+' : '-' }} $ {{ t.monto | number:'1.2-2' }}
            </div>
          </div>
        </div>

      </div>
    </ion-content>
  `,
  styles: [`
    .main-toolbar { --background: #1a1a2e; --color: white; border-bottom: 2px solid #e94560; }
    .page-container { padding: 20px; }
    
    .transaction-card {
      background: #1a1a2e; border: 1px solid rgba(255,255,255,0.05); border-radius: 16px;
      padding: 15px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;

      .tx-main { display: flex; align-items: center; gap: 15px; }
      
      .tx-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px;
        &.entrada { background: rgba(74, 222, 128, 0.1); color: #4ade80; }
        &.salida { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
      }

      .tx-type { margin: 0; color: #ffffff; font-size: 16px; font-weight: 700; }
      .tx-date { margin: 2px 0 0 0; color: #64748b; font-size: 11px; display: flex; align-items: center; gap: 4px; }

      .tx-amount { font-size: 18px; font-weight: 800; 
        &.entrada { color: #4ade80; }
        &.salida { color: #ef4444; }
      }
    }

    .empty-state { text-align: center; padding: 60px 20px; ion-icon { font-size: 64px; color: #334155; margin-bottom: 15px; } p { color: #64748b; font-size: 16px; } }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class FinanceTransactionsPage implements OnInit {
  transactions: any[] = [];
  constructor(private http: HttpClient) {
    addIcons({ swapHorizontalOutline, arrowUpOutline, arrowDownOutline, calendarOutline });
  }
  ngOnInit() {
    this.http.get(`${environment.apiUrl}/caja/transacciones`).subscribe((res: any) => {
      this.transactions = res;
    });
  }
}
