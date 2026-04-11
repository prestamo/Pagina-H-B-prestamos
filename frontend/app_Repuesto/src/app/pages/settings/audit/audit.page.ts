import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { addIcons } from 'ionicons';
import { shieldCheckmarkOutline, trashOutline, calendarOutline, documentTextOutline } from 'ionicons/icons';

@Component({
  selector: 'app-audit',
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar class="main-toolbar">
        <ion-buttons slot="start">
          <ion-menu-button color="light"></ion-menu-button>
        </ion-buttons>
        <ion-title>Auditoría de Anulaciones</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <div class="page-container">
        <div class="header-alert">
          <ion-icon name="shield-checkmark-outline"></ion-icon>
          <div class="alert-text">
            <h3>Registro de Ventas Eliminadas</h3>
            <p>Control de auditoría para el seguimiento de mercancía devuelta y facturas anuladas.</p>
          </div>
        </div>

        <div *ngIf="voidedSales.length === 0" class="empty-state">
           <ion-icon name="trash-outline"></ion-icon>
           <p>No se registran ventas eliminadas recientes.</p>
        </div>

        <div class="audit-list">
          <div *ngFor="let v of voidedSales" class="audit-card">
            <div class="card-left">
              <span class="doc-num">{{ v.num_documento }}</span>
              <h4 class="product-name">{{ v.nombre_producto }}</h4>
              <p class="void-date"><ion-icon name="calendar-outline"></ion-icon> {{ v.fecha_eliminacion | date:'medium' }}</p>
            </div>
            <div class="card-right">
              <div class="total-voided">$ {{ v.total | number:'1.2-2' }}</div>
              <span class="status-label">ANULADA</span>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .main-toolbar { --background: #1a1a2e; --color: white; border-bottom: 2px solid #e94560; }
    .page-container { padding: 20px; }
    
    .header-alert {
      background: rgba(233, 69, 96, 0.1); border: 1px solid rgba(233, 69, 96, 0.3);
      padding: 15px; border-radius: 12px; display: flex; align-items: center; gap: 15px; margin-bottom: 25px;
      ion-icon { font-size: 32px; color: #e94560; }
      h3 { margin: 0; font-size: 16px; color: #ffffff; font-weight: 700; }
      p { margin: 2px 0 0 0; font-size: 12px; color: #94a3b8; }
    }

    .audit-card {
      background: #1a1a2e; border: 1px solid rgba(255,255,255,0.05); border-radius: 16px;
      padding: 15px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;
      
      .doc-num { font-size: 10px; font-weight: 800; color: #e94560; background: rgba(233, 69, 96, 0.1); padding: 2px 6px; border-radius: 4px; }
      .product-name { margin: 8px 0 4px 0; color: #ffffff; font-size: 15px; }
      .void-date { font-size: 11px; color: #64748b; margin: 0; display: flex; align-items: center; gap: 5px; }
      
      .card-right { text-align: right; }
      .total-voided { font-size: 18px; font-weight: 800; color: #ffffff; margin-bottom: 4px; }
      .status-label { font-size: 9px; font-weight: 800; color: #ef4444; border: 1px solid #ef4444; padding: 2px 6px; border-radius: 4px; }
    }

    .empty-state { text-align: center; padding: 60px 20px; ion-icon { font-size: 64px; color: #334155; margin-bottom: 15px; } p { color: #64748b; font-size: 16px; } }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class AuditPage implements OnInit {
  voidedSales: any[] = [];

  constructor(private http: HttpClient) {
    addIcons({ shieldCheckmarkOutline, trashOutline, calendarOutline, documentTextOutline });
  }

  ngOnInit() {
    this.http.get(`${environment.apiUrl}/audit/anulaciones`).subscribe((res: any) => {
      this.voidedSales = res;
    });
  }
}
