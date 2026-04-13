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
    { 
      title: 'Panel de Control', 
      url: '/home', 
      icon: 'analytics-outline',
      description: 'Vista General y KPIs'
    },
    { 
      title: 'Inventario', 
      icon: 'cube-outline',
      description: 'Gestión de Stock',
      subPages: [
        { title: 'Productos', url: '/inventory', icon: 'pricetag-outline' },
        { title: 'Categorías', url: '/categories', icon: 'grid-outline' },
      ]
    },
    { 
      title: 'Ventas ', 
      icon: 'cart-outline',
      description: 'Facturación y POS',
      subPages: [
        { title: 'Nueva Venta', url: '/sales', icon: 'add-circle-outline' },
        { title: 'Historial', url: '/sales/history', icon: 'receipt-outline' },
        { title: 'Créditos', url: '/credits', icon: 'card-outline' },
      ]
    },
    { 
      title: 'Finanzas', 
      icon: 'wallet-outline',
      description: 'Caja y Utilidades',
      subPages: [
        { title: 'Estado de Caja', url: '/finance/status', icon: 'pulse-outline' },
        { title: 'Apertura/Cierre', url: '/finance/opening', icon: 'lock-open-outline' },
        { title: 'Historial Cajas', url: '/finance/history', icon: 'time-outline' },
      ]
    },
    { 
      title: 'Configuración', 
      icon: 'settings-outline', 
      description: 'Sistema y Usuarios',
      subPages: [
        { title: 'Usuarios', url: '/settings/users', icon: 'people-outline' },
        { title: 'Empresa', url: '/settings/business', icon: 'business-outline' },
        { title: 'Auditoría', url: '/settings/audit', icon: 'shield-checkmark-outline' },
      ]
    },
  ];

  public activeSubMenu: any = null;
  public subMenuPos = { top: 0, left: 240 };

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
