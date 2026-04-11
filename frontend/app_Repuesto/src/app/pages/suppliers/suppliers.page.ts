import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ToastController, AlertController } from '@ionic/angular/standalone';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { addIcons } from 'ionicons';
import { 
  briefcaseOutline, locationOutline, callOutline, mailOutline, 
  searchOutline, addOutline, createOutline, trashOutline, 
  closeOutline, saveOutline 
} from 'ionicons/icons';
import { InputFormatterDirective } from '../../directives/input-formatter.directive';
import { UiService } from '../../services/ui.service';

@Component({
  selector: 'app-suppliers',
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar class="main-toolbar">
        <ion-buttons slot="start">
          <ion-menu-button color="light"></ion-menu-button>
        </ion-buttons>
        <ion-title>Cartera de Proveedores</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="openModal()" class="add-btn">
            <ion-icon name="add-outline" slot="start"></ion-icon>
            Nuevo Proveedor
          </ion-button>
        </ion-buttons>
      </ion-toolbar>

      <ion-toolbar class="filter-toolbar">
        <ion-searchbar 
          placeholder="Buscar por nombre, correo o teléfono..." 
          [(ngModel)]="searchTerm" 
          (ionInput)="applyFilter()"
          class="custom-search">
        </ion-searchbar>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <div class="page-container">
        
        <div *ngIf="filteredSuppliers.length === 0" class="empty-state">
          <ion-icon name="search-outline"></ion-icon>
          <p>No se encontraron proveedores</p>
        </div>

        <div class="suppliers-grid">
          <ion-card *ngFor="let s of filteredSuppliers" class="contact-card">
            <ion-card-header>
              <div class="card-header-flex">
                <div class="avatar-circle">
                  <ion-icon name="briefcase-outline"></ion-icon>
                </div>
                <div class="header-text">
                  <ion-card-title>{{ s.nombre }}</ion-card-title>
                  <ion-card-subtitle>
                    Cod: #{{ s.id_proveedor }} | Homologado
                  </ion-card-subtitle>
                </div>
                <div class="card-actions">
                  <ion-button fill="clear" color="primary" (click)="openModal(s)">
                    <ion-icon name="create-outline" slot="icon-only"></ion-icon>
                  </ion-button>
                  <ion-button fill="clear" color="danger" (click)="confirmDelete(s)">
                    <ion-icon name="trash-outline" slot="icon-only"></ion-icon>
                  </ion-button>
                </div>
              </div>
            </ion-card-header>

            <ion-card-content>
              <div class="info-list">
                <div class="info-item" *ngIf="s.telefono">
                  <ion-icon name="call-outline"></ion-icon>
                  <span>{{ s.telefono }}</span>
                </div>
                <div class="info-item" *ngIf="s.email">
                  <ion-icon name="mail-outline"></ion-icon>
                  <span>{{ s.email }}</span>
                </div>
                <div class="info-item" *ngIf="s.direccion">
                  <ion-icon name="location-outline"></ion-icon>
                  <span>{{ s.direccion }}</span>
                </div>
              </div>
            </ion-card-content>
          </ion-card>
        </div>
      </div>

      <!-- MODAL PARA AGREGAR/EDITAR PROVEEDOR -->
      <ion-modal [isOpen]="isModalOpen" (didDismiss)="isModalOpen = false" class="custom-modal">
        <ng-template>
          <ion-header class="ion-no-border">
            <ion-toolbar color="primary">
              <ion-title>{{ currentSupplier.id_proveedor ? 'Editar' : 'Nuevo' }} Proveedor</ion-title>
              <ion-buttons slot="end">
                <ion-button (click)="isModalOpen = false">
                  <ion-icon name="close-outline"></ion-icon>
                </ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>

          <ion-content class="ion-padding">
            <div class="form-container">
              <ion-item fill="outline" class="custom-input">
                <ion-label position="stacked">Nombre de la Empresa</ion-label>
                <ion-input [(ngModel)]="currentSupplier.nombre" placeholder="Ej. Repuestos HSR"></ion-input>
              </ion-item>

              <div class="form-row">
                <ion-item fill="outline" class="custom-input">
                  <ion-label position="stacked">Teléfono</ion-label>
                  <ion-input 
                    [(ngModel)]="currentSupplier.telefono" 
                    name="phone"
                    placeholder="809-000-0000"
                    appFormatter="phone">
                  </ion-input>
                </ion-item>
                <ion-item fill="outline" class="custom-input">
                  <ion-label position="stacked">Email</ion-label>
                  <ion-input [(ngModel)]="currentSupplier.email" placeholder="contacto@empresa.com"></ion-input>
                </ion-item>
              </div>

              <ion-item fill="outline" class="custom-input">
                <ion-label position="stacked">Dirección Fiscal / Oficina</ion-label>
                <ion-textarea [(ngModel)]="currentSupplier.direccion" placeholder="Calle, Ciudad..."></ion-textarea>
              </ion-item>

              <ion-button expand="block" color="danger" (click)="saveSupplier()" class="save-btn">
                <ion-icon name="save-outline" slot="start"></ion-icon>
                {{ currentSupplier.id_proveedor ? 'Actualizar' : 'Registrar' }} Proveedor
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
      --background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      --color: white;
      --border-radius: 10px;
      --box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
      font-weight: 700;
      height: 38px;
      font-size: 13px;
      margin-right: 15px;
      border: 1px solid rgba(255,255,255,0.1);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      
      &:hover {
        transform: translateY(-2px);
        --box-shadow: 0 6px 18px rgba(59, 130, 246, 0.5);
      }
      
      ion-icon { font-size: 18px; margin-right: 4px; }
    }
    
    .custom-search {
      --background: rgba(255, 255, 255, 0.05);
      --color: white;
      --placeholder-color: #94a3b8;
      --icon-color: #3b82f6;
      padding: 0;
    }

    .page-container { padding: 20px; }

    .suppliers-grid {
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

      &:hover { transform: translateY(-5px); border: 1px solid rgba(59, 130, 246, 0.2); }

      .card-header-flex { display: flex; align-items: center; gap: 12px; }
      .header-text { flex: 1; }

      .avatar-circle {
        width: 45px; height: 45px; background: rgba(59, 130, 246, 0.1); 
        border-radius: 50%; display: flex; align-items: center; justify-content: center;
        font-size: 20px; color: #3b82f6;
      }

      ion-card-title { font-size: 16px; font-weight: 700; color: #ffffff; }
      ion-card-subtitle { font-size: 11px; color: #94a3b8; margin-top: 4px; }
    }

    .info-list {
      display: flex; flex-direction: column; gap: 8px; margin-top: 5px;
      .info-item {
        display: flex; align-items: center; gap: 10px; color: #64748b; font-size: 12px;
        ion-icon { color: #3b82f6; font-size: 14px; min-width: 14px; }
        span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      }
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
      --background: #1a1a2e; --color: white; border-radius: 12px;
      ion-label { color: #3b82f6; font-weight: 700; font-size: 12px; }
    }
    .save-btn { --border-radius: 12px; margin-top: 20px; height: 50px; font-weight: 700; }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, InputFormatterDirective]
})
export class SuppliersPage implements OnInit {
  allSuppliers: any[] = [];
  filteredSuppliers: any[] = [];
  searchTerm: string = '';

  isModalOpen = false;
  currentSupplier: any = {
    nombre: '', direccion: '', telefono: '', email: ''
  };

  constructor(
    private http: HttpClient,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private uiService: UiService
  ) {
    addIcons({ 
      briefcaseOutline, locationOutline, callOutline, mailOutline, 
      searchOutline, addOutline, createOutline, trashOutline, 
      closeOutline, saveOutline 
    });
  }

  ngOnInit() {
    this.loadSuppliers();
  }

  loadSuppliers() {
    this.http.get(`${environment.apiUrl}/proveedores`).subscribe((res: any) => {
      this.allSuppliers = res;
      this.applyFilter();
    });
  }

  applyFilter() {
    if (!this.searchTerm) {
      this.filteredSuppliers = [...this.allSuppliers];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredSuppliers = this.allSuppliers.filter(s => 
      s.nombre.toLowerCase().includes(term) || 
      (s.email && s.email.toLowerCase().includes(term)) ||
      (s.telefono && s.telefono.includes(term))
    );
  }

  openModal(supplier: any = null) {
    if (supplier) {
      this.currentSupplier = { ...supplier };
    } else {
      this.currentSupplier = {
        nombre: '', direccion: '', telefono: '', email: ''
      };
    }
    this.isModalOpen = true;
  }

  saveSupplier() {
    if (!this.currentSupplier.nombre) {
      this.showToast('El nombre es requerido', 'warning');
      return;
    }

    if (this.currentSupplier.id_proveedor) {
      // EDITAR
      this.http.put(`${environment.apiUrl}/proveedores/${this.currentSupplier.id_proveedor}`, this.currentSupplier)
        .subscribe({
          next: () => {
            this.showToast('Proveedor actualizado');
            this.isModalOpen = false;
            this.loadSuppliers();
          },
          error: (err) => this.uiService.handleBackendError(err)
        });
    } else {
      // REGISTRAR
      this.http.post(`${environment.apiUrl}/proveedores`, this.currentSupplier)
        .subscribe({
          next: () => {
            this.showToast('Proveedor registrado con éxito');
            this.isModalOpen = false;
            this.loadSuppliers();
          },
          error: (err) => this.uiService.handleBackendError(err)
        });
    }
  }

  async confirmDelete(supplier: any) {
    const confirmed = await this.uiService.showConfirmDelete(
      '¿Eliminar Proveedor?',
      `¿Está seguro que desea eliminar a "${supplier.nombre}"? Esta acción no se puede deshacer.`
    );

    if (confirmed) {
      this.http.delete(`${environment.apiUrl}/proveedores/${supplier.id_proveedor}`)
        .subscribe({
          next: () => {
            this.showToast('Proveedor eliminado');
            this.loadSuppliers();
          },
          error: (err) => this.uiService.handleBackendError(err)
        });
    }
  }

  async showToast(msg: string, color: string = 'success') {
    const toast = await this.toastCtrl.create({ message: msg, duration: 2000, color, position: 'bottom' });
    toast.present();
  }
}
