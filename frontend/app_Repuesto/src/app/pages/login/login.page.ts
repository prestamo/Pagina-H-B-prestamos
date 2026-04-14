import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonToolbar, IonTitle, IonButton, 
  IonIcon, IonInput, IonItem, IonSpinner, IonModal, 
  IonList, IonButtons, IonLabel 
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { UiService } from '../../services/ui.service';
import { addIcons } from 'ionicons';
import { 
  personOutline, lockClosedOutline, serverOutline, 
  settingsOutline, desktopOutline, informationCircleOutline,
  eyeOutline, eyeOffOutline, constructOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButton, 
    IonIcon, IonInput, IonItem, IonSpinner, IonModal, 
    IonList, IonButtons, IonLabel
  ]
})
export class LoginPage {
  credentials = {
    usuario: '',
    password: ''
  };

  serverInstance = 'YERY-PEREZ';
  dbName = 'BDRepuesto';
  
  isSettingsModalOpen = false;
  loading = false;
  showPassword = false;
  userError = false;
  passError = false;

  connectionInfo = {
    instance: 'YERY-PEREZ',
    database: 'BDRepuesto'
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private uiService: UiService,
    private toastCtrl: ToastController
  ) {
    addIcons({ 
      personOutline, lockClosedOutline, serverOutline, 
      settingsOutline, desktopOutline, informationCircleOutline,
      eyeOutline, eyeOffOutline, constructOutline 
    });
    
    // Cargar ajustes guardados
    this.serverInstance = this.authService.selectedServerValue;
    this.dbName = this.authService.selectedDbValue;
    this.updateConnectionInfo();
  }

  openSettings() {
    this.isSettingsModalOpen = true;
  }

  updateConnectionInfo() {
    this.connectionInfo = {
      instance: this.serverInstance,
      database: this.dbName
    };
  }

  saveSettings() {
    this.authService.setServer(this.serverInstance);
    this.authService.setDatabase(this.dbName);
    this.updateConnectionInfo();
    this.isSettingsModalOpen = false;
    this.showToast('Configuraciones de conexión guardadas');
  }

  async onLogin() {
    this.userError = !this.credentials.usuario;
    this.passError = !this.credentials.password;

    if (this.userError || this.passError) return;

    this.loading = true;
    const loginData = {
      usuario: this.credentials.usuario,
      contraseña: this.credentials.password
    };

    // Realizar login pasando instancia y DB actual
    this.authService.login(loginData, this.dbName, this.serverInstance).subscribe({
      next: (res) => {
        this.loading = false;
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.loading = false;
        this.uiService.handleBackendError(err);
      }
    });
  }

  async showToast(msg: string, color: string = 'success') {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
      color: color,
      position: 'bottom'
    });
    toast.present();
  }
}
