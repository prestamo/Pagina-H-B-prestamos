import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ToastController, AlertController } from '@ionic/angular/standalone';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { addIcons } from 'ionicons';
import { 
  searchOutline, filterOutline, alertCircleOutline, cubeOutline, 
  businessOutline, warningOutline, addCircleOutline, createOutline, 
  trashOutline, printOutline, closeOutline, saveOutline, folderOutline 
} from 'ionicons/icons';
import { InputFormatterDirective } from '../../../directives/input-formatter.directive';
import { ValidationService } from '../../../services/validation.service';
import { UiService } from '../../../services/ui.service';

@Component({
  selector: 'app-products',
  template: `
    <ion-header class="ion-no-border no-print">
      <ion-toolbar class="main-toolbar">
        <ion-buttons slot="start">
          <ion-menu-button color="light"></ion-menu-button>
        </ion-buttons>
        <ion-title>Gestión de Inventario</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="openModal()" class="add-btn-header">
            <ion-icon name="add-circle-outline" slot="start"></ion-icon>
            Nuevo Producto
          </ion-button>
        </ion-buttons>
      </ion-toolbar>

      <!-- BARRA DE BÚSQUEDA Y FILTROS -->
      <ion-toolbar class="filter-toolbar">
        <div class="filter-container">
          <ion-searchbar 
            placeholder="Buscar por nombre o código..." 
            [(ngModel)]="searchTerm" 
            (ionInput)="applyFilters()"
            class="custom-search">
          </ion-searchbar>
          
          <div class="filter-actions">
            <ion-item lines="none" class="filter-item">
              <ion-icon name="business-outline" slot="start"></ion-icon>
              <ion-select 
                placeholder="Proveedor" 
                [(ngModel)]="selectedSupplier" 
                (ionChange)="applyFilters()">
                <ion-select-option [value]="0">Todos</ion-select-option>
                <ion-select-option *ngFor="let s of suppliers" [value]="s.id_proveedor">
                  {{ s.nombre }}
                </ion-select-option>
              </ion-select>
            </ion-item>

            <ion-button (click)="printReport()" fill="clear" color="light" class="print-btn">
              <ion-icon name="print-outline"></ion-icon>
            </ion-button>
          </div>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <div class="page-container">
        
        <!-- DASHBOARD DE ESTADÍSTICAS (Oculto en impresión) -->
        <div class="stats-grid no-print">
          <div class="stat-card">
            <div class="stat-icon sku">
              <ion-icon name="cube-outline"></ion-icon>
            </div>
            <div class="stat-data">
              <span class="label">Total SKU</span>
              <span class="value">{{ stats.totalSKU }}</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon stock">
              <ion-icon name="cube-outline"></ion-icon>
            </div>
            <div class="stat-data">
              <span class="label">Stock Total</span>
              <span class="value">{{ stats.totalStock }}</span>
            </div>
          </div>

          <div class="stat-card urgent" [class.has-alerts]="stats.lowStock > 0" (click)="toggleLowStock()">
            <div class="stat-icon alert">
              <ion-icon name="alert-circle-outline"></ion-icon>
            </div>
            <div class="stat-data">
              <span class="label">Stock Bajo</span>
              <span class="value">{{ stats.lowStock }}</span>
            </div>
            <ion-badge *ngIf="lowStockOnly" color="danger" mode="ios">FILTRADO</ion-badge>
          </div>
        </div>

        <!-- LISTA DE PRODUCTOS -->
        <div class="list-section">
          <h2 class="section-title">
            <span class="no-print">Listado de Productos</span>
            <span class="only-print">Reporte de Inventario - H&B Racing</span>
            <span class="count">({{ filteredProducts.length }})</span>
          </h2>

          <div *ngIf="filteredProducts.length === 0" class="empty-state no-print">
            <ion-icon name="search-outline"></ion-icon>
            <p>No se encontraron productos</p>
          </div>

          <!-- TABLA PARA IMPRESIÓN -->
          <table class="only-print report-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Precio</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of filteredProducts">
                <td>{{ p.cod_producto }}</td>
                <td>{{ p.nombre }}</td>
                <td>{{ p.Descripcion_producto }}</td>
                <td>$ {{ p.precio_venta | number:'1.2-2' }}</td>
                <td>{{ p.stock }}</td>
              </tr>
            </tbody>
          </table>

          <div class="products-grid no-print">
            <div *ngFor="let p of filteredProducts" class="product-card">
              <div class="card-header">
                <span class="product-code">{{ p.cod_producto }}</span>
                <div class="action-btns">
                  <ion-button fill="clear" (click)="openModal(p)">
                    <ion-icon name="create-outline"></ion-icon>
                  </ion-button>
                  <ion-button fill="clear" color="danger" (click)="confirmDelete(p)">
                    <ion-icon name="trash-outline"></ion-icon>
                  </ion-button>
                </div>
              </div>

              <div class="card-content">
                <h3 class="product-name">{{ p.nombre }}</h3>
                <p class="product-desc">{{ p.Descripcion_producto }}</p>
                
                <div class="meta-tags">
                  <div class="tag category" *ngIf="p.categoria_nombre">
                    <ion-icon name="folder-outline"></ion-icon>
                    {{ p.categoria_nombre }}
                  </div>
                  <div class="tag supplier" *ngIf="p.proveedor_nombre">
                    <ion-icon name="business-outline"></ion-icon>
                    {{ p.proveedor_nombre }}
                  </div>
                </div>
              </div>

              <div class="card-footer">
                <div class="pricing">
                  <span class="sale-price">$ {{ p.precio_venta | number:'1.2-2' }}</span>
                  <span class="cost-price">C: $ {{ p.precio_compra | number:'1.2-2' }}</span>
                </div>
                <div class="stock-badge" [ngClass]="getStockClass(p.stock)">
                  <span class="label">STOCK</span>
                  <span class="value">{{ p.stock }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- MODAL DE AGREGAR/EDITAR -->
      <ion-modal [isOpen]="isModalOpen" (didDismiss)="isModalOpen = false" class="product-modal">
        <ng-template>
          <ion-header class="ion-no-border">
            <ion-toolbar color="primary">
              <ion-title>{{ currentProduct.cod_producto ? 'Editar' : 'Nuevo' }} Producto</ion-title>
              <ion-buttons slot="end">
                <ion-button (click)="isModalOpen = false">
                  <ion-icon name="close-outline"></ion-icon>
                </ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>

          <ion-content class="ion-padding">
            <div class="modal-form">
              <ion-item fill="outline" class="custom-input">
                <ion-label position="stacked">Nombre del Producto</ion-label>
                <ion-input [(ngModel)]="currentProduct.nombre" placeholder="Ej. Filtro de Aceite"></ion-input>
              </ion-item>

              <ion-item fill="outline" class="custom-input">
                <ion-label position="stacked">Descripción</ion-label>
                <ion-textarea [(ngModel)]="currentProduct.Descripcion_producto" placeholder="Detalles técnicos..."></ion-textarea>
              </ion-item>

              <div class="form-row">
                <ion-item fill="outline" class="custom-input">
                  <ion-label position="stacked">P. Compra</ion-label>
                  <ion-input 
                    [(ngModel)]="currentProduct.precio_compra" 
                    name="precio_compra"
                    appFormatter="currency">
                  </ion-input>
                </ion-item>
                <ion-item fill="outline" class="custom-input">
                  <ion-label position="stacked">P. Venta</ion-label>
                  <ion-input 
                    [(ngModel)]="currentProduct.precio_venta" 
                    name="precio_venta"
                    appFormatter="currency">
                  </ion-input>
                </ion-item>
              </div>

              <div class="form-row">
                <ion-item fill="outline" class="custom-input">
                  <ion-label position="stacked">Stock Inicial</ion-label>
                  <ion-input type="number" [(ngModel)]="currentProduct.stock"></ion-input>
                </ion-item>
                <ion-item fill="outline" class="custom-input">
                  <ion-label position="stacked">Categoría</ion-label>
                  <ion-select [(ngModel)]="currentProduct.cod_categoria">
                    <ion-select-option *ngFor="let c of categories" [value]="c.cod_categoria">
                      {{ c.descripcion }}
                    </ion-select-option>
                  </ion-select>
                </ion-item>
              </div>

              <ion-item fill="outline" class="custom-input">
                <ion-label position="stacked">Proveedor</ion-label>
                <ion-select [(ngModel)]="currentProduct.id_proveedor">
                  <ion-select-option *ngFor="let s of suppliers" [value]="s.id_proveedor">
                    {{ s.nombre }}
                  </ion-select-option>
                </ion-select>
              </ion-item>

              <ion-button expand="block" color="danger" (click)="saveProduct()" class="save-btn">
                <ion-icon name="save-outline" slot="start"></ion-icon>
                Guardar Cambios
              </ion-button>
            </div>
          </ion-content>
        </ng-template>
      </ion-modal>
    </ion-content>
  `,
  styles: [`
    .main-toolbar { --background: #1a1a2e; --color: white; }
    .filter-toolbar { --background: #16213e; padding: 10px 15px; }
    .add-btn-header { 
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
    
    .filter-container { display: flex; flex-direction: column; gap: 10px; }
    .filter-actions { display: flex; gap: 10px; align-items: center; }
    .custom-search { --background: rgba(255, 255, 255, 0.05); --color: white; --placeholder-color: #94a3b8; --icon-color: #e94560; padding: 0; }
    .filter-item { --background: rgba(255, 255, 255, 0.05); --color: white; border-radius: 8px; flex: 1; height: 44px; 
      ion-icon { color: #e94560; font-size: 18px; } ion-select { font-size: 14px; --placeholder-color: #94a3b8; } }

    .print-btn { --color: #ffffff; background: rgba(255,255,255,0.1); border-radius: 8px; height: 44px; margin: 0; }

    .page-container { padding: 20px; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 30px; }
    .stat-card { background: #1a1a2e; padding: 15px; border-radius: 16px; display: flex; align-items: center; gap: 15px; border: 1px solid rgba(255, 255, 255, 0.05);
      .stat-icon { width: 45px; height: 45px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; 
        &.sku { background: rgba(59, 130, 246, 0.1); color: #3b82f6; } &.stock { background: rgba(16, 185, 129, 0.1); color: #10b981; } &.alert { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
      }
      &.urgent.has-alerts { border: 1px solid rgba(239, 68, 68, 0.3); .alert { background: rgba(239, 68, 68, 0.1); color: #ef4444; } }
      .stat-data { display: flex; flex-direction: column; .label { font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: 700; } .value { font-size: 20px; font-weight: 800; color: #ffffff; } }
    }

    .section-title { font-size: 18px; font-weight: 800; color: #ffffff; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;
      .count { color: #e94560; font-size: 14px; } }

    /* GRID LAYOUT */
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 10px;
    }

    .product-card {
      background: #1a1a2e;
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.05);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        border-color: rgba(233, 69, 96, 0.3);
      }

      .card-header {
        padding: 15px 15px 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .product-code {
          font-size: 10px;
          font-weight: 800;
          color: #e94560;
          background: rgba(233, 69, 96, 0.1);
          padding: 4px 10px;
          border-radius: 8px;
          letter-spacing: 0.5px;
        }

        .action-btns {
          display: flex;
          gap: 5px;
          ion-button {
            --padding-start: 8px;
            --padding-end: 8px;
            height: 32px;
            margin: 0;
            --color: #94a3b8;
            &:hover { --color: white; }
          }
        }
      }

      .card-content {
        padding: 0 15px 15px;
        flex: 1;

        .product-name {
          margin: 0 0 6px 0;
          font-size: 17px;
          font-weight: 700;
          color: #ffffff;
          line-height: 1.2;
        }

        .product-desc {
          margin: 0 0 15px 0;
          font-size: 12px;
          color: #94a3b8;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.5;
        }

        .meta-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          
          .tag {
            display: flex;
            align-items: center;
            gap: 5px;
            font-size: 10px;
            font-weight: 700;
            padding: 4px 10px;
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.03);
            color: #64748b;
            text-transform: uppercase;
            
            ion-icon { font-size: 12px; color: #e94560; }
          }
        }
      }

      .card-footer {
        padding: 15px;
        background: rgba(0, 0, 0, 0.2);
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 1px solid rgba(255, 255, 255, 0.03);

        .pricing {
          display: flex;
          flex-direction: column;
          
          .sale-price {
            font-size: 18px;
            font-weight: 800;
            color: #ffffff;
          }
          .cost-price {
            font-size: 11px;
            font-weight: 600;
            color: #94a3b8;
          }
        }

        .stock-badge {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 65px;
          padding: 6px;
          border-radius: 12px;

          .label { font-size: 9px; font-weight: 800; margin-bottom: 2px; }
          .value { font-size: 15px; font-weight: 800; }

          &.stock-red { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); }
          &.stock-yellow { background: rgba(245, 158, 11, 0.1); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); }
          &.stock-green { background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); }
        }
      }
    }

    /* MODAL STYLES */
    .modal-form { display: flex; flex-direction: column; gap: 15px; padding-top: 10px; }
    .custom-input { --background: #1a1a2e; --color: white; --border-color: rgba(255,255,255,0.1); border-radius: 12px; 
      ion-label { color: #e94560 !important; font-weight: 700; letter-spacing: 0.5px; } }
    .form-row { display: flex; gap: 15px; }
    .save-btn { --border-radius: 12px; margin-top: 20px; font-weight: 800; height: 50px; }

    /* PRINT STYLES */
    .only-print { display: none; }
    @media print {
      .no-print { display: none !important; }
      .only-print { display: block !important; }
      body { background: white !important; color: black !important; }
      .page-container { padding: 0 !important; }
      .report-table { width: 100%; border-collapse: collapse; margin-top: 20px;
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background: #f4f4f4; font-weight: 800; }
      }
      .section-title { color: black !important; border-bottom: 2px solid #000; padding-bottom: 10px; }
    }

    @media (min-width: 768px) { .filter-container { flex-direction: row; } .filter-actions { flex: 1; justify-content: flex-end; } .custom-search { flex: 2; } }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, InputFormatterDirective]
})
export class ProductsPage implements OnInit {
  allProducts: any[] = [];
  filteredProducts: any[] = [];
  suppliers: any[] = [];
  categories: any[] = [];
  
  searchTerm: string = '';
  selectedSupplier: number = 0;
  lowStockOnly: boolean = false;

  stats = { totalSKU: 0, totalStock: 0, lowStock: 0 };

  isModalOpen = false;
  currentProduct: any = {};

  constructor(
    private http: HttpClient, 
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private validationService: ValidationService,
    private uiService: UiService
  ) {
    addIcons({ 
      searchOutline, filterOutline, alertCircleOutline, cubeOutline, 
      businessOutline, warningOutline, addCircleOutline, createOutline, 
      trashOutline, printOutline, closeOutline, saveOutline, folderOutline 
    });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.http.get(`${environment.apiUrl}/productos`).subscribe({
      next: (res: any) => {
        this.allProducts = res;
        this.calculateStats();
        this.applyFilters();
      },
      error: (err) => this.showToast('Error al cargar productos', 'danger')
    });
    
    this.http.get(`${environment.apiUrl}/proveedores`).subscribe((res: any) => {
      this.suppliers = res;
      // Auto-seleccionar si solo hay uno al crear nuevo
      if (this.suppliers.length === 1 && !this.currentProduct.id_proveedor) {
        this.currentProduct.id_proveedor = this.suppliers[0].id_proveedor;
      }
    });

    this.http.get(`${environment.apiUrl}/categorias`).subscribe((res: any) => {
      this.categories = res;
      // Auto-seleccionar si solo hay uno
      if (this.categories.length === 1 && !this.currentProduct.cod_categoria) {
        this.currentProduct.cod_categoria = this.categories[0].cod_categoria;
      }
    });
  }

  calculateStats() {
    this.stats.totalSKU = this.allProducts.length;
    this.stats.totalStock = this.allProducts.reduce((acc, p) => acc + p.stock, 0);
    this.stats.lowStock = this.allProducts.filter(p => p.stock < 5).length;
  }

  applyFilters() {
    this.filteredProducts = this.allProducts.filter(p => {
      const matchesSearch = !this.searchTerm || 
        p.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
        p.cod_producto.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesSupplier = !this.selectedSupplier || p.id_proveedor === this.selectedSupplier;
      const matchesStock = !this.lowStockOnly || p.stock < 5;
      return matchesSearch && matchesSupplier && matchesStock;
    });
  }

  toggleLowStock() {
    this.lowStockOnly = !this.lowStockOnly;
    this.applyFilters();
  }

  getStockClass(stock: number) {
    if (stock < 5) return 'stock-red';
    if (stock < 10) return 'stock-yellow';
    return 'stock-green';
  }

  openModal(product: any = null) {
    if (product) {
      this.currentProduct = { ...product };
    } else {
      this.currentProduct = {
        nombre: '', Descripcion_producto: '', stock: 0,
        cod_categoria: '', precio_compra: 0, precio_venta: 0, id_proveedor: 0
      };
      // Auto-seleccionar si solo hay una opción disponible
      if (this.categories.length === 1) this.currentProduct.cod_categoria = this.categories[0].cod_categoria;
      if (this.suppliers.length === 1) this.currentProduct.id_proveedor = this.suppliers[0].id_proveedor;
    }
    this.isModalOpen = true;
  }

  async saveProduct() {
    // Validación de campos obligatorios para evitar FK Violations y errores 500
    if (!this.currentProduct.nombre || !this.currentProduct.cod_categoria || !this.currentProduct.id_proveedor) {
      this.showToast('Error: Nombre, Categoría y Proveedor son obligatorios', 'warning');
      return;
    }

    // Clonar para no romper el formato de la UI mientras se guarda
    const productToSend = { ...this.currentProduct };
    
    // Limpiar formatos antes de enviar al backend (convertir a número real)
    try {
      productToSend.precio_compra = parseFloat(this.validationService.unformat(String(productToSend.precio_compra)) || '0');
      productToSend.precio_venta = parseFloat(this.validationService.unformat(String(productToSend.precio_venta)) || '0');
      
      if (productToSend.precio_compra <= 0 || productToSend.precio_venta <= 0) {
        this.showToast('Error: Los precios deben ser mayores a 0', 'warning');
        return;
      }
    } catch (e) {
      this.showToast('Error en el formato de precios', 'danger');
      return;
    }

    if (this.currentProduct.cod_producto) {
      this.http.put(`${environment.apiUrl}/productos/${this.currentProduct.cod_producto}`, productToSend)
        .subscribe({
          next: () => {
            this.showToast('Producto actualizado con éxito');
            this.isModalOpen = false;
            this.loadData();
          },
          error: (err) => this.uiService.handleBackendError(err)
        });
    } else {
      this.http.post(`${environment.apiUrl}/productos`, productToSend)
        .subscribe({
          next: () => {
            this.showToast('Producto agregado con éxito');
            this.isModalOpen = false;
            this.loadData();
          },
          error: (err) => this.uiService.handleBackendError(err)
        });
    }
  }

  async showToast(msg: string, color: string = 'success') {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 3000,
      color: color,
      position: 'bottom'
    });
    toast.present();
  }

  async confirmDelete(product: any) {
    const confirmed = await this.uiService.showConfirmDelete(
      '¿Eliminar Producto?',
      `¿Está seguro que desea eliminar "${product.nombre}"? Esta acción no se puede deshacer.`
    );

    if (confirmed) {
      this.http.delete(`${environment.apiUrl}/productos/${product.cod_producto}`)
        .subscribe({
          next: () => {
            this.showToast('Producto eliminado');
            this.loadData();
          },
          error: (err) => this.uiService.handleBackendError(err)
        });
    }
  }

  printReport() {
    window.print();
  }
}
