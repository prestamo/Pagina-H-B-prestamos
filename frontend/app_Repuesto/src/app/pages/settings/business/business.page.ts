import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { addIcons } from 'ionicons';
import { storefrontOutline, callOutline, locationOutline, documentOutline, ribbonOutline, cameraOutline } from 'ionicons/icons';
import { ToastController, IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-business',
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar class="main-toolbar">
        <ion-buttons slot="start">
          <ion-menu-button color="light"></ion-menu-button>
        </ion-buttons>
        <ion-title>Configuración del Negocio</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <div class="page-container">
        
        <div class="business-hero">
          <div class="logo-container" (click)="logoInput.click()">
            <img *ngIf="businessInfo.logo_url" [src]="'http://127.0.0.1:8000' + businessInfo.logo_url" alt="Logo">
            <div class="logo-placeholder" *ngIf="!businessInfo.logo_url">
              <ion-icon name="storefront-outline"></ion-icon>
            </div>
            <div class="upload-overlay">
              <ion-icon name="camera-outline"></ion-icon>
              <span>Cambiar Logo</span>
            </div>
          </div>
          <input type="file" #logoInput style="display: none" (change)="onFileSelected($event)" accept="image/*">
          
          <h1 *ngIf="!editMode">{{ businessInfo.nombre }}</h1>
          <ion-item *ngIf="editMode" class="edit-input-hero" lines="none">
            <ion-input [(ngModel)]="businessInfo.nombre" placeholder="Nombre del Negocio"></ion-input>
          </ion-item>
          <p>H&B RACING - Gestión Administrativa</p>
        </div>

        <div class="info-grid" *ngIf="!editMode">
          <div class="info-card">
            <ion-icon name="document-outline" class="card-icon"></ion-icon>
            <div class="card-content">
              <span class="label">RNC / Cédula</span>
              <span class="value">{{ businessInfo.rnc || 'N/A' }}</span>
            </div>
          </div>

          <div class="info-card">
            <ion-icon name="location-outline" class="card-icon"></ion-icon>
            <div class="card-content">
              <span class="label">Dirección</span>
              <span class="value">{{ businessInfo.direccion || 'No especificada' }}</span>
            </div>
          </div>

          <div class="info-card">
            <ion-icon name="call-outline" class="card-icon"></ion-icon>
            <div class="card-content">
              <span class="label">Teléfono</span>
              <span class="value">{{ businessInfo.telefono || 'N/A' }}</span>
            </div>
          </div>

          <div class="info-card">
            <ion-icon name="ribbon-outline" class="card-icon"></ion-icon>
            <div class="card-content">
              <span class="label">Código de Negocio</span>
              <span class="value">{{ businessInfo.cod_negocio || 'HB-001' }}</span>
            </div>
          </div>
        </div>

        <div class="edit-form" *ngIf="editMode">
           <ion-item class="form-item">
             <ion-label position="stacked">RNC / Cédula</ion-label>
             <ion-input [(ngModel)]="businessInfo.rnc"></ion-input>
           </ion-item>
           <ion-item class="form-item">
             <ion-label position="stacked">Dirección</ion-label>
             <ion-input [(ngModel)]="businessInfo.direccion"></ion-input>
           </ion-item>
           <ion-item class="form-item">
             <ion-label position="stacked">Teléfono</ion-label>
             <ion-input [(ngModel)]="businessInfo.telefono"></ion-input>
           </ion-item>
        </div>

        <div class="action-section">
          <ion-button *ngIf="!editMode" expand="block" color="danger" class="edit-btn" (click)="editMode = true">
            Habilitar Edición de Datos
          </ion-button>
          
          <div class="edit-actions" *ngIf="editMode">
            <ion-button expand="block" color="success" class="save-btn" (click)="saveChanges()">
              Guardar Cambios
            </ion-button>
            <ion-button expand="block" fill="clear" color="medium" (click)="editMode = false">
              Cancelar
            </ion-button>
          </div>
        </div>

      </div>
    </ion-content>
  `,
  styles: [`
    .business-hero {
      text-align: center; margin-bottom: 40px; padding: 40px 20px;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      border-radius: 24px; border: 1px solid rgba(255,255,255,0.05);
      
      .logo-container {
        width: 120px; height: 120px; margin: 0 auto 20px auto; border-radius: 20px; 
        overflow: hidden; position: relative; cursor: pointer;
        background: rgba(255,255,255,0.05); border: 2px dashed rgba(233, 69, 96, 0.4);
        
        img { width: 100%; height: 100%; object-fit: contain; }
        .logo-placeholder { display: flex; align-items: center; justify-content: center; height: 100%;
          ion-icon { font-size: 50px; color: #e94560; }
        }
        
        .upload-overlay {
          position: absolute; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.6); display: flex; flex-direction: column;
          align-items: center; justify-content: center; opacity: 0;
          transition: opacity 0.3s ease; color: white;
          ion-icon { font-size: 30px; margin-bottom: 5px; }
          span { font-size: 10px; font-weight: 700; text-transform: uppercase; }
        }
        &:hover .upload-overlay { opacity: 1; }
      }

      h1 { font-size: 28px; font-weight: 800; color: #ffffff; margin: 0; }
      p { font-size: 14px; color: #e94560; font-weight: 700; margin-top: 5px; letter-spacing: 1px; }
      .edit-input-hero { --background: rgba(255,255,255,0.05); border-radius: 12px; margin: 0 auto; max-width: 400px; color: white; border: 1px solid #e94560; }
    }

    .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
    
    .info-card {
      background: #1a1a2e; padding: 20px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05);
      display: flex; align-items: center; gap: 15px;
      
      .card-icon { font-size: 24px; color: #e94560; }
      .card-content { display: flex; flex-direction: column;
        .label { font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: 700; }
        .value { font-size: 15px; color: #ffffff; font-weight: 600; margin-top: 3px; }
      }
    }
    
    .edit-form { background: #1a1a2e; border-radius: 20px; padding: 10px; border: 1px solid rgba(255,255,255,0.05);
      .form-item { --background: transparent; color: white; font-weight: 600; --padding-start: 10px; 
        ion-label { color: #e94560 !important; font-weight: 800; }
        ion-input { --color: white; }
      }
    }

    .action-section { margin-top: 40px; }
    .edit-btn { --border-radius: 12px; font-weight: 700; height: 50px; }
    .save-btn { --border-radius: 12px; font-weight: 700; height: 50px; margin-bottom: 10px; box-shadow: 0 10px 20px rgba(16, 185, 129, 0.2); }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class BusinessPage implements OnInit {
  businessInfo: any = {};
  editMode: boolean = false;

  constructor(private http: HttpClient, private toastCtrl: ToastController) {
    addIcons({ storefrontOutline, callOutline, locationOutline, documentOutline, ribbonOutline, cameraOutline });
  }

  ngOnInit() {
    this.loadBusinessInfo();
  }

  loadBusinessInfo() {
    this.http.get(`${environment.apiUrl}/negocio`).subscribe((res: any) => {
      this.businessInfo = res;
    });
  }

  saveChanges() {
    this.http.put(`${environment.apiUrl}/negocio`, this.businessInfo).subscribe(() => {
      this.showToast('Información actualizada correctamente');
      this.editMode = false;
      this.loadBusinessInfo();
    });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('cod_negocio', this.businessInfo.cod_negocio);

      this.http.post(`${environment.apiUrl}/negocio/logo`, formData).subscribe({
        next: (res: any) => {
          this.showToast('Logo actualizado con éxito');
          this.businessInfo.logo_url = res.logo_url;
        },
        error: (err) => {
          this.showToast('Error al subir el logo', 'danger');
        }
      });
    }
  }

  async showToast(msg: string, color: string = 'success') {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2500,
      color: color,
      position: 'bottom'
    });
    toast.present();
  }
}
