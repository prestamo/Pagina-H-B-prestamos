import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rjstcmowxhlfbualhtao.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqc3RjbW93eGhsZmJ1YWxodGFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwNjM3MTEsImV4cCI6MjA4NTYzOTcxMX0.JpEo5MbBXSEzftVCQqUip8wbH6NcQxX4QEcyUu2HK5M'

export const supabase = createClient(supabaseUrl, supabaseKey)
window.supabase = supabase; // Fallback global logic

/**
 * Genera el cuerpo de correo HTML altamente estructurado y profesional para la solicitud.
 */
export const generateLoanApplicationHtml = (isTest, name, cedula, type, monto, tiempo, cuota, d = {}) => {
    const cleanNum = (val) => {
        if (val === null || val === undefined || val === '' || val === 'NaN' || val === 'NA' || val === 'N/A') return null;
        if (typeof val === 'number') return isNaN(val) ? null : val;
        const cleanStr = String(val).replace(/[^0-9.-]/g, '');
        if (!cleanStr || cleanStr === '-' || cleanStr === '.') return null;
        const num = Number(cleanStr);
        return isNaN(num) ? null : num;
    };

    const formatCurrency = (val) => {
        const num = cleanNum(val);
        if (num !== null) {
            return `RD$ ${num.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
        if (val !== null && val !== undefined && String(val).trim() !== '' && String(val).trim() !== 'NaN') {
            return String(val);
        }
        return '---';
    };

    const freq = d.frecuenciaPago || 'mensual';
    let freqLabel = 'Meses';
    let cuotaLabel = 'CUOTA MENSUAL:';
    if (freq === 'diario') {
        freqLabel = 'Días';
        cuotaLabel = 'CUOTA DIARIA:';
    } else if (freq === 'semanal') {
        freqLabel = 'Semanas';
        cuotaLabel = 'CUOTA SEMANAL:';
    } else if (freq === 'quincenal') {
        freqLabel = 'Quincenas';
        cuotaLabel = 'CUOTA QUINCENAL:';
    } else {
        freqLabel = 'Meses';
        cuotaLabel = 'CUOTA MENSUAL:';
    }

    // Si es un correo de prueba, autocompletar con los datos maqueta de Grismeldy
    if (isTest) {
        name = "GRISMELDY OSKARINA";
        cedula = "402-0916423-1";
        type = "garante";
        monto = 150000;
        tiempo = 12;
        cuota = 15000;
        d = {
            "id": "prueba",
            "solicitante": {
                "nombres": "GRISMELDY OSKARINA",
                "apellidos": "EVANGELISTA DE AMADOR",
                "apodo": "GRISMELDY",
                "identificador": "402-0916423-1",
                "fotoUrl": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=180&fit=crop&q=80",
                "estadoCivil": "Casado(a)",
                "fechaNacimiento": "24/11/2001",
                "telefono": "809-803-1215",
                "edad": "24",
                "dependientes": "2",
                "sexo": "Femenino",
                "profesion": "Estilista",
                "vehiculo": "No",
                "sector": "Sabaneta",
                "ciudad": "La Vega",
                "direccion": "Calle Principal No. 55 antes del Colmado Matica",
                "ocupaciones": "Estilista / Colorista",
                "trabajo": "Salón de Belleza La Moda",
                "cargo": "Administradora / Estilista Principal",
                "direccionTrabajo": "Av. Pedro A. Rivera #12, La Vega",
                "superior": "Yanna Núñez",
                "telTrabajo": "809-573-0000",
                "tiempoTrabajo": "3 Años",
                "ingresos": "25000",
                "otrosIngresos": "5000",
                "tipoCasa": "Alquilada",
                "destino": "Capital de trabajo para salón",
                "chkCliente": true,
                "chkEmpleado": false,
                "chkFuncionario": false,
                "chkAccionista": false
            },
            "conyuge": {
                "nombres": "WASCAR RAFAEL",
                "apellidos": "EVANGELISTA PEGUERO",
                "fechaNacimiento": "15/05/2000",
                "edad": "25",
                "apodo": "Wascar",
                "estadoCivil": "Casado(a)",
                "telefono": "829-808-5760",
                "ocupacion": "Mecánico",
                "trabajo": "Auto Repuestos La Vega",
                "sector": "Sabaneta",
                "direccion": "Calle Principal No. 55",
                "superior": "Juan Pérez",
                "telTrabajo": "829-555-1234",
                "tiempoTrabajo": "5 Años",
                "ingresos": "30000"
            },
            "garante": {
                "identificador": "047-0139257-5",
                "nombres": "WASCAR RAFAEL",
                "apellidos": "EVANGELISTA PEGUERO",
                "fotoUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=180&fit=crop&q=80",
                "apodo": "Wascar",
                "estadoCivil": "Casado(a)",
                "fechaNacimiento": "15/05/2000",
                "edad": "25",
                "telefono": "829-808-5760",
                "sector": "Sabaneta",
                "ciudad": "La Vega",
                "direccion": "Calle Principal, Villa Paraíso frente a la Agroquímica Morill",
                "ocupaciones": "Mecánico de Vehículos",
                "trabajo": "Auto Repuestos La Vega",
                "cargo": "Técnico Mecánico",
                "direccionTrabajo": "Av. Pedro A Rivera #45, La Vega",
                "superior": "José Gómez",
                "telTrabajo": "829-660-8236",
                "tiempoTrabajo": "5 Años",
                "ingresos": "30000",
                "otrosIngresos": "0",
                "tipoCasa": "Propia",
                "destino": "Garantía de préstamo personal",
                "chkCliente": false,
                "chkEmpleado": true,
                "chkFuncionario": false,
                "chkAccionista": false,
                "conyuge": {
                    "nombres": "MILAGROS ALTAGRACIA",
                    "apellidos": "GONZALEZ DE EVANGELISTA",
                    "fechaNacimiento": "12/08/2002",
                    "edad": "23",
                    "apodo": "Mily",
                    "telefono": "809-555-4321",
                    "ocupacion": "Secretaria",
                    "trabajo": "Oficina Dental La Vega",
                    "sector": "Sabaneta",
                    "direccion": "Calle Principal No. 55",
                    "superior": "Dr. Martínez",
                    "telTrabajo": "809-555-8765",
                    "tiempoTrabajo": "2 Años",
                    "ingresos": "18000"
                }
            },
            "referencias": [
                { "nombre": "MARÍA ALTAGRACIA", "telefono": "809-555-0199", "direccion": "Sabaneta, La Vega" },
                { "nombre": "JUAN RAMÓN AMADOR", "telefono": "829-555-0120", "direccion": "Calle Central #12" }
            ]
        };
    }

    const sol = d.solicitante || {};
    const con = d.conyuge || {};
    const gar = d.garante || {};
    const refs = d.referencias || [];

    // Dividir referencias entre cliente y garante si aplica
    let clientRefs = refs;
    let garanteRefs = [];
    if (type === 'garante' || isTest) {
        const splitIndex = refs.length >= 6 ? 3 : Math.ceil(refs.length / 2);
        clientRefs = refs.slice(0, splitIndex);
        garanteRefs = refs.slice(splitIndex);
    }
    const veh = d.garantiaVehiculo || {};
    const hipo = d.garantiaHipotecaria || {};

    const typeLabels = {
        personal: 'Crédito Personal',
        garante: 'Crédito con Garante',
        hipotecario: 'Crédito Hipotecario',
        vehiculo: 'Crédito para Vehículo'
    };
    const prettyType = typeLabels[type] || type || 'No especificado';
    const solicitudId = isTest ? 'BH-TEST-9999' : (Math.floor(Math.random() * 90000) + 10000);
    const dateStr = isTest ? '26/6/2026' : new Date().toLocaleDateString('es-DO');

    // SOLICITANTE FIELD LIST
    const solFields = [
        { label: 'Identificador / Cédula', value: cedula || sol.identificador || '---' },
        { label: 'Nombres', value: sol.nombres || name || '---' },
        { label: 'Apellidos', value: sol.apellidos || '---' },
        { label: 'Apodo', value: sol.apodo || '---' },
        { label: 'Estado Civil', value: sol.estadoCivil || '---' },
        { label: 'Sexo', value: sol.sexo === 'F' ? 'Femenino' : sol.sexo === 'M' ? 'Masculino' : (sol.sexo || '---') },
        { label: 'Dependientes / Hijos', value: (sol.dependientes !== undefined && sol.dependientes !== null && sol.dependientes !== '') ? String(sol.dependientes) : (sol.hijos || '0') },
        { label: 'Fecha de Nacimiento', value: sol.fechaNacimiento || '---' },
        { label: 'Edad', value: sol.edad ? `${sol.edad} Años` : '---' },
        { label: 'Teléfono / Celular', value: sol.telefono || '---' },
        { label: 'Profesión', value: sol.profesion || '---' },
        { label: 'Ocupación', value: sol.ocupaciones || sol.ocupacion || '---' },
        { label: 'Lugar de Trabajo', value: sol.trabajo || '---' },
        { label: 'Cargo', value: sol.cargo || '---' },
        { label: 'Dirección Trabajo', value: sol.direccionTrabajo || '---' },
        { label: 'Superior Inmediato', value: sol.superior || '---' },
        { label: 'Teléfono Trabajo', value: sol.telTrabajo || '---' },
        { label: 'Tiempo Laborando', value: sol.tiempoTrabajo || '---' },
        { label: 'Ingresos Mensuales', value: formatCurrency(sol.ingresos) },
        { label: 'Otros Ingresos', value: formatCurrency(sol.otrosIngresos) },
        { label: 'Vehículo Propio', value: sol.vehiculo || '---' },
        { label: 'Tipo de Casa', value: sol.tipoCasa || '---' },
        { label: 'Sector / Ciudad', value: `${sol.sector || ''}, ${sol.ciudad || ''}`.trim().replace(/^,|,$/, '') || '---' },
        { label: 'Dirección completa', value: sol.direccion || '---' },
        { label: 'Destino del Crédito', value: sol.destino || '---' }
    ];

    // GARANTE FIELD LIST
    const garFields = [
        { label: 'Identificador / Cédula', value: gar.identificador || '---' },
        { label: 'Nombres', value: gar.nombres || '---' },
        { label: 'Apellidos', value: gar.apellidos || '---' },
        { label: 'Apodo', value: gar.apodo || '---' },
        { label: 'Estado Civil', value: gar.estadoCivil || '---' },
        { label: 'Sexo', value: gar.sexo === 'F' ? 'Femenino' : gar.sexo === 'M' ? 'Masculino' : (gar.sexo || '---') },
        { label: 'Dependientes / Hijos', value: (gar.dependientes !== undefined && gar.dependientes !== null && gar.dependientes !== '') ? String(gar.dependientes) : (gar.hijos || '0') },
        { label: 'Fecha de Nacimiento', value: gar.fechaNacimiento || '---' },
        { label: 'Edad', value: gar.edad ? `${gar.edad} Años` : '---' },
        { label: 'Teléfono / Celular', value: gar.telefono || '---' },
        { label: 'Profesión', value: gar.profesion || '---' },
        { label: 'Ocupación', value: gar.ocupaciones || gar.ocupacion || '---' },
        { label: 'Lugar de Trabajo', value: gar.trabajo || '---' },
        { label: 'Cargo', value: gar.cargo || '---' },
        { label: 'Dirección Trabajo', value: gar.direccionTrabajo || '---' },
        { label: 'Superior Inmediato', value: gar.superior || '---' },
        { label: 'Teléfono Trabajo', value: gar.telTrabajo || '---' },
        { label: 'Tiempo Laborando', value: gar.tiempoTrabajo || '---' },
        { label: 'Ingresos Mensuales', value: formatCurrency(gar.ingresos) },
        { label: 'Otros Ingresos', value: formatCurrency(gar.otrosIngresos) },
        { label: 'Vehículo Propio', value: gar.vehiculo || '---' },
        { label: 'Tipo de Casa', value: gar.tipoCasa || '---' },
        { label: 'Sector / Ciudad', value: `${gar.sector || ''}, ${gar.ciudad || ''}`.trim().replace(/^,|,$/, '') || '---' },
        { label: 'Dirección completa', value: gar.direccion || '---' },
        { label: 'Destino del Crédito', value: gar.destino || '---' }
    ];

    // FUNCIÓN AUXILIAR PARA RENDERIZAR CÓNYUGE INTEGRADO
    const renderSpouseInline = (spouseData, isGaranteSpouse = false) => {
        if (!spouseData || (!spouseData.nombres && !spouseData.apellidos)) return '';
        
        const spouseTitle = isGaranteSpouse ? 'DATOS DEL CÓNYUGE DEL GARANTE:' : 'DATOS DEL CÓNYUGE:';

        const fields = [
            { label: 'Nombres Cónyuge', value: spouseData.nombres || '---' },
            { label: 'Apellidos Cónyuge', value: spouseData.apellidos || '---' },
            { label: 'Apodo', value: spouseData.apodo || '---' },
            { label: 'Teléfono', value: spouseData.telefono || '---' },
            { label: 'Fecha Nacimiento', value: spouseData.fechaNacimiento || '---' },
            { label: 'Edad', value: spouseData.edad ? `${spouseData.edad} Años` : '---' },
            { label: 'Estado Civil', value: spouseData.estadoCivil || '---' },
            { label: 'Profesión / Ocupación', value: spouseData.ocupacion || spouseData.profesion || '---' },
            { label: 'Lugar de Trabajo', value: spouseData.trabajo || '---' },
            { label: 'Dirección Trabajo', value: spouseData.direccionTrabajo || spouseData.trabajo || '---' },
            { label: 'Superior Inmediato', value: spouseData.superior || '---' },
            { label: 'Teléfono Trabajo', value: spouseData.telTrabajo || '---' },
            { label: 'Tiempo Laborando', value: spouseData.tiempoTrabajo || '---' },
            { label: 'Ingresos Mensuales', value: formatCurrency(spouseData.ingresos) },
            { label: 'Sector / Dirección', value: `${spouseData.sector || ''}, ${spouseData.direccion || ''}`.trim().replace(/^,|,$/, '') || '---' }
        ];

        const colsCount = 3;
        const rowsCount = Math.ceil(fields.length / colsCount);
        let rowsHtml = '';
        for (let r = 0; r < rowsCount; r++) {
            rowsHtml += '<tr style="border-bottom: 1px solid #f1f5f9;">';
            for (let c = 0; c < colsCount; c++) {
                const idx = r * colsCount + c;
                const f = fields[idx] || { label: '', value: '' };
                rowsHtml += `
                    <td style="padding: 1.5px 1px; font-weight: bold; color: #475569; width: 14%; font-size: 9.5px; text-transform: uppercase;">${f.label ? f.label + ':' : ''}</td>
                    <td style="padding: 1.5px 2px; color: #1e293b; width: 19%; font-size: 10.5px; font-weight: 600;">${f.value || ''}</td>
                `;
            }
            rowsHtml += '</tr>';
        }

        return `
        <div style="border-top: 1.5px dashed #cbd5e1; margin-top: 4px; padding-top: 4px;">
            <span style="font-weight: bold; color: #0f172a; text-transform: uppercase; font-size: 9.5px; display: block; margin-bottom: 2px; letter-spacing: 0.05em;">${spouseTitle}</span>
            <table style="width: 100%; border-collapse: collapse;">
                ${rowsHtml}
            </table>
        </div>
        `;
    };

    // FUNCIÓN AUXILIAR PARA RENDERIZAR TARJETA DE DATOS (3 COLUMNAS, CON CÓNYUGE INTEGRADO Y OPCIONALMENTE FOTO)
    const renderPersonCard = (title, fields, chk, spouseData, photoUrl, isGarante = false) => {
        const colsCount = 3;
        const rowsCount = Math.ceil(fields.length / colsCount);

        let rowsHtml = '';
        for (let r = 0; r < rowsCount; r++) {
            rowsHtml += '<tr style="border-bottom: 1px solid #f1f5f9;">';
            for (let c = 0; c < colsCount; c++) {
                const idx = r * colsCount + c;
                const f = fields[idx] || { label: '', value: '' };
                rowsHtml += `
                    <td style="padding: 1.5px 1px; font-weight: bold; color: #475569; width: 14%; font-size: 9.5px; text-transform: uppercase;">${f.label ? f.label + ':' : ''}</td>
                    <td style="padding: 1.5px 2px; color: #1e293b; width: 19%; font-size: 10.5px; font-weight: 600;">${f.value || ''}</td>
                `;
            }
            rowsHtml += '</tr>';
        }

        const checkPill = (isActive, label) => {
            const bg = isActive ? '#e0f2fe' : '#f8fafc';
            const border = isActive ? '#bae6fd' : '#e2e8f0';
            const color = isActive ? '#0369a1' : '#94a3b8';
            const icon = isActive ? '☒' : '☐';
            return `
                <td style="padding: 1.5px 4px; background-color: ${bg}; border-radius: 4px; border: 1px solid ${border}; text-align: center; color: ${color}; font-weight: 700; font-size: 10px; text-transform: uppercase; width: 23%;">
                    <span style="font-size: 11px; margin-right: 2px;">${icon}</span> ${label}
                </td>
            `;
        };

        const spouseHtml = renderSpouseInline(spouseData, isGarante);

        const photoHtml = photoUrl ? `
            <td style="width: 80px; padding-right: 10px; vertical-align: top; text-align: center;">
                <div style="border: 2px solid #cbd5e1; border-radius: 6px; overflow: hidden; background-color: #f8fafc; height: 80px; width: 70px; text-align: center; margin: 0 auto 4px auto;">
                    <img src="${photoUrl}" style="width: 100%; height: 100%; object-fit: cover; display: block;" alt="Foto Perfil">
                </div>
            </td>
        ` : '';

        return `
        <div style="background-color: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
            <h3 style="color: #0f172a; margin-top: 0; margin-bottom: 4px; font-size: 11.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #00aeef; padding-bottom: 2px; display: inline-block;">
                ${title}
            </h3>
            
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    ${photoHtml}
                    <td style="vertical-align: top;">
                        <table style="width: 100%; border-collapse: collapse;">
                            ${rowsHtml}
                        </table>
                        
                        ${chk ? `
                        <table style="width: 100%; margin-top: 4px; border-collapse: collapse;">
                            <tr>
                                ${checkPill(chk.chkCliente, 'Cliente')}
                                <td style="width: 2%;"></td>
                                ${checkPill(chk.chkEmpleado, 'Empleado')}
                                <td style="width: 2%;"></td>
                                ${checkPill(chk.chkFuncionario, 'Funcionario')}
                                <td style="width: 2%;"></td>
                                ${checkPill(chk.chkAccionista, 'Accionista')}
                            </tr>
                        </table>
                        ` : ''}
                    </td>
                </tr>
            </table>

            ${spouseHtml}
        </div>
        `;
    };

    // FUNCIÓN AUXILIAR PARA GENERAR LA CABECERA COMPARTIDA
    const renderHeaderSinglePage = (solPhotoUrl) => {
        const finalSolPhoto = solPhotoUrl || 'https://placehold.co/100x80/cbd5e1/475569?text=Sin+Foto';
        
        let logoUrl = d.portalLogo || 'https://files.catbox.moe/yz89qv.png';
        if (logoUrl.startsWith('.')) {
            logoUrl = logoUrl.replace(/^\.+/, '');
        }
        if (logoUrl.startsWith('/')) {
            if (d.isEmail || typeof window === 'undefined') {
                logoUrl = 'https://files.catbox.moe/yz89qv.png';
            } else {
                logoUrl = window.location.origin + logoUrl;
            }
        }

        return `
        <table style="width: 100%; border-collapse: collapse; background-color: #ffffff; border-bottom: 3.5px solid #00aeef; margin-bottom: 8px;">
            <tr style="vertical-align: middle;">
                <!-- Foto Solicitante -->
                <td style="width: 80px; padding: 4px 8px 4px 4px; vertical-align: middle; text-align: center; border-right: 1.5px solid #e2e8f0;">
                    <div style="border: 2px solid #cbd5e1; border-radius: 6px; overflow: hidden; background-color: #f8fafc; height: 80px; width: 70px; text-align: center; margin: 0 auto;">
                        <img src="${finalSolPhoto}" style="width: 100%; height: 100%; object-fit: cover; display: block;" alt="Foto Deudor">
                    </div>
                    <span style="font-size: 9px; font-weight: bold; color: #64748b; text-transform: uppercase; display: block; margin-top: 2px;">Deudor</span>
                </td>
                
                <!-- Datos del Préstamo -->
                <td style="vertical-align: middle; font-size: 12px; padding: 4px 8px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 1px 0; font-weight: bold; color: #475569; text-transform: uppercase; font-size: 9.5px; width: 110px;">SOLICITUD:</td>
                            <td style="padding: 1px 0; color: #00aeef; font-weight: 800; font-size: 13px; text-transform: uppercase;">${prettyType}</td>
                        </tr>
                        <tr>
                            <td style="padding: 1px 0; font-weight: bold; color: #475569; text-transform: uppercase; font-size: 9.5px;">SOLICITUD NO:</td>
                            <td style="padding: 1px 0; color: #0f172a; font-weight: 700; font-size: 12px;">${solicitudId}</td>
                            <td style="padding: 1px 0; font-weight: bold; color: #475569; text-transform: uppercase; font-size: 9.5px; width: 50px;">FECHA:</td>
                            <td style="padding: 1px 0; color: #0f172a; font-weight: 700; font-size: 12px;">${dateStr}</td>
                        </tr>
                        <tr>
                            <td style="padding: 1px 0; font-weight: bold; color: #475569; text-transform: uppercase; font-size: 9.5px;">MONTO:</td>
                            <td style="padding: 1px 0; color: #0f172a; font-weight: 800; font-size: 13px;">RD$ ${Number(monto).toLocaleString()}</td>
                            <td style="padding: 1px 0; font-weight: bold; color: #475569; text-transform: uppercase; font-size: 9.5px;">PLAZO / TIEMPO:</td>
                            <td style="padding: 1px 0; color: #0f172a; font-weight: 700; font-size: 12px;">${tiempo} ${freqLabel.toUpperCase()}</td>
                        </tr>
                        <tr>
                            <td style="padding: 1px 0; font-weight: bold; color: #475569; text-transform: uppercase; font-size: 9.5px;">${cuotaLabel}</td>
                            <td style="padding: 1px 0; color: #00aeef; font-weight: 800; font-size: 13px;" colspan="3">RD$ ${Number(cuota).toLocaleString()}</td>
                        </tr>
                    </table>
                </td>

                <!-- Logo de la Empresa -->
                <td style="width: 100px; padding: 4px 4px 4px 8px; vertical-align: middle; text-align: center; border-left: 1.5px solid #e2e8f0;">
                    <img src="${logoUrl}" style="height: 60px; width: 60px; object-fit: contain; display: block; margin: 0 auto 2px auto;" alt="Logo B&H">
                    <span style="font-size: 8px; font-weight: bold; color: #0f172a; text-transform: uppercase; display: block;">B&H PRÉSTAMOS</span>
                </td>
            </tr>
        </table>
        `;
    };

    // GENERAR CONTENIDO DE VEHÍCULO
    let vehiculoSectionHtml = '';
    if (type === 'vehiculo' && (veh.placa || isTest)) {
        const vehFields = [
            { label: 'Razon Social', value: veh.razonSocial || '---' },
            { label: 'Placa', value: veh.placa || '---' },
            { label: 'Fecha Expedición', value: veh.fechaExpedicion || '---' },
            { label: 'Chasis', value: veh.chasis || '---' },
            { label: 'Estatus', value: veh.estatus || '---' },
            { label: 'Emisión', value: veh.emision || '---' },
            { label: 'Matrícula', value: veh.matricula || '---' },
            { label: 'Tipo Vehículo', value: veh.tipo || '---' },
            { label: 'Marca / Modelo', value: `${veh.marca || ''} ${veh.modelo || ''}`.trim() || '---' },
            { label: 'Año / Color', value: `${veh.anio || ''} / ${veh.color || ''}`.trim().replace(/^\/|\/$/, '') || '---' },
            { label: 'Motor Serie', value: veh.motorSerie || '---' },
            { label: 'Cilindros / Puertas', value: `${veh.cilindros || ''} Cil. / ${veh.puertas || ''} Pts` }
        ];
        let vehRows = '';
        const half = Math.ceil(vehFields.length / 2);
        const leftVeh = vehFields.slice(0, half);
        const rightVeh = vehFields.slice(half);
        for (let i = 0; i < Math.max(leftVeh.length, rightVeh.length); i++) {
            const lf = leftVeh[i] || { label: '', value: '' };
            const rf = rightVeh[i] || { label: '', value: '' };
            vehRows += `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 2px 2px; font-weight: bold; color: #475569; width: 22%; font-size: 10px; text-transform: uppercase;">${lf.label}:</td>
                    <td style="padding: 2px 2px; color: #1e293b; width: 28%; font-size: 11px; font-weight: 600;">${lf.value}</td>
                    <td style="padding: 2px 2px; font-weight: bold; color: #475569; width: 22%; font-size: 10px; text-transform: uppercase;">${rf.label}:</td>
                    <td style="padding: 2px 2px; color: #1e293b; width: 28%; font-size: 11px; font-weight: 600;">${rf.value}</td>
                </tr>
            `;
        }
        vehiculoSectionHtml = `
        <div style="background-color: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
            <h3 style="color: #0f172a; margin-top: 0; margin-bottom: 4px; font-size: 11.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #00aeef; padding-bottom: 2px; display: inline-block;">
                DATOS DE GARANTÍA DE VEHÍCULO
            </h3>
            <table style="width: 100%; border-collapse: collapse;">
                ${vehRows}
            </table>
        </div>
        `;
    }

    // GENERAR CONTENIDO DE HIPOTECA
    let hipotecaSectionHtml = '';
    if (type === 'hipotecario' && (hipo.propietario || isTest)) {
        const hipoFields = [
            { label: 'Propietario', value: hipo.propietario || '---' },
            { label: 'Distrito Catastral', value: hipo.distritoCatastral || '---' },
            { label: 'Fecha Expedición', value: hipo.fechaExpedicion || '---' },
            { label: 'Libro / Folio', value: `${hipo.libro || '---'} / ${hipo.folio || '---'}` },
            { label: 'Provincia / Ciudad', value: `${hipo.provincia || ''}, ${hipo.ciudad || ''}`.trim().replace(/^,|,$/, '') || '---' },
            { label: 'Parcela / Área', value: `${hipo.parcela || '---'} / ${hipo.area || '---'}` },
            { label: 'Cédula / RNC Prop.', value: hipo.cedulaRNC || '---' },
            { label: 'Certificado Título', value: hipo.certificadoTitulo || '---' },
            { label: 'Dirección Inmueble', value: hipo.direccion || '---' },
            { label: 'Descripción Inmueble', value: hipo.descripcion || '---' }
        ];
        let hipoRows = '';
        const half = Math.ceil(hipoFields.length / 2);
        const leftHipo = hipoFields.slice(0, half);
        const rightHipo = hipoFields.slice(half);
        for (let i = 0; i < Math.max(leftHipo.length, rightHipo.length); i++) {
            const lf = leftHipo[i] || { label: '', value: '' };
            const rf = rightHipo[i] || { label: '', value: '' };
            hipoRows += `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 2px 2px; font-weight: bold; color: #475569; width: 22%; font-size: 10px; text-transform: uppercase;">${lf.label}:</td>
                    <td style="padding: 2px 2px; color: #1e293b; width: 28%; font-size: 11px; font-weight: 600;">${lf.value}</td>
                    <td style="padding: 2px 2px; font-weight: bold; color: #475569; width: 22%; font-size: 10px; text-transform: uppercase;">${rf.label}:</td>
                    <td style="padding: 2px 2px; color: #1e293b; width: 28%; font-size: 11px; font-weight: 600;">${rf.value}</td>
                </tr>
            `;
        }
        hipotecaSectionHtml = `
        <div style="background-color: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
            <h3 style="color: #0f172a; margin-top: 0; margin-bottom: 4px; font-size: 11.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #00aeef; padding-bottom: 2px; display: inline-block;">
                DATOS DE GARANTÍA HIPOTECARIA
            </h3>
            <table style="width: 100%; border-collapse: collapse;">
                ${hipoRows}
            </table>
        </div>
        `;
    }

    // GENERAR REFERENCIAS DEL CLIENTE
    let refsRowsHtml = '';
    if (clientRefs.length > 0) {
        clientRefs.forEach(r => {
            refsRowsHtml += `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 2px; color: #1e293b; font-size: 12px; font-weight: 600;">${r.nombre || '---'}</td>
                    <td style="padding: 2px; color: #1e293b; font-size: 12px; font-family: monospace;">${r.telefono || '---'}</td>
                    <td style="padding: 2px; color: #64748b; font-size: 11px;">${r.direccion || '---'}</td>
                </tr>
            `;
        });
    } else {
        refsRowsHtml = `
            <tr>
                <td colspan="3" style="padding: 6px; text-align: center; color: #94a3b8; font-size: 12px; font-style: italic;">
                    No se agregaron referencias personales
                </td>
            </tr>
        `;
    }

    const refsSectionHtml = `
    <div style="background-color: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 6px 10px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); height: 100%; box-sizing: border-box;">
        <h3 style="color: #0f172a; margin-top: 0; margin-bottom: 4px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #00aeef; padding-bottom: 2px; display: inline-block;">
            REFERENCIAS DEL CLIENTE
        </h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px; text-align: left;">
            <thead>
                <tr style="background-color: #f8fafc; border-bottom: 1.5px solid #cbd5e1;">
                    <th style="padding: 2px; font-weight: bold; color: #475569; text-transform: uppercase; font-size: 9.5px;">Nombre</th>
                    <th style="padding: 2px; font-weight: bold; color: #475569; text-transform: uppercase; font-size: 9.5px;">Teléfono</th>
                    <th style="padding: 2px; font-weight: bold; color: #475569; text-transform: uppercase; font-size: 9.5px;">Dirección</th>
                </tr>
            </thead>
            <tbody>
                ${refsRowsHtml}
            </tbody>
        </table>
    </div>
    `;

    // GENERAR REFERENCIAS DEL GARANTE
    let garanteRefsSectionHtml = '';
    if (type === 'garante' || isTest) {
        let garRefsRowsHtml = '';
        if (garanteRefs.length > 0) {
            garanteRefs.forEach(r => {
                garRefsRowsHtml += `
                    <tr style="border-bottom: 1px solid #e2e8f0;">
                        <td style="padding: 2px; color: #1e293b; font-size: 12px; font-weight: 600;">${r.nombre || '---'}</td>
                        <td style="padding: 2px; color: #1e293b; font-size: 12px; font-family: monospace;">${r.telefono || '---'}</td>
                        <td style="padding: 2px; color: #64748b; font-size: 11px;">${r.direccion || '---'}</td>
                    </tr>
                `;
            });
        } else {
            garRefsRowsHtml = `
                <tr>
                    <td colspan="3" style="padding: 6px; text-align: center; color: #94a3b8; font-size: 12px; font-style: italic;">
                        No se agregaron referencias personales
                    </td>
                </tr>
            `;
        }

        garanteRefsSectionHtml = `
        <div style="background-color: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 6px 10px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); height: 100%; box-sizing: border-box;">
            <h3 style="color: #0f172a; margin-top: 0; margin-bottom: 4px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #00aeef; padding-bottom: 2px; display: inline-block;">
                REFERENCIAS DEL FIADOR / CO-DEUDOR
            </h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 11px; text-align: left;">
                <thead>
                    <tr style="background-color: #f8fafc; border-bottom: 1.5px solid #cbd5e1;">
                        <th style="padding: 2px; font-weight: bold; color: #475569; text-transform: uppercase; font-size: 9.5px;">Nombre</th>
                        <th style="padding: 2px; font-weight: bold; color: #475569; text-transform: uppercase; font-size: 9.5px;">Teléfono</th>
                        <th style="padding: 2px; font-weight: bold; color: #475569; text-transform: uppercase; font-size: 9.5px;">Dirección</th>
                    </tr>
                </thead>
                <tbody>
                    ${garRefsRowsHtml}
                </tbody>
            </table>
        </div>
        `;
    }

    // CONFIGURACIÓN DE SECCIÓN DE DEUDOR
    const chkSol = {
        chkCliente: sol.chkCliente !== undefined ? sol.chkCliente : true,
        chkEmpleado: sol.chkEmpleado !== undefined ? sol.chkEmpleado : false,
        chkFuncionario: sol.chkFuncionario !== undefined ? sol.chkFuncionario : false,
        chkAccionista: sol.chkAccionista !== undefined ? sol.chkAccionista : false
    };

    const clientHeaderHtml = renderHeaderSinglePage(sol.fotoUrl);
    const solicitanteSectionHtml = renderPersonCard('DATOS DE SOLICITANTE', solFields, chkSol, con);

    // CONFIGURACIÓN DE SECCIÓN DE GARANTE
    let garanteSectionHtml = '';
    if (type === 'garante' || isTest) {
        const chkGar = {
            chkCliente: gar.chkCliente !== undefined ? gar.chkCliente : false,
            chkEmpleado: gar.chkEmpleado !== undefined ? gar.chkEmpleado : true,
            chkFuncionario: gar.chkFuncionario !== undefined ? gar.chkFuncionario : false,
            chkAccionista: gar.chkAccionista !== undefined ? gar.chkAccionista : false
        };
        garanteSectionHtml = renderPersonCard('DATOS DEL FIADOR / CO-DEUDOR', garFields, chkGar, gar.conyuge, gar.fotoUrl, true);
    }

    // REFERENCIAS PERSONALES SIDE-BY-SIDE
    let referencesBlockHtml = '';
    if (type === 'garante' || isTest) {
        referencesBlockHtml = `
        <div style="display: flex; gap: 8px; margin-bottom: 6px;">
            <div style="flex: 1; min-width: 0;">
                ${refsSectionHtml}
            </div>
            <div style="flex: 1; min-width: 0;">
                ${garanteRefsSectionHtml}
            </div>
        </div>
        `;
    } else {
        referencesBlockHtml = `
        <div style="margin-bottom: 6px;">
            ${refsSectionHtml}
        </div>
        `;
    }

    // BLOQUE DE FIRMAS EN PARALELO
    const signaturesHtml = `
    <div style="background-color: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 4px 10px; margin-bottom: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
        <table style="width: 100%; border-collapse: collapse;">
            <tr>
                <td style="width: 48%; text-align: center; padding: 2px;">
                    <div style="width: 80%; border-bottom: 1.5px solid #94a3b8; margin: 8px auto 2px auto;"></div>
                    <span style="font-size: 9.5px; font-weight: bold; color: #475569; text-transform: uppercase; letter-spacing: 0.05em;">FIRMA DEUDOR</span>
                </td>
                ${type === 'garante' || isTest ? `
                <td style="width: 4%;"></td>
                <td style="width: 48%; text-align: center; padding: 2px;">
                    <div style="width: 80%; border-bottom: 1.5px solid #94a3b8; margin: 8px auto 2px auto;"></div>
                    <span style="font-size: 9.5px; font-weight: bold; color: #475569; text-transform: uppercase; letter-spacing: 0.05em;">FIRMA FIADOR</span>
                </td>
                ` : ''}
            </tr>
        </table>
    </div>
    `;

    // BLOQUE DE TÉRMINOS LEGALES
    const termsHtml = `
    <div style="padding: 4px 8px; border-radius: 8px; background-color: #f1f5f9; border: 1px dashed #cbd5e1; text-align: justify; margin-bottom: 6px;">
        <table style="width: 100%; border-collapse: collapse;">
            <tr>
                <td style="vertical-align: top; width: ${type === 'garante' || isTest ? '48%' : '100%'}; font-size: 9px; color: #64748b; line-height: 1.2; font-style: italic; font-weight: 500;">
                    <strong>DEUDOR:</strong> El cliente autoriza a la empresa a consultar su información en los burós de crédito. Por la presente doy constancia de haber leído esta solicitud y que las contestaciones dadas por mí son ciertas y correctas en fe de lo cual firmo.
                </td>
                ${type === 'garante' || isTest ? `
                <td style="width: 4%;"></td>
                <td style="vertical-align: top; width: 48%; font-size: 9px; color: #64748b; line-height: 1.2; font-style: italic; font-weight: 500;">
                    <strong>FIADOR:</strong> El fiador/co-deudor autoriza a la empresa a consultar su información en los burós de crédito. Se constituye en fiador solidario e indivisible de las obligaciones del deudor principal firmando el presente documento en señal de conformidad.
                </td>
                ` : ''}
            </tr>
        </table>
    </div>
    `;

    const pageContentHtml = `
    <!-- PÁGINA ÚNICA DE SOLICITUD -->
    <div class="page-container" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 800px; margin: 0 auto; border: 1px solid #cbd5e1; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); background-color: #ffffff; padding: 12px; box-sizing: border-box;">
        ${clientHeaderHtml}
        
        <div style="padding: 0;">
            ${solicitanteSectionHtml}
            ${garanteSectionHtml}
            ${vehiculoSectionHtml}
            ${hipotecaSectionHtml}
            ${referencesBlockHtml}
            ${signaturesHtml}
            ${termsHtml}
        </div>

        <!-- Pie de Página -->
        <div style="background-color: #0f172a; padding: 6px; text-align: center; margin-top: 6px; border-radius: 8px;">
            <p style="color: #94a3b8; font-size: 10px; margin: 0; text-transform: uppercase; letter-spacing: 0.1em; font-weight: bold;">
                &copy; 2026 B&H Préstamos | Transparencia & Seguridad de Datos (Página 1 de 1)
            </p>
        </div>
    </div>
    `;

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            @media print {
                body {
                    background-color: #ffffff !important;
                    margin: 0 !important;
                    padding: 0 !important;
                }
                .page-container {
                    border: none !important;
                    box-shadow: none !important;
                    background-color: #ffffff !important;
                    padding: 0 !important;
                    margin: 0 !important;
                    page-break-after: avoid !important;
                    break-after: avoid !important;
                    page-break-inside: avoid !important;
                }
                .no-print {
                    display: none !important;
                }
            }
        </style>
    </head>
    <body style="background-color: #f1f5f9; padding: 20px; margin: 0;">
        <!-- Botón de versión limpia para impresión / PDF (se oculta al imprimir) -->
        <div class="no-print" style="text-align: center; margin-bottom: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 12px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; max-width: 600px; margin-left: auto; margin-right: auto; box-sizing: border-box;">
            <h4 style="margin: 0 0 4px 0; color: #1e293b; font-size: 14px; font-weight: bold;">¿Deseas imprimir o descargar como PDF sin las cabeceras del correo?</h4>
            <p style="margin: 0 0 10px 0; color: #64748b; font-size: 11px; line-height: 1.4;">
                Los gestores de correo (como Gmail o Outlook) agregan datos y cabeceras extra al imprimir. Haz clic en el botón de abajo para abrir una versión limpia desde el panel administrativo e imprimir directamente.
            </p>
            
            <div style="margin-bottom: 10px;">
                ${d && d.id ? `
                <a href="${(typeof window !== 'undefined' && window.location) ? window.location.origin : 'https://byhprestamos.com'}/admin/solicitudes_list.html?print=${d.id}" target="_blank" style="background-color: #00aeef; color: #ffffff; text-decoration: none; padding: 10px 24px; font-size: 14px; font-weight: bold; border-radius: 8px; display: inline-block; box-shadow: 0 3px 5px rgba(0,0,0,0.1);">
                    🖨️ Abrir Versión Limpia para Imprimir / PDF
                </a>
                ` : `
                <span style="background-color: #94a3b8; color: #ffffff; padding: 10px 24px; font-size: 14px; font-weight: bold; border-radius: 8px; display: inline-block;">
                    🖨️ Versión Limpia no disponible en Vista de Prueba
                </span>
                `}
            </div>

            <div style="border-top: 1px solid #e2e8f0; padding-top: 8px; margin-top: 8px;">
                <p style="margin: 0 0 6px 0; color: #64748b; font-size: 10px; font-weight: 500;">
                    Si descargaste este correo como archivo HTML y lo abres en el navegador, usa esta opción:
                </p>
                <button onclick="window.print()" style="background-color: #ffffff; color: #475569; border: 1px solid #cbd5e1; padding: 4px 12px; font-size: 12px; font-weight: bold; border-radius: 6px; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.05); transition: background-color 0.2s;">
                    Imprimir archivo HTML local
                </button>
            </div>
        </div>
        ${pageContentHtml}
    </body>
    </html>
    `;
};

/**
 * Envía una notificación de solicitud de préstamo a través del API de Brevo.
 */
export const sendBrevoNotification = async (monto, tiempo, cuota, type, name, cedula, data = {}) => {
    try {
        const { data: configRecord, error } = await supabase
            .from('promotions')
            .select('*')
            .eq('title', 'CONFIG_EMAIL')
            .maybeSingle();

        if (error) {
            console.error('Error fetching email configuration:', error);
            return;
        }

        let config = {
            enabled: true,
            brevo_key: '',
            sender_email: 'josegrullat.byhprestamoengeneral@outlook.com',
            sender_name: 'B&H Préstamos',
            recipient_email: 'josegrullat.byhprestamoengeneral@outlook.com'
        };

        if (configRecord && configRecord.description) {
            const desc = typeof configRecord.description === 'string' ? JSON.parse(configRecord.description) : configRecord.description;
            config = { ...config, ...desc };
        }

        if (!config.enabled || !config.brevo_key) {
            console.log('Brevo notification is disabled or API key is missing.');
            return;
        }

        // Obtener el logo de la empresa para incluirlo en el correo
        try {
            const { data: iconData } = await supabase.from('site_settings').select('value').eq('key', 'portal_icon').maybeSingle();
            if (iconData && iconData.value) {
                data.portalLogo = iconData.value;
            }
        } catch (logoErr) {
            console.error('Error fetching portal logo for email:', logoErr);
        }
        data.isEmail = true;

        const subject = `Nueva Solicitud de Préstamo - ${name}`;
        const htmlContent = generateLoanApplicationHtml(false, name, cedula, type, monto, tiempo, cuota, data);

        const formatRecipients = (emailStr) => {
            if (!emailStr) return [];
            return String(emailStr)
                .split(/[,;]/)
                .map(e => e.trim())
                .filter(Boolean)
                .map(email => ({ email }));
        };

        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': config.brevo_key,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                sender: {
                    name: String(config.sender_name || 'B&H Préstamos').trim(),
                    email: String(config.sender_email || '').trim()
                },
                to: formatRecipients(config.recipient_email),
                subject: subject,
                htmlContent: htmlContent
            })
        });

        if (!response.ok) {
            const errBody = await response.text();
            throw new Error(`HTTP ${response.status}: ${errBody}`);
        }

        console.log('Brevo notification sent successfully!');
    } catch (e) {
        console.error('Error sending Brevo notification:', e);
    }
};

