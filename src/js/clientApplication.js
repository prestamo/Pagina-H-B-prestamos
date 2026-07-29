import { supabase, sendBrevoNotification } from './supabase.js';

export function initClientApplication() {
    const form = document.getElementById('clientSolicitudForm');
    if (!form) return;

    const saveBtn = document.getElementById('saveSolicitudBtn');
    const refTableBody = document.getElementById('referenciasTableBody');
    const tipoPrestamoSelect = document.getElementById('tipoPrestamo');
    const fechaSolicitudInput = document.getElementById('fechaSolicitud');

    setToday(fechaSolicitudInput);
    setupJceLookup('buscarJceBtn', 'identificador', 'Sol');
    setupJceLookup('buscarJceGarBtn', 'identificadorGar', 'Gar');
    setupConditionalSections(tipoPrestamoSelect);
    setupMasks(form);
    setupAgeValidation('fechaNacimientoSol', 'edadSol');
    setupAgeValidation('fechaNacimientoCon', 'edadCon');
    setupAgeValidation('fechaNacimientoGar', 'edadGar');
    setupAgeValidation('fechaNacimientoConGar', 'edadConGar');
    setupReferenceRows(refTableBody);

    const frecuenciaPagoSelect = document.getElementById('frecuenciaPago');
    const labelTiempoPrestamo = document.getElementById('labelTiempoPrestamo');
    if (frecuenciaPagoSelect && labelTiempoPrestamo) {
        const isEnglish = window.location.pathname.includes('english');
        const updateLabel = () => {
            const val = frecuenciaPagoSelect.value;
            if (isEnglish) {
                if (val === 'diario') labelTiempoPrestamo.textContent = 'Term (Days)';
                else if (val === 'semanal') labelTiempoPrestamo.textContent = 'Term (Weeks)';
                else if (val === 'quincenal') labelTiempoPrestamo.textContent = 'Term (Biweeks)';
                else labelTiempoPrestamo.textContent = 'Term (Months)';
            } else {
                if (val === 'diario') labelTiempoPrestamo.textContent = 'Tiempo (Días)';
                else if (val === 'semanal') labelTiempoPrestamo.textContent = 'Tiempo (Semanas)';
                else if (val === 'quincenal') labelTiempoPrestamo.textContent = 'Tiempo (Quincenas)';
                else labelTiempoPrestamo.textContent = 'Tiempo (Meses)';
            }
        };
        frecuenciaPagoSelect.addEventListener('change', updateLabel);
        updateLabel();
    }

    setupSubmit(form, saveBtn, tipoPrestamoSelect, fechaSolicitudInput);
}

function setToday(input) {
    if (!input) return;
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    input.value = `${yyyy}-${mm}-${dd}`;
}

