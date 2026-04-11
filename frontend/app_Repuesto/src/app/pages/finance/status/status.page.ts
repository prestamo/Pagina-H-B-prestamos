import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { addIcons } from 'ionicons';
import { analyticsOutline, cashOutline, walletOutline, alertCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-finance-status',
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar class="main-toolbar">
        <ion-buttons slot="start">
          <ion-menu-button color="light"></ion-menu-button>
        </ion-buttons>
        <ion-title>Estado de Caja</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <div class="page-container">
        <div class="status-hero">
          <div class="hero-icon active">
            <ion-icon name="wallet-outline"></ion-icon>
          </div>
          <h2>Caja de Ventas Activa</h2>
          <ion-badge color="success" mode="ios">ABIERTA</ion-badge>
        </div>

        <div class="denominations-card">
          <h3 class="card-title">Resumen de Efectivo</h3>
          <div class="balance-line">
            <span>Saldo en Caja</span>
            <span class="total-amount">$ 15,420.00</span>
          </div>
          <div class="divider"></div>
          <div class="stats-row">
            <div class="stat-mini">
              <span class="lbl">Ingresos</span>
              <span class="val positive">+$ 12,300</span>
            </div>
            <div class="stat-mini">
              <span class="lbl">Gastos</span>
              <span class="val negative">-$ 450</span>
            </div>
          </div>
        </div>

        <div class="actions">
          <ion-button expand="block" color="danger" fill="outline">
            Cierre de Turno
          </ion-button>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .main-toolbar { --background: #1a1a2e; --color: white; border-bottom: 2px solid #e94560; }
    .page-container { padding: 20px; }
    
    .status-hero {
      text-align: center; margin-bottom: 30px;
      .hero-icon { width: 80px; height: 80px; border-radius: 50%; background: rgba(59, 130, 246, 0.1); 
        color: #3b82f6; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px auto;
        font-size: 40px; border: 2px solid rgba(59, 130, 246, 0.2);
        &.active { background: rgba(74, 222, 128, 0.1); color: #4ade80; border-color: rgba(74, 222, 128, 0.2); }
      }
      h2 { color: #ffffff; font-weight: 800; margin-bottom: 8px; }
    }

    .denominations-card {
      background: #1a1a2e; padding: 25px; border-radius: 24px; border: 1px solid rgba(255,255,255,0.05);
      .card-title { color: #94a3b8; font-size: 12px; font-weight: 800; text-transform: uppercase; margin-bottom: 20px; }
      .balance-line { display: flex; justify-content: space-between; align-items: center; font-size: 18px; color: #ffffff; 
        .total-amount { font-size: 32px; font-weight: 800; }
      }
      .divider { height: 1px; background: rgba(255,255,255,0.05); margin: 20px 0; }
      .stats-row { display: flex; gap: 30px; 
        .stat-mini { display: flex; flex-direction: column;
          .lbl { font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase; }
          .val { font-size: 16px; font-weight: 800; margin-top: 4px; 
            &.positive { color: #4ade80; }
            &.negative { color: #ef4444; }
          }
        }
      }
    }

    .actions { margin-top: 40px; }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class FinanceStatusPage implements OnInit {
  constructor(private http: HttpClient) {
    addIcons({ analyticsOutline, cashOutline, walletOutline, alertCircleOutline });
  }
  ngOnInit() {}
}
