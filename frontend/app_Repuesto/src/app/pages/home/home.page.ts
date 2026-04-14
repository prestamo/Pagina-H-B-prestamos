import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IonicModule, MenuController } from '@ionic/angular';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class HomePage {
  // Mock data for the dashboard visual
  public weekData = [
    { label: 'Lun', val: 45 },
    { label: 'Mar', val: 70 },
    { label: 'Mie', val: 55 },
    { label: 'Jue', val: 90 },
    { label: 'Vie', val: 80 },
    { label: 'Sab', val: 100 },
    { label: 'Dom', val: 30 }
  ];

  public recentTx = [
    { customer: 'Juan Perez', time: 'Hace 5 min', amount: 150.00, status: 'success' },
    { customer: 'Marina Solis', time: 'Hace 15 min', amount: 85.50, status: 'success' },
    { customer: 'Taller El Rayo', time: 'Hace 1 hora', amount: 1200.00, status: 'pending' },
    { customer: 'Carlos Ruiz', time: 'Hace 2 horas', amount: 45.00, status: 'success' }
  ];

  public isMenuOpen: boolean = false;
  private menuSub!: Subscription;

  constructor(private menuCtrl: MenuController) {}

  ngOnInit() {
    this.syncMenuState();
  }

  async syncMenuState() {
    const menu = await this.menuCtrl.get('main');
    if (menu) {
      menu.addEventListener('ionWillOpen', () => { this.isMenuOpen = true; });
      menu.addEventListener('ionWillClose', () => { this.isMenuOpen = false; });
      
      // Initialize state
      this.isMenuOpen = await this.menuCtrl.isOpen('main');
    }
  }


}
