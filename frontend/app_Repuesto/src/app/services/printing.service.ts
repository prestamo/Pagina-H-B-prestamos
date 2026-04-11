import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PrintingService {

  constructor() { }

  printReceipt80mm(negocio: any, factura: any) {
    const printWindow = window.open('', '_blank', 'width=350,height=600');
    if (!printWindow) return;

    const itemsHtml = factura.items.map((item: any) => `
      <tr>
        <td colspan="3" style="padding-top: 5px;">${item.nombre_producto}</td>
      </tr>
      <tr>
        <td style="width: 20%;">${item.cantidad} x</td>
        <td style="width: 40%;">$ ${item.precio_venta.toFixed(2)}</td>
        <td style="width: 40%; text-align: right;">$ ${item.total.toFixed(2)}</td>
      </tr>
    `).join('');

    const logoHtml = negocio.logo_url 
      ? `<img src="http://127.0.0.1:8000${negocio.logo_url}" style="width: 60mm; margin: 0 auto 10px auto; display: block; filter: grayscale(1);">` 
      : '';

    const htmlContent = `
      <html>
        <head>
          <style>
            @page { margin: 0; }
            body { 
              font-family: 'Courier New', Courier, monospace; 
              width: 72mm; 
              margin: 0 auto; 
              padding: 5mm; 
              font-size: 12px; 
              color: #000;
            }
            .header { text-align: center; margin-bottom: 5mm; }
            .header h2 { margin: 0; font-size: 16px; text-transform: uppercase; }
            .header p { margin: 2px 0; font-size: 11px; }
            .divider { border-top: 1px dashed #000; margin: 3mm 0; }
            table { width: 100%; border-collapse: collapse; }
            .totals-table td { padding: 2px 0; }
            .totals-table .label { text-align: left; }
            .totals-table .val { text-align: right; font-weight: bold; }
            .footer { text-align: center; margin-top: 10mm; font-size: 10px; }
            .bold { font-weight: bold; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
          </style>
        </head>
        <body>
          <div class="header">
            ${logoHtml}
            <h2>${negocio.nombre}</h2>
            <p>RNC: ${negocio.rnc}</p>
            <p>${negocio.direccion}</p>
            <p>Tel: ${negocio.telefono}</p>
            <div class="divider"></div>
            <p class="bold">FACTURA: ${factura.numero_factura}</p>
            <p>Fecha: ${new Date(factura.fecha).toLocaleString()}</p>
            <p>Vendedor: ${factura.usuario_logueado}</p>
            <p>Metodo Pago: ${factura.metodo_pago}</p>
          </div>

          <div class="divider"></div>
          <p class="bold">CLIENTE: ${factura.cliente}</p>
          <div class="divider"></div>

          <table>
            <thead>
              <tr style="border-bottom: 1px solid #000;">
                <th class="text-center" colspan="3">PRODUCTOS</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="divider"></div>
          
          <table class="totals-table">
            <tr>
              <td class="label">SUBTOTAL:</td>
              <td class="val">$ ${factura.subtotal.toFixed(2)}</td>
            </tr>
            ${factura.itbis > 0 ? `
            <tr>
              <td class="label">ITBIS (18%):</td>
              <td class="val">$ ${factura.itbis.toFixed(2)}</td>
            </tr>` : ''}
            <tr>
              <td class="label">DESCUENTO:</td>
              <td class="val">-$ ${factura.descuento.toFixed(2)}</td>
            </tr>
            <tr style="font-size: 16px;">
              <td class="label">TOTAL:</td>
              <td class="val">$ ${factura.total_con_descuento.toFixed(2)}</td>
            </tr>
          </table>

          <div class="divider"></div>
          
          <div class="footer">
            <p class="bold">¡GRACIAS POR SU COMPRA!</p>
            <p>H&B Racing - Calidad en Repuestos</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
}
