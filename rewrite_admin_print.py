import re

with open('src/js/admin.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Regular expression to find window.printSolicitud = async (id) => { ... }
# and window.exportToWord = async (id) => { ... }
# Since these are at the end of the file, we can just replace everything from window.printSolicitud = async (id) => { to the end of the file.

start_idx = content.find('window.printSolicitud = async (id) => {')

if start_idx != -1:
    new_code = """window.printSolicitud = async (id) => {
    const { data: s, error } = await supabase.from('loan_applications')
        .select('*, clients(*)')
        .eq('id', id)
        .single();
    
    if (error || !s) {
        alert('Error al cargar la solicitud');
        return;
    }

    const { data: iconData } = await supabase.from('site_settings').select('value').eq('key', 'portal_icon').single();
    const portalLogo = iconData?.value || '../assets/img/logob&H.jpeg';

    const d = s.data || {};
    const sol = d.solicitante || {};
    const con = d.conyuge || {};
    const veh = d.garantiaVehiculo || {};
    const hipo = d.garantiaHipotecaria || {};
    const gar = d.garante || {};
    const conGar = d.conyugeGarante || {};

    const type = s.loan_type || 'personal';

    const renderSolicitante = () => `
        <div class="section-label">DATOS DE SOLICITANTE</div>
        <div class="two-columns">
            <div class="column">
                <div class="data-item"><span class="label">IDENTIFICADOR:</span> <span class="val">${sol.identificador || ''}</span></div>
                <div class="data-item"><span class="label">NOMBRES:</span> <span class="val">${sol.nombres || ''}</span></div>
                <div class="data-item"><span class="label">APELLIDOS:</span> <span class="val">${sol.apellidos || ''}</span></div>
                <div class="data-item"><span class="label">SECTOR:</span> <span class="val">${sol.sector || ''}</span></div>
                <div class="data-item"><span class="label">CIUDAD:</span> <span class="val">${sol.ciudad || ''}</span></div>
                <div class="data-item"><span class="label">DIRECCION:</span> <span class="val">${sol.direccion || ''}</span></div>
                <div class="data-item"><span class="label">OCUPACIONES:</span> <span class="val">${sol.ocupaciones || ''}</span></div>
                <div class="data-item"><span class="label">LUGAR DE TRABAJO:</span> <span class="val">${sol.trabajo || ''}</span></div>
                <div class="data-item"><span class="label">CARGO:</span> <span class="val">${sol.cargo || ''}</span></div>
                <div class="data-item"><span class="label">DIRECCION:</span> <span class="val">${sol.direccionTrabajo || ''}</span></div>
                <div class="data-item"><span class="label">SUPERIOR:</span> <span class="val">${sol.superior || ''}</span></div>
                <div class="data-item"><span class="label">CASA PROPIA/ALQ:</span> <span class="val">${sol.tipoCasa || ''}</span></div>
                <div class="data-item"><span class="label">DESTINO CREDITO:</span> <span class="val">${sol.destino || ''}</span></div>
            </div>
            <div class="column">
                <div class="data-item"><span class="label">APODO:</span> <span class="val">${sol.apodo || ''}</span></div>
                <div class="data-item"><span class="label">ESTADO CIVIL:</span> <span class="val">${sol.estadoCivil || ''}</span></div>
                <div class="data-item"><span class="label">FECHA DE NACIMIENTO:</span> <span class="val">${sol.fechaNacimiento || ''}</span></div>
                <div class="data-item"><span class="label">TELEFONO:</span> <span class="val">${sol.telefono || ''}</span></div>
                <div class="data-item"><span class="label">EDAD:</span> <span class="val">${sol.edad || ''}</span></div>
                <div class="data-item"><span class="label">DEPENDIENTE:</span> <span class="val">${sol.dependientes || ''}</span></div>
                <div class="data-item"><span class="label">SEXO:</span> <span class="val">${sol.sexo || ''}</span></div>
                <div class="data-item"><span class="label">PROFESION:</span> <span class="val">${sol.profesion || ''}</span></div>
                <div class="data-item"><span class="label">VEHICULO:</span> <span class="val">${sol.vehiculo || ''}</span></div>
                <div class="data-item"><span class="label">TEL. TRABAJO:</span> <span class="val">${sol.telTrabajo || ''}</span></div>
                <div class="data-item"><span class="label">TIEMPO TRABAJO:</span> <span class="val">${sol.tiempoTrabajo || ''}</span></div>
                <div class="data-item"><span class="label">INGRESOS:</span> <span class="val">${sol.ingresos || ''}</span></div>
                <div class="data-item"><span class="label">OTROS INGRESOS:</span> <span class="val">${sol.otrosIngresos || ''}</span></div>
            </div>
        </div>
    `;

    const renderConyuge = (c) => `
        <div class="two-columns">
            <div class="column">
                <div class="data-item"><span class="label">NOMBRES:</span> <span class="val">${c.nombres || ''}</span></div>
                <div class="data-item"><span class="label">APELLIDOS:</span> <span class="val">${c.apellidos || ''}</span></div>
                <div class="data-item"><span class="label">FECHA DE NACIMIENTO:</span> <span class="val">${c.fechaNacimiento || ''}</span></div>
                <div class="data-item"><span class="label">APODO:</span> <span class="val">${c.apodo || ''}</span></div>
                <div class="data-item"><span class="label">ESTADO CIVIL:</span> <span class="val">${c.estadoCivil || ''}</span></div>
                <div class="data-item"><span class="label">TELEFONO:</span> <span class="val">${c.telefono || ''}</span></div>
                <div class="data-item"><span class="label">OCUPACION:</span> <span class="val">${c.ocupacion || ''}</span></div>
            </div>
            <div class="column">
                <div class="data-item"><span class="label">LUGAR DE TRABAJO:</span> <span class="val">${c.trabajo || ''}</span></div>
                <div class="data-item"><span class="label">SECTOR:</span> <span class="val">${c.sector || ''}</span></div>
                <div class="data-item"><span class="label">DIRECCION:</span> <span class="val">${c.direccion || ''}</span></div>
                <div class="data-item"><span class="label">SUPERIOR:</span> <span class="val">${c.superior || ''}</span></div>
                <div class="data-item"><span class="label">TEL. TRABAJO:</span> <span class="val">${c.telTrabajo || ''}</span></div>
                <div class="data-item"><span class="label">TIEMPO TRABAJO:</span> <span class="val">${c.tiempoTrabajo || ''}</span></div>
                <div class="data-item"><span class="label">INGRESOS:</span> <span class="val">${c.ingresos || ''}</span></div>
            </div>
        </div>
    `;

    const renderVehiculo = () => `
        <div class="section-label">DATOS DE GARANTIA</div>
        <div class="two-columns">
            <div class="column">
                <div class="data-item"><span class="label">RAZON SOCIAL:</span> <span class="val">${veh.razonSocial || ''}</span></div>
                <div class="data-item"><span class="label">PLACA Y REG:</span> <span class="val">${veh.placa || ''}</span></div>
                <div class="data-item"><span class="label">FECHA EXP:</span> <span class="val">${veh.fechaExpedicion || ''}</span></div>
                <div class="data-item"><span class="label">CHASIS:</span> <span class="val">${veh.chasis || ''}</span></div>
                <div class="data-item"><span class="label">ESTATUS VEHICULO:</span> <span class="val">${veh.estatus || ''}</span></div>
                <div class="data-item"><span class="label">TIPO EMISION:</span> <span class="val">${veh.emision || ''}</span></div>
                <div class="data-item"><span class="label">MATRICULA:</span> <span class="val">${veh.matricula || ''}</span></div>
                <div class="data-item"><span class="label">FUERZA MOTRIZ:</span> <span class="val">${veh.fuerza || ''}</span></div>
                <div class="data-item"><span class="label">CILINDROS:</span> <span class="val">${veh.cilindros || ''}</span></div>
                <div class="data-item"><span class="label">CEDULA/RNC:</span> <span class="val">${veh.identificador || ''}</span></div>
            </div>
            <div class="column">
                <div class="data-item"><span class="label">TIPO:</span> <span class="val">${veh.tipo || ''}</span></div>
                <div class="data-item"><span class="label">MARCA:</span> <span class="val">${veh.marca || ''}</span></div>
                <div class="data-item"><span class="label">MODELO:</span> <span class="val">${veh.modelo || ''}</span></div>
                <div class="data-item"><span class="label">AÑO FABRICACION:</span> <span class="val">${veh.anio || ''}</span></div>
                <div class="data-item"><span class="label">COLOR:</span> <span class="val">${veh.color || ''}</span></div>
                <div class="data-item"><span class="label">MOTOR/SERIE:</span> <span class="val">${veh.motorSerie || ''}</span></div>
                <div class="data-item"><span class="label">PASAJERO:</span> <span class="val">${veh.pasajeros || ''}</span></div>
                <div class="data-item"><span class="label">CAP CARGA:</span> <span class="val">${veh.capCarga || ''}</span></div>
                <div class="data-item"><span class="label">NO. PUERTAS:</span> <span class="val">${veh.puertas || ''}</span></div>
            </div>
        </div>
    `;

    const renderHipotecario = () => `
        <div class="section-label">DATOS DE GARANTIA</div>
        <div class="two-columns">
            <div class="column">
                <div class="data-item"><span class="label">PROPIETARIO:</span> <span class="val">${hipo.propietario || ''}</span></div>
                <div class="data-item"><span class="label">CEDULA/RNC:</span> <span class="val">${hipo.cedulaRNC || ''}</span></div>
                <div class="data-item"><span class="label">FECHA EXP:</span> <span class="val">${hipo.fechaExpedicion || ''}</span></div>
            </div>
            <div class="column">
               <div class="data-item"><span class="label">TIPO INMUEBLE:</span> <span class="val">${hipo.tipoInmueble || ''}</span></div>
               <div class="data-item"><span class="label">VALOR:</span> <span class="val">${hipo.valorAproximado || ''}</span></div>
            </div>
        </div>
    `;

    let dynamicSections = renderSolicitante();
    dynamicSections += \`<div class="section-label">DATOS DEL CONYUGE</div>\` + renderConyuge(con);

    if (type === 'vehiculo') {
        dynamicSections += renderVehiculo();
    } else if (type === 'hipotecario') {
         dynamicSections += renderHipotecario();
    } else if (type === 'garante') {
         dynamicSections += \`<div class="section-label">DATOS DEL GARANTE</div>\` + renderConyuge(gar);
         dynamicSections += \`<div class="section-label">DATOS DEL CONYUGE DEL GARANTE</div>\` + renderConyuge(conGar);
    }

    const printWindow = window.open('', '_blank');
    
    // Customization: Arial 12pt, normal weights for fields, bold ONLY for .section-label
    const html = \`
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <title>Solicitud - \${s.id}</title>
        <style>
            @page { size: portrait; margin: 5mm 10mm; }
            body { font-family: 'Arial', sans-serif; font-size: 11pt; color: #000; line-height: 1.15; margin: 0; padding: 0; }
            .container { width: 100%; max-width: 800px; margin: auto; padding: 5px 10px; }
            
            /* Header Image 4 Style */
            .header-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 25px; }
            .logo-left { width: 220px; text-align: center; }
            .logo-left img { max-width: 170px; height: auto; display: block; margin: 0 auto; }
            .rnc-center { font-weight: normal; font-size: 11pt; margin-top: 5px; }
            
            .meta-right { width: 330px; font-size: 11pt; margin-top: 5px; }
            .meta-item { display: flex; margin-bottom: 3px; justify-content: space-between; }
            .meta-label { text-align: left; }
            .meta-value { font-weight: normal; text-align: right; }

            /* Sections: ONLY THIS IS BOLD */
            .section-label { font-weight: bold; margin-top: 10px; margin-bottom: 5px; font-size: 11pt; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 2px; }
            
            .two-columns { display: flex; width: 100%; }
            .column { flex: 1; display: flex; flex-direction: column; }
            
            .data-item { display: flex; margin-bottom: 2px; padding: 0; }
            .label { font-weight: normal; width: 170px; text-transform: uppercase; }
            .val { font-weight: normal; flex: 1; }

            /* References Table Style */
            .ref-grid { margin-top: 5px; font-size: 11pt; }
            .ref-header { display: flex; font-weight: normal; margin-bottom: 3px; border-bottom: 1px solid #ccc; padding-bottom: 2px;}
            .ref-row { display: flex; margin-bottom: 2px; }
            .ref-col { flex: 1; }

            /* Signature */
            .sig-area { margin-top: 40px; text-align: center; display: flex; justify-content: \${type === 'garante' ? 'space-around' : 'center'}; }
            .sig-line { width: 250px; border-top: 1px solid #000; padding-top: 5px; font-weight: normal; text-transform: uppercase; font-size: 11pt; }
            .legal-disclaimer { margin-top: 20px; font-size: 8.5pt; color: #444; text-align: center; padding: 0 40px; line-height: 1.1; }
        </style>
    </head>
    <body onload="setTimeout(() => { window.print(); window.close(); }, 1200);">
        <div class="container">
            <div class="header-top">
                <div class="logo-left">
                    <img src="\${portalLogo}">
                    <div class="rnc-center">1-33-34406-8</div>
                </div>
                <div class="meta-right">
                    <div class="meta-item"><span class="meta-label">SOLICITUD NO:</span> <span class="meta-value">\${String(s.id).split('-')[0].toUpperCase()}</span></div>
                    <div class="meta-item"><span class="meta-label">FECHA DE SOLICITUD:</span> <span class="meta-value">\${new Date(s.created_at).toLocaleDateString()}</span></div>
                    <div class="meta-item"><span class="meta-label">MONTO SOLICITADO RD$:</span> <span class="meta-value">\${Number(s.monto).toLocaleString()}</span></div>
                    <div class="meta-item"><span class="meta-label">TIEMPO:</span> <span class="meta-value">\${s.tiempo} MESES</span></div>
                    <div class="meta-item"><span class="meta-label">CUOTA:</span> <span class="meta-value">RD$ \${Number(d.cuota || 0).toLocaleString()}</span></div>
                </div>
            </div>

            \${dynamicSections}

            <div class="section-label">REFERENCIA SONSE</div>
            <div class="ref-grid">
                <div class="ref-header">
                    <div class="ref-col" style="flex:1.5">NOMBRES</div>
                    <div class="ref-col">TELEFONO</div>
                    <div class="ref-col" style="flex:1.5">DIRECCION</div>
                </div>
                \${(d.referencias || []).slice(0, 3).map(r => \`
                    <div class="ref-row">
                        <div class="ref-col" style="flex:1.5">\${r.nombre || ''}</div>
                        <div class="ref-col">\${r.telefono || ''}</div>
                        <div class="ref-col" style="flex:1.5">\${r.direccion || ''}</div>
                    </div>
                \`).join('')}
            </div>

            <div class="sig-area">
                <div class="sig-line">FIRMA DEUDOR</div>
                \${type === 'garante' ? '<div class="sig-line">FIRMA FIADOR</div>' : ''}
            </div>

            <div class="legal-disclaimer">
                El cliente autoriza a la empresa a consultar su información en los buros de crédito por la presente doy constancia de haber leído esta solicitud y que las contestaciones dadas por mí son ciertas y correctas en fe de la cual firmo.
            </div>
        </div>
    </body>
    </html>
    \`;
    
    printWindow.document.write(html);
    printWindow.document.close();
};

window.exportToWord = async (id) => {
    const { data: iconData } = await supabase.from('site_settings').select('value').eq('key', 'portal_icon').single();
    const portalLogo = iconData?.value || '';

    const { data: s, error } = await supabase.from('loan_applications')
        .select('*, clients(*)')
        .eq('id', id)
        .single();
    
    if (error || !s) return;
    const d = s.data || {};
    const sol = d.solicitante || {};
    const con = d.conyuge || {};
    const veh = d.garantiaVehiculo || {};
    const hipo = d.garantiaHipotecaria || {};
    const gar = d.garante || {};
    const conGar = d.conyugeGarante || {};

    const type = s.loan_type || 'personal';

    const buildWordTable = (obj1, obj2, fields1, fields2) => {
        let rows = '';
        const maxLen = Math.max(fields1.length, fields2.length);
        for (let i = 0; i < maxLen; i++) {
            const f1 = fields1[i];
            const f2 = fields2[i];
            const c1 = f1 ? \`<td width="50%"><span class="label">\${f1.l}:</span> \${obj1[f1.k] || ''}</td>\` : '<td width="50%"></td>';
            const c2 = f2 ? \`<td width="50%"><span class="label">\${f2.l}:</span> \${obj2[f2.k] || ''}</td>\` : '<td width="50%"></td>';
            rows += \`<tr>\${c1}\${c2}</tr>\`;
        }
        return \`<table class="data-table" cellspacing="0" cellpadding="0">\${rows}</table>\`;
    };

    const solFields1 = [
        {l:'IDENTIFICADOR',k:'identificador'},{l:'NOMBRES',k:'nombres'},{l:'APELLIDOS',k:'apellidos'},
        {l:'SECTOR',k:'sector'},{l:'CIUDAD',k:'ciudad'},{l:'DIRECCION',k:'direccion'},
        {l:'OCUPACIONES',k:'ocupaciones'},{l:'LUGAR TRABAJO',k:'trabajo'},{l:'CARGO',k:'cargo'},
        {l:'DIR. TRAB',k:'direccionTrabajo'},{l:'SUPERIOR',k:'superior'},{l:'CASA PROPIA/ALQ',k:'tipoCasa'},
        {l:'DESTINO CREDITO',k:'destino'}
    ];
    const solFields2 = [
        {l:'APODO',k:'apodo'},{l:'ESTADO CIVIL',k:'estadoCivil'},{l:'FECHA NAC.',k:'fechaNacimiento'},
        {l:'TELEFONO',k:'telefono'},{l:'EDAD',k:'edad'},{l:'DEPENDIENTE',k:'dependientes'},
        {l:'SEXO',k:'sexo'},{l:'PROFESION',k:'profesion'},{l:'VEHICULO',k:'vehiculo'},
        {l:'TEL TRABAJO',k:'telTrabajo'},{l:'TIEMPO TRABAJO',k:'tiempoTrabajo'},{l:'INGRESOS',k:'ingresos'},
        {l:'OTROS ING',k:'otrosIngresos'}
    ];

    const conFields1 = [
        {l:'NOMBRES',k:'nombres'},{l:'APELLIDOS',k:'apellidos'},{l:'FECHA NAC.',k:'fechaNacimiento'},
        {l:'APODO',k:'apodo'},{l:'ESTADO CIVIL',k:'estadoCivil'},{l:'TELEFONO',k:'telefono'},
        {l:'OCUPACION',k:'ocupacion'}
    ];
    const conFields2 = [
        {l:'LUGAR TRABAJO',k:'trabajo'},{l:'SECTOR',k:'sector'},{l:'DIRECCION',k:'direccion'},
        {l:'SUPERIOR',k:'superior'},{l:'TEL TRABAJO',k:'telTrabajo'},{l:'TIEMPO TRABAJO',k:'tiempoTrabajo'},
        {l:'INGRESOS',k:'ingresos'}
    ];

    const vehFields1 = [
        {l:'RAZON SOCIAL',k:'razonSocial'},{l:'PLACA Y REG',k:'placa'},{l:'FECHA EXP',k:'fechaExpedicion'},
        {l:'CHASIS',k:'chasis'},{l:'ESTATUS VEH',k:'estatus'},{l:'TIPO EMISION',k:'emision'},
        {l:'MATRICULA',k:'matricula'},{l:'FUERZA MOTRIZ',k:'fuerza'},{l:'CILINDROS',k:'cilindros'},
        {l:'CEDULA/RNC',k:'identificador'}
    ];
    const vehFields2 = [
        {l:'TIPO',k:'tipo'},{l:'MARCA',k:'marca'},{l:'MODELO',k:'modelo'},{l:'AÑO FAB.',k:'anio'},
        {l:'COLOR',k:'color'},{l:'MOTOR/SERIE',k:'motorSerie'},{l:'PASAJERO',k:'pasajeros'},
        {l:'CAP CARGA',k:'capCarga'},{l:'NO. PUERTAS',k:'puertas'}
    ];

    let dynamicWord = \`<div class="section">DATOS DE SOLICITANTE</div>\`;
    dynamicWord += buildWordTable(sol, sol, solFields1, solFields2);
    
    dynamicWord += \`<div class="section">DATOS DEL CONYUGE</div>\`;
    dynamicWord += buildWordTable(con, con, conFields1, conFields2);

    if (type === 'vehiculo') {
        dynamicWord += \`<div class="section">DATOS DE GARANTIA</div>\`;
        dynamicWord += buildWordTable(veh, veh, vehFields1, vehFields2);
    } else if (type === 'hipotecario') {
         dynamicWord += \`<div class="section">DATOS DE GARANTIA HIPOTECARIA</div>\`;
         dynamicWord += \`<table class="data-table" cellspacing="0" cellpadding="0">
            <tr><td width="50%"><span class="label">PROPIETARIO:</span> \${hipo.propietario || ''}</td><td width="50%"><span class="label">TIPO INMUEBLE:</span> \${hipo.tipoInmueble || ''}</td></tr>
            <tr><td><span class="label">CEDULA:</span> \${hipo.cedulaRNC || ''}</td><td><span class="label">VALOR:</span> \${hipo.valorAproximado || ''}</td></tr>
         </table>\`;
    } else if (type === 'garante') {
        dynamicWord += \`<div class="section">DATOS DEL GARANTE</div>\`;
        dynamicWord += buildWordTable(gar, gar, conFields1, conFields2); 
        dynamicWord += \`<div class="section">DATOS DEL CONYUGE DEL GARANTE</div>\`;
        dynamicWord += buildWordTable(conGar, conGar, conFields1, conFields2); 
    }

    const content = \`
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'>
    <style>
        body { font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.25; }
        .center { text-align: center; }
        /* ONLY THIS IS BOLD */
        .section { font-weight: bold; margin-top: 15px; margin-bottom: 8px; text-transform: uppercase; border-bottom: 1px solid black; padding-bottom: 2px; }
        table.data-table { width: 100%; font-size: 11pt; margin-bottom: 5px; }
        table.data-table td { padding: 3px 0; vertical-align: top; }
        .label { display: inline-block; width: 140pt; font-weight: normal; } /* Normal as requested */
    </style>
    </head>
    <body>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 25px;">
            <tr>
                <td width="40%" align="center" valign="top">
                    <img src="\${portalLogo}" width="160" height="auto"><br>
                    <span style="font-size: 11pt;">1-33-34406-8</span>
                </td>
                <td width="20%"></td>
                <td width="40%" align="left" valign="top" style="font-size: 11pt; padding-top: 15px;">
                    <p style="margin:4px 0;">SOLICITUD NO: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; \${String(s.id).split('-')[0].toUpperCase()}</p>
                    <p style="margin:4px 0;">FECHA SOLICITUD: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; \${new Date(s.created_at).toLocaleDateString()}</p>
                    <p style="margin:4px 0;">MONTO RD$: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; \${Number(s.monto).toLocaleString()}</p>
                    <p style="margin:4px 0;">TIEMPO: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; \${s.tiempo} MESES</p>
                    <p style="margin:4px 0;">CUOTA: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; RD$ \${Number(d.cuota || 0).toLocaleString()}</p>
                </td>
            </tr>
        </table>

        \${dynamicWord}

        <br><br><br>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
                <td width="\${type === 'garante' ? '50%' : '100%'}" align="center">
                    <p style="margin:0;">__________________________</p>
                    <p style="margin:4px 0 0 0;">FIRMA DEUDOR</p>
                </td>
                \${type === 'garante' ? \`
                <td width="50%" align="center">
                    <p style="margin:0;">__________________________</p>
                    <p style="margin:4px 0 0 0;">FIRMA FIADOR</p>
                </td>
                \` : ''}
            </tr>
        </table>

        <p style="font-size:9pt; margin-top:30px; text-align:center;"><i>El cliente autoriza a la empresa a consultar su información en los buros de crédito por la presente doy constancia de haber leído esta solicitud y que las contestaciones dadas por mí son ciertas y correctas en fe de la cual firmo.</i></p>
    </body></html>\`;

    const blob = new Blob(['\\ufeff', content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = \`Solicitud_\${sol.nombres || 'Expediente'}.doc\`;
    link.click();
};
"""
    
    final_content = content[:start_idx] + new_code + "\n"
    
    with open('src/js/admin.js', 'w', encoding='utf-8') as f:
        f.write(final_content)
    
    print("Replace successful")
else:
    print("Anchor text not found")
