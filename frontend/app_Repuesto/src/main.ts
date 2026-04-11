import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { inject } from '@angular/core';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

// Interceptor para inyectar servidor y base de datos seleccionada en cada petición
export const dbInterceptor = (req: any, next: any) => {
  const dbName = localStorage.getItem('techsystem_db') || 'BDRepuesto';
  const server = localStorage.getItem('techsystem_server') || 'YERY-PEREZ';
  
  const modifiedReq = req.clone({
    headers: req.headers
      .set('X-Database', dbName)
      .set('X-Server', server)
  });
  return next(modifiedReq);
};

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(withInterceptors([dbInterceptor])),
  ],
});
