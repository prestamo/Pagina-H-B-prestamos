import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { addIcons } from 'ionicons';
import { cardOutline, timeOutline, alertCircleOutline, checkmarkCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-credits',
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar class="main-toolbar">
        <ion-buttons slot="start">
          <ion-menu-button color="light"></ion-menu-button>
        </ion-buttons>
        <ion-title>Cuentas por Cobrar</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <div class="page-container">
        <!-- DASHBOARD CRÉDITOS -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon info"><ion-icon name="card-outline"></ion-icon></div>
            <div class="stat-data">
              <span class="label">Total por Cobrar</span>
              <span class="value">$ {{ totalAdeudado | number:'1.2-2' }}</span>
            </div>
          </div>
          <div class="stat-card urgent">
            <div class="stat-icon alert"><ion-icon name="alert-circle-outline"></ion-icon></div>
            <div class="stat-data">
              <span class="label">Créditos Vencidos</span>
              <span class="value">{{ vencidosCount }}</span>
            </div>
          </div>
        </div>

        <h2 class="section-title">Listado de Créditos Pendientes</h2>

        <div *ngIf="credits.length === 0" class="empty-state">
          <ion-icon name="card-outline"></ion-icon>
          <p>No hay cuentas pendientes en este momento.</p>
        </div>

        <ion-list lines="none" class="custom-list">
          <ion-item *ngFor="let c of credits" class="credit-item">
            <div class="credit-info">
              <div class="client-details">
                <h3 class="name">{{ c.nombre_cliente }}</h3>
                <p class="date"><ion-icon name="time-outline"></ion-icon> Vence: {{ c.fecha_vencimiento | date:'dd/MM/yyyy' }}</p>
              </div>
              <div class="balance-details">
                <div class="amount">$ {{ c.monto_adeudado | number:'1.2-2' }}</div>
                <ion-badge [color]="getStatusColor(c.estado)">{{ c.estado }}</ion-badge>
              </div>
            </div>
          </ion-item>
        </ion-list>
      </div>
    </ion-content>
  `,
  styles: [`
    .main-toolbar { --background: #1a1a2e; --color: white; border-bottom: 2px solid #e94560; }
    .page-container { padding: 20px; }
    
    .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px; }
    .stat-card {
      background: #1a1a2e; padding: 15px; border-radius: 16px; display: flex; align-items: center; gap: 12px;
      border: 1px solid rgba(255,255,255,0.05);
      .stat-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
      .stat-icon.info { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
      .stat-icon.alert { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
      .stat-data { display: flex; flex-direction: column; 
        .label { font-size: 10px; color: #94a3b8; text-transform: uppercase; font-weight: 700; }
        .value { font-size: 18px; font-weight: 800; color: #ffffff; }
      }
    }

    .section-title { font-size: 18px; font-weight: 800; color: #ffffff; margin-bottom: 20px; }

    .credit-item {
      --background: #1a1a2e; margin-bottom: 12px; border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.05);
      --padding-start: 15px; --padding-end: 15px; --padding-top: 15px; --padding-bottom: 15px;
      .credit-info { display: flex; justify-content: space-between; align-items: center; width: 100%; }
      .name { margin: 0 0 5px 0; font-size: 16px; color: #ffffff; font-weight: 700; }
      .date { font-size: 12px; color: #94a3b8; margin: 0; display: flex; align-items: center; gap: 5px; }
      .amount { font-size: 18px; font-weight: 800; color: #ffffff; margin-bottom: 5px; text-align: right; }
    }

    .empty-state { text-align: center; padding: 60px 20px; ion-icon { font-size: 64px; color: #334155; margin-bottom: 15px; } p { color: #64748b; font-size: 16px; } }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class CreditsPage implements OnInit {
  credits: any[] = [];
  totalAdeudado: number = 0;
  vencidosCount: number = 0;

  constructor(private http: HttpClient) {
    addIcons({ cardOutline, timeOutline, alertCircleOutline, checkmarkCircleOutline });
  }

  ngOnInit() {
    this.http.get(`${environment.apiUrl}/creditos`).subscribe((res: any) => {
      this.credits = res;
      this.totalAdeudado = this.credits.reduce((acc, c) => acc + c.monto_adeudado, 0);
      this.vencidosCount = this.credits.filter(c => c.estado === 'Vencido').length;
    });
  }

  getStatusColor(status: string) {
    switch(status.toLowerCase()) {
      case 'pendiente': return 'warning';
      case 'vencido': return 'danger';
      case 'pagado': return 'success';
      default: return 'medium';
    }
  }
}
