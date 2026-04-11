import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { addIcons } from 'ionicons';
import { 
  documentTextOutline, searchOutline, downloadOutline, 
  filterOutline, calendarOutline, chevronForwardOutline,
  eyeOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-cash-history',
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar class="main-toolbar">
        <ion-buttons slot="start">
          <ion-menu-button color="light"></ion-menu-button>
        </ion-buttons>
        <ion-title>Historial de Cajas</ion-title>
        <ion-buttons slot="end">
          <ion-button fill="solid" color="success" class="export-btn">
            <ion-icon name="download-outline" slot="start"></ion-icon>
            Excel
          </ion-button>
        </ion-buttons>
      </ion-toolbar>

      <div class="filter-panel">
        <div class="filter-group">
          <ion-icon name="calendar-outline"></ion-icon>
          <ion-input type="date" [(ngModel)]="startDate" class="filter-input"></ion-input>
          <span>a</span>
          <ion-input type="date" [(ngModel)]="endDate" class="filter-input"></ion-input>
        </div>
        <ion-button (click)="loadHistory()" class="search-btn">
          <ion-icon name="search-outline" slot="icon-only"></ion-icon>
        </ion-button>
      </div>
    </ion-header>

    <ion-content [fullscreen]="true">
      <div class="table-container">
        <div class="modern-table">
          <div class="table-header">
            <div class="h-col">Fecha</div>
            <div class="h-col text-right">Fondo Ini.</div>
            <div class="h-col text-right">V. Efectivo</div>
            <div class="h-col text-right">V. Tarjeta</div>
            <div class="h-col text-right">V. Transf.</div>
            <div class="h-col text-right">Egresos</div>
            <div class="h-col text-right">T. Sistema</div>
            <div class="h-col text-right">Contado</div>
            <div class="h-col text-right">Dif.</div>
            <div class="h-col">Estado</div>
            <div class="h-col">Ops.</div>
          </div>

          <div class="table-body">
            <div *ngFor="let h of history" class="table-row">
              <div class="b-col row-date">
                <span>{{ h.fecha | date:'dd/MM/yy' }}</span>
                <small>{{ h.fecha | date:'HH:mm' }}</small>
              </div>
              <div class="b-col text-right bold">$ {{ h.monto_apertura | number:'1.2-2' }}</div>
              <div class="b-col text-right">$ {{ h.ventas_efectivo | number:'1.2-2' }}</div>
              <div class="b-col text-right">$ {{ h.ventas_tarjeta | number:'1.2-2' }}</div>
              <div class="b-col text-right">$ {{ h.ventas_transferencia | number:'1.2-2' }}</div>
              <div class="b-col text-right text-danger">$ {{ h.egresos | number:'1.2-2' }}</div>
              <div class="b-col text-right blue-text bold">$ {{ h.total_sistema | number:'1.2-2' }}</div>
              <div class="b-col text-right bold">$ {{ h.efectivo_contado | number:'1.2-2' }}</div>
              <div class="b-col text-right" [class.text-danger]="h.diferencia < 0" [class.text-success]="h.diferencia >= 0">
                $ {{ h.diferencia | number:'1.2-2' }}
              </div>
              <div class="b-col">
                <ion-badge [color]="h.estado_cierre === 'OK' ? 'success' : (h.estado_cierre === 'SOBRANTE' ? 'warning' : 'danger')">
                  {{ h.estado_cierre }}
                </ion-badge>
              </div>
              <div class="b-col">
                <ion-button fill="clear" size="small" class="view-btn">
                  <ion-icon name="eye-outline" slot="icon-only"></ion-icon>
                </ion-button>
              </div>
            </div>

            <div *ngIf="history.length === 0" class="empty-state">
              <ion-icon name="document-text-outline"></ion-icon>
              <p>No se encontraron registros en este rango de fechas.</p>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .main-toolbar { --background: #1a1a2e; --color: white; }
    
    .filter-panel {
      background: #1a1a2e;
      padding: 15px 30px;
      display: flex;
      align-items: center;
      gap: 20px;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }

    .export-btn { --border-radius: 12px; font-weight: 800; }

    .filter-group {
      background: rgba(30, 41, 59, 0.5);
      border-radius: 12px;
      padding: 5px 15px;
      display: flex;
      align-items: center;
      gap: 12px;
      color: #94a3b8;
      ion-icon { color: #e94560; font-size: 18px; }
      span { font-size: 11px; font-weight: 800; text-transform: uppercase; }
      .filter-input { --color: white; font-weight: 700; width: 140px; }
    }

    .search-btn { --background: #e94560; --border-radius: 12px; height: 45px; width: 50px; }

    .table-container { padding: 30px; background: #0f172a; height: 100%; }

    .modern-table {
      background: rgba(30, 41, 59, 0.3);
      border-radius: 20px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.05);
      display: flex;
      flex-direction: column;
    }

    .table-header {
      background: #1e293b;
      display: flex;
      padding: 15px 20px;
      border-bottom: 2px solid rgba(255, 255, 255, 0.05);
      .h-col { 
        flex: 1; color: #94a3b8; font-size: 11px; font-weight: 800; 
        text-transform: uppercase; letter-spacing: 1px;
      }
    }

    .table-row {
      display: flex;
      padding: 15px 20px;
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.03);
      transition: background 0.2s ease;
      &:hover { background: rgba(255, 255, 255, 0.02); }
      .b-col { flex: 1; color: white; font-size: 13px; }
    }

    .row-date {
      display: flex;
      flex-direction: column;
      span { font-weight: 700; }
      small { color: #64748b; font-size: 10px; }
    }

    .text-right { text-align: right; }
    .bold { font-weight: 700; }
    .blue-text { color: #3b82f6; }
    .text-danger { color: #ef4444; }
    .text-success { color: #10b981; }

    .view-btn { --color: #94a3b8; margin: 0; }

    .empty-state {
      padding: 100px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      ion-icon { font-size: 60px; color: rgba(255,255,255,0.1); margin-bottom: 20px; }
      p { color: #64748b; font-weight: 600; }
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class CashHistoryPage implements OnInit {
  history: any[] = [];
  startDate: string = '';
  endDate: string = '';

  constructor(private http: HttpClient) {
    addIcons({ 
      documentTextOutline, searchOutline, downloadOutline, 
      filterOutline, calendarOutline, chevronForwardOutline,
      eyeOutline
    });
  }

  ngOnInit() {
    this.loadHistory();
  }

  loadHistory() {
    let url = `${environment.apiUrl}/cash/history`;
    if (this.startDate && this.endDate) {
      url += `?start_date=${this.startDate}&end_date=${this.endDate}`;
    }
    this.http.get(url).subscribe((res: any) => {
      this.history = res;
    });
  }
}
