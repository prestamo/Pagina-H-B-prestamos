import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../services/auth.service';
import { UiService } from '../../../services/ui.service';
import { addIcons } from 'ionicons';
import { lockOpenOutline, cashOutline, alertCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-cash-opening',
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar class="main-toolbar">
        <ion-buttons slot="start">
          <ion-menu-button color="light"></ion-menu-button>
        </ion-buttons>
        <ion-title>Apertura de Caja</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true" class="ion-padding">
      <div class="opening-container">
        
        <div class="glass-card main-card">
          <div class="card-header">
            <div class="icon-circle">
              <ion-icon name="lock-open-outline"></ion-icon>
            </div>
            <h2>Nueva Sesión de Caja</h2>
            <p>Ingrese el monto inicial de efectivo disponible en gaveta.</p>
          </div>

          <div class="form-section">
            <div class="input-group">
              <span class="currency-symbol">$</span>
              <ion-input 
                type="number" 
                [(ngModel)]="montoInicial" 
                placeholder="0.00"
                class="amount-input">
              </ion-input>
            </div>

            <div class="info-alert" *ngIf="isAlreadyOpen">
              <ion-icon name="alert-circle-outline"></ion-icon>
              <span>Hay una sesión activa. Debe cerrarla antes de abrir una nueva.</span>
            </div>

            <ion-button 
              expand="block" 
              class="opening-btn" 
              (click)="openRegister()"
              [disabled]="montoInicial < 0 || isAlreadyOpen">
              <ion-icon name="cash-outline" slot="start"></ion-icon>
              INICIAR TURNO
            </ion-button>
          </div>
        </div>

      </div>
    </ion-content>
  `,
  styles: [`
    .main-toolbar { --background: #1a1a2e; --color: white; }
    
    .opening-container {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      background: radial-gradient(circle at top right, rgba(233, 69, 96, 0.1), transparent);
    }

    .glass-card {
      background: rgba(30, 41, 59, 0.7);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 30px;
      padding: 40px;
      width: 100%;
      max-width: 450px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      text-align: center;
      animation: fadeIn 0.6s ease-out;
    }

    .icon-circle {
      width: 80px;
      height: 80px;
      background: rgba(233, 69, 96, 0.1);
      border-radius: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      ion-icon { font-size: 40px; color: #e94560; }
    }

    h2 { font-weight: 800; color: white; margin-bottom: 8px; font-size: 24px; }
    p { color: #94a3b8; font-size: 15px; margin-bottom: 30px; }

    .input-group {
      position: relative;
      display: flex;
      align-items: center;
      background: rgba(15, 23, 42, 0.5);
      border: 2px solid rgba(255, 255, 255, 0.05);
      border-radius: 20px;
      padding: 0 20px;
      margin-bottom: 30px;
      transition: border-color 0.3s ease;
      
      &:focus-within { border-color: #e94560; }

      .currency-symbol {
        font-size: 32px;
        font-weight: 900;
        color: #e94560;
        margin-right: 15px;
      }

      .amount-input {
        --padding-start: 0;
        font-size: 42px;
        font-weight: 900;
        color: white;
      }
    }

    .info-alert {
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.3);
      border-radius: 12px;
      padding: 12px;
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 20px;
      text-align: left;
      ion-icon { color: #f59e0b; font-size: 20px; flex-shrink: 0; }
      span { color: #f59e0b; font-size: 13px; font-weight: 600; }
    }

    .opening-btn {
      --background: linear-gradient(135deg, #e94560 0%, #891a2b 100%);
      --border-radius: 16px;
      height: 60px;
      font-weight: 800;
      font-size: 18px;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class CashOpeningPage implements OnInit {
  montoInicial: number = 0;
  isAlreadyOpen: boolean = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    private uiService: UiService
  ) {
    addIcons({ lockOpenOutline, cashOutline, alertCircleOutline });
  }

  ngOnInit() {
    this.checkStatus();
  }

  checkStatus() {
    this.http.get(`${environment.apiUrl}/cash/status`).subscribe((res: any) => {
      this.isAlreadyOpen = res.active;
      if (this.isAlreadyOpen) {
        // Redirigir si ya está abierta o avisar
      }
    });
  }

  async openRegister() {
    const user = this.authService.currentUserValue;
    if (!user) return;

    const data = {
      id_caja: 1, // Default por ahora
      monto_inicial: this.montoInicial,
      id_usuario: user.cod_usuario || '1'
    };

    this.http.post(`${environment.apiUrl}/cash/open`, data).subscribe({
      next: (res: any) => {
        this.uiService.showSuccess('Caja Abierta', 'La sesión ha sido iniciada exitosamente. Ya puede realizar ventas.');
        this.router.navigate(['/sales']);
      },
      error: (err) => {
        this.uiService.showError('Error', err.error?.detail || 'No se pudo abrir la caja');
      }
    });
  }
}