function setupJceLookup(btnId, inputCedulaId, prefix) {
    const btn = document.getElementById(btnId);
    const inputCedula = document.getElementById(inputCedulaId);
    if (!btn || !inputCedula) return;

    btn.addEventListener('click', async () => {
        const cedula = inputCedula.value;
        if (!cedula.replace(/\D/g, '')) {
            alert('Por favor, ingrese un número de cédula.');
            return;
        }

        btn.disabled = true;
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-circle-notch animate-spin"></i>';

        try {
            const result = await consultarJCE(cedula);
            if (result) {
                const nombresField = document.getElementById(`nombres${prefix}`);
                const apellidosField = document.getElementById(`apellidos${prefix}`);
                if (nombresField) nombresField.value = result.nombres || '';
                if (apellidosField) {
                    apellidosField.value = `${result.apellido1 || ''} ${result.apellido2 || ''}`.trim();
                }

                const fechaNacField = document.getElementById(`fechaNacimiento${prefix}`);
                const fechaRaw = result.fechaNacimiento || result.fecha_nacimiento || result.FechaNacimiento || result.fechanacimiento || result.fechaNac || result.fecha_nac || result.birthDate || result.birth_date || result.FechaNac || '';
                if (fechaNacField && fechaRaw) {
                    const parsedDate = parseJCEDate(fechaRaw);
                    if (parsedDate) {
                        fechaNacField.value = parsedDate;
                        fechaNacField.dispatchEvent(new Event('change'));
                        fechaNacField.dispatchEvent(new Event('input'));
                    }
                }

                const sexoField = document.getElementById(`sexo${prefix}`);
                if (sexoField && result.sexo) {
                    const s = result.sexo.trim().toUpperCase();
                    sexoField.value = s.startsWith('F') ? 'F' : 'M';
                }

                const estadoCivilField = document.getElementById(`estadoCivil${prefix}`);
                const ecRaw = result.estadoCivil || result.estado_civil || result.EstadoCivil || result.estadocivil || result.estadoCivilDescripcion || result.idEstadoCivil || '';
                if (estadoCivilField && ecRaw) {
                    const ec = String(ecRaw).trim().toLowerCase();
                    let selectedValue = '';
                    if (ec.includes('solter') || ec === 's' || ec === '1') selectedValue = 'Soltero/a';
                    else if (ec.includes('casad') || ec === 'c' || ec === '2') selectedValue = 'Casado/a';
                    else if (ec.includes('divorc') || ec === 'd' || ec === '3') selectedValue = 'Divorciado/a';
                    else if (ec.includes('libre') || ec.includes('union') || ec === 'u' || ec === '4' || ec.includes('soltero c') || ec.includes('soltera c')) selectedValue = 'Unión Libre';
                    else if (ec.includes('viud') || ec === 'v') selectedValue = 'Soltero/a';

                    if (selectedValue) {
                        estadoCivilField.value = selectedValue;
                    } else if (estadoCivilField.tagName === 'INPUT') {
                        estadoCivilField.value = String(ecRaw).charAt(0).toUpperCase() + String(ecRaw).slice(1).toLowerCase();
                    }

                    estadoCivilField.dispatchEvent(new Event('change'));
                }

                const direccionField = document.getElementById(`direccion${prefix}`);
                if (direccionField) {
                    direccionField.value = result.direccion || result.dirección || [result.lugarNacimiento].filter(Boolean).join(', ') || '';
                }

                const sectorField = document.getElementById(`sector${prefix}`);
                const ciudadField = document.getElementById(`ciudad${prefix}`);

                let sectorVal = result.sector || result.barrio || result.paraje || '';
                let ciudadVal = result.ciudad || result.municipio || result.provincia || '';

                const fullDir = result.direccion || result.dirección || '';
                if (fullDir && (!sectorVal || !ciudadVal)) {
                    const parts = fullDir.split(',').map(p => p.trim());
                    if (parts.length >= 3) {
                        if (!sectorVal) sectorVal = parts[parts.length - 2];
                        if (!ciudadVal) ciudadVal = parts[parts.length - 1];
                    } else if (parts.length === 2) {
                        if (!ciudadVal) ciudadVal = parts[1];
                    }
                }

                if (!ciudadVal && result.lugarNacimiento) {
                    const birthParts = result.lugarNacimiento.split(',').map(p => p.trim());
                    ciudadVal = birthParts[birthParts.length - 1];
                }

                if (sectorField && sectorVal) sectorField.value = sectorVal.toUpperCase();
                if (ciudadField && ciudadVal) ciudadField.value = ciudadVal.toUpperCase();

                const fotoUrlInput = document.getElementById(`fotoUrl${prefix}`);
                const fotoImg = document.getElementById(`${prefix === 'Sol' ? 'solicitanteFoto' : 'garanteFoto'}`);
                const fotoPlaceholder = document.getElementById(`${prefix === 'Sol' ? 'solicitanteFotoPlaceholder' : 'garanteFotoPlaceholder'}`);

                if (fotoUrlInput) fotoUrlInput.value = result.fotoUrl || '';
                if (fotoImg && result.fotoUrl) {
                    fotoImg.src = result.fotoUrl;
                    fotoImg.classList.remove('hidden');
                    if (fotoPlaceholder) fotoPlaceholder.classList.add('hidden');
                } else if (fotoImg) {
                    fotoImg.src = '';
                    fotoImg.classList.add('hidden');
                    if (fotoPlaceholder) fotoPlaceholder.classList.remove('hidden');
                }

                alert('¡Datos de la cédula cargados correctamente desde la JCE!');
            }
        } catch (err) {
            console.error(err);
            alert('Error al consultar cédula en JCE: ' + err.message);
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalHTML;
        }
    });
}

