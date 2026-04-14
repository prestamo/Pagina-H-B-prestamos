import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonApp, IonSplitPane, IonMenu, IonHeader, IonToolbar, 
  IonContent, IonList, IonMenuToggle, IonItem, IonIcon, 
  IonLabel, IonFooter, IonRouterOutlet 
} from '@ionic/angular/standalone';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from './services/auth.service';
import { addIcons } from 'ionicons';
import { 
  personCircleOutline, homeOutline, cubeOutline, settingsOutline, 
  logOutOutline, peopleOutline, cartOutline, walletOutline, 
  statsChartOutline, briefcaseOutline, cashOutline, pricetagsOutline,
  cardOutline, shieldCheckmarkOutline, storefrontOutline, lockOpenOutline,
  swapHorizontalOutline, analyticsOutline, documentTextOutline, alertCircleOutline,
  checkmarkCircleOutline, timeOutline, gridOutline, businessOutline, lockClosedOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [
    IonApp, IonSplitPane, IonMenu, IonHeader, IonToolbar, 
    IonContent, IonList, IonMenuToggle, IonItem, IonIcon, 
    IonLabel, IonFooter, IonRouterOutlet,
    CommonModule, RouterModule
  ],
})
export class AppComponent {
  public appPages = [
    { title: 'Ventas', url: '/sales', icon: 'cart-outline' },
    { title: 'Clientes', url: '/clients', icon: 'people-outline' },
    { title: 'Productos', url: '/inventory', icon: 'cube-outline' },
    { title: 'Categorias', url: '/categories', icon: 'grid-outline' },
    { title: 'Proveedores', url: '/suppliers', icon: 'briefcase-outline' },
    { title: 'Usuarios', url: '/settings/users', icon: 'person-circle-outline' },
    { title: 'Apertura de Caja', url: '/finance/opening', icon: 'lock-open-outline' },
    { title: 'Cierre de Caja', url: '/finance/closing', icon: 'lock-closed-outline' },
    { title: 'Historial de Cajas', url: '/finance/history', icon: 'time-outline' },
    { title: 'Creditos', url: '/credits', icon: 'card-outline' },
    { title: 'Transacciones', url: '/finance/transactions', icon: 'swap-horizontal-outline' },
    { title: 'Auditoria', url: '/settings/audit', icon: 'shield-checkmark-outline' },
    { title: 'Datos del Negocio', url: '/settings/business', icon: 'business-outline' },
    { title: 'Inicio', url: '/home', icon: 'home-outline' },
  ];

  public dbName: string = localStorage.getItem('techsystem_db') || 'BDRepuesto';

  constructor(
    public authService: AuthService, 
    public router: Router
  ) {
    addIcons({ 
      personCircleOutline, homeOutline, cubeOutline, settingsOutline, 
      logOutOutline, peopleOutline, cartOutline, walletOutline, 
      statsChartOutline, briefcaseOutline, cashOutline, pricetagsOutline,
      cardOutline, shieldCheckmarkOutline, storefrontOutline, lockOpenOutline,
      swapHorizontalOutline, analyticsOutline, documentTextOutline, alertCircleOutline,
      checkmarkCircleOutline, timeOutline, gridOutline, businessOutline, lockClosedOutline
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
