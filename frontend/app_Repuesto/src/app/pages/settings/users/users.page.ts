import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { addIcons } from 'ionicons';
import { personOutline, shieldOutline, radioButtonOnOutline, radioButtonOffOutline } from 'ionicons/icons';

@Component({
  selector: 'app-users',
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar class="main-toolbar">
        <ion-buttons slot="start">
          <ion-menu-button color="light"></ion-menu-button>
        </ion-buttons>
        <ion-title>Administración de Usuarios</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <div class="page-container">
        <div class="section-header">
          <h2 class="section-title">Usuarios del Sistema</h2>
          <p class="section-subtitle">Gestiona el personal con acceso a H&B Racing</p>
        </div>

        <div class="users-grid">
          <ion-card *ngFor="let u of users" class="user-card">
            <ion-card-header>
              <div class="user-avatar-container">
                <div class="avatar-circle">
                   <ion-icon name="person-outline"></ion-icon>
                </div>
                <div class="status-indicator" [class.active]="u.estado === '1'"></div>
              </div>
              <ion-card-title>{{ u.usuario }}</ion-card-title>
              <ion-card-subtitle>{{ u.tipo_usuario }}</ion-card-subtitle>
            </ion-card-header>
            <ion-card-content>
               <p class="user-code">Código: {{ u.cod_usuario }}</p>
               <ion-badge [color]="u.estado === '1' ? 'success' : 'medium'" mode="ios">
                 {{ u.estado === '1' ? 'Activo' : 'Inactivo' }}
               </ion-badge>
            </ion-card-content>
          </ion-card>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .main-toolbar { --background: #1a1a2e; --color: white; border-bottom: 2px solid #e94560; }
    .page-container { padding: 20px; }
    
    .section-header { margin-bottom: 30px; 
      .section-title { font-size: 22px; font-weight: 800; color: #ffffff; }
      .section-subtitle { font-size: 14px; color: #94a3b8; }
    }

    .users-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 20px; }
    
    .user-card {
      background: #1a1a2e; border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; margin: 0;
      text-align: center; overflow: visible;
      
      .user-avatar-container { position: relative; width: 80px; height: 80px; margin: 0 auto 15px auto;
        .avatar-circle { width: 100%; height: 100%; background: rgba(233, 69, 96, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 40px; color: #e94560; border: 2px solid rgba(233, 69, 96, 0.2); }
        .status-indicator { position: absolute; bottom: 5px; right: 5px; width: 15px; height: 15px; border-radius: 50%; background: #64748b; border: 3px solid #1a1a2e;
          &.active { background: #4ade80; }
        }
      }

      ion-card-title { color: #ffffff; font-weight: 700; font-size: 18px; }
      ion-card-subtitle { color: #e94560; font-weight: 800; text-transform: uppercase; font-size: 11px; margin-top: 5px; }
      .user-code { font-size: 12px; color: #94a3b8; }
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class UsersPage implements OnInit {
  users: any[] = [];

  constructor(private http: HttpClient) {
    addIcons({ personOutline, shieldOutline, radioButtonOnOutline, radioButtonOffOutline });
  }

  ngOnInit() {
    this.http.get(`${environment.apiUrl}/usuarios`).subscribe((res: any) => {
      this.users = res;
    });
  }
}