function setupConditionalSections(tipoPrestamoSelect) {
    const secGar = document.getElementById('sectionGarante');
    const secHipo = document.getElementById('sectionHipotecaria');
    const secVeh = document.getElementById('sectionVehiculo');
    const estadoCivilSol = document.getElementById('estadoCivilSol');
    const sectionConyugeSol = document.getElementById('sectionConyuge');
    const estadoCivilGar = document.getElementById('estadoCivilGar');
    const sectionConyugeGar = document.getElementById('sectionConyugeGar');

    const toggleMarital = (select, section) => {
        if (!select || !section) return;
        const val = select.value;
        section.classList.toggle('hidden', !(val === 'Casado/a' || val === 'Unión Libre'));
    };

    const toggleLoanSections = (type) => {
        secGar?.classList.add('hidden');
        secHipo?.classList.add('hidden');
        secVeh?.classList.add('hidden');
        sectionConyugeGar?.classList.add('hidden');

        if (type === 'garante') {
            secGar?.classList.remove('hidden');
            toggleMarital(estadoCivilGar, sectionConyugeGar);
        }
        if (type === 'hipotecario') secHipo?.classList.remove('hidden');
        if (type === 'vehiculo') secVeh?.classList.remove('hidden');
    };

    tipoPrestamoSelect?.addEventListener('change', e => toggleLoanSections(e.target.value));
    toggleLoanSections(tipoPrestamoSelect?.value || 'personal');

    estadoCivilSol?.addEventListener('change', () => toggleMarital(estadoCivilSol, sectionConyugeSol));
    estadoCivilGar?.addEventListener('change', () => toggleMarital(estadoCivilGar, sectionConyugeGar));

    toggleMarital(estadoCivilSol, sectionConyugeSol);
    toggleMarital(estadoCivilGar, sectionConyugeGar);
}

function setupMasks(form) {
    form.addEventListener('input', e => {
        const target = e.target;

        if (target.classList.contains('mask-cedula')) {
            let value = target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.slice(0, 11);
            let formatted = '';
            if (value.length > 0) formatted += value.substring(0, 3);
            if (value.length > 3) formatted += '-' + value.substring(3, 10);
            if (value.length > 10) formatted += '-' + value.substring(10, 11);
            target.value = formatted;
        }

        if (target.classList.contains('mask-phone')) {
            let value = target.value.replace(/\D/g, '');
            if (value.length > 10) value = value.slice(0, 10);
            let formatted = '';
            if (value.length > 0) formatted += value.substring(0, 3);
            if (value.length > 3) formatted += '-' + value.substring(3, 6);
            if (value.length > 6) formatted += '-' + value.substring(6, 10);
            target.value = formatted;
        }

        if (target.classList.contains('mask-currency')) {
            let value = target.value.replace(/[^\d.]/g, '');
            const parts = value.split('.');
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            if (parts[1]) parts[1] = parts[1].slice(0, 2);
            target.value = parts.join('.');
        }
    });
}

