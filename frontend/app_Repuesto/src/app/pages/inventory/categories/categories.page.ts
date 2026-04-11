import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { addIcons } from 'ionicons';
import { 
  pricetagsOutline, addOutline, createOutline, trashOutline, 
  closeOutline, saveOutline, searchOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-categories',
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar class="main-toolbar">
        <ion-buttons slot="start">
          <ion-menu-button color="light"></ion-menu-button>
        </ion-buttons>
        <ion-title>Gestión de Categorías</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="openModal()" class="add-btn">
            <ion-icon name="add-outline" slot="start"></ion-icon>
            Nueva Categoría
          </ion-button>
        </ion-buttons>
      </ion-toolbar>

      <ion-toolbar class="filter-toolbar">
        <ion-searchbar 
          placeholder="Buscar categorías..." 
          [(ngModel)]="searchTerm" 
          (ionInput)="applyFilter()"
          class="custom-search">
        </ion-searchbar>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <div class="page-container">
        
        <div *ngIf="filteredCategories.length === 0" class="empty-state">
          <ion-icon name="pricetags-outline"></ion-icon>
          <p>No se encontraron categorías</p>
        </div>

        <div class="categories-grid">
          <ion-card *ngFor="let cat of filteredCategories" class="category-card">
            <ion-card-header>
              <div class="card-top">
                <ion-icon name="pricetags-outline" class="cat-icon"></ion-icon>
                <div class="card-actions">
                  <ion-button fill="clear" color="primary" (click)="openModal(cat)">
                    <ion-icon name="create-outline" slot="icon-only"></ion-icon>
                  </ion-button>
                  <ion-button fill="clear" color="danger" (click)="confirmDelete(cat)">
                    <ion-icon name="trash-outline" slot="icon-only"></ion-icon>
                  </ion-button>
                </div>
              </div>
              <ion-card-title>{{ cat.descripcion }}</ion-card-title>
              <ion-card-subtitle class="cat-code">COD: {{ cat.cod_categoria }}</ion-card-subtitle>
            </ion-card-header>
            <ion-card-content>
              <p>Esta categoría permite clasificar productos en el inventario para una mejor gestión de ventas y reportes.</p>
            </ion-card-content>
          </ion-card>
        </div>
      </div>

      <!-- MODAL PARA AGREGAR/EDITAR CATEGORÍA -->
      <ion-modal [isOpen]="isModalOpen" (didDismiss)="isModalOpen = false" class="custom-modal compact">
        <ng-template>
          <ion-header class="ion-no-border">
            <ion-toolbar color="primary">
              <ion-title>{{ currentCategory.cod_categoria ? 'Editar' : 'Nueva' }} Categoría</ion-title>
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
                <ion-label position="stacked">Descripción de la Categoría</ion-label>
                <ion-input [(ngModel)]="currentCategory.descripcion" placeholder="Ej. Accesorios de Lujo"></ion-input>
              </ion-item>

              <ion-button expand="block" color="danger" (click)="saveCategory()" class="save-btn">
                <ion-icon name="save-outline" slot="start"></ion-icon>
                {{ currentCategory.cod_categoria ? 'Actualizar' : 'Guardar' }} Categoría
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
      --background: linear-gradient(135deg, #e94560 0%, #891a2b 100%);
      --color: white;
      --border-radius: 10px;
      --box-shadow: 0 4px 12px rgba(233, 69, 96, 0.3);
      font-weight: 700;
      height: 38px;
      font-size: 13px;
      margin-right: 15px;
      border: 1px solid rgba(255,255,255,0.1);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      
      &:hover {
        transform: translateY(-2px);
        --box-shadow: 0 6px 18px rgba(233, 69, 96, 0.5);
      }
      
      ion-icon { font-size: 18px; margin-right: 4px; }
    }
    
    .custom-search {
      --background: rgba(255, 255, 255, 0.05);
      --color: white;
      --placeholder-color: #94a3b8;
      --icon-color: #e94560;
      padding: 0;
    }

    .page-container { padding: 20px; }

    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
    }

    .category-card {
      background: #1a1a2e;
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 20px;
      margin: 0;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      transition: transform 0.3s ease;

      &:hover { transform: translateY(-5px); border: 1px solid #e94560; }

      .card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
      .cat-icon { font-size: 32px; color: #e94560; }
      .card-actions { display: flex; gap: 5px; }

      ion-card-title { font-size: 18px; font-weight: 700; color: #ffffff; }
      .cat-code { font-size: 10px; font-weight: 800; color: #e94560; margin-top: 5px; opacity: 0.8; }
      ion-card-content p { color: #64748b; font-size: 13px; line-height: 1.5; margin-top: 10px; }
    }

    .empty-state {
      text-align: center; padding: 60px 20px;
      ion-icon { font-size: 64px; color: #334155; margin-bottom: 15px; }
      p { color: #64748b; font-size: 16px; }
    }

    /* FORM STYLES */
    .form-container { display: flex; flex-direction: column; gap: 15px; }
    .custom-input { 
      --background: #1a1a2e; --color: white; border-radius: 12px;
      ion-label { color: #e94560; font-weight: 700; font-size: 12px; }
    }
    .save-btn { --border-radius: 12px; margin-top: 10px; height: 50px; font-weight: 700; }
    
    .compact { --width: 400px; --height: 300px; }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class CategoriesPage implements OnInit {
  allCategories: any[] = [];
  filteredCategories: any[] = [];
  searchTerm: string = '';

  isModalOpen = false;
  currentCategory: any = { descripcion: '' };

  constructor(
    private http: HttpClient,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {
    addIcons({ pricetagsOutline, addOutline, createOutline, trashOutline, closeOutline, saveOutline, searchOutline });
  }

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.http.get(`${environment.apiUrl}/categorias`).subscribe((res: any) => {
      this.allCategories = res;
      this.applyFilter();
    });
  }

  applyFilter() {
    if (!this.searchTerm) {
      this.filteredCategories = [...this.allCategories];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredCategories = this.allCategories.filter(c => 
      c.descripcion.toLowerCase().includes(term) || 
      c.cod_categoria.toLowerCase().includes(term)
    );
  }

  openModal(category: any = null) {
    if (category) {
      this.currentCategory = { ...category };
    } else {
      this.currentCategory = { descripcion: '' };
    }
    this.isModalOpen = true;
  }

  saveCategory() {
    if (!this.currentCategory.descripcion) {
      this.showToast('La descripción es requerida', 'warning');
      return;
    }

    if (this.currentCategory.cod_categoria) {
      // EDITAR
      this.http.put(`${environment.apiUrl}/categorias/${this.currentCategory.cod_categoria}`, this.currentCategory)
        .subscribe(() => {
          this.showToast('Categoría actualizada');
          this.isModalOpen = false;
          this.loadCategories();
        });
    } else {
      // GUARDAR
      this.http.post(`${environment.apiUrl}/categorias`, this.currentCategory)
        .subscribe(() => {
          this.showToast('Categoría creada con éxito');
          this.isModalOpen = false;
          this.loadCategories();
        });
    }
  }

  async confirmDelete(category: any) {
    const alert = await this.alertCtrl.create({
      header: '¿Eliminar categoría?',
      message: `La categoría "${category.descripcion}" será eliminada del inventario activo.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { 
          text: 'Eliminar', 
          role: 'destructive',
          handler: () => {
            this.http.delete(`${environment.apiUrl}/categorias/${category.cod_categoria}`)
              .subscribe(() => {
                this.showToast('Categoría eliminada');
                this.loadCategories();
              });
          }
        }
      ]
    });
    await alert.present();
  }

  async showToast(msg: string, color: string = 'success') {
    const toast = await this.toastCtrl.create({ message: msg, duration: 2000, color, position: 'bottom' });
    toast.present();
  }
}
