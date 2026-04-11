import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { addIcons } from 'ionicons';
import { lockOpenOutline, shieldOutline, keyOutline, toggleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-permissions',
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar class="main-toolbar">
        <ion-buttons slot="start">
          <ion-menu-button color="light"></ion-menu-button>
        </ion-buttons>
        <ion-title>Roles y Permisos</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <div class="page-container">
        <div class="role-selector">
          <ion-item lines="none" class="custom-select">
            <ion-icon name="shield-outline" slot="start"></ion-icon>
            <ion-label>Seleccionar Rol</ion-label>
            <ion-select value="admin">
              <ion-select-option value="admin">ADMINISTRADOR</ion-select-option>
              <ion-select-option value="vendedor">VENDEDOR</ion-select-option>
              <ion-select-option value="cajero">CAJERO</ion-select-option>
            </ion-select>
          </ion-item>
        </div>

        <div class="permissions-list">
          <h3 class="group-title">Módulos del Sistema</h3>
          
          <div *ngFor="let p of permList" class="perm-row">
            <div class="perm-info">
              <ion-icon name="key-outline"></ion-icon>
              <span>{{ p }}</span>
            </div>
            <ion-toggle [checked]="true" color="danger"></ion-toggle>
          </div>
        </div>

        <div class="actions">
           <ion-button expand="block" color="danger">Guardar Cambios</ion-button>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .main-toolbar { --background: #1a1a2e; --color: white; border-bottom: 2px solid #e94560; }
    .page-container { padding: 20px; }
    
    .custom-select { --background: #1a1a2e; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; margin-bottom: 30px; 
      ion-icon { color: #e94560; }
    }

    .group-title { color: #94a3b8; font-size: 11px; font-weight: 800; text-transform: uppercase; margin-bottom: 15px; letter-spacing: 1px; }

    .perm-row { background: #1a1a2e; padding: 15px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 10px;
      display: flex; justify-content: space-between; align-items: center;
      .perm-info { display: flex; align-items: center; gap: 12px; color: #ffffff; font-weight: 600; ion-icon { color: #e94560; } }
      ion-toggle { --handle-background: #ffffff; --handle-background-checked: #ffffff; --track-background-checked: #e94560; }
    }

    .actions { margin-top: 30px; }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class PermissionsPage implements OnInit {
  permList = ['Acceso a Inventario', 'Realizar Ventas', 'Anular Facturas', 'Ver Reportes Financieros', 'Gestionar Créditos', 'Configuración de Negocio'];
  constructor() {
    addIcons({ lockOpenOutline, shieldOutline, keyOutline, toggleOutline });
  }
  ngOnInit() {}
}