function setupAgeValidation(dobId, edadId) {
    const dobEl = document.getElementById(dobId);
    const edadEl = document.getElementById(edadId);

    dobEl?.addEventListener('change', () => {
        const age = calculateAge(dobEl.value);
        if (edadEl) edadEl.value = age;

        if (age !== '' && age < 18) {
            dobEl.classList.add('border-red-500', 'ring-2', 'ring-red-100');
            if (edadEl) edadEl.classList.add('text-red-500', 'font-black');
        } else {
            dobEl.classList.remove('border-red-500', 'ring-2', 'ring-red-100');
            if (edadEl) edadEl.classList.remove('text-red-500', 'font-black');
        }
    });
}

function calculateAge(dob) {
    if (!dob) return '';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
}

function setupReferenceRows(refTableBody) {
    if (!refTableBody) return;

    window.addReferenciaRow = (data = { nombre: '', telefono: '', direccion: '' }) => {
        const tr = document.createElement('tr');
        tr.className = 'group';
        tr.innerHTML = `
            <td class="py-3 px-2"><input type="text" value="${data.nombre}" class="ref-nombre w-full p-2 bg-slate-50 border rounded-lg text-xs font-bold font-['Inter']" placeholder="Nombre completo"></td>
            <td class="py-3 px-2"><input type="text" value="${data.telefono}" class="ref-telefono mask-phone w-full p-2 bg-slate-50 border rounded-lg text-xs font-bold" placeholder="000-000-0000"></td>
            <td class="py-3 px-2"><input type="text" value="${data.direccion}" class="ref-direccion w-full p-2 bg-slate-50 border rounded-lg text-xs font-bold" placeholder="Calle, No., Sector"></td>
            <td class="py-3 px-2 text-right">
                <button type="button" onclick="this.closest('tr').remove()" class="text-red-400 hover:text-red-500 p-2"><i class="fas fa-trash"></i></button>
            </td>
        `;
        refTableBody.appendChild(tr);
    };

    window.addReferenciaRow();
    window.addReferenciaRow();
}

