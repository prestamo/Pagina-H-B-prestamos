import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  alertCircleOutline, checkmarkCircleOutline, 
  closeCircleOutline, warningOutline, 
  cloudOfflineOutline, lockClosedOutline,
  trashOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-professional-modal',
  template: `
    <div class="modal-wrapper {{ type }}">
      <div class="glass-background"></div>
      
      <div class="content-container">
        <div class="icon-container">
          <div class="icon-blob"></div>
          <ion-icon [name]="getIcon()" class="main-icon"></ion-icon>
        </div>

        <div class="text-content">
          <h2 class="title">{{ title }}</h2>
          <p class="message">{{ message }}</p>
        </div>

        <div class="footer-actions">
          <ion-button *ngIf="showCancel" fill="clear" color="light" (click)="dismiss(false)" class="btn-cancel">
            {{ cancelText }}
          </ion-button>
          <ion-button 
            [color]="getButtonColor()" 
            (click)="dismiss(true)" 
            class="btn-confirm" 
            [expand]="showCancel ? 'none' : 'block'">
            {{ confirmText }}
          </ion-button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding: 20px;
      position: relative;
      overflow: hidden;
      font-family: 'Inter', sans-serif;
    }

    .glass-background {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(12px);
      z-index: -1;
    }

    .content-container {
      background: rgba(30, 41, 59, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 28px;
      padding: 30px;
      width: 100%;
      max-width: 360px;
      text-align: center;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      animation: modalPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .icon-container {
      position: relative;
      width: 90px;
      height: 90px;
      margin: 0 auto 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .icon-blob {
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 35% 65% 70% 30% / 30% 30% 70% 70%;
      opacity: 0.2;
      animation: blobMove 8s infinite alternate;
    }

    .main-icon {
      font-size: 48px;
      z-index: 1;
      filter: drop-shadow(0 0 10px rgba(255,255,255,0.2));
    }

    .title {
      color: white;
      font-size: 22px;
      font-weight: 800;
      margin: 0 0 12px 0;
      letter-spacing: -0.5px;
    }

    .message {
      color: #94a3b8;
      font-size: 15px;
      line-height: 1.5;
      margin-bottom: 30px;
    }

    .footer-actions {
      display: flex;
      gap: 12px;
      justify-content: center;
    }

    .btn-confirm {
      --border-radius: 14px;
      --box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      font-weight: 700;
      flex: 1;
      height: 48px;
    }

    .btn-cancel {
      --border-radius: 14px;
      font-weight: 600;
      flex: 1;
      height: 48px;
    }

    /* TYPES STYLES */
    .success .icon-blob { background: #10b981; }
    .success .main-icon { color: #10b981; }
    
    .error .icon-blob { background: #ef4444; }
    .error .main-icon { color: #ef4444; }
    
    .warning .icon-blob { background: #f59e0b; }
    .warning .main-icon { color: #f59e0b; }

    .delete .icon-blob { background: #e94560; }
    .delete .main-icon { color: #e94560; }

    @keyframes modalPop {
      from { transform: scale(0.8) translateY(20px); opacity: 0; }
      to { transform: scale(1) translateY(0); opacity: 1; }
    }

    @keyframes blobMove {
      0% { border-radius: 35% 65% 70% 30% / 30% 30% 70% 70%; }
      50% { border-radius: 50% 50% 30% 70% / 50% 60% 40% 50%; }
      100% { border-radius: 30% 70% 70% 30% / 60% 30% 70% 40%; }
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class ProfessionalModalComponent {
  @Input() type: 'success' | 'error' | 'warning' | 'delete' = 'success';
  @Input() title: string = '';
  @Input() message: string = '';
  @Input() confirmText: string = 'Entendido';
  @Input() cancelText: string = 'Cancelar';
  @Input() showCancel: boolean = false;

  constructor(private modalCtrl: ModalController) {
    addIcons({ 
      alertCircleOutline, checkmarkCircleOutline, 
      closeCircleOutline, warningOutline, 
      cloudOfflineOutline, lockClosedOutline,
      trashOutline
    });
  }

  getIcon() {
    switch (this.type) {
      case 'success': return 'checkmark-circle-outline';
      case 'error': return 'close-circle-outline';
      case 'warning': return 'warning-outline';
      case 'delete': return 'trash-outline';
      default: return 'information-circle-outline';
    }
  }

  getButtonColor() {
    switch (this.type) {
      case 'success': return 'success';
      case 'error': return 'danger';
      case 'warning': return 'warning';
      case 'delete': return 'danger';
      default: return 'primary';
    }
  }

  dismiss(confirm: boolean) {
    this.modalCtrl.dismiss(confirm);
  }
}
