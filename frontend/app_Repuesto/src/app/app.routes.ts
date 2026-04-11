import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Session-based routing
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage) },
  { path: 'home', loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage), canActivate: [AuthGuard] },
  
  // INVENTARIO
  { path: 'inventory', loadComponent: () => import('./pages/inventory/products/products.page').then(m => m.ProductsPage), canActivate: [AuthGuard] },
  { path: 'categories', loadComponent: () => import('./pages/inventory/categories/categories.page').then(m => m.CategoriesPage), canActivate: [AuthGuard] },
  
  // CLIENTES Y CRÉDITOS
  { path: 'clients', loadComponent: () => import('./pages/clients/clients.page').then(m => m.ClientsPage), canActivate: [AuthGuard] },
  { path: 'credits', loadComponent: () => import('./pages/credits/credits.page').then(m => m.CreditsPage), canActivate: [AuthGuard] },
  
  // VENTAS
  { path: 'sales', loadComponent: () => import('./pages/sales/sales.page').then(m => m.SalesPage), canActivate: [AuthGuard] },
  
  // PROVEEDORES
  { path: 'suppliers', loadComponent: () => import('./pages/suppliers/suppliers.page').then(m => m.SuppliersPage), canActivate: [AuthGuard] },

  // CAJA / FINANZAS (SUB-MENU ROUTES)
  { path: 'finance/opening', loadComponent: () => import('./pages/finance/opening/opening.page').then(m => m.CashOpeningPage), canActivate: [AuthGuard] },
  { path: 'finance/closing', loadComponent: () => import('./pages/finance/closing/closing.page').then(m => m.CashClosingPage), canActivate: [AuthGuard] },
  { path: 'finance/history', loadComponent: () => import('./pages/finance/history/history.page').then(m => m.CashHistoryPage), canActivate: [AuthGuard] },
  { path: 'finance/status', loadComponent: () => import('./pages/finance/status/status.page').then(m => m.FinanceStatusPage), canActivate: [AuthGuard] },
  { path: 'finance/transactions', loadComponent: () => import('./pages/finance/transactions/transactions.page').then(m => m.FinanceTransactionsPage), canActivate: [AuthGuard] },

  // CONFIGURACIÓN (SUB-MENU ROUTES)
  { path: 'settings/users', loadComponent: () => import('./pages/settings/users/users.page').then(m => m.UsersPage), canActivate: [AuthGuard] },
  { path: 'settings/permissions', loadComponent: () => import('./pages/settings/permissions/permissions.page').then(m => m.PermissionsPage), canActivate: [AuthGuard] },
  { path: 'settings/audit', loadComponent: () => import('./pages/settings/audit/audit.page').then(m => m.AuditPage), canActivate: [AuthGuard] },
  { path: 'settings/business', loadComponent: () => import('./pages/settings/business/business.page').then(m => m.BusinessPage), canActivate: [AuthGuard] },

  { path: 'reports', loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage), canActivate: [AuthGuard] },
  { path: 'settings', redirectTo: 'settings/business', pathMatch: 'full' }
];