function setupSubmit(form, saveBtn, tipoPrestamoSelect, fechaSolicitudInput) {
    form.addEventListener('submit', async e => {
        e.preventDefault();

        if (!validateRequiredFields()) {
            return;
        }

        if (hasMinor()) {
            alert('El solicitante debe ser mayor de 18 años para continuar.');
            return;
        }

        if (!saveBtn) return;
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-circle-notch animate-spin"></i> GUARDANDO...';

        const val = id => document.getElementById(id)?.value || '';
        const chk = (id, def = false) => {
            const el = document.getElementById(id);
            return el ? el.checked : def;
        };

        // 1. Enviar a Netlify Forms de manera asíncrona para disparar notificaciones por correo
        try {
            const formData = new FormData(form);
            if (!formData.has('form-name')) {
                formData.append('form-name', 'solicitud');
            }
            await fetch('/', {
                method: 'POST',
                body: formData
            });
        } catch (netlifyErr) {
            console.warn('Netlify submission error (email notification might fail):', netlifyErr);
        }

        // 2. Registrar en Supabase
        try {
            const type = val('tipoPrestamo');
            const cedula = val('identificador');
            const full_name = `${val('nombresSol')} ${val('apellidosSol')}`.trim();

            const { data: client } = await supabase.from('clients').select('id').eq('cedula', cedula).maybeSingle();
            let clientId;
            if (!client) {
                const { data: newClient, error: niErr } = await supabase
                    .from('clients')
                    .insert([{ full_name, cedula, phone: val('telefonoSol') }])
                    .select()
                    .single();
                if (niErr) throw niErr;
                clientId = newClient.id;
            } else {
                clientId = client.id;
                await supabase.from('clients').update({ full_name, phone: val('telefonoSol') }).eq('id', clientId);
            }

            const refs = Array.from(document.querySelectorAll('#referenciasTableBody tr')).map(tr => ({
                nombre: tr.querySelector('.ref-nombre')?.value || '',
                telefono: tr.querySelector('.ref-telefono')?.value || '',
                direccion: tr.querySelector('.ref-direccion')?.value || ''
            }));

            const fullData = {
                tipoPrestamo: type,
                fechaSolicitud: val('fechaSolicitud'),
                frecuenciaPago: val('frecuenciaPago') || 'mensual',
                evaluador: 'cliente_web',
                source: 'landing_publica',
                solicitante: {
                    nombres: val('nombresSol'),
                    apellidos: val('apellidosSol'),
                    identificador: cedula,
                    fotoUrl: val('fotoUrlSol'),
                    apodo: val('apodoSol'),
                    estadoCivil: val('estadoCivilSol'),
                    fechaNacimiento: val('fechaNacimientoSol'),
                    telefono: val('telefonoSol'),
                    edad: val('edadSol'),
                    dependientes: val('dependientesSol'),
                    sexo: val('sexoSol'),
                    profesion: val('profesionSol'),
                    vehiculo: val('vehiculoSol'),
                    sector: val('sectorSol'),
                    ciudad: val('ciudadSol'),
                    direccion: val('direccionSol'),
                    ocupaciones: val('ocupacionesSol'),
                    trabajo: val('trabajoSol'),
                    cargo: val('cargoSol'),
                    direccionTrabajo: val('direccionTrabajoSol'),
                    superior: val('superiorSol'),
                    telTrabajo: val('telTrabajoSol'),
                    tiempoTrabajo: val('tiempoTrabajoSol'),
                    ingresos: val('ingresosSol'),
                    otrosIngresos: val('otrosIngresosSol'),
                    tipoCasa: val('tipoCasaSol'),
                    destino: val('destinoCredito'),
                    chkCliente: chk('chkClienteSol', true),
                    chkEmpleado: chk('chkEmpleadoSol', false),
                    chkFuncionario: chk('chkFuncionarioSol', false),
                    chkAccionista: chk('chkAccionistaSol', false)
                },
                conyuge: {
                    nombres: val('nombresCon'),
                    apellidos: val('apellidosCon'),
                    fechaNacimiento: val('fechaNacimientoCon'),
                    edad: val('edadCon'),
                    apodo: val('apodoCon'),
                    estadoCivil: val('estadoCivilCon'),
                    telefono: val('telefonoCon'),
                    ocupacion: val('ocupacionCon'),
                    trabajo: val('trabajoCon'),
                    direccionTrabajo: val('direccionTrabajoCon') || val('trabajoCon'),
                    sector: val('sectorCon'),
                    direccion: val('direccionCon'),
                    superior: val('superiorCon'),
                    telTrabajo: val('telTrabajoCon'),
                    tiempoTrabajo: val('tiempoTrabajoCon'),
                    ingresos: val('ingresosCon')
                },
                referencias: refs
            };

            if (type === 'garante') {
                fullData.garante = {
                    identificador: val('identificadorGar'),
                    nombres: val('nombresGar'),
                    apellidos: val('apellidosGar'),
                    fotoUrl: val('fotoUrlGar'),
                    apodo: val('apodoGar'),
                    estadoCivil: val('estadoCivilGar'),
                    sexo: val('sexoGar'),
                    dependientes: val('dependientesGar'),
                    profesion: val('profesionGar'),
                    vehiculo: val('vehiculoGar'),
                    fechaNacimiento: val('fechaNacimientoGar'),
                    edad: val('edadGar'),
                    telefono: val('telefonoGar'),
                    sector: val('sectorGar'),
                    ciudad: val('ciudadGar'),
                    direccion: val('direccionGar'),
                    ocupaciones: val('ocupacionesGar'),
                    trabajo: val('trabajoGar'),
                    cargo: val('cargoGar'),
                    direccionTrabajo: val('direccionTrabajoGar'),
                    superior: val('superiorGar'),
                    telTrabajo: val('telTrabajoGar'),
                    tiempoTrabajo: val('tiempoTrabajoGar'),
                    ingresos: val('ingresosGar'),
                    otrosIngresos: val('otrosIngresosGar'),
                    tipoCasa: val('tipoCasaGar'),
                    destino: val('destinoGar'),
                    chkCliente: chk('chkClienteGar', false),
                    chkEmpleado: chk('chkEmpleadoGar', true),
                    chkFuncionario: chk('chkFuncionarioGar', false),
                    chkAccionista: chk('chkAccionistaGar', false),
                    conyuge: {
                        nombres: val('nombresConGar'),
                        apellidos: val('apellidosConGar'),
                        fechaNacimiento: val('fechaNacimientoConGar'),
                        edad: val('edadConGar'),
                        apodo: val('apodoConGar'),
                        estadoCivil: val('estadoCivilConGar'),
                        telefono: val('telefonoConGar'),
                        ocupacion: val('ocupacionConGar'),
                        trabajo: val('trabajoConGar'),
                        direccionTrabajo: val('direccionTrabajoConGar') || val('trabajoConGar'),
                        sector: val('sectorConGar'),
                        direccion: val('direccionConGar'),
                        superior: val('superiorConGar'),
                        telTrabajo: val('telTrabajoConGar'),
                        tiempoTrabajo: val('tiempoTrabajoConGar'),
                        ingresos: val('ingresosConGar')
                    }
                };
            } else if (type === 'hipotecario') {
                fullData.garantiaHipotecaria = {
                    propietario: val('propHipo'),
                    distritoCatastral: val('distHipo'),
                    fechaExpedicion: val('fechaHipo'),
                    libro: val('libroHipo'),
                    folio: val('folioHipo'),
                    provincia: val('provHipo'),
                    ciudad: val('ciudadHipo'),
                    parcela: val('parcelaHipo'),
                    area: val('areaHipo'),
                    cedulaRNC: val('cedulaHipo'),
                    certificadoTitulo: val('tituloHipo'),
                    direccion: val('dirHipo'),
                    descripcion: val('descHipo')
                };
            } else if (type === 'vehiculo') {
                fullData.garantiaVehiculo = {
                    razonSocial: val('razonVeh'),
                    placa: val('placaVeh'),
                    fechaExpedicion: val('fechaVeh'),
                    chasis: val('chasisVeh'),
                    estatus: val('estatusVeh'),
                    emision: val('emisionVeh'),
                    matricula: val('matriculaVeh'),
                    fuerza: val('fuerzaVeh'),
                    cilindros: val('cilindrosVeh'),
                    cedulaProp: val('cedulaPropVeh'),
                    tipo: val('tipoVeh'),
                    marca: val('marcaVeh'),
                    modelo: val('modeloVeh'),
                    anio: val('anioVeh'),
                    color: val('colorVeh'),
                    motorSerie: val('motorVeh'),
                    pasajeros: val('pasajerosVeh'),
                    capCarga: val('capCargaVeh'),
                    puertas: val('puertasVeh')
                };
            }

            const cleanNum = str => parseFloat(String(str).replace(/,/g, '')) || 0;

            const { data: insertedData, error: sErr } = await supabase.from('loan_applications').insert([{
                client_id: clientId,
                loan_type: type,
                applicant_name: full_name,
                applicant_cedula: cedula,
                monto: cleanNum(val('montoSolicitado')),
                tiempo: parseInt(val('tiempoPrestamo')) || 0,
                cuota: cleanNum(val('cuotaPrestamo')),
                status: 'Pendiente',
                data: fullData
            }]).select();

            if (sErr) throw sErr;
            const insertedId = insertedData && insertedData[0] ? insertedData[0].id : null;

            // Enviar notificación por correo de forma asíncrona usando Brevo
            try {
                sendBrevoNotification(
                    cleanNum(val('montoSolicitado')),
                    parseInt(val('tiempoPrestamo')) || 0,
                    cleanNum(val('cuotaPrestamo')),
                    type,
                    full_name,
                    cedula,
                    { ...fullData, id: insertedId }
                );
            } catch (emailErr) {
                console.warn('Error al intentar enviar la notificación por correo:', emailErr);
            }

            alert('¡Solicitud enviada con éxito! Nos comunicaremos contigo pronto.');
            form.reset();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setToday(fechaSolicitudInput);
            
            const refTableBody = document.getElementById('referenciasTableBody');
            if (refTableBody) {
                refTableBody.innerHTML = '';
                window.addReferenciaRow();
                window.addReferenciaRow();
            }
            setupConditionalSections(tipoPrestamoSelect);
        } catch (err) {
            console.error(err);
            alert('Error al enviar: ' + err.message);
        } finally {
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.innerHTML = '<i class="fas fa-paper-plane text-xl"></i> ENVIAR SOLICITUD';
            }
        }
    });
}