/**
 * Envía un correo electrónico de prueba utilizando la configuración de Brevo provista.
 */
export const sendBrevoTestEmail = async (config) => {
    const subject = "Prueba de Configuración (Maqueta Completa) - B&H Préstamos";
    
    // Obtener el logo de la empresa para el correo de prueba
    let portalLogo = '';
    try {
        const { data: iconData } = await supabase.from('site_settings').select('value').eq('key', 'portal_icon').maybeSingle();
        if (iconData && iconData.value) {
            portalLogo = iconData.value;
        }
    } catch (e) {
        console.error('Error fetching portal logo for test email:', e);
    }

    const htmlContent = generateLoanApplicationHtml(true, null, null, null, null, null, null, { isEmail: true, portalLogo });

    const formatRecipients = (emailStr) => {
        if (!emailStr) return [];
        return String(emailStr)
            .split(/[,;]/)
            .map(e => e.trim())
            .filter(Boolean)
            .map(email => ({ email }));
    };

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'api-key': config.brevo_key,
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            sender: {
                name: String(config.sender_name || 'B&H Préstamos').trim(),
                email: String(config.sender_email || '').trim()
            },
            to: formatRecipients(config.recipient_email),
            subject: subject,
            htmlContent: htmlContent
        })
    });

    if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`HTTP ${response.status}: ${errBody}`);
    }
    return true;
};

/**
 * Funciones de ayuda para obtener contenido dinámico
 */
export const getBanners = async () => {
    const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('is_visible', true)
    return { data, error }
}

export const getCarouselImages = async () => {
    const { data, error } = await supabase
        .from('carousel')
        .select('*')
        .eq('active', true)
        .order('order', { ascending: true })
    return { data, error }
}

export const getPromotions = async () => {
    const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('active', true)
    return { data, error }
}
