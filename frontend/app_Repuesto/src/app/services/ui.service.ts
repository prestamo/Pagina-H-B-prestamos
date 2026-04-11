import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { ProfessionalModalComponent } from '../components/professional-modal/professional-modal.component';

@Injectable({
  providedIn: 'root'
})
export class UiService {

  constructor(private modalCtrl: ModalController) { }

  async showSuccess(title: string, message: string) {
    const modal = await this.modalCtrl.create({
      component: ProfessionalModalComponent,
      componentProps: {
        type: 'success',
        title: title,
        message: message,
        confirmText: 'Aceptar'
      },
      cssClass: 'professional-modal-class',
      backdropDismiss: true
    });
    return modal.present();
  }

  async showError(title: string, message: string) {
    const modal = await this.modalCtrl.create({
      component: ProfessionalModalComponent,
      componentProps: {
        type: 'error',
        title: title,
        message: message,
        confirmText: 'Entendido'
      },
      cssClass: 'professional-modal-class'
    });
    return modal.present();
  }

  async showWarning(title: string, message: string) {
    const modal = await this.modalCtrl.create({
      component: ProfessionalModalComponent,
      componentProps: {
        type: 'warning',
        title: title,
        message: message,
        confirmText: 'Aceptar'
      },
      cssClass: 'professional-modal-class'
    });
    return modal.present();
  }

  async showConfirmDelete(title: string, message: string): Promise<boolean> {
    const modal = await this.modalCtrl.create({
      component: ProfessionalModalComponent,
      componentProps: {
        type: 'delete',
        title: title,
        message: message,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        showCancel: true
      },
      cssClass: 'professional-modal-class'
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    return !!data;
  }

  /**
   * Método especializado para errores de Login / Backend
   * Analiza el "detail" del error para mostrar el modal adecuado
   */
  async handleBackendError(err: any) {
    const detail = err.error?.detail || '';
    
    if (detail.includes('CRITICAL:USUARIO_NO_REGISTRADO')) {
      return this.showError('Usuario No Encontrado', 'El nombre de usuario ingresado no existe en nuestro sistema. Verifique e intente de nuevo.');
    }
    
    if (detail.includes('CRITICAL:CONTRASEÑA_INCORRECTA')) {
      return this.showError('Contraseña Incorrecta', 'La contraseña no coincide con el usuario proporcionado. El acceso ha sido denegado.');
    }

    if (detail.includes('DB:ERROR_INSTANCIA')) {
      return this.showWarning('Instancia no Encontrada', 'No se pudo localizar la Base de Datos o la Instancia SQL especificada en los ajustes.');
    }

    if (detail.includes('DB:ERROR_CONEXION')) {
      return this.showError('Servidor Inalcanzable', 'No hay respuesta del servidor SQL. Verifique que la instancia esté activa y acepte conexiones.');
    }

    // Error genérico profesional
    return this.showError('Error del Sistema', detail || 'Se ha producido un error inesperado. Intente de nuevo más tarde.');
  }
}