function hasMinor() {
    const ageStr = document.getElementById('edadSol')?.value;
    if (!ageStr || ageStr.trim() === '') return true; // Block if age is not calculated
    const age = Number(ageStr);
    return age < 18;
}

function validateRequiredFields() {
    const requiredIds = [
        'identificador',
        'nombresSol',
        'apellidosSol',
        'fechaNacimientoSol',
        'telefonoSol',
        'montoSolicitado',
        'tiempoPrestamo'
    ];
    let isValid = true;
    let firstMissing = null;
    for (const id of requiredIds) {
        const el = document.getElementById(id);
        if (!el || !el.value || el.value.trim() === '') {
            if (el) {
                el.classList.add('border-red-500', 'bg-red-50');
                if (!firstMissing) firstMissing = el;
            }
            isValid = false;
        } else {
            if (el) el.classList.remove('border-red-500', 'bg-red-50');
        }
    }
    if (firstMissing) {
        alert('Por favor completa los campos obligatorios.');
        firstMissing.focus();
    }
    return isValid;
}

function parseJCEDate(jceDate) {
    if (!jceDate) return '';
    const str = String(jceDate).trim();
    if (str.includes('T') || /^\d{4}-\d{2}-\d{2}$/.test(str)) {
        return str.split('T')[0];
    }
    const match = str.match(/^(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})/);
    if (match) {
        const n1 = parseInt(match[1], 10);
        const n2 = parseInt(match[2], 10);
        const year = match[3];
        let day, month;
        if (n1 > 12) {
            day = n1;
            month = n2;
        } else if (n2 > 12) {
            month = n1;
            day = n2;
        } else {
            day = n1;
            month = n2;
        }
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
    return '';
}

