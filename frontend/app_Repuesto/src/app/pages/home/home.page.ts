import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-home',
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Inicio</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true" class="ion-padding">
      <div class="welcome-container">
        <ion-icon name="sparkles-outline" color="primary"></ion-icon>
        <h2>Bienvenido a H&amp;B Racing</h2>
        <p>Sistema de gestión de repuestos profesional.</p>
      </div>
    </ion-content>
  `,
  styles: [`
    .welcome-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 80%;
      text-align: center;
      ion-icon { font-size: 80px; margin-bottom: 20px; }
      h2 { font-weight: 800; color: #ffffff; }
      p { color: #94a3b8; }
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class HomePage {}
