import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { addIcons } from 'ionicons';
import { 
  personOutline, locationOutline, callOutline, mailOutline, 
  documentTextOutline, searchOutline, addOutline, createOutline, 
  trashOutline, closeOutline, saveOutline, maleOutline, femaleOutline 
} from 'ionicons/icons';
import { InputFormatterDirective } from '../../directives/input-formatter.directive';

@Component({
  selector: 'app-clients',
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar class="main-toolbar">
        <ion-buttons slot="start">
          <ion-menu-button color="light"></ion-menu-button>
        </ion-buttons>
        <ion-title>Gestión de Clientes</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="openModal()" class="add-btn">
            <ion-icon name="add-outline" slot="start"></ion-icon>
            Nuevo Cliente
          </ion-button>
        </ion-buttons>
      </ion-toolbar>

      <ion-toolbar class="filter-toolbar">
        <ion-searchbar 
          placeholder="Buscar por nombre, apellidos o DNI..." 
          [(ngModel)]="searchTerm" 
          (ionInput)="applyFilter()"
          class="custom-search">
        </ion-searchbar>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <div class="page-container">
        
        <div *ngIf="filteredClients.length === 0" class="empty-state">
          <ion-icon name="search-outline"></ion-icon>
          <p>No se encontraron clientes</p>
        </div>

        <div class="clients-grid">
          <ion-card *ngFor="let c of filteredClients" class="contact-card" [class.inactive]="c.estado === '0'">
            <ion-card-header>
              <div class="card-header-flex">
                <div class="avatar-circle">
                  <ion-icon [name]="c.sexo === 'Femenino' ? 'female-outline' : 'person-outline'"></ion-icon>
                </div>
                <div class="header-text">
                  <ion-card-title>{{ c.nombres }} {{ c.apellidos }}</ion-card-title>
                  <ion-card-subtitle>
                    <ion-icon name="document-text-outline"></ion-icon> 
                    {{ c.dni || 'Sin DNI' }}
                  </ion-card-subtitle>
                </div>
                <div class="card-actions">
                  <ion-button fill="clear" color="primary" (click)="openModal(c)">
                    <ion-icon name="create-outline" slot="icon-only"></ion-icon>
                  </ion-button>
                  <ion-button fill="clear" color="danger" (click)="confirmDelete(c)">
                    <ion-icon name="trash-outline" slot="icon-only"></ion-icon>
                  </ion-button>
                </div>
              </div>
            </ion-card-header>

            <ion-card-content>
              <div class="info-list">
                <div class="info-item" *ngIf="c.telefono">
                  <ion-icon name="call-outline"></ion-icon>
                  <span>{{ c.telefono }}</span>
                </div>
                <div class="info-item" *ngIf="c.direccion">
                  <ion-icon name="location-outline"></ion-icon>
                  <span>{{ c.direccion }}</span>
                </div>
                <div class="footer-badge">
                  <ion-badge [color]="c.estado === '1' ? 'success' : 'medium'" mode="ios">
                    {{ c.estado === '1' ? 'Activo' : 'Inactivo' }}
                  </ion-badge>
                  <span class="client-code">{{ c.cod_cliente }}</span>
                </div>
              </div>
            </ion-card-content>
          </ion-card>
        </div>
      </div>

      <!-- MODAL PARA AGREGAR/EDITAR CLIENTE -->
      <ion-modal [isOpen]="isModalOpen" (didDismiss)="isModalOpen = false" class="custom-modal">
        <ng-template>
          <ion-header class="ion-no-border">
            <ion-toolbar color="primary">
              <ion-title>{{ currentClient.cod_cliente ? 'Editar' : 'Nuevo' }} Cliente</ion-title>
              <ion-buttons slot="end">
                <ion-button (click)="isModalOpen = false">
                  <ion-icon name="close-outline"></ion-icon>
                </ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>

          <ion-content class="ion-padding">
            <div class="form-container">
              <div class="form-row">
                <ion-item fill="outline" class="custom-input">
                  <ion-label position="stacked">Nombres</ion-label>
                  <ion-input [(ngModel)]="currentClient.nombres" placeholder="Ej. Juan"></ion-input>
                </ion-item>
                <ion-item fill="outline" class="custom-input">
                  <ion-label position="stacked">Apellidos</ion-label>
                  <ion-input [(ngModel)]="currentClient.apellidos" placeholder="Ej. Pérez"></ion-input>
                </ion-item>
              </div>

              <ion-item fill="outline" class="custom-input">
                <ion-label position="stacked">DNI / Cédula</ion-label>
                <ion-input 
                  [(ngModel)]="currentClient.dni" 
                  name="dni"
                  placeholder="000-0000000-0"
                  appFormatter="cedula">
                </ion-input>
              </ion-item>

              <div class="form-row">
                <ion-item fill="outline" class="custom-input">
                  <ion-label position="stacked">Teléfono</ion-label>
                  <ion-input 
                    [(ngModel)]="currentClient.telefono" 
                    name="phone"
                    placeholder="809-000-0000"
                    appFormatter="phone">
                  </ion-input>
                </ion-item>
                <ion-item fill="outline" class="custom-input">
                  <ion-label position="stacked">Sexo</ion-label>
                  <ion-select [(ngModel)]="currentClient.sexo">
                    <ion-select-option value="Masculino">Masculino</ion-select-option>
                    <ion-select-option value="Femenino">Femenino</ion-select-option>
                  </ion-select>
                </ion-item>
              </div>

              <ion-item fill="outline" class="custom-input">
                <ion-label position="stacked">Dirección</ion-label>
                <ion-textarea [(ngModel)]="currentClient.direccion" placeholder="Calle, Sector, Ciudad..."></ion-textarea>
              </ion-item>

              <ion-button expand="block" color="danger" (click)="saveClient()" class="save-btn">
                <ion-icon name="save-outline" slot="start"></ion-icon>
                {{ currentClient.cod_cliente ? 'Actualizar' : 'Guardar' }} Cliente
              </ion-button>
            </div>
          </ion-content>
        </ng-template>
      </ion-modal>

    </ion-content>
  `,
  styles: [`
    .main-toolbar { --background: #1a1a2e; --color: white; }
    .filter-toolbar { --background: #16213e; padding: 5px 10px 10px 10px; }
    .add-btn { 
      --background: linear-gradient(135deg, #e94560 0%, #891a2b 100%);
      --color: white;
      --border-radius: 10px;
      --box-shadow: 0 4px 12px rgba(233, 69, 96, 0.3);
      font-weight: 700;
      height: 38px;
      font-size: 13px;
      margin-right: 15px;
      border: 1px solid rgba(255,255,255,0.1);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      
      &:hover {
        transform: translateY(-2px);
        --box-shadow: 0 6px 18px rgba(233, 69, 96, 0.5);
      }
      
      ion-icon { font-size: 18px; margin-right: 4px; }
    }
    
    .custom-search {
      --background: rgba(255, 255, 255, 0.05);
      --color: white;
      --placeholder-color: #94a3b8;
      --icon-color: #e94560;
      padding: 0;
    }

    .page-container { padding: 20px; }

    .clients-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
    }

    .contact-card {
      background: #1a1a2e;
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 20px;
      margin: 0;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      transition: transform 0.2s ease;

      &:hover { transform: translateY(-5px); border: 1px solid rgba(233, 69, 96, 0.2); }
      &.inactive { opacity: 0.6; grayscale: 1; }

      .card-header-flex { display: flex; align-items: center; gap: 12px; position: relative; width: 100%; }
      .header-text { flex: 1; }

      .avatar-circle {
        width: 45px; height: 45px; background: rgba(233, 69, 96, 0.1); 
        border-radius: 50%; display: flex; align-items: center; justify-content: center;
        font-size: 20px; color: #e94560;
      }

      .card-actions { display: flex; gap: 0; }

      ion-card-title { font-size: 16px; font-weight: 700; color: #ffffff; }
      ion-card-subtitle { 
        font-size: 11px; color: #94a3b8; display: flex; align-items: center; gap: 5px; margin-top: 4px;
        ion-icon { color: #3b82f6; }
      }
    }

    .info-list {
      display: flex; flex-direction: column; gap: 8px; margin-top: 5px;
      .info-item {
        display: flex; align-items: center; gap: 10px; color: #64748b; font-size: 12px;
        ion-icon { color: #e94560; font-size: 14px; min-width: 14px; }
      }
    }

    .footer-badge {
      display: flex; justify-content: space-between; align-items: center; margin-top: 15px; padding-top: 10px;
      border-top: 1px solid rgba(255,255,255,0.05);
      .client-code { font-size: 10px; font-weight: 800; color: #e94560; background: rgba(233, 69, 96, 0.1); padding: 2px 6px; border-radius: 4px; }
    }

    .empty-state {
      text-align: center; padding: 60px 20px;
      ion-icon { font-size: 64px; color: #334155; margin-bottom: 15px; }
      p { color: #64748b; font-size: 16px; }
    }

    /* FORM STYLES */
    .form-container { display: flex; flex-direction: column; gap: 15px; }
    .form-row { display: flex; gap: 15px; }
    .custom-input { 
      --background: #1a1a2e; --color: white; border-radius: 12px; margin-bottom: 5px;
      ion-label { color: #e94560; font-weight: 700; font-size: 12px; }
    }
    .save-btn { --border-radius: 12px; margin-top: 20px; height: 50px; font-weight: 700; }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, InputFormatterDirective]
})
export class ClientsPage implements OnInit {
  allClients: any[] = [];
  filteredClients: any[] = [];
  searchTerm: string = '';

  isModalOpen = false;
  currentClient: any = {
    nombres: '', apellidos: '', dni: '', sexo: 'Masculino', direccion: '', telefono: ''
  };

  constructor(
    private http: HttpClient,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {
    addIcons({ 
      personOutline, locationOutline, callOutline, mailOutline, 
      documentTextOutline, searchOutline, addOutline, createOutline, 
      trashOutline, closeOutline, saveOutline, maleOutline, femaleOutline
    });
  }

  ngOnInit() {
    this.loadClients();
  }

  loadClients() {
    this.http.get(`${environment.apiUrl}/clientes`).subscribe((res: any) => {
      this.allClients = res;
      this.applyFilter();
    });
  }

  applyFilter() {
    if (!this.searchTerm) {
      this.filteredClients = [...this.allClients];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredClients = this.allClients.filter(c => 
      c.nombres.toLowerCase().includes(term) || 
      c.apellidos.toLowerCase().includes(term) ||
      (c.dni && c.dni.toLowerCase().includes(term)) ||
      (c.telefono && c.telefono.includes(term))
    );
  }

  openModal(client: any = null) {
    if (client) {
      this.currentClient = { ...client };
    } else {
      this.currentClient = {
        nombres: '', apellidos: '', dni: '', sexo: 'Masculino', direccion: '', telefono: ''
      };
    }
    this.isModalOpen = true;
  }

  saveClient() {
    if (!this.currentClient.nombres || !this.currentClient.apellidos) {
      this.showToast('Nombre y apellido son requeridos', 'warning');
      return;
    }

    if (this.currentClient.cod_cliente) {
      // EDITAR
      this.http.put(`${environment.apiUrl}/clientes/${this.currentClient.cod_cliente}`, this.currentClient)
        .subscribe(() => {
          this.showToast('Cliente actualizado');
          this.isModalOpen = false;
          this.loadClients();
        });
    } else {
      // AGREGAR
      this.http.post(`${environment.apiUrl}/clientes`, this.currentClient)
        .subscribe(() => {
          this.showToast('Cliente registrado con éxito');
          this.isModalOpen = false;
          this.loadClients();
        });
    }
  }

  async confirmDelete(client: any) {
    const alert = await this.alertCtrl.create({
      header: '¿Eliminar cliente?',
      message: `El cliente ${client.nombres} será marcado como inactivo.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { 
          text: 'Eliminar', 
          role: 'destructive',
          handler: () => {
            this.http.delete(`${environment.apiUrl}/clientes/${client.cod_cliente}`)
              .subscribe(() => {
                this.showToast('Cliente eliminado');
                this.loadClients();
              });
          }
        }
      ]
    });
    await alert.present();
  }

  async showToast(msg: string, color: string = 'success') {
    const toast = await this.toastCtrl.create({ message: msg, duration: 2000, color, position: 'bottom' });
    toast.present();
  }
}