async function getJCEBaseUrl() {
    let baseUrl = 'https://edging-rarity-routing.ngrok-free.dev';
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        const checks = [
            { port: 3001, path: '/api/health' },
            { port: 8082, path: '/api/v1/health' },
            { port: 8082, path: '/actuator/health' },
            { port: 8080, path: '/api/v1/health' },
            { port: 8080, path: '/actuator/health' }
        ];

        for (const target of checks) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 600);
                const res = await fetch(`http://localhost:${target.port}${target.path}`, { signal: controller.signal });
                if (res.ok) {
                    clearTimeout(timeoutId);
                    return `http://localhost:${target.port}`;
                }
                clearTimeout(timeoutId);
            } catch (err) {}
        }
    }
    return baseUrl;
}

async function consultarJCE(cedula) {
    const cleanCedula = cedula.replace(/[^0-9]/g, '');
    if (cleanCedula.length !== 11) {
        throw new Error('La cédula debe tener exactamente 11 dígitos.');
    }

    const baseUrl = await getJCEBaseUrl();
    const apiUrl = `${baseUrl}/api/v1/cedula-queries/query`;
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ cedula: cleanCedula })
    });

    if (!response.ok) {
        throw new Error(`Error en el servidor JCE: Código ${response.status}`);
    }

    const resData = await response.json();
    if (resData.success && resData.data && resData.data.result) {
        return resData.data.result;
    } else {
        throw new Error(resData.message || 'No se encontró información para la cédula ingresada.');
    }
}
