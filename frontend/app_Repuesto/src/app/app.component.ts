import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from './services/auth.service';
import { SalesService } from './services/sales.service';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { 
  personCircleOutline, homeOutline, cubeOutline, settingsOutline, 
  logOutOutline, peopleOutline, cartOutline, walletOutline, 
  statsChartOutline, briefcaseOutline, cashOutline, pricetagsOutline,
  cardOutline, shieldCheckmarkOutline, storefrontOutline, lockOpenOutline,
  swapHorizontalOutline, analyticsOutline, documentTextOutline, alertCircleOutline,
  checkmarkCircleOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, FormsModule],
})
export class AppComponent {
  public appPages = [
    { title: 'Inicio', url: '/home', icon: 'home-outline' },
    { title: 'Productos', url: '/inventory', icon: 'cube-outline' },
    { title: 'Categorías', url: '/categories', icon: 'pricetags-outline' },
    { title: 'Ventas', url: '/sales', icon: 'cart-outline' },
    { title: 'Créditos', url: '/credits', icon: 'card-outline' },
    { title: 'Clientes', url: '/clients', icon: 'people-outline' },
    { title: 'Proveedores', url: '/suppliers', icon: 'briefcase-outline' },
    { 
      title: 'Caja', 
      icon: 'wallet-outline',
      subPages: [
        { title: 'Apertura de Caja', url: '/finance/opening', icon: 'lock-open-outline' },
        { title: 'Cierre de Caja', url: '/finance/closing', icon: 'checkmark-circle-outline' },
        { title: 'Historial de Cajas', url: '/finance/history', icon: 'document-text-outline' },
        { title: 'Estado / Transac.', url: '/finance/status', icon: 'analytics-outline' }
      ]
    },
    { 
      title: 'Configuración', 
      icon: 'settings-outline', 
      subPages: [
        { title: 'Usuarios', url: '/settings/users', icon: 'people-outline' },
        { title: 'Permisos', url: '/settings/permissions', icon: 'lock-open-outline' },
        { title: 'Auditoría', url: '/settings/audit', icon: 'shield-checkmark-outline' },
        { title: 'Negocio', url: '/settings/business', icon: 'storefront-outline' }
      ]
    },
    { title: 'Reportes', url: '/reports', icon: 'stats-chart-outline' },
  ];

  public activeSubMenu: any = null;
  public subMenuPos = { top: 0, left: 185 };

  // Variables para la calculadora
  public cobro: number = 0;
  public totalVenta: number = 0;
  
  get devuelta(): number {
    return this.cobro > 0 ? this.cobro - this.totalVenta : 0;
  }

  constructor(
    public authService: AuthService, 
    private router: Router,
    private salesService: SalesService
  ) {
    this.salesService.totalVenta$.subscribe(total => this.totalVenta = total);
    
    addIcons({ 
      personCircleOutline, homeOutline, cubeOutline, settingsOutline, 
      logOutOutline, peopleOutline, cartOutline, walletOutline, 
      statsChartOutline, briefcaseOutline, cashOutline, pricetagsOutline,
      cardOutline, shieldCheckmarkOutline, storefrontOutline, lockOpenOutline,
      swapHorizontalOutline, analyticsOutline, documentTextOutline, alertCircleOutline,
      checkmarkCircleOutline
    });
  }

  handlePageClick(ev: MouseEvent, page: any) {
    if (page.subPages) {
      ev.preventDefault();
      ev.stopPropagation();
      
      if (this.activeSubMenu === page) {
        this.activeSubMenu = null;
      } else {
        const target = ev.currentTarget as HTMLElement;
        const rect = target.getBoundingClientRect();
        this.subMenuPos.top = rect.top;
        this.activeSubMenu = page;
      }
    } else {
      this.closeSubMenu();
      this.router.navigate([page.url]);
    }
  }

  @HostListener('document:click')
  closeSubMenu() {
    this.activeSubMenu = null;
  }

  navigateTo(url: string) {
    this.closeSubMenu();
    this.router.navigate([url]);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
