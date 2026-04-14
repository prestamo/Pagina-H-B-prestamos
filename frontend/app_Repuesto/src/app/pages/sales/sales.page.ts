import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController, AlertController, MenuController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { SalesService, CartItem } from '../../services/sales.service';
import { AuthService } from '../../services/auth.service';
import { addIcons } from 'ionicons';
import { 
  pricetagOutline, barcodeOutline, flashOutline, cardOutline, 
  swapHorizontalOutline, alertCircleOutline, cartOutline, 
  addOutline, removeOutline, trashOutline, searchOutline, 
  personOutline, documentTextOutline, cashOutline, closeOutline, 
  checkmarkCircleOutline, lockClosedOutline 
} from 'ionicons/icons';
import { UiService } from '../../services/ui.service';
import { Router, RouterModule } from '@angular/router';
import { PrintingService } from '../../services/printing.service';

@Component({
  selector: 'app-sales',
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar class="main-toolbar">
        <ion-buttons slot="start">
          <ion-menu-toggle menu="main">
            <div 
              class="custom-burger" 
              [class.menu-open]="isMenuOpen">
              <span class="bar line-1"></span>
              <span class="bar line-2"></span>
              <span class="bar line-3"></span>
              <div class="special-event-glow"></div>
            </div>
          </ion-menu-toggle>
        </ion-buttons>

        <ion-title class="ion-text-center hide-mobile">Terminal Punto de Venta</ion-title>
        <ion-title class="show-mobile">TPV</ion-title>
        <ion-buttons slot="end">
          <div class="mini-status-badge hide-mobile" [class.active]="hasActiveSession" [class.closed]="!hasActiveSession">
            <ion-icon [name]="hasActiveSession ? 'checkmark-circle-outline' : 'lock-closed-outline'"></ion-icon>
            <div class="badge-text">
              <span class="status-label">{{ hasActiveSession ? 'ACTIVA' : 'OFF' }}</span>
            </div>
          </div>
        </ion-buttons>
      </ion-toolbar>


      <!-- PANEL DE ACCIÓN RÁPIDA (TOP CENTER) -->
      <div class="action-panel-container">
        <div class="action-panel">
          <div class="action-item search-box">
            <ion-icon name="barcode-outline"></ion-icon>
            <ion-input 
              placeholder="Escribe para buscar..." 
              [(ngModel)]="productSearch" 
              (ionInput)="filterProducts()"
              class="quick-input">
            </ion-input>
            
            <div class="quick-results" *ngIf="productSearch && filteredProducts.length > 0">
              <div *ngFor="let p of filteredProducts | slice:0:5" class="result-row" (click)="addProduct(p)">
                <div class="res-info">
                  <span class="res-name">{{ p.nombre }}</span>
                  <span class="res-meta">{{ p.cod_producto }} | Stock: {{ p.stock }}</span>
                </div>
                <div class="res-price">$ {{ p.precio_venta | number:'1.2-2' }}</div>
              </div>
            </div>
          </div>

          <div class="divider-v hide-mobile"></div>

          <div class="action-item discount-box hide-mobile">
            <ion-icon name="pricetagOutline"></ion-icon>
            <ion-label>Desc. %</ion-label>
            <ion-input type="number" [(ngModel)]="discountPercent" (ionChange)="applyDiscount()" placeholder="0" class="quick-input discount-val"></ion-input>
          </div>

          <ion-button (click)="isProductModalOpen = true" class="browse-btn">
            <ion-icon name="search-outline"></ion-icon>
            <span class="hide-mobile">Catálogo</span>
          </ion-button>

          <div class="mini-status-badge hide-mobile" [class.active]="hasActiveSession" [class.closed]="!hasActiveSession" [routerLink]="!hasActiveSession ? '/finance/opening' : null">
            <ion-icon [name]="hasActiveSession ? 'checkmark-circle-outline' : 'lock-closed-outline'"></ion-icon>
            <div class="badge-text">
              <span class="status-label">{{ hasActiveSession ? 'ACTIVA' : 'OFF' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- MOBILE SEGMENT SELECTOR -->
      <div class="mobile-switcher show-mobile">
        <ion-segment [(ngModel)]="isMobileView" mode="md">
          <ion-segment-button value="cart">
            <ion-label>Carrito ({{ cart.length }})</ion-label>
          </ion-segment-button>
          <ion-segment-button value="summary">
            <ion-label>Cobro</ion-label>
          </ion-segment-button>
        </ion-segment>
      </div>
    </ion-header>


    <ion-content [fullscreen]="true">
      <div class="pos-container" [class.mobile-view-summary]="isMobileView === 'summary'">
        <!-- SECCIÓN IZQUIERDA: CARRITO -->
        <div class="cart-section" [class.hide-on-mobile]="isMobileView === 'summary'">
          <div class="section-header">
            <h3><ion-icon name="cart-outline"></ion-icon> Detalle de Venta</h3>
            <ion-button fill="clear" color="danger" (click)="clearCart()" *ngIf="cart.length > 0">
              Limpiar Carrito
            </ion-button>
          </div>

          <div class="cart-items" *ngIf="cart.length > 0">
            <div *ngFor="let item of cart; let i = index" class="cart-card">
              <div class="item-info">
                <span class="item-code">{{ item.cod_producto }}</span>
                <span class="item-name">{{ item.nombre }}</span>
                <span class="item-price">Precio Unit: $ {{ item.precio_venta | number:'1.2-2' }}</span>
              </div>
              
              <div class="item-controls">
                <ion-button fill="clear" (click)="updateQty(i, item.cantidad - 1)">
                  <ion-icon name="remove-outline"></ion-icon>
                </ion-button>
                <div class="qty-pill">{{ item.cantidad }}</div>
                <ion-button fill="clear" (click)="updateQty(i, item.cantidad + 1)">
                  <ion-icon name="add-outline"></ion-icon>
                </ion-button>
              </div>

              <div class="item-total">
                <span class="total-lbl">Subtotal</span>
                $ {{ item.total | number:'1.2-2' }}
              </div>

              <ion-button fill="clear" color="danger" class="delete-btn" (click)="remove(i)">
                <ion-icon name="trash-outline" slot="icon-only"></ion-icon>
              </ion-button>
            </div>
          </div>

          <div class="empty-cart" *ngIf="cart.length === 0">
            <p>Utiliza el panel superior para cargar productos a la venta</p>
          </div>
        </div>

        <!-- SECCIÓN DERECHA: TOTALES Y CLIENTE -->
        <div class="summary-section">
          <div class="customer-card">
            <h4><ion-icon name="person-outline"></ion-icon> Cliente</h4>
            <ion-item lines="none" class="customer-select">
              <ion-select placeholder="Seleccionar Cliente" [(ngModel)]="selectedClient">
                <ion-select-option *ngFor="let c of clients" [value]="c">
                  {{ c.nombres }} {{ c.apellidos }}
                </ion-select-option>
              </ion-select>
            </ion-item>
          </div>

          <div class="fiscal-toggle-card">
            <div class="fiscal-header">
              <div class="f-info">
                <ion-icon name="document-text-outline"></ion-icon>
                <span>Facturación Fiscal</span>
              </div>
              <ion-toggle color="danger" [(ngModel)]="isFiscal" (ionChange)="toggleFiscal()"></ion-toggle>
            </div>
            <p class="fiscal-hint" *ngIf="isFiscal">Se aplicará ITBIS (18%) a la venta</p>
            <p class="fiscal-hint" *ngIf="!isFiscal">Venta sin impuestos (Consumo final)</p>
          </div>

          <!-- MÉTODO DE PAGO -->
          <div class="payment-method-card">
            <h4><ion-icon name="cash-outline"></ion-icon> Método de Pago</h4>
            <div class="method-toggles">
              <div 
                class="method-btn" 
                [class.active]="paymentMethod === 'EFECTIVO'"
                (click)="paymentMethod = 'EFECTIVO'">
                <ion-icon name="cash-outline"></ion-icon>
                <span>Efectivo</span>
              </div>
              <div 
                class="method-btn" 
                [class.active]="paymentMethod === 'TARJETA'"
                (click)="paymentMethod = 'TARJETA'">
                <ion-icon name="card-outline"></ion-icon>
                <span>Tarjeta</span>
              </div>
              <div 
                class="method-btn" 
                [class.active]="paymentMethod === 'TRANSFERENCIA'"
                (click)="paymentMethod = 'TRANSFERENCIA'">
                <ion-icon name="swap-horizontal-outline"></ion-icon>
                <span>Transf.</span>
              </div>
            </div>
          </div>

          <div class="totals-card">
            <div class="total-row">
              <span>Sub-Total</span>
              <span>$ {{ totals.subtotal | number:'1.2-2' }}</span>
            </div>
            <div class="total-row" *ngIf="isFiscal">
              <span>Impuestos (ITBIS 18%)</span>
              <span>$ {{ totals.itbis | number:'1.2-2' }}</span>
            </div>
            
            <div class="total-row discount-applied" *ngIf="totals.discount > 0">
              <span>Descuento Aplicado ({{ discountPercent }}%)</span>
              <span>-$ {{ totals.discount | number:'1.2-2' }}</span>
            </div>

            <div class="divider"></div>

            <div class="final-total">
              <span class="label">TOTAL A PAGAR</span>
              <span class="value">$ {{ totals.total | number:'1.2-2' }}</span>
            </div>

            <!-- NUEVA SECCIÓN DE COBRO -->
            <div class="payment-input-group">
              <div class="pay-field received">
                <span class="label">ENTREGADO</span>
                <ion-input 
                  type="number" 
                  [(ngModel)]="amountReceived" 
                  (ionInput)="calculateChange()"
                  placeholder="0.00"
                  class="amount-field">
                </ion-input>
              </div>
              <div class="pay-field change" [class.has-change]="changeAmount > 0">
                <span class="label">CAMBIO</span>
                <span class="value">$ {{ changeAmount | number:'1.2-2' }}</span>
              </div>
            </div>

            <ion-button expand="block" class="complete-btn" (click)="processSale()" [disabled]="cart.length === 0 || (paymentMethod === 'EFECTIVO' && amountReceived < totals.total)">
              <ion-icon name="checkmark-circle-outline" slot="start"></ion-icon>
              REGISTRAR VENTA
            </ion-button>
          </div>
          
          <div class="shortcut-info">
            <p><ion-icon name="flash-outline"></ion-icon> El total se sincroniza con el cobro automático en el menú lateral.</p>
          </div>
        </div>
      </div>

      <!-- MODAL SELECTOR DE PRODUCTOS (CATÁLOGO COMPLETO) -->
      <ion-modal [isOpen]="isProductModalOpen" (didDismiss)="isProductModalOpen = false" class="selector-modal">
        <ng-template>
          <ion-header class="ion-no-border">
            <ion-toolbar color="primary">
              <ion-title>Catálogo de Productos</ion-title>
              <ion-buttons slot="end">
                <ion-button (click)="isProductModalOpen = false">Cerrar</ion-button>
              </ion-buttons>
            </ion-toolbar>
            <ion-toolbar>
              <ion-searchbar 
                placeholder="Busca cualquier repuesto..." 
                [(ngModel)]="catalogSearch" 
                (ionInput)="filterCatalog()">
              </ion-searchbar>
            </ion-toolbar>
          </ion-header>
          <ion-content>
            <ion-list lines="full">
              <ion-item *ngFor="let p of filteredCatalog" button (click)="addProduct(p)">
                <ion-label>
                  <h2 style="font-weight: 700;">{{ p.nombre }}</h2>
                  <p>{{ p.cod_producto }} | <ion-badge [color]="p.stock > 5 ? 'success' : 'warning'">En Stock: {{ p.stock }}</ion-badge></p>
                </ion-label>
                <div slot="end" class="modal-price">
                  $ {{ p.precio_venta | number:'1.2-2' }}
                </div>
              </ion-item>
            </ion-list>
          </ion-content>
        </ng-template>
      </ion-modal>

    </ion-content>
  `,
  styles: [`
    .main-toolbar { --background: #1a1a2e; --color: white; }

    /* --- MODERN SANDWICH MENU --- */
    /* Handled Globally in global.scss */

    .mini-status-badge {
      display: flex; align-items: center; gap: 10px; padding: 6px 12px; border-radius: 12px; cursor: pointer;
      transition: all 0.2s ease; margin-left: auto;
      
      ion-icon { font-size: 18px; }
      .badge-text { display: flex; flex-direction: column; }
      .status-label { font-size: 10px; font-weight: 900; letter-spacing: 0.5px; }
      .status-action { font-size: 8px; color: #ffffff; opacity: 0.7; text-transform: uppercase; font-weight: 700; }

      &.active { background: rgba(16, 185, 129, 0.2); border: 1px solid rgba(16, 185, 129, 0.4); 
        ion-icon { color: #10b981; } .status-label { color: #10b981; }
      }
      &.closed { background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4);
        ion-icon { color: #ef4444; } .status-label { color: #ef4444; }
        &:hover { background: rgba(239, 68, 68, 0.3); }
      }
    }
    
    /* PANEL DE ACCIÓN RÁPIDA */
    .action-panel-container { 
      background: #1a1a2e; padding: 10px 20px 20px 20px; 
      display: flex; justify-content: center;
    }
    .action-panel {
      background: #16213e; border: 1px solid rgba(233, 69, 96, 0.3);
      border-radius: 16px; width: 100%; max-width: 900px;
      display: flex; align-items: center; padding: 8px 15px;
      gap: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.4);
    }
    .action-item { display: flex; align-items: center; gap: 10px; flex: 1; position: relative;
      ion-icon { color: #e94560; font-size: 22px; }
      ion-label { color: #94a3b8; font-size: 11px; font-weight: 800; text-transform: uppercase; min-width: 50px; }
    }
    .quick-input { --background: transparent; color: white; font-weight: 600; font-size: 15px; }
    .discount-box { flex: 0.4; }
    .divider-v { width: 1px; height: 30px; background: rgba(255,255,255,0.1); }
    .browse-btn { --background: transparent; --color: #e94560; font-weight: 800; --padding-start: 10px; border-left: 1px solid rgba(255,255,255,0.1); }

    .quick-results {
      position: absolute; top: 100%; left: 0; right: 0; background: #16213e;
      z-index: 1000; border-radius: 0 0 12px 12px; box-shadow: 0 15px 30px rgba(0,0,0,0.5);
      border: 1px solid rgba(233, 69, 96, 0.2); border-top: none;
      .result-row { padding: 12px 15px; display: flex; justify-content: space-between; align-items: center; 
        border-bottom: 1px solid rgba(255,255,255,0.05); cursor: pointer;
        &:hover { background: rgba(233, 69, 96, 0.1); }
        .res-name { color: white; font-weight: 700; display: block; }
        .res-meta { color: #64748b; font-size: 11px; }
        .res-price { color: #e94560; font-weight: 800; }
      }
    }

    .pos-container { display: flex; height: 100%; width: 100%; background: #0f3460; }

    /* MOBILE RESPONSIVE TWEAKS */
    .show-mobile { display: none; }
    
    @media (max-width: 991px) {
      .hide-mobile { display: none !important; }
      .show-mobile { display: block; }
      
      .pos-container { flex-direction: column; }
      
      .cart-section, .summary-section { 
        width: 100% !important; 
        flex: none !important; 
      }

      .mobile-view-summary .cart-section { display: none; }
      .pos-container:not(.mobile-view-summary) .summary-section { display: none; }

      .action-panel-container { padding: 10px; }
      .action-panel { gap: 5px; padding: 5px 10px; }
      
      .mobile-switcher {
        background: #1a1a2e;
        padding: 0 10px 10px 10px;
        ion-segment {
          --background: #16213e;
          ion-segment-button {
            --color: #94a3b8;
            --color-checked: #e94560;
            --indicator-color: #e94560;
          }
        }
      }

      .browse-btn {
        background: #e94560 !important;
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 0 15px rgba(233, 69, 96, 0.4);
        border-radius: 12px;
        margin-left: 5px;
        height: 45px;
        width: 45px;
        transition: all 0.3s ease;
        ion-icon { font-size: 24px !important; margin: 0 !important; color: white !important; }
        
        &:active { transform: scale(0.9); box-shadow: 0 0 30px rgba(233, 69, 96, 0.6); }
      }

      .action-panel { padding: 5px; gap: 8px; }
      .search-box { flex: 2; }
      .dropdown-results { width: calc(100vw - 40px); left: -15px; }


      .summary-section { box-shadow: none; padding: 20px; }
      .final-total .value { font-size: 32px !important; }
      
      .cart-card { 
        flex-direction: column; 
        align-items: flex-start; 
        gap: 10px;
        .item-controls { justify-content: flex-start; width: 100%; }
        .item-total { text-align: left; }
      }
    }

    /* CARRITO */
    .cart-section {
      flex: 3; display: flex; flex-direction: column; padding: 25px; 
      .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;
        h3 { margin: 0; color: #ffffff; font-weight: 800; font-size: 20px; display: flex; align-items: center; gap: 10px; 
          ion-icon { color: #e94560; }
        }
      }
    }

    .cart-items { flex: 1; overflow-y: auto; padding-right: 15px; }
    
    .cart-card {
      background: #1a1a2e; border: 1px solid rgba(255,255,255,0.05); border-radius: 20px;
      margin-bottom: 15px; padding: 20px; display: flex; align-items: center; gap: 20px;
      transition: transform 0.2s ease;
      &:hover { transform: scale(1.01); border: 1px solid rgba(233, 69, 96, 0.2); }
      
      .item-info { flex: 2; display: flex; flex-direction: column;
        .item-code { font-size: 10px; font-weight: 800; color: #e94560; background: rgba(233, 69, 96, 0.1); padding: 4px 8px; border-radius: 6px; width: fit-content; margin-bottom: 8px; }
        .item-name { color: #ffffff; font-weight: 700; font-size: 17px; margin-bottom: 4px; }
        .item-price { color: #94a3b8; font-size: 13px; }
      }

      .item-controls { flex: 1; display: flex; align-items: center; gap: 12px; justify-content: center;
        .qty-pill { background: #16213e; color: #ffffff; font-weight: 800; font-size: 20px; width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); }
        ion-button { --color: #e94560; font-size: 24px; margin: 0; }
      }

      .item-total { flex: 1; text-align: right; color: #ffffff; font-weight: 900; font-size: 20px; display: flex; flex-direction: column;
        .total-lbl { color: #64748b; font-size: 10px; font-weight: 800; text-transform: uppercase; margin-bottom: 4px; }
      }
      .delete-btn { --color: #ef4444; }
    }

    .empty-cart { 
      flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;
      .pulse-icon { font-size: 80px; color: rgba(233, 69, 96, 0.2); margin-bottom: 20px; animation: pulse 2s infinite; }
      p { color: #94a3b8; font-size: 16px; font-weight: 500; }
    }

    @keyframes pulse { 0% { opacity: 0.5; transform: scale(1); } 50% { opacity: 1; transform: scale(1.1); } 100% { opacity: 0.5; transform: scale(1); } }

    /* RÉSUMEN */
    .summary-section { flex: 1.2; background: #1a1a2e; padding: 30px; display: flex; flex-direction: column; gap: 20px; box-shadow: -15px 0 45px rgba(0,0,0,0.4); }
    .customer-card {
      background: rgba(255,255,255,0.03); padding: 20px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05);
      h4 { margin: 0 0 15px 0; font-size: 12px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 2px;
        ion-icon { color: #e94560; font-size: 18px; margin-right: 8px; }
      }
      .customer-select { --background: #16213e; --color: white; border-radius: 12px; font-weight: 700; height: 50px; }
    }

    .totals-card {
      background: linear-gradient(135deg, rgba(233, 69, 96, 0.1) 0%, rgba(22, 33, 62, 0.5) 100%);
      padding: 30px; border-radius: 30px; border: 1px solid rgba(233, 69, 96, 0.2);
      display: flex; flex-direction: column; gap: 15px;
      
      .total-row { display: flex; justify-content: space-between; align-items: center; color: #94a3b8; font-weight: 600; font-size: 16px; }
      .discount-applied { color: #ef4444; font-size: 14px; }
      .divider { height: 1px; background: rgba(255,255,255,0.1); margin: 15px 0; }

      .final-total { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 10px; margin: 10px 0;
        .label { color: #64748b; font-size: 12px; font-weight: 800; letter-spacing: 1px; }
        .value { color: #ffffff; font-weight: 900; font-size: 42px; text-shadow: 0 0 20px rgba(233, 69, 96, 0.3); }
      }
      .complete-btn { --background: linear-gradient(135deg, #e94560 0%, #891a2b 100%); --border-radius: 16px; height: 65px; font-weight: 900; font-size: 20px; margin: 0; box-shadow: 0 10px 20px rgba(233, 69, 96, 0.3); }
      
      &.disabled { opacity: 0.5; }
    }

    /* ESTILOS NUEVOS PARA COBRO */
    .payment-input-group {
      display: flex; gap: 15px; margin-bottom: 5px;
      .pay-field {
        flex: 1; background: rgba(0,0,0,0.2); padding: 12px; border-radius: 16px;
        display: flex; flex-direction: column; gap: 4px; border: 1px solid rgba(255,255,255,0.05);
        .label { font-size: 9px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
        .amount-field { --padding-start: 0; --padding-end: 0; --color: #ffffff; font-size: 18px; font-weight: 800; height: 30px; }
        .value { font-size: 18px; font-weight: 800; color: #94a3b8; }
        
        &.received { border-color: rgba(233, 69, 96, 0.3); }
        &.change.has-change { 
          background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.3);
          .value { color: #10b981; }
        }
      }
    }

    .shortcut-info { padding: 15px; font-size: 12px; color: #64748b; background: rgba(255,255,255,0.02); border-radius: 12px; text-align: center;
      ion-icon { color: #e94560; }
    }

    .modal-price { font-weight: 900; font-size: 18px; color: #e94560; }
    
    /* PAYMENT METHODS */
    .payment-method-card {
      background: rgba(255,255,255,0.03); padding: 15px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05);
      h4 { margin: 0 0 12px 0; font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
      .method-toggles { display: flex; gap: 8px; }
      .method-btn {
        flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
        padding: 10px; border-radius: 12px; background: #16213e; border: 1px solid transparent; cursor: pointer;
        transition: all 0.2s ease;
        ion-icon { font-size: 20px; color: #94a3b8; margin-bottom: 4px; }
        span { font-size: 10px; color: #94a3b8; font-weight: 700; }
        &.active {
          background: rgba(233, 69, 96, 0.1); border: 1px solid #e94560;
          ion-icon { color: #e94560; }
          span { color: #ffffff; }
        }
      }
    }

    .fiscal-toggle-card {
      background: rgba(233, 69, 96, 0.05); border: 1px solid rgba(233, 69, 96, 0.2);
      padding: 15px; border-radius: 20px;
      .fiscal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;
        .f-info { display: flex; align-items: center; gap: 10px; color: white; font-weight: 700; font-size: 14px; 
          ion-icon { color: #e94560; font-size: 20px; }
        }
      }
      .fiscal-hint { font-size: 10px; color: #94a3b8; margin: 0; }
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule]
})
export class SalesPage implements OnInit {
  cart: CartItem[] = [];
  totals: any = { subtotal: 0, itbis: 0, discount: 0, total: 0 };
  discountPercent: number = 0;
  hasActiveSession: boolean = false;

  products: any[] = [];
  filteredProducts: any[] = [];
  catalogSearch: string = '';
  filteredCatalog: any[] = [];

  clients: any[] = [];
  selectedClient: any = { nombres: 'Mostrador', cod_cliente: null };

  isProductModalOpen = false;
  paymentMethod: string = 'EFECTIVO';
  productSearch: string = '';
  isFiscal: boolean = false;
  businessInfo: any = {};
  
  amountReceived: number = 0;
  changeAmount: number = 0;
  isMobileView: string = 'cart';
  isMenuOpen: boolean = false;


  constructor(
    private http: HttpClient,
    private salesService: SalesService,
    private authService: AuthService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private uiService: UiService,
    private router: Router,
    private printingService: PrintingService,
    private menuCtrl: MenuController
  ) {

    addIcons({ 
      cartOutline, addOutline, removeOutline, trashOutline, 
      searchOutline, personOutline, documentTextOutline, 
      cashOutline, cardOutline, closeOutline, checkmarkCircleOutline,
      pricetagOutline, barcodeOutline, flashOutline, swapHorizontalOutline,
      alertCircleOutline, lockClosedOutline
    });
  }

  ngOnInit() {
    this.loadData();
    this.salesService.cart$.subscribe(c => this.cart = c);
    this.salesService.totals$.subscribe(t => {
      this.totals = t;
      this.calculateChange();
    });
    this.salesService.isFiscal$.subscribe(f => this.isFiscal = f);
    this.loadBusinessInfo();
    this.syncMenuState();
  }

  async syncMenuState() {
    const menu = await this.menuCtrl.get('main');
    if (menu) {
      menu.addEventListener('ionWillOpen', () => { this.isMenuOpen = true; });
      menu.addEventListener('ionWillClose', () => { this.isMenuOpen = false; });
      this.isMenuOpen = await this.menuCtrl.isOpen('main');
    }
  }


  loadBusinessInfo() {
    this.http.get(`${environment.apiUrl}/negocio`).subscribe(res => {
      this.businessInfo = res;
    });
  }

  toggleFiscal() {
    this.salesService.setFiscal(this.isFiscal);
  }

  ionViewWillEnter() {
    this.checkCashStatus();
  }

  checkCashStatus() {
    this.http.get(`${environment.apiUrl}/cash/status`).subscribe((res: any) => {
      this.hasActiveSession = res.active;
    });
  }

  loadData() {
    this.http.get(`${environment.apiUrl}/productos`).subscribe((res: any) => {
      this.products = res;
      this.filteredCatalog = res;
    });
    this.http.get(`${environment.apiUrl}/clientes`).subscribe((res: any) => {
      this.clients = res;
      const m = res.find((c: any) => c.nombres.toLowerCase() === 'mostrador');
      if (m) this.selectedClient = m;
    });
  }

  filterProducts() {
    if (!this.productSearch) {
      this.filteredProducts = [];
      return;
    }
    const term = this.productSearch.toLowerCase();
    this.filteredProducts = this.products.filter(p => 
      p.nombre.toLowerCase().includes(term) || 
      p.cod_producto.toLowerCase().includes(term)
    );
  }

  filterCatalog() {
    const term = this.catalogSearch.toLowerCase();
    this.filteredCatalog = this.products.filter(p => 
      p.nombre.toLowerCase().includes(term) || 
      p.cod_producto.toLowerCase().includes(term)
    );
  }

  addProduct(product: any) {
    if (product.stock <= 0) {
      this.showToast('Producto sin stock', 'danger');
      return;
    }
    this.salesService.addToCart(product);
    this.productSearch = '';
    this.filteredProducts = [];
    this.showToast(`${product.nombre} añadido`);
  }

  updateQty(index: number, qty: number) {
    this.salesService.updateQuantity(index, qty);
  }

  remove(index: number) {
    this.salesService.removeFromCart(index);
  }

  applyDiscount() {
    if (this.discountPercent > 20) {
      this.discountPercent = 20;
      this.showToast('El descuento máximo permitido es del 20%', 'warning');
    }
    this.salesService.setDiscount(this.discountPercent);
  }

  clearCart() {
    this.salesService.clearCart();
    this.discountPercent = 0;
  }

  async processSale() {
    if (this.cart.length === 0) return;

    // VALIDACIÓN DE CAJA ACTIVA
    const cashStatus: any = await this.http.get(`${environment.apiUrl}/cash/status`).toPromise();
    if (!cashStatus.active) {
      await this.uiService.showError(
        'Venta Bloqueada', 
        'No se puede procesar la venta porque no hay una sesión de caja abierta. Por favor, realice la apertura de caja primero.'
      );
      this.router.navigate(['/finance/status']);
      return;
    }

    const user = this.authService.currentUserValue;
    
    const facturaData = {
      cliente: `${this.selectedClient.nombres} ${this.selectedClient.apellidos || ''}`,
      dni_cliente: this.selectedClient.dni || 'N/A',
      direccion_cliente: this.selectedClient.direccion || 'N/A',
      telefono_cliente: this.selectedClient.telefono || 'N/A',
      usuario_logueado: user?.usuario || 'admin',
      subtotal: this.totals.subtotal,
      itbis: this.totals.itbis,
      total_con_descuento: this.totals.total,
      descuento: this.totals.discount,
      monto_pagado: this.amountReceived || this.totals.total,
      cambio: this.changeAmount,
      metodo_pago: this.paymentMethod,
      items: this.cart.map(i => ({
        cod_producto: i.cod_producto,
        nombre_producto: i.nombre,
        precio_venta: i.precio_venta,
        cantidad: i.cantidad,
        total: i.total
      }))
    };

    const loader = await this.alertCtrl.create({ header: 'Procesando...', message: 'Generando factura...', backdropDismiss: false });
    await loader.present();

    this.http.post(`${environment.apiUrl}/facturas`, facturaData).subscribe({
      next: (res: any) => {
        loader.dismiss();
        this.showSuccess(res.numero_factura, facturaData);
        this.clearCart();
        this.amountReceived = 0;
        this.changeAmount = 0;
        this.loadData();
      },
      error: (err) => {
        loader.dismiss();
        this.showToast('Error: ' + err.error.detail, 'danger');
      }
    });
  }

  async showSuccess(num: string, facturaData: any) {
    const alert = await this.alertCtrl.create({
      header: '¡Venta Registrada!',
      subHeader: `FAC: ${num}`,
      message: '¿Desea imprimir el ticket de venta ahora?',
      buttons: [
        { text: 'NO', role: 'cancel' },
        { 
          text: 'IMPRIMIR', 
          handler: () => {
            const facturaFull = { ...facturaData, numero_factura: num, fecha: new Date() };
            this.printingService.printReceipt80mm(this.businessInfo, facturaFull);
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

  calculateChange() {
    if (this.amountReceived > 0 && this.totals.total > 0) {
      this.changeAmount = Math.max(0, this.amountReceived - this.totals.total);
    } else {
      this.changeAmount = 0;
    }
  }
}


