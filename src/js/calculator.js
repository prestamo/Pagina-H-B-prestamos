/**
 * B&H PRÉSTAMOS – Simulador de Préstamo
 * Tipos: Crédito de Consumo | Crédito de Vehículo | Crédito Hipotecario
 * Fórmula: Amortización Francesa (PMT estándar)
 * Póliza de seguro: 0.4454% anual sobre saldo inicial (solo consumo)
 */

(function () {
    'use strict';

    // =====================================================
    // UTILIDADES
    // =====================================================

    /** Convierte "RD$300,000" → 300000 */
    function parseCurrency(val) {
        if (typeof val === 'number') return val;
        return parseFloat(String(val).replace(/[^0-9.]/g, '')) || 0;
    }

    /** Formatea 300000 → "RD$300,000.00" */
    function formatCurrency(val) {
        return 'RD$' + Number(val).toLocaleString('es-DO', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    /** Calcula cuota mensual (PMT – Amortización Francesa) */
    function calcPMT(principal, annualRatePct, months) {
        if (!principal || !months) return 0;
        if (!annualRatePct) return principal / months;
        const r = annualRatePct / 100 / 12;
        const n = months;
        return principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    }

    /**
     * Póliza de seguro de vida estimada:
     * tasa anual 0.4454% × (plazo en años) × monto principal
     */
    function calcPoliza(principal, months) {
        return principal * 0.004454 * (months / 12);
    }

    /** Etiqueta legible para meses */
    function mesesLabel(meses) {
        const años = Math.floor(meses / 12);
        const resto = meses % 12;
        let label = meses + ' meses';
        if (años > 0 && resto === 0) {
            label += ' (' + años + ' año' + (años > 1 ? 's' : '') + ')';
        } else if (años > 0) {
            label += ' (' + años + 'a ' + resto + 'm)';
        }
        return label;
    }

    /** Actualiza el fill del slider con el color brand */
    function updateSliderFill(slider) {
        const min = parseFloat(slider.min) || 0;
        const max = parseFloat(slider.max) || 100;
        const val = parseFloat(slider.value) || 0;
        const pct = ((val - min) / (max - min)) * 100;
        slider.style.background =
            'linear-gradient(to right, #00aeef ' + pct + '%, #e2e8f0 ' + pct + '%)';
    }

    /** Flash animation en el elemento al actualizar */
    function flashEl(elId) {
        const el = document.getElementById(elId);
        if (!el) return;
        el.style.transition = 'color 0.15s';
        el.style.color = '#00aeef';
        setTimeout(() => { el.style.color = ''; }, 220);
    }

    /** Actualiza el texto del elemento y hace flash */
    function setVal(elId, formatted) {
        const el = document.getElementById(elId);
        if (!el) return;
        el.textContent = formatted;
        flashEl(elId);
    }

    // =====================================================
    // MANEJO DE INPUTS DE MONEDA
    // =====================================================

    function setupCurrencyInput(inputId, onChangeCallback) {
        const input = document.getElementById(inputId);
        if (!input) return;

        input.addEventListener('focus', function () {
            const raw = parseCurrency(this.value);
            this.setAttribute('type', 'number');
            this.setAttribute('step', '1000');
            this.setAttribute('min', '0');
            this.value = raw || '';
        });

        input.addEventListener('blur', function () {
            const raw = parseFloat(this.value) || 0;
            this.setAttribute('type', 'text');
            this.value = 'RD$' + raw.toLocaleString('es-DO');
            if (onChangeCallback) onChangeCallback();
        });

        input.addEventListener('input', function () {
            if (onChangeCallback) onChangeCallback();
        });
    }

    // =====================================================
    // ACTUALIZACIÓN DE RESULTADOS (panel derecho)
    // =====================================================

    function updateResults({ loanType, valorFinanciar, cuota, ingresos, poliza }) {
        const capPct  = ingresos > 0 ? (cuota / ingresos) * 100 : 0;
        const cumple  = capPct <= 30;

        // — Subtítulo —
        const typeLabels = {
            consumo:     'Detalles del crédito de consumo',
            vehiculo:    'Detalles del crédito vehicular',
            hipotecario: 'Detalles del crédito hipotecario'
        };
        const typeEl = document.getElementById('calc-result-type');
        if (typeEl) typeEl.textContent = typeLabels[loanType] || '';

        // — Status badge —
        const statusMsg = document.getElementById('calc-status-msg');
        if (statusMsg) {
            if (cumple) {
                statusMsg.innerHTML = '<i class="fas fa-check-circle"></i> Su solicitud cumple con las políticas de B&H Préstamos';
                statusMsg.className = 'calc-status-badge calc-status-ok';
            } else {
                statusMsg.innerHTML = '<i class="fas fa-exclamation-triangle"></i> La cuota supera el 30% de sus ingresos disponibles';
                statusMsg.className = 'calc-status-badge calc-status-warn';
            }
        }

        // — Valores monetarios —
        setVal('calc-valor-financiar', formatCurrency(valorFinanciar));
        setVal('calc-cuota', formatCurrency(cuota));

        // — Póliza (solo consumo) —
        const polizaRow = document.getElementById('calc-poliza-row');
        if (polizaRow) {
            if (poliza != null) {
                polizaRow.style.display = 'flex';
                setVal('calc-poliza', formatCurrency(poliza));
            } else {
                polizaRow.style.display = 'none';
            }
        }

        // — Capacidad de pago —
        const capEl   = document.getElementById('calc-capacidad');
        const capBar  = document.getElementById('calc-capacidad-bar');
        const capNote = document.getElementById('calc-cap-note');
        const capRnd  = Math.round(capPct);

        if (capEl) {
            capEl.textContent = capRnd + '%';
            capEl.style.color = cumple ? '#16a34a' : '#dc2626';
        }
        if (capBar) {
            capBar.style.width      = Math.min(capPct, 100) + '%';
            capBar.style.background = cumple ? '#22c55e' : '#ef4444';
        }
        if (capNote) {
            if (cumple && capPct > 0) {
                capNote.textContent  = '✓ Excelente capacidad de pago.';
                capNote.style.color  = '#16a34a';
                capNote.style.fontStyle = 'normal';
            } else {
                capNote.textContent  = 'Se recomienda que la cuota no supere el 30% de los ingresos disponibles.';
                capNote.style.color  = '#94a3b8';
                capNote.style.fontStyle = 'italic';
            }
        }
    }

    // =====================================================
    // CÁLCULOS POR TIPO
    // =====================================================

    function calcConsumo() {
        const monto    = parseCurrency(document.getElementById('con-monto')?.value);
        const plazo    = parseInt(document.getElementById('con-plazo')?.value) || 36;
        const tasa     = parseFloat(document.getElementById('con-interes')?.value) || 10;
        const ingresos = parseCurrency(document.getElementById('con-ingresos')?.value);

        const cuota  = calcPMT(monto, tasa, plazo);
        const poliza = calcPoliza(monto, plazo);

        const lblPlazo = document.getElementById('con-plazo-label');
        if (lblPlazo) lblPlazo.textContent = mesesLabel(plazo);

        const slider = document.getElementById('con-plazo');
        if (slider) updateSliderFill(slider);

        updateResults({ loanType: 'consumo', valorFinanciar: monto, cuota, ingresos, poliza });
    }

    function calcVehiculo() {
        const valorVeh   = parseCurrency(document.getElementById('veh-valor')?.value);
        const tipo       = document.getElementById('veh-tipo')?.value || 'nuevo';
        const porcentaje = tipo === 'nuevo' ? 0.80 : 0.70;
        const monto      = valorVeh * porcentaje;
        const plazo      = parseInt(document.getElementById('veh-plazo')?.value) || 60;
        const tasa       = parseFloat(document.getElementById('veh-interes')?.value) || 10;
        const ingresos   = parseCurrency(document.getElementById('veh-ingresos')?.value);

        const cuota = calcPMT(monto, tasa, plazo);

        const lblPlazo = document.getElementById('veh-plazo-label');
        if (lblPlazo) lblPlazo.textContent = mesesLabel(plazo);

        const finLabel = document.getElementById('veh-financiar-label');
        if (finLabel) {
            finLabel.textContent =
                'Monto a financiar: ' + formatCurrency(monto) +
                ' (' + Math.round(porcentaje * 100) + '% del valor del vehículo)';
        }

        const slider = document.getElementById('veh-plazo');
        if (slider) updateSliderFill(slider);

        updateResults({ loanType: 'vehiculo', valorFinanciar: monto, cuota, ingresos, poliza: null });
    }

    function calcHipotecario() {
        const valorInm = parseCurrency(document.getElementById('hip-valor')?.value);
        const monto    = valorInm * 0.80;
        const plazo    = parseInt(document.getElementById('hip-plazo')?.value) || 240;
        const tasa     = parseFloat(document.getElementById('hip-interes')?.value) || 10;
        const ingresos = parseCurrency(document.getElementById('hip-ingresos')?.value);

        const cuota = calcPMT(monto, tasa, plazo);

        const lblPlazo = document.getElementById('hip-plazo-label');
        if (lblPlazo) lblPlazo.textContent = mesesLabel(plazo);

        const finLabel = document.getElementById('hip-financiar-label');
        if (finLabel) {
            finLabel.textContent =
                'Monto a financiar: ' + formatCurrency(monto) + ' (80% del valor del inmueble)';
        }

        const slider = document.getElementById('hip-plazo');
        if (slider) updateSliderFill(slider);

        updateResults({ loanType: 'hipotecario', valorFinanciar: monto, cuota, ingresos, poliza: null });
    }

    const CALCULATORS = {
        consumo:     calcConsumo,
        vehiculo:    calcVehiculo,
        hipotecario: calcHipotecario
    };

    // =====================================================
    // CAMBIO DE PESTAÑA
    // =====================================================

    function switchTab(tab) {
        // Tabs UI
        document.querySelectorAll('.calc-tab').forEach(function (btn) {
            if (btn.dataset.tab === tab) {
                btn.style.background    = '#00aeef';
                btn.style.color         = '#ffffff';
                btn.style.boxShadow     = '0 8px 20px rgba(0,174,239,0.35)';
                btn.style.borderColor   = 'transparent';
            } else {
                btn.style.background    = 'rgba(255,255,255,0.08)';
                btn.style.color         = 'rgba(255,255,255,0.65)';
                btn.style.boxShadow     = 'none';
                btn.style.borderColor   = 'rgba(255,255,255,0.12)';
            }
        });

        // Paneles
        document.querySelectorAll('.calc-panel').forEach(function (p) {
            p.classList.add('hidden');
        });
        const panel = document.getElementById('panel-' + tab);
        if (panel) panel.classList.remove('hidden');

        // Calcular
        if (CALCULATORS[tab]) CALCULATORS[tab]();
    }

    // =====================================================
    // INICIALIZACIÓN
    // =====================================================

    function init() {
        if (!document.getElementById('calc-tabs')) return; // sección no está en la página

        // Tabs
        document.querySelectorAll('.calc-tab').forEach(function (btn) {
            btn.addEventListener('click', function () { switchTab(btn.dataset.tab); });
        });

        // Currency inputs
        setupCurrencyInput('con-monto',    calcConsumo);
        setupCurrencyInput('con-ingresos', calcConsumo);
        setupCurrencyInput('veh-valor',    calcVehiculo);
        setupCurrencyInput('veh-ingresos', calcVehiculo);
        setupCurrencyInput('hip-valor',    calcHipotecario);
        setupCurrencyInput('hip-ingresos', calcHipotecario);

        // Listeners – Consumo
        ['con-plazo', 'con-interes', 'con-edad'].forEach(function (id) {
            document.getElementById(id)?.addEventListener('input',  calcConsumo);
            document.getElementById(id)?.addEventListener('change', calcConsumo);
        });

        // Listeners – Vehículo
        ['veh-plazo', 'veh-interes', 'veh-tipo', 'veh-categoria', 'veh-edad'].forEach(function (id) {
            document.getElementById(id)?.addEventListener('input',  calcVehiculo);
            document.getElementById(id)?.addEventListener('change', calcVehiculo);
        });

        // Listeners – Hipotecario
        ['hip-plazo', 'hip-interes', 'hip-tipo', 'hip-moneda', 'hip-edad'].forEach(function (id) {
            document.getElementById(id)?.addEventListener('input',  calcHipotecario);
            document.getElementById(id)?.addEventListener('change', calcHipotecario);
        });

        // Init slider fills
        ['con-plazo', 'veh-plazo', 'hip-plazo'].forEach(function (id) {
            const el = document.getElementById(id);
            if (el) updateSliderFill(el);
        });

        // Pestaña inicial
        switchTab('consumo');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
