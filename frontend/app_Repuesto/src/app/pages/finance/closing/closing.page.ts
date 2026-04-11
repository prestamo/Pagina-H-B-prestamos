import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { UiService } from '../../../services/ui.service';
import { addIcons } from 'ionicons';
import { 
  calculatorOutline, cashOutline, cardOutline, 
  swapHorizontalOutline, alertCircleOutline, 
  checkmarkCircleOutline, closeOutline, saveOutline,
  trendingUpOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-cash-closing',
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar class="main-toolbar">
        <ion-buttons slot="start">
          <ion-menu-button color="light"></ion-menu-button>
        </ion-buttons>
        <ion-title>Cierre y Cuadre de Caja</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true" class="ion-padding" *ngIf="status">
      
      <div class="closing-layout" *ngIf="status.active; else noActive">
        
        <!-- DASHBOARD PRIVADO (RESUMEN) -->
        <div class="stats-dashboard">
          <div class="stat-glass-card">
            <span class="stat-label">FONDO INICIAL</span>
            <span class="stat-value">$ {{ status.fondo_inicial | number:'1.2-2' }}</span>
          </div>
          <div class="stat-glass-card">
            <span class="stat-label">VENTAS EFECTIVO</span>
            <span class="stat-value">$ {{ status.ventas_efectivo | number:'1.2-2' }}</span>
          </div>
          <div class="stat-glass-card highlight">
            <span class="stat-label">TOTAL EN SISTEMA</span>
            <span class="stat-value">$ {{ status.total_sistema | number:'1.2-2' }}</span>
            <div class="sub-labels">
              <span>(Fondo + Ventas - Egresos)</span>
            </div>
          </div>
        </div>

        <div class="main-grid">
          <!-- SECCIÓN DESGLOSE -->
          <div class="breakdown-section">
            
            <div class="breakdown-group">
              <h3 class="group-title"><ion-icon name="cash-outline"></ion-icon> Desglose de Monedas</h3>
              <div class="denom-grid">
                <div *ngFor="let d of coins" class="denom-card">
                  <div class="denom-val">$ {{ d.value }}</div>
                  <ion-input type="number" [(ngModel)]="d.qty" (ionChange)="calculateBreakdownTotal()"></ion-input>
                  <div class="denom-total">$ {{ (d.qty * d.value) | number:'1.2-2' }}</div>
                </div>
              </div>
            </div>

            <div class="breakdown-group">
              <h3 class="group-title"><ion-icon name="cash-outline"></ion-icon> Desglose de Billetes</h3>
              <div class="denom-grid">
                <div *ngFor="let d of bills" class="denom-card tall">
                  <div class="denom-val">$ {{ d.value }}</div>
                  <ion-input type="number" [(ngModel)]="d.qty" (ionChange)="calculateBreakdownTotal()"></ion-input>
                  <div class="denom-total">$ {{ (d.qty * d.value) | number:'1.2-2' }}</div>
                </div>
              </div>
            </div>

            <div class="observations-box">
              <h3 class="group-title"><ion-icon name="alert-circle-outline"></ion-icon> Observaciones</h3>
              <ion-textarea 
                [(ngModel)]="observaciones" 
                placeholder="Notas adicionales del cierre..."
                rows="3" 
                auto-grow="true"
                class="custom-textarea">
              </ion-textarea>
            </div>
          </div>

          <!-- SECCIÓN RESULTADOS -->
          <div class="summary-section">
            <div class="summary-card">
              <div class="result-box total-counted">
                <div class="res-icon"><ion-icon name="calculator-outline"></ion-icon></div>
                <div class="res-data">
                  <span class="res-lbl">Total Efectivo Contado</span>
                  <span class="res-val">$ {{ totalContado | number:'1.2-2' }}</span>
                  <p class="res-hint">Calculado automáticamente (Desglose + Fondo)</p>
                </div>
              </div>

              <div class="result-box difference" [class.negative]="diferencia < 0" [class.positive]="diferencia > 0">
                <div class="res-icon"><ion-icon [name]="diferencia === 0 ? 'checkmark-circle-outline' : 'trending-up-outline'"></ion-icon></div>
                <div class="res-data">
                  <span class="res-lbl">Diferencia de Cuadre</span>
                  <span class="res-val">$ {{ diferencia | number:'1.2-2' }}</span>
                  <span class="res-status" *ngIf="diferencia === 0">CUADRADO</span>
                  <span class="res-status" *ngIf="diferencia > 0">SOBRANTE</span>
                  <span class="res-status" *ngIf="diferencia < 0">FALTANTE</span>
                </div>
              </div>

              <ion-button expand="block" class="close-btn" (click)="confirmClose()">
                <ion-icon name="save-outline" slot="start"></ion-icon>
                REALIZAR CIERRE DE CAJA
              </ion-button>
            </div>

            <div class="audit-info">
              <h4>Otros métodos (informativo)</h4>
              <div class="audit-row">
                <span>Ventas Tarjeta:</span>
                <span>$ {{ status.ventas_tarjeta | number:'1.2-2' }}</span>
              </div>
              <div class="audit-row">
                <span>Ventas Transferencia:</span>
                <span>$ {{ status.ventas_transferencia | number:'1.2-2' }}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <ng-template #noActive>
        <div class="no-active-session">
          <div class="glass-card">
            <ion-icon name="lock-closed-outline" class="big-icon"></ion-icon>
            <h2>No hay sesión activa</h2>
            <p>Debe abrir la caja antes de poder realizar un cuadre o cierre.</p>
            <ion-button expand="block" routerLink="/finance/opening">Ir a Apertura</ion-button>
          </div>
        </div>
      </ng-template>

    </ion-content>
  `,
  styles: [`
    .main-toolbar { --background: #1a1a2e; --color: white; }
    
    .stats-dashboard {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 25px;
    }

    .stat-glass-card {
      background: rgba(30, 41, 59, 0.6);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 20px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      &.highlight { border: 1px solid #3b82f6; .stat-value { color: #3b82f6; } }
      .stat-label { font-size: 11px; font-weight: 800; color: #94a3b8; letter-spacing: 1px; }
      .stat-value { font-size: 26px; font-weight: 900; color: white; margin: 5px 0; }
      .sub-labels { font-size: 10px; color: #64748b; font-weight: 600; }
    }

    .main-grid { display: grid; grid-template-columns: 1.8fr 1fr; gap: 25px; }

    .breakdown-group {
      background: rgba(30, 41, 59, 0.4);
      border-radius: 24px;
      padding: 20px;
      margin-bottom: 25px;
      border: 1px solid rgba(255, 255, 255, 0.03);
    }

    .group-title {
      font-size: 14px; color: #10b981; font-weight: 800; text-transform: uppercase;
      display: flex; align-items: center; gap: 10px; margin-bottom: 15px;
      ion-icon { font-size: 18px; }
    }

    .denom-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 12px; }
    .denom-card {
      background: #1e293b; border-radius: 12px; padding: 10px; text-align: center;
      .denom-val { font-size: 11px; color: #94a3b8; font-weight: 800; margin-bottom: 5px; }
      ion-input { --background: #0f172a; --color: white; border-radius: 6px; height: 38px; font-weight: 800; font-size: 18px; margin-bottom: 5px; }
      .denom-total { font-size: 12px; color: #ffffff; font-weight: 700; }
    }

    .summary-section { display: flex; flex-direction: column; gap: 20px; }
    .summary-card {
      background: #1a1a2e; border-radius: 28px; padding: 25px; border: 1px solid rgba(255,255,255,0.05);
      display: flex; flex-direction: column; gap: 20px;
    }

    .result-box {
      display: flex; align-items: center; gap: 15px; padding: 15px; border-radius: 18px;
      .res-icon { width: 45px; height: 45px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
      .res-data { display: flex; flex-direction: column; }
      .res-lbl { font-size: 12px; font-weight: 700; color: #94a3b8; }
      .res-val { font-size: 24px; font-weight: 900; color: white; }
      .res-hint { font-size: 10px; color: #64748b; margin: 0; }
    }

    .total-counted {
      background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2);
      .res-icon { background: #3b82f6; color: white; }
    }

    .difference {
      background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2);
      .res-icon { background: #10b981; color: white; }
      &.negative { background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; .res-icon { background: #ef4444; } }
      &.positive { background: rgba(245, 158, 11, 0.1); border: 1px solid #f59e0b; .res-icon { background: #f59e0b; } }
      .res-status { font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px; background: rgba(0,0,0,0.3); width: fit-content; margin-top: 4px; }
    }

    .close-btn { --background: linear-gradient(135deg, #10b981 0%, #064e3b 100%); --border-radius: 16px; height: 60px; font-weight: 900; margin-top: 10px; }

    .audit-info { background: rgba(255,255,255,0.02); padding: 15px; border-radius: 18px;
      h4 { font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-top: 0; }
      .audit-row { display: flex; justify-content: space-between; font-size: 13px; color: #94a3b8; margin: 5px 0; }
    }

    .observations-box { .custom-textarea { --background: #1e293b; --color: white; border-radius: 12px; font-size: 14px; border: 1px solid rgba(255,255,255,0.05); } }

    .no-active-session { display: flex; align-items: center; justify-content: center; height: 100%; text-align: center;
      .glass-card { background: #1a1a2e; padding: 40px; border-radius: 30px; width: 100%; max-width: 400px;
        .big-icon { font-size: 80px; color: #64748b; margin-bottom: 20px; } h2 { color: white; } p { color: #94a3b8; margin-bottom: 30px; }
      }
    }

    @media (max-width: 900px) { .main-grid { grid-template-columns: 1fr; } }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class CashClosingPage implements OnInit {
  status: any = null;
  coins = [
    { value: 1, qty: 0 }, { value: 5, qty: 0 }, 
    { value: 10, qty: 0 }, { value: 25, qty: 0 }
  ];
  bills = [
    { value: 50, qty: 0 }, { value: 100, qty: 0 }, 
    { value: 200, qty: 0 }, { value: 500, qty: 0 }, 
    { value: 1000, qty: 0 }, { value: 2000, qty: 0 }
  ];
  
  totalBreakdown: number = 0;
  totalContado: number = 0;
  diferencia: number = 0;
  observaciones: string = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private uiService: UiService
  ) {
    addIcons({ 
      calculatorOutline, cashOutline, cardOutline, 
      swapHorizontalOutline, alertCircleOutline, 
      checkmarkCircleOutline, closeOutline, saveOutline,
      trendingUpOutline
    });
  }

  ngOnInit() {
    this.checkStatus();
  }

  checkStatus() {
    this.http.get(`${environment.apiUrl}/cash/status`).subscribe((res: any) => {
      this.status = res;
      this.calculateBreakdownTotal();
    });
  }

  calculateBreakdownTotal() {
    this.totalBreakdown = 0;
    this.coins.forEach(c => this.totalBreakdown += (c.qty * c.value));
    this.bills.forEach(b => this.totalBreakdown += (b.qty * b.value));
    
    // Total Contado = Desglose + Fondo Inicial (tal como pidió el usuario)
    this.totalContado = this.totalBreakdown + (this.status?.fondo_inicial || 0);
    this.diferencia = this.totalContado - (this.status?.total_sistema || 0);
  }

  async confirmClose() {
    const confirmed = await this.uiService.showConfirmDelete(
      '¿Cerrar Caja?', 
      'Desea finalizar el turno y guardar el cuadre actual? Esta acción liberará la caja para el siguiente turno.'
    );

    if (confirmed) {
      this.processClose();
    }
  }

  processClose() {
    const payload = {
      id_historial: this.status.id_historial,
      id_caja: this.status.id_caja,
      efectivo_contado: this.totalContado,
      observaciones: this.observaciones,
      denominaciones: [
        ...this.coins.map(c => ({ denominacion: c.value, cantidad: c.qty, total: c.value * c.qty })),
        ...this.bills.map(b => ({ denominacion: b.value, cantidad: b.qty, total: b.value * b.qty }))
      ]
    };

    this.http.post(`${environment.apiUrl}/cash/close`, payload).subscribe({
      next: () => {
        this.uiService.showSuccess('Caja Cerrada', 'El turno ha finalizado correctamente. El reporte ha sido guardado en el historial.');
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.uiService.showError('Error', err.error?.detail || 'No se pudo cerrar la caja');
      }
    });
  }
}
