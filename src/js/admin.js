import { supabase, sendBrevoNotification, sendBrevoTestEmail, generateLoanApplicationHtml } from './supabase.js';
import { getRequiredImageCount, renderAdvancedPromo } from './promoRenderer.js';

// Elementos del DOM
const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');
const loginBtn = document.getElementById('loginBtn');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // UI Feedback
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<i class="fas fa-circle-notch animate-spin"></i>';
        errorMessage.classList.add('hidden');

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                throw error;
            }

            // Exito -> Redirigir al dashboard o a la solicitud a imprimir
            const urlParams = new URLSearchParams(window.location.search);
            const printId = urlParams.get('print');
            if (printId) {
                window.location.href = './solicitudes_list.html?print=' + printId;
            } else {
                window.location.href = './index.html';
            }

        } catch (err) {
            console.error('Error de login:', err.message);
            errorMessage.textContent = 'Credenciales inválidas o error de conexión';
            errorMessage.classList.remove('hidden');
        } finally {
            loginBtn.disabled = false;
            loginBtn.innerHTML = '<span>ACCEDER</span><i class="fas fa-arrow-right text-xs"></i>';
        }
    });
}

/**
 * Función para verificar sesión (protección de rutas)
 */
export const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        window.location.href = './login.html' + window.location.search;
        return null;
    }
    return session;
};

// 2. Lógica General para todas las páginas administrativas (Banners, Carrusel, Promociones, Index)
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Si es la página de login, no procesar nada más
        if (document.getElementById('loginForm')) return;

        // Protección de Ruta & Sesión
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            window.location.href = './login.html' + window.location.search;
            return;
        }

        console.log('Admin autenticado:', session.user.email);

        // Logout Genérico
        document.getElementById('logoutBtn')?.addEventListener('click', async () => {
            await supabase.auth.signOut();
            window.location.href = './login.html';
        });

        // --- INICIALIZACIÓN POR PÁGINA ---
        const getPageName = () => {
            const path = window.location.pathname.toLowerCase();
            // Manejar tanto /admin/como /admin/index.html
            if (path.endsWith('/admin/') || path.endsWith('/admin')) return 'index';
            const parts = path.split('/');
            const lastPart = parts[parts.length - 1];
            return lastPart.replace('.html', '') || 'index';
        };

        const page = getPageName();
        console.log('DEBUG: Admin Page detected:', page);
        console.log('DEBUG: initBannerModule type:', typeof initBannerModule);
        console.log('DEBUG: initCarouselModule type:', typeof initCarouselModule);
        
        if (page === 'banners') {
            initBannerModule();
        } else if (page === 'carousel') {
            initCarouselModule();
        } else if (page === 'promotions') {
            initPromotionsModule();
        } else if (page === 'cuotas') {
            initCuotasConfigModule(); 
        } else if (page === 'footer') {
            initFooterModule();
        } else if (page === 'solicitudes_list') {
            initSolicitudesListModule();
        } else if (page === 'solicitudes') {
            initSolicitudesModule();
        } else if (page === 'clientes') {
            initClientesModule();
        } else if (page === 'email') {
            initEmailConfigModule();
        } else if (page === 'index' || page === 'dashboard') {
            if (typeof initStats === 'function') initStats();
            else if (typeof initAnalytics === 'function') initAnalytics();
        }
    } catch (error) {
        console.error('CRITICAL ADMIN ERROR:', error);
    }
});

// --- MÓDULOS DE GESTIÓN ---

async function initBannerModule() {
    const bannerText = document.getElementById('bannerText');
    if (!bannerText) return;
    const bannerColor = document.getElementById('bannerColor');
    const bannerVisible = document.getElementById('bannerVisible');
    const bannerScroll = document.getElementById('bannerScroll');
    const bannerStripes = document.getElementById('bannerStripes');
    const bannerHeight = document.getElementById('bannerHeight');
    const bannerPosition = document.getElementById('bannerPosition');
    const bannerFont = document.getElementById('bannerFont');
    const bannerFontSize = document.getElementById('bannerFontSize');
    const bannerLineHeight = document.getElementById('bannerLineHeight');
    const bannerFontScale = document.getElementById('bannerFontScale');
    const bannerTextAlign = document.getElementById('bannerTextAlign');
    const bannerImgSize = document.getElementById('bannerImgSize');
    const bannerImgHeight = document.getElementById('bannerImgHeight');
    const bannerShowImage = document.getElementById('bannerShowImage');
    const bannerImagePosition = document.getElementById('bannerImagePosition');
    const bannerSpeed = document.getElementById('bannerSpeed');
    const bannerLoopDelay = document.getElementById('bannerLoopDelay');
    const bannerImageMode = document.getElementById('bannerImageMode');
    const bannerImageFile = document.getElementById('bannerImageFile');
    const colorHex = document.getElementById('colorHex');
    const bannerForm = document.getElementById('bannerForm');
    const bannerHistoryList = document.getElementById('bannerHistoryList');
    const bannerFontColor = document.getElementById('bannerFontColor');
    const fontColorHex = document.getElementById('fontColorHex');

    // Labels/Previews
    const heightVal = document.getElementById('heightVal');
    const fontSizeVal = document.getElementById('fontSizeVal');
    const lineHeightVal = document.getElementById('lineHeightVal');
    const fontScaleVal = document.getElementById('fontScaleVal');
    const imgSizeVal = document.getElementById('imgSizeVal');
    const imgHeightVal = document.getElementById('imgHeightVal');
    const speedVal = document.getElementById('speedVal');
    const loopDelayVal = document.getElementById('loopDelayVal');
    const imagePreview = document.getElementById('imagePreview');
    const currentBannerImg = document.getElementById('currentBannerImg');
    const previewContainer = document.getElementById('previewContainer');
    const bannerPreviewBox = document.getElementById('bannerPreview');

    // State
    let bannersHistory = [];
    let currentActiveBannerId = null;

    // Cropper State
    let cropper = null;
    let croppedBlob = null;
    const cropModal = document.getElementById('cropModal');
    const imageToCrop = document.getElementById('imageToCrop');

    // Manejo de recorte
    window.closeCropModal = () => {
        cropModal.classList.add('hidden');
        if (cropper) {
            cropper.destroy();
            cropper = null;
        }
    };

    window.applyCrop = () => {
        if (!cropper) return;
        const canvas = cropper.getCroppedCanvas();
        currentBannerImg.src = canvas.toDataURL();
        canvas.toBlob((blob) => {
            croppedBlob = blob;
        });
        imagePreview.classList.remove('hidden');
        closeCropModal();
        updatePreview();
    };

    // Manejo de modo de imagen (Icono vs Banner)
    window.setImageMode = (mode) => {
        bannerImageMode.value = mode;
        const btnIcon = document.getElementById('idBtnIcon');
        const btnBanner = document.getElementById('idBtnBanner');
        
        if (mode === 'icon') {
            btnIcon.className = "text-[8px] font-bold uppercase p-2 rounded-lg bg-brand text-white shadow-sm transition-all";
            btnBanner.className = "text-[8px] font-bold uppercase p-2 rounded-lg bg-white text-slate-400 border border-slate-100 transition-all";
        } else {
            btnBanner.className = "text-[8px] font-bold uppercase p-2 rounded-lg bg-brand text-white shadow-sm transition-all";
            btnIcon.className = "text-[8px] font-bold uppercase p-2 rounded-lg bg-white text-slate-400 border border-slate-100 transition-all";
        }
        updatePreview();
    };

    window.setImagePosition = (pos) => {
        bannerImagePosition.value = pos;
        const btnLeft = document.getElementById('btnImgLeft');
        const btnRight = document.getElementById('btnImgRight');
        
        if (pos === 'left') {
            btnLeft.className = "text-[9px] font-bold uppercase p-2.5 rounded-xl bg-brand text-white shadow-sm border border-brand/20 transition-all";
            btnRight.className = "text-[9px] font-bold uppercase p-2.5 rounded-xl bg-white text-slate-400 border border-slate-200 transition-all";
        } else {
            btnRight.className = "text-[9px] font-bold uppercase p-2.5 rounded-xl bg-brand text-white shadow-sm border border-brand/20 transition-all";
            btnLeft.className = "text-[9px] font-bold uppercase p-2.5 rounded-xl bg-white text-slate-400 border border-slate-200 transition-all";
        }
        updatePreview();
    };

    // --- LÓGICA DE HISTORIAL ---
    const loadHistory = async () => {
        const { data, error } = await supabase
            .from('banner_history')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);
        
        if (error) return;
        bannersHistory = data;
        renderHistory();
    };

    const renderHistory = () => {
        if (!bannerHistoryList) return;
        bannerHistoryList.innerHTML = bannersHistory.map(b => {
            const isActive = b.is_active;
            const activeBadge = isActive ? '<span class="px-2 py-0.5 bg-green-500 text-white text-[7px] font-black rounded-full shadow-sm ml-2 animate-pulse">AL AIRE</span>' : '';
            
            const miniatureStyle = `background-color: ${b.bg_color}; font-family: ${b.font_family}; font-size: 8px; line-height: 1; color: white; display: flex; align-items: center; justify-content: center; height: 100%; width: 100%; border-radius: 8px; overflow: hidden; position: relative;`;
            const textStyle = `transform: scaleY(${b.font_scale_y || 1}); position: relative; z-index: 2; font-weight: 900;`;
            
            let miniatureContent = `<div style="${miniatureStyle}">`;
            if (b.show_image && b.image_url) {
                if (b.image_mode === 'icon') {
                    miniatureContent += `<img src="${b.image_url}" style="width: 25%; height: 25%; object-fit: contain; margin-right: 2px; z-index: 2; position: relative;">`;
                } else {
                    miniatureContent += `<img src="${b.image_url}" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.4; z-index: 1;">`;
                }
            }
            miniatureContent += `<span style="${textStyle}; color: white !important; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 80%; display: inline-block;">${b.text ? b.text.substring(0, 12) : ''}</span></div>`;

            return `
            <div class="p-4 bg-white rounded-2xl border ${isActive ? 'border-green-400' : 'border-slate-100'} shadow-sm hover:border-brand/30 transition-all flex items-center justify-between group">
                <div class="flex items-center gap-4 overflow-hidden w-full">
                    <div class="w-16 h-10 flex-shrink-0">
                        ${miniatureContent}
                    </div>
                    <div class="overflow-hidden flex-1">
                        <div class="flex items-center">
                            <p class="font-bold text-slate-700 text-xs truncate uppercase tracking-wider">${b.text || 'Sin texto'}</p>
                            ${activeBadge}
                        </div>
                        <p class="text-[9px] text-slate-400 uppercase font-medium">${new Date(b.created_at).toLocaleString('es-ES')} • ${b.position}</p>
                    </div>
                </div>
                <div class="flex gap-2">
                    <button onclick="applyHistory('${b.id}')" class="bg-brand/10 text-brand text-[9px] font-black uppercase px-4 py-2 rounded-lg hover:bg-brand hover:text-white transition-colors">Cargar</button>
                    <button onclick="deleteHistory('${b.id}')" class="bg-rose-100 text-rose-600 text-[9px] font-black uppercase px-2 py-2 rounded-lg hover:bg-rose-600 hover:text-white transition-colors">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            `;
        }).join('');
    };

    window.deleteHistory = async (id) => {
        if (!confirm('¿Seguro que quieres eliminar este diseño del historial? Se borrará también de la página principal y el almacenamiento.')) return;
        
        // 1. Obtener datos para borrar foto de storage si existe
        const item = bannersHistory.find(b => b.id === id);
        
        // 2. Borrar del historial
        const { error } = await supabase.from('banner_history').delete().eq('id', id);
        if (error) {
            alert('Error: ' + error.message);
            return;
        }

        // 3. Borrar de producción si es el activo
        await supabase.from('banners').delete().match({ text: item.text, position: item.position });

        // 4. Borrar foto de storage si es de supabase
        if (item.image_url && item.image_url.includes('supabase.co/storage')) {
            const fileName = item.image_url.split('/').pop();
            await supabase.storage.from('banners').remove([fileName]);
        }

        alert('✅ Eliminado de historial, producción y storage.');
        loadHistory();
    };

    window.applyHistory = (id) => {
        const b = bannersHistory.find(x => x.id === id);
        if (!b) return;
        populateForm(b);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const populateForm = (b) => {
        bannerText.value = b.text || '';
        bannerColor.value = b.bg_color || '#000000';
        colorHex.textContent = (b.bg_color || '#000000').toUpperCase();
        bannerVisible.checked = b.is_visible;
        bannerScroll.checked = b.scroll_text;
        bannerStripes.checked = b.show_stripes;
        bannerHeight.value = b.height || 60;
        heightVal.textContent = b.height || 60;
        bannerPosition.value = b.position || 'bottom';
        bannerFont.value = b.font_family || "'Inter', sans-serif";
        bannerFontSize.value = b.font_size || 14;
        fontSizeVal.textContent = b.font_size || 14;
        bannerLineHeight.value = b.line_height || 1.2;
        lineHeightVal.textContent = b.line_height || 1.2;
        bannerFontScale.value = b.font_scale_y || 1.0;
        fontScaleVal.textContent = b.font_scale_y || 1.0;
        bannerTextAlign.value = b.text_align || 'center';
        bannerFontColor.value = b.font_color || '#FFFFFF';
        fontColorHex.textContent = (b.font_color || '#FFFFFF').toUpperCase();
        bannerShowImage.checked = b.show_image !== false;
        
        if (b.image_mode) window.setImageMode(b.image_mode);
        if (b.image_position) window.setImagePosition(b.image_position);
        
        bannerImgSize.value = b.image_size || 40;
        imgSizeVal.textContent = b.image_size || 40;
        bannerImgHeight.value = b.image_height || 100;
        imgHeightVal.textContent = b.image_height || 100;
        bannerSpeed.value = b.scroll_speed || 20;
        speedVal.textContent = b.scroll_speed || 20;
        bannerLoopDelay.value = b.loop_delay || 4;
        loopDelayVal.textContent = b.loop_delay || 4;
        
        if (b.image_url) {
            currentBannerImg.src = b.image_url;
            imagePreview.classList.remove('hidden');
        } else {
            imagePreview.classList.add('hidden');
        }
        updatePreview();
    };

    // Función de Previsualización en Tiempo Real
    const updatePreview = () => {
        if (!previewContainer) return;

        const bgColor = bannerColor.value;
        const bnHeight = bannerHeight.value;
        const text = bannerText.value || 'Texto de ejemplo del banner';
        const font = bannerFont.value;
        const fontSize = bannerFontSize.value;
        const lineHeight = bannerLineHeight.value;
        const fontScale = bannerFontScale.value;
        const textAlign = bannerTextAlign.value;
        const fontColor = bannerFontColor.value;
        const showImage = bannerShowImage.checked;
        const imgPos = bannerImagePosition.value;
        const imgMode = bannerImageMode.value;
        const scrollText = bannerScroll.checked;
        const showStripes = bannerStripes.checked;
        const isVisible = bannerVisible.checked;
        const imgScaleY = bannerImgHeight.value || 100;
        const imgSize = bannerImgSize.value || 40;

        const animId = `marquee_preview_${Math.floor(Math.random()*1000)}`;
        const horizontalAlign = textAlign === 'left' ? 'flex-start' : (textAlign === 'right' ? 'flex-end' : 'center');
        const flexDirVal = imgPos === 'right' ? 'row-reverse' : 'row';
        
        // Limpiar fuente para evitar errores de sintaxis
        let cleanFont = font.split(',')[0].replace(/['"]/g, '').trim();
        const fontStyle = `'${cleanFont}', sans-serif`;

        const commonTypography = `font-family: ${fontStyle} !important; font-size: ${fontSize}px !important; line-height: ${lineHeight} !important; color: ${fontColor} !important; transform: scaleY(${fontScale}) !important; transform-origin: center !important; text-decoration: none !important; font-weight: 900 !important; text-transform: uppercase !important; letter-spacing: 0.2em !important;`;
        const containerStyle = `display: flex !important; align-items: center !important; justify-content: ${horizontalAlign} !important; flex-direction: ${flexDirVal} !important; width: 100% !important; height: 100% !important; padding: 0 40px !important; box-sizing: border-box !important; position: relative !important; overflow: hidden !important; background-color: ${bgColor} !important; ${commonTypography}`;

        // Validación robusta de URL de imagen
        const rawImgSrc = currentBannerImg.src;
        const isRealImage = rawImgSrc && (rawImgSrc.startsWith('http') || rawImgSrc.startsWith('data:')) && !rawImgSrc.includes('admin/banners.html');

        let bannerContent = "";
        const spanStyle = `position: relative; z-index: 2; display: flex !important; align-items: center !important; height: 100% !important; white-space: nowrap !important; ${commonTypography}`;

        if (showImage && isRealImage) {
            if (imgMode === 'icon') {
                const margin = imgPos === 'right' ? 'margin-left: 20px;' : 'margin-right: 20px;';
                const imgStyle = `width: ${imgSize}%; height: ${imgScaleY}%; max-height: 95%; object-fit: contain; ${margin} position: relative; z-index: 2; flex-shrink: 0;`;
                bannerContent = `<img src="${rawImgSrc}" style="${imgStyle}" alt="Icon"> <span style="${spanStyle}">${text}</span>`;
            } else {
                const imgStyle = `position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.6; z-index: 1;`;
                bannerContent = `<img src="${rawImgSrc}" style="${imgStyle}" alt="BG"> <span style="${spanStyle} width: 100%; justify-content: inherit; text-align: ${textAlign};">${text}</span>`;
            }
        } else {
            bannerContent = `<span style="${spanStyle} width: 100%; justify-content: inherit;">${text}</span>`;
        }

        if (scrollText) {
            const speed = bannerSpeed.value || 20;
            const style = document.createElement('style');
            style.textContent = `
                @keyframes ${animId} {
                    0% { transform: translateX(100%); }
                    100% { transform: translateX(-101%); }
                }
                .${animId}-class {
                    display: flex !important;
                    align-items: center !important;
                    flex-direction: inherit !important;
                    height: 100% !important;
                    animation: ${animId} ${speed}s linear infinite !important;
                    width: max-content !important;
                    min-width: 100% !important;
                    white-space: nowrap !important;
                }
            `;
            document.head.appendChild(style);
            previewContainer.innerHTML = `<div class="${showStripes ? 'bg-stripes' : ''}" style="${containerStyle}"><span class="${animId}-class">${bannerContent}</span></div>`;
        } else {
            previewContainer.innerHTML = `<div class="${showStripes ? 'bg-stripes' : ''}" style="${containerStyle}">${bannerContent}</div>`;
        }
        
        bannerPreview.style.backgroundColor = bgColor;
        bannerPreview.style.height = `${bnHeight}px`;
        bannerPreview.style.opacity = isVisible ? '1' : '0.3';
        bannerPreview.className = `w-full bg-slate-200 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 relative group ${showStripes ? 'bg-stripes' : ''}`;
    };

    // Sincronizar UI y Vista Previa
    [bannerColor, bannerText, bannerFont, bannerFontSize, bannerLineHeight, bannerFontScale, bannerTextAlign, bannerShowImage, bannerImgSize, bannerImgHeight, bannerSpeed, bannerLoopDelay, bannerHeight, bannerVisible, bannerScroll, bannerStripes, bannerFontColor].forEach(el => {
        el.addEventListener('input', () => {
             // Actualizar labels
             if (el === bannerColor) colorHex.textContent = el.value.toUpperCase();
             if (el === bannerHeight) heightVal.textContent = el.value;
             if (el === bannerFontSize) fontSizeVal.textContent = el.value;
             if (el === bannerLineHeight) lineHeightVal.textContent = el.value;
             if (el === bannerFontScale) fontScaleVal.textContent = el.value;
             if (el === bannerImgSize) imgSizeVal.textContent = el.value;
             if (el === bannerImgHeight) imgHeightVal.textContent = el.value;
             if (el === bannerSpeed) speedVal.textContent = el.value;
             if (el === bannerLoopDelay) loopDelayVal.textContent = el.value;
             if (el === bannerFontColor) fontColorHex.textContent = el.value.toUpperCase();
             
             updatePreview();
        });
    });
    
    // Cambiar alineación
    bannerTextAlign.addEventListener('change', updatePreview);
    bannerShowImage.addEventListener('change', updatePreview);

    // Preview de imagen y CROP
    bannerImageFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (re) => {
                imageToCrop.src = re.target.result;
                cropModal.classList.remove('hidden');
                
                if (cropper) cropper.destroy();
                cropper = new Cropper(imageToCrop, {
                    viewMode: 1,
                    dragMode: 'move',
                    aspectRatio: NaN, 
                    autoCropArea: 1,
                    restore: false,
                    guides: true,
                    center: true,
                    highlight: false,
                    cropBoxMovable: true,
                    cropBoxResizable: true,
                    toggleDragModeOnDblclick: false,
                });
            };
            reader.readAsDataURL(file);
        }
    });

    // Cargar datos actuales e historial
    const { data: activeBanners, error: initialError } = await supabase.from('banners').select('*').limit(1);
    const activeBanner = activeBanners && activeBanners.length > 0 ? activeBanners[0] : null;
    
    if (initialError) {
        console.warn('Error loading initial banner:', initialError);
    }
    if (activeBanner) {
        // Usamos una función auxiliar para poblar sin ID de historial
        populateForm(activeBanner);
    }
    loadHistory();

    window.applyHistory = (id) => {
        const b = bannersHistory.find(x => x.id === id);
        if (!b) return;
        populateForm(b);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Función para obtener los datos del formulario (unificada)
    const getFormData = async () => {
        const rawImgSrc = currentBannerImg.src;
        const isRealImage = rawImgSrc && 
                           (rawImgSrc.startsWith('http') || rawImgSrc.startsWith('data:')) && 
                           !rawImgSrc.endsWith('admin/banners.html') && 
                           !rawImgSrc.endsWith('admin/banners.html?');

        let imageUrl = isRealImage ? rawImgSrc : null;
        if (croppedBlob) {
            const fileName = `banner_${Math.random()}.png`;
            const { data: uploadData, error: uploadError } = await supabase.storage.from('carousel').upload(fileName, croppedBlob);
            if (!uploadError) {
                const { data: publicUrl } = supabase.storage.from('carousel').getPublicUrl(fileName);
                imageUrl = publicUrl.publicUrl;
                croppedBlob = null;
            }
        }
        return {
            text: bannerText.value,
            bg_color: bannerColor.value,
            is_visible: bannerVisible.checked,
            scroll_text: bannerScroll.checked,
            show_stripes: bannerStripes.checked,
            height: parseInt(bannerHeight.value),
            position: bannerPosition.value,
            font_family: bannerFont.value,
            font_size: parseInt(bannerFontSize.value),
            line_height: parseFloat(bannerLineHeight.value),
            font_scale_y: parseFloat(bannerFontScale.value),
            font_color: bannerFontColor.value,
            text_align: bannerTextAlign.value,
            show_image: bannerShowImage.checked,
            image_position: bannerImagePosition.value,
            image_size: parseInt(bannerImgSize.value),
            image_height: parseInt(bannerImgHeight.value),
            scroll_speed: parseInt(bannerSpeed.value),
            loop_delay: parseInt(bannerLoopDelay.value),
            image_mode: bannerImageMode.value,
            image_url: imageUrl,
            // Asegurar que las fuentes no tengan comillas dobles innecesarias
            font_family: (bannerFont.value || "").replace(/^'|'$/g, '').trim().replace(/^"|"$/g, '').trim()
        };
        
        // Pero para el CSS necesitamos las comillas si tiene espacios
        if (data.font_family.includes(' ') && !data.font_family.includes("'")) {
            data.font_family = `'${data.font_family}'`;
        }
        
        return data;
    };

    bannerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = await getFormData();
        
        // 1. Guardar en producción
        const { data: existing } = await supabase.from('banners').select('id').eq('position', data.position).limit(1);
        
        let error;
        if (existing && existing.length > 0) {
            const { error: err } = await supabase.from('banners').update(data).eq('id', existing[0].id);
            error = err;
        } else {
            const { error: err } = await supabase.from('banners').insert(data);
            error = err;
        }

        if (error) {
            alert('Error al publicar: ' + error.message);
        } else {
            // 2. GESTIÓN DE ESTADO GLOBAL: Desactivar otros
            // Ponemos is_visible = false a todos los demás banners en producción
            await supabase.from('banners').update({ is_visible: false }).neq('position', data.position);
            
            // 3. Guardar en historial (con inteligencia para la columna is_active)
            // Agregamos un filtro .not('id', 'is', null) para permitir el update masivo en PostgREST
            const { error: resetError } = await supabase.from('banner_history').update({ is_active: false }).not('id', 'is', null);
            
            let finalHistoryData = { ...data };
            // Si resetError tiene código de "columna no existe" (PGRST204), no usamos is_active
            if (!resetError || resetError.code !== 'PGRST204') {
                finalHistoryData.is_active = true;
            }

            const { error: histError } = await supabase.from('banner_history').insert(finalHistoryData);
            
            if (!histError) loadHistory();
            
            alert('✅ ¡Publicado! Este es ahora el ÚNICO banner visible en el sitio.');
        }
    });

    const loadBannerData = async () => {
        const { data: activeBanner } = await supabase.from('banners').select('*').eq('is_visible', true).maybeSingle();
        if (activeBanner) {
            bannerText.value = activeBanner.text || '';
            bannerColor.value = activeBanner.bg_color || '#2d5cff';
            colorHex.textContent = (activeBanner.bg_color || '#2d5cff').toUpperCase();
            bannerVisible.checked = activeBanner.is_visible;
            bannerScroll.checked = activeBanner.scroll_text;
            bannerStripes.checked = activeBanner.show_stripes;
            bannerHeight.value = activeBanner.height || 50;
            heightVal.textContent = activeBanner.height || 50;
            bannerPosition.value = activeBanner.position || 'top';
            bannerFont.value = activeBanner.font_family || 'Montserrat';
            bannerFontSize.value = activeBanner.font_size || 14;
            fontSizeVal.textContent = activeBanner.font_size || 14;
            bannerLineHeight.value = activeBanner.line_height || 1;
            lineHeightVal.textContent = activeBanner.line_height || 1;
            bannerFontScale.value = activeBanner.font_scale_y || 1;
            fontScaleVal.textContent = activeBanner.font_scale_y || 1;
            bannerFontColor.value = activeBanner.font_color || '#ffffff';
            fontColorHex.textContent = (activeBanner.font_color || '#ffffff').toUpperCase();
            bannerTextAlign.value = activeBanner.text_align || 'center';
            bannerShowImage.checked = activeBanner.show_image;
            bannerImagePosition.value = activeBanner.image_position || 'left';
            bannerImgSize.value = activeBanner.image_size || 40;
            imgSizeVal.textContent = activeBanner.image_size || 40;
            bannerImgHeight.value = activeBanner.image_height || 100;
            imgHeightVal.textContent = activeBanner.image_height || 100;
            bannerSpeed.value = activeBanner.scroll_speed || 20;
            speedVal.textContent = activeBanner.scroll_speed || 20;
            bannerLoopDelay.value = activeBanner.loop_delay || 0;
            loopDelayVal.textContent = activeBanner.loop_delay || 0;
            bannerImageMode.value = activeBanner.image_mode || 'icon';
            if (activeBanner.image_url) {
                currentBannerImg.src = activeBanner.image_url;
                imagePreview.classList.remove('hidden');
            }
            updatePreview();
        }
    };

    loadBannerData();
    window.previewBanner = updatePreview;
}

async function initCarouselModule() {
    const globalOverlayForm = document.getElementById('globalOverlayForm');
    if (!globalOverlayForm) return;
    const globalEnable = document.getElementById('globalEnable');
    const globalTitle = document.getElementById('globalTitle');
    const globalSubtitle = document.getElementById('globalSubtitle');
    const globalBtnText = document.getElementById('globalBtnText');
    const globalBtnLink = document.getElementById('globalBtnLink');
    const globalPosition = document.getElementById('globalPosition');
    const saveGlobalBtn = document.getElementById('saveGlobalBtn');

    // Studio Elements
    const uploadInput = document.getElementById('carouselUploadInput');
    const uploadPrompt = document.getElementById('uploadPrompt');
    const studioPreview = document.getElementById('studioPreview');
    
    // Filters
    const fBrightness = document.getElementById('filterBrightness');
    const fContrast = document.getElementById('filterContrast');
    const fSaturation = document.getElementById('filterSaturation');
    const vBrightness = document.getElementById('valBrightness');
    const vContrast = document.getElementById('valContrast');
    const vSaturation = document.getElementById('valSaturation');
    
    // Slide Data
    const slideUploadForm = document.getElementById('slideUploadForm');
    const slideTransition = document.getElementById('slideTransition');
    const slideTitle = document.getElementById('slideTitle');
    const slideBtnText = document.getElementById('slideBtnText');
    const slideBtnLink = document.getElementById('slideBtnLink');
    const slidePosition = document.getElementById('slidePosition');
    const saveSlideBtn = document.getElementById('saveSlideBtn');
    
    const carouselList = document.getElementById('carouselList');
    
    let currentImageFile = null;

    // --- 0. PORTAL ICON UPLOAD ---
    const portalIconUpload = document.getElementById('portalIconUpload');
    const portalIconPreview = document.getElementById('portalIconPreview');
    const savePortalIconBtn = document.getElementById('savePortalIconBtn');
    let pendingIconFile = null;

    portalIconUpload?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        pendingIconFile = file;
        if (portalIconPreview) {
            portalIconPreview.src = URL.createObjectURL(file);
        }
        if (savePortalIconBtn) {
            savePortalIconBtn.classList.remove('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
        }
    });

    savePortalIconBtn?.addEventListener('click', async () => {
        if (!pendingIconFile) return;

        const originalText = savePortalIconBtn.innerHTML;
        savePortalIconBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Subiendo...';
        savePortalIconBtn.disabled = true;

        const iconContainer = portalIconPreview.parentElement;
        iconContainer.classList.add('opacity-50', 'pointer-events-none', 'animate-pulse');
        
        const fileName = `icon/${Date.now()}-${pendingIconFile.name}`;
        
        const { error: uploadError } = await window.supabase.storage.from('carousel').upload(fileName, pendingIconFile);

        if (uploadError) {
            alert('Error al subir icono: ' + uploadError.message);
        } else {
            const { data: { publicUrl } } = window.supabase.storage.from('carousel').getPublicUrl(fileName);
            
            // Save to site_settings
            await window.supabase.from('site_settings')
                .upsert({ key: 'portal_icon', value: publicUrl }, { onConflict: 'key' });
            
            savePortalIconBtn.classList.add('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
            pendingIconFile = null;
        }
        iconContainer.classList.remove('opacity-50', 'pointer-events-none', 'animate-pulse');
        savePortalIconBtn.innerHTML = originalText;
        savePortalIconBtn.disabled = false;
    });

    // --- 1. LOAD GLOBAL SETTINGS ---
    const loadGlobalSettings = async () => {
        const { data, error } = await supabase.from('site_settings').select('key, value');
        if (data) {
            data.forEach(setting => {
                if (setting.key === 'carousel_global_overlay') globalEnable.checked = setting.value === 'true';
                if (setting.key === 'carousel_global_title') globalTitle.value = setting.value;
                if (setting.key === 'carousel_global_subtitle') globalSubtitle.value = setting.value;
                if (setting.key === 'carousel_global_btn_text') globalBtnText.value = setting.value;
                if (setting.key === 'carousel_global_btn_link') globalBtnLink.value = setting.value;
                if (setting.key === 'carousel_global_position') globalPosition.value = setting.value;
                if (setting.key === 'portal_icon' && portalIconPreview) portalIconPreview.src = setting.value;
            });
        }
    };

    // --- 2. SAVE GLOBAL SETTINGS ---
    globalOverlayForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        saveGlobalBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> GUARDANDO...';
        
        const settingsToSave = [
            { key: 'carousel_global_overlay', value: globalEnable.checked.toString() },
            { key: 'carousel_global_title', value: globalTitle.value },
            { key: 'carousel_global_subtitle', value: globalSubtitle.value },
            { key: 'carousel_global_btn_text', value: globalBtnText.value },
            { key: 'carousel_global_btn_link', value: globalBtnLink.value },
            { key: 'carousel_global_position', value: globalPosition.value }
        ];

        for (const s of settingsToSave) {
            await supabase.from('site_settings')
                .update({ value: s.value })
                .eq('key', s.key);
        }
        
        saveGlobalBtn.innerHTML = '<i class="fas fa-check"></i> ¡GUARDADO!';
        setTimeout(() => {
            saveGlobalBtn.innerHTML = '<i class="fas fa-save"></i> GUARDAR CONFIGURACIÓN GLOBAL';
        }, 2000);
    });

    // --- 3. IMAGE STUDIO PREVIEW & FILTERS ---
    const updatePreviewFilters = () => {
        if (!fBrightness) return 'none';
        const b = fBrightness.value;
        const c = fContrast.value;
        const s = fSaturation.value;
        
        if (vBrightness) vBrightness.innerText = b + '%';
        if (vContrast) vContrast.innerText = c + '%';
        if (vSaturation) vSaturation.innerText = s + '%';
        
        const filterStr = `brightness(${b}%) contrast(${c}%) saturate(${s}%)`;
        if (studioPreview) studioPreview.style.filter = filterStr;
        return filterStr;
    };

    [fBrightness, fContrast, fSaturation].forEach(input => {
        input?.addEventListener('input', updatePreviewFilters);
    });

    uploadInput?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            currentImageFile = file;
            const reader = new FileReader();
            reader.onload = (e) => {
                studioPreview.src = e.target.result;
                studioPreview.classList.remove('hidden');
                uploadPrompt.classList.add('hidden');
                saveSlideBtn.disabled = false;
                saveSlideBtn.classList.remove('bg-slate-300', 'text-slate-500', 'cursor-not-allowed');
                saveSlideBtn.classList.add('bg-brand', 'text-white', 'hover:bg-blue-600', 'shadow-xl');
            };
            reader.readAsDataURL(file);
        }
    });

    // --- 4. UPLOAD NEW SLIDE ---
    slideUploadForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentImageFile) return;

        saveSlideBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> PRECESANDO MAGIA...';
        saveSlideBtn.disabled = true;

        const fileName = `carousel/${Date.now()}-${currentImageFile.name}`;
        const { error: uploadError } = await supabase.storage.from('carousel').upload(fileName, currentImageFile);

        if (uploadError) {
            alert('Error al subir imagen: ' + uploadError.message);
            saveSlideBtn.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> PUBLICAR DIAPOSITIVA';
            saveSlideBtn.disabled = false;
            return;
        }

        const { data: { publicUrl } } = supabase.storage.from('carousel').getPublicUrl(fileName);
        
        // Cargar los filtros actuales
        const finalFilter = updatePreviewFilters();

        const slideData = {
            image_url: publicUrl,
            image_filters: finalFilter,
            transition_type: slideTransition.value,
            text_content: slideTitle.value || null,
            button_text: slideBtnText.value || null,
            button_link: slideBtnLink.value || null,
            button_position: slidePosition.value
        };

        const { error: dbError } = await supabase.from('carousel').insert(slideData);
        
        if (!dbError) {
            // Reset form
            currentImageFile = null;
            slideUploadForm.reset();
            fBrightness.value = 100; fContrast.value = 100; fSaturation.value = 100;
            updatePreviewFilters();
            studioPreview.classList.add('hidden');
            uploadPrompt.classList.remove('hidden');
            saveSlideBtn.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> PUBLICAR DIAPOSITIVA';
            saveSlideBtn.disabled = true;
            saveSlideBtn.classList.add('bg-slate-300', 'text-slate-500', 'cursor-not-allowed');
            saveSlideBtn.classList.remove('bg-brand', 'text-white', 'hover:bg-blue-600', 'shadow-xl');
            
            loadCarouselList();
        } else {
            alert('Error al guardar datos: ' + dbError.message);
        }
    });

    // --- 5. LOAD CAROUSEL LIST ---
    const loadCarouselList = async () => {
        if (!carouselList) return;
        carouselList.innerHTML = '<div class="col-span-full text-center py-10 text-slate-400 italic">Cargando diapositivas...</div>';
        const { data: slides } = await supabase.from('carousel').select('*').order('created_at', { ascending: false });
        
        if (!slides || slides.length === 0) {
            carouselList.innerHTML = '<p class="col-span-full text-center py-10 text-slate-400">No hay imágenes en el carrusel.</p>';
            return;
        }

        carouselList.innerHTML = slides.map(slide => `
            <div class="relative group aspect-[16/9] rounded-3xl overflow-hidden shadow-lg border border-slate-200">
                <img src="${slide.image_url}" class="w-full h-full object-cover" style="filter: ${slide.image_filters || 'none'};">
                
                <div class="absolute inset-0 bg-slate-900/80 opacity-0 group-hover:opacity-100 transition-all flex flex-col p-6 overflow-hidden">
                    <div class="flex-1 text-white">
                        <span class="inline-block px-2 py-1 bg-brand/30 text-brand font-bold text-[10px] rounded uppercase tracking-widest mb-2">${slide.transition_type || 'Fade'}</span>
                        ${slide.text_content ? `<p class="font-bold text-sm truncate">${slide.text_content}</p>` : '<p class="text-xs text-white/50 italic">Sin texto individual</p>'}
                    </div>
                    
                    <button onclick="deleteSlide('${slide.id}', '${slide.image_url}')" class="bg-red-500/10 text-red-400 border border-red-500/20 font-bold p-3 rounded-xl hover:bg-red-500 hover:text-white transition-all text-xs w-full flex items-center justify-center gap-2 mt-auto z-10">
                        <i class="fas fa-trash-alt"></i> ELIMINAR DIAPOSITIVA
                    </button>
                </div>
            </div>
        `).join('');
    };

    loadGlobalSettings();
    loadCarouselList();
}

async function initPromotionsModule() {
    const promoForm = document.getElementById('promoForm');
    if (!promoForm) return;
    const promoList = document.getElementById('promoList');
    const promoTemplate = document.getElementById('promoTemplate');
    const heroOptions = document.getElementById('heroOptions');
    const imageUploaderSection = document.getElementById('imageUploaderSection');
    const imageSlotsContainer = document.getElementById('imageSlotsContainer');
    const heroImagePos = document.getElementById('heroImagePos');
    const promoTitle = document.getElementById('promoTitle');
    const promoBgColor = document.getElementById('promoBgColor');
    const promoBgHex = document.getElementById('promoBgHex');
    const promoAnimation = document.getElementById('promoAnimation');
    const savePromoBtn = document.getElementById('savePromoBtn');

    // Cropper & Images State
    let quillObj = null;
    let quillTitle = null; // New editor for titles
    let currentCropper = null;
    let pendingImages = []; // Array to store Blobs: { index, blob, fileExt }
    let existingImageUrls = []; // To keep track of reused images
    let currentCropIndex = -1; // Which slot is being cropped
    
    // 🔥 INYECTAR LIBRERÍA DE ANIMACIONES EN EL ADMIN PARA VISTA PREVIA
    const animStyle = document.createElement('style');
    animStyle.innerHTML = `
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translate3d(0, 40px, 0); } to { opacity: 1; transform: translate3d(0, 0, 0); } }
        @keyframes fadeInDown { from { opacity: 0; transform: translate3d(0, -40px, 0); } to { opacity: 1; transform: translate3d(0, 0, 0); } }
        @keyframes fadeInLeft { from { opacity: 0; transform: translate3d(-40px, 0, 0); } to { opacity: 1; transform: translate3d(0, 0, 0); } }
        @keyframes fadeInRight { from { opacity: 0; transform: translate3d(40px, 0, 0); } to { opacity: 1; transform: translate3d(0, 0, 0); } }
        @keyframes bounceIn { from, 20%, 40%, 60%, 80%, to { animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1); } 0% { opacity: 0; transform: scale3d(0.3, 0.3, 0.3); } 20% { transform: scale3d(1.1, 1.1, 1.1); } 40% { transform: scale3d(0.9, 0.9, 0.9); } 60% { opacity: 1; transform: scale3d(1.03, 1.03, 1.03); } 80% { transform: scale3d(0.97, 0.97, 0.97); } to { opacity: 1; transform: scale3d(1, 1, 1); } }
        @keyframes zoomIn { from { opacity: 0; transform: scale3d(0.3, 0.3, 0.3); } 50% { opacity: 1; } }
        @keyframes flipInX { from { transform: perspective(400px) rotate3d(1, 0, 0, 90deg); animation-timing-function: ease-in; opacity: 0; } 40% { transform: perspective(400px) rotate3d(1, 0, 0, -20deg); animation-timing-function: ease-in; } 60% { transform: perspective(400px) rotate3d(1, 0, 0, 10deg); opacity: 1; } 80% { transform: perspective(400px) rotate3d(1, 0, 0, -5deg); } to { transform: perspective(400px); } }
        @keyframes heartbeat { 0% { transform: scale(1); } 14% { transform: scale(1.3); } 28% { transform: scale(1); } 42% { transform: scale(1.3); } 70% { transform: scale(1); } }
        @keyframes tada { from { transform: scale3d(1, 1, 1); } 10%, 20% { transform: scale3d(0.9, 0.9, 0.9) rotate3d(0, 0, 1, -3deg); } 30%, 50%, 70%, 90% { transform: scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, 3deg); } 40%, 60%, 80% { transform: scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, -3deg); } to { transform: scale3d(1, 1, 1); } }
        /* ... more here if needed, but start with the core ... */
        @keyframes backInUp { 0% { transform: translateY(1200px) scale(0.7); opacity: 0.7; } 80% { transform: translateY(0px) scale(0.7); opacity: 0.7; } 100% { transform: scale(1); opacity: 1; } }
    `;
    document.head.appendChild(animStyle);

    // UI Event Listeners
    if (promoBgColor) {
        promoBgColor.addEventListener('input', (e) => {
            promoBgHex.textContent = e.target.value.toUpperCase();
        });
    }

    try {
        // Registrar Fuentes Personalizadas
        const Font = Quill.import('formats/font');
        Font.whitelist = ['montserrat', 'poppins', 'playfair', 'oswald', 'bebas', 'caveat'];
        Quill.register(Font, true);

        const toolbarOptions = [
            [{ 'font': Font.whitelist }, { 'size': ['small', false, 'large', 'huge'] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }],
            ['clean']
        ];

        // Editor de Título
        if (document.getElementById('editor-title-container')) {
            document.getElementById('editor-title-container').innerHTML = '';
            quillTitle = new Quill('#editor-title-container', {
                theme: 'snow',
                placeholder: 'Cabecera de impacto...',
                modules: { toolbar: toolbarOptions }
            });
            quillTitle.on('text-change', () => { setTimeout(updatePromoPreview, 50); });
        }

        // Editor de Contenido
        if (document.getElementById('editor-container')) {
            document.getElementById('editor-container').innerHTML = '';
            quillObj = new Quill('#editor-container', {
                theme: 'snow',
                placeholder: 'Cuerpo del mensaje...',
                modules: { toolbar: toolbarOptions }
            });
            quillObj.on('text-change', () => { setTimeout(updatePromoPreview, 50); });
        }
    } catch(e) { console.error('Quill is not rendering', e); }

    const updateTemplateUI = (existingImgs = null) => {
        if (!promoTemplate) return;
        const val = promoTemplate.value;
        existingImageUrls = existingImgs || [];
        
        // Handle Hero specific options (only show for hero_split layout)
        if (val === 'hero_split') heroOptions?.classList.remove('hidden');
        else heroOptions?.classList.add('hidden');
        
        // Handle Images Section dynamic slot generation based on template requirement
        const numImages = getRequiredImageCount(val);
        if (numImages === 0) {
            imageUploaderSection?.classList.add('hidden');
            if (imageSlotsContainer) imageSlotsContainer.innerHTML = '';
            pendingImages = [];
        } else {
            imageUploaderSection?.classList.remove('hidden');
            renderImageSlots(numImages, existingImageUrls);
        }
    };
    
    const renderImageSlots = (count, existingImgs = []) => {
        if (!imageSlotsContainer) return;
        let html = '';
        for (let i = 0; i < count; i++) {
            const currentImg = existingImgs[i] || '';
            html += `
                <div class="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group transition-all hover:bg-white hover:shadow-md">
                    <div class="w-20 h-20 bg-slate-200 rounded-xl overflow-hidden flex items-center justify-center relative border-2 border-white shadow-sm shrink-0">
                        <img id="promoPreviewImg_${i}" src="${currentImg}" class="${currentImg ? '' : 'hidden'} w-full h-full object-cover z-10">
                        <i class="fas fa-image text-slate-300 text-2xl z-0"></i>
                    </div>
                    <div class="flex-1 flex flex-col gap-2 w-full">
                        <label class="block text-[10px] font-bold uppercase text-slate-400">Imagen ${i+1}</label>
                        <input type="file" accept="image/*" class="hidden" id="promoFileInput_${i}" data-index="${i}">
                        <label for="promoFileInput_${i}" class="bg-white border border-slate-200 text-slate-600 font-bold py-3 px-4 rounded-xl hover:bg-slate-100 shadow-sm transition-all cursor-pointer text-xs flex justify-center items-center gap-2">
                            <i class="fas fa-crop"></i> Localizar Galería y Recortar...
                        </label>
                    </div>
                </div>
            `;
        }
        imageSlotsContainer.innerHTML = html;
        
        // Attach File Listeners
        for(let i=0; i<count; i++){
            const input = document.getElementById(`promoFileInput_${i}`);
            input?.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    currentCropIndex = i;
                    const reader = new FileReader();
                    reader.onload = (re) => {
                        const imgEl = document.getElementById('promoImageToCrop');
                        if (imgEl) {
                            imgEl.src = re.target.result;
                            document.getElementById('promoCropModal')?.classList.remove('hidden');
                            
                            const val = promoTemplate.value;
                            let ar = 4/3;
                            if (val === 'hero_split') ar = NaN;
                            if (['instagram_post', 'holographic_card', 'canva_neon_glow', 'canva_retro_wave', 'brutal_typography'].includes(val)) ar = 1;
                            if (val === 'film_strip' || val === 'parallax_window') ar = 16/9;
                            if (val === 'minimalist_editorial') ar = 3/4;

                            currentCropper = new Cropper(imgEl, {
                                viewMode: 1,
                                dragMode: 'move',
                                aspectRatio: ar,
                                autoCropArea: 1,
                                restore: false,
                                center: true,
                                highlight: false,
                                cropBoxMovable: true,
                                cropBoxResizable: true,
                            });
                        }
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    };

    window.closePromoCrop = () => {
        document.getElementById('promoCropModal')?.classList.add('hidden');
        if (currentCropper) {
            currentCropper.destroy();
            currentCropper = null;
        }
        currentCropIndex = -1;
    };

    window.applyPromoCrop = () => {
        if (!currentCropper || currentCropIndex === -1) return;
        const targetIndex = currentCropIndex; // Capture current index before it gets reset by closePromoCrop
        const canvas = currentCropper.getCroppedCanvas();
        
        // Show preview element
        const preview = document.getElementById(`promoPreviewImg_${targetIndex}`);
        if(preview) {
            preview.src = canvas.toDataURL();
            preview.classList.remove('hidden');
        }
        
        // Convert canvas to a Blob and cache it in pendingImages array
        canvas.toBlob((blob) => {
            const ext = "png";
            const existingIdx = pendingImages.findIndex(x => x.index === targetIndex);
            if(existingIdx >= 0) pendingImages.splice(existingIdx, 1);
            
            pendingImages.push({ index: targetIndex, blob, fileExt: ext });
            updatePromoPreview();
        });
        
        window.closePromoCrop();
    };

    const promoLivePreview = document.getElementById('promoLivePreview');

    const updatePromoPreview = () => {
        if (!promoLivePreview) return;
        
        const templateStr = promoTemplate.value;
        const layoutData = {
            template: templateStr,
            bgColor: promoBgColor.value,
            animation: promoAnimation.value,
            heroPos: document.getElementById('heroImagePos')?.value || 'left',
            htmlTitle: quillTitle ? quillTitle.root.innerHTML : '',
            htmlContent: quillObj ? quillObj.root.innerHTML : '',
            images: Array(getRequiredImageCount(templateStr)).fill(null).map((_, i) => {
                 const el = document.getElementById(`promoPreviewImg_${i}`);
                 return (el && !el.classList.contains('hidden') && el.src) ? el.src : null;
            })
        };
        
        promoLivePreview.innerHTML = renderAdvancedPromo(layoutData, null, true);
        promoLivePreview.querySelectorAll('.editor-content').forEach(el => el.classList.add('ql-editor'));
    };

    // Attach Live Preview Listeners
    promoTitle?.addEventListener('input', updatePromoPreview);
    promoBgColor?.addEventListener('input', updatePromoPreview);
    promoAnimation?.addEventListener('change', updatePromoPreview);
    heroImagePos?.addEventListener('change', updatePromoPreview);
    // Since heroImagePos is controlled by buttons without real 'change' events triggerable easily by the inline onclick,
    // we attach click listeners to the containing div in the html directly or observe it.
    heroOptions?.addEventListener('click', () => { setTimeout(updatePromoPreview, 10); });

    promoTemplate?.addEventListener('change', () => {
        updateTemplateUI();
        updatePromoPreview();
    });
    
    // Init rendering defaults
    if (promoTemplate) {
        updateTemplateUI();
        updatePromoPreview();
    }

    const loadPromos = async () => {
        if (!promoList) return;
        promoList.innerHTML = '<p class="text-slate-400 italic font-bold">Autenticando datos de Supabase...</p>';
        const { data: promos } = await supabase.from('promotions').select('*').order('created_at', { ascending: false });
        
        const filteredPromos = (promos || []).filter(p => !p.title || !p.title.startsWith('CONFIG_'));
        
        if (filteredPromos.length === 0) {
            promoList.innerHTML = '<div class="p-8 border-2 border-dashed border-slate-200 rounded-3xl text-center"><p class="text-slate-400 italic">No tienes bloques de promoción. ¡Crea el primero arriba!</p></div>';
            return;
        }

        promoList.innerHTML = filteredPromos.map(promo => {
            let layoutInfo = "Texto Simple (Clásico)";
            let parsedData = null;
            let bgColor = "#ffffff";
            let anim = "none";
            let title = promo.title;
            let hasImages = false;

            try {
                parsedData = JSON.parse(promo.description);
                if (parsedData.type === 'advanced_layout') {
                    if (parsedData.template === 'hero_split') layoutInfo = "Hero Split Avanzado";
                    if (parsedData.template === 'mosaic') layoutInfo = "Mosaico Multimedia";
                    if (parsedData.template === 'text_only') layoutInfo = "Bloque de Texto Rico";
                    bgColor = parsedData.bgColor || '#ffffff';
                    anim = parsedData.animation || 'none';
                    if (parsedData.images && parsedData.images.length > 0) hasImages = true;
                }
            } catch(e) {
                // Not JSON, just legacy string. Fallback safely.
            }

            return `
                <div class="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden relative group transition-all hover:shadow-2xl">
                    <!-- Ribbon -->
                    <div class="h-6 w-full opacity-80" style="background-color: ${bgColor};"></div>
                    <div class="p-6 md:p-8 flex flex-col md:flex-row justify-between md:items-center gap-6">
                        <div class="flex-1 space-y-3">
                            <div class="flex items-center gap-2 flex-wrap mb-1">
                                <span class="bg-slate-100 text-slate-500 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">${layoutInfo}</span>
                                ${anim !== 'none' ? `<span class="bg-brand/10 text-brand px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider"><i class="fas fa-magic"></i> ${anim.replace('-',' ')}</span>` : ''}
                                ${hasImages ? `<span class="bg-emerald-50 text-emerald-500 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider"><i class="fas fa-images"></i> Media</span>` : ''}
                            </div>
                            <div class="editor-content line-clamp-2">${title || 'Sin Título'}</div>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="reusePromo('${promo.id}')" class="shrink-0 bg-blue-50 text-blue-600 border-2 border-blue-100 hover:bg-blue-600 hover:text-white hover:border-blue-600 font-bold px-5 py-3 rounded-2xl transition-all text-[10px] uppercase shadow-sm flex items-center justify-center gap-2 active:scale-95">
                                <i class="fas fa-sync-alt"></i> Volver a Usar
                            </button>
                            <button onclick="deletePromo('${promo.id}')" class="shrink-0 bg-red-50 text-red-500 border-2 border-red-100 hover:bg-red-500 hover:text-white hover:border-red-500 font-bold px-5 py-3 rounded-2xl transition-all text-[10px] uppercase shadow-sm flex items-center justify-center gap-2 active:scale-95">
                                <i class="fas fa-trash-alt"></i> Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    };

    promoForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        savePromoBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> CREANDO ESTRUCTURA EN SERVIDOR...';
        savePromoBtn.classList.add('opacity-70', 'cursor-not-allowed', 'pointer-events-none');

        const htmlContent = quillObj ? quillObj.root.innerHTML : '';
        const titleStr = promoTitle.value;
        const templateStr = promoTemplate.value;
        const requiredImages = getRequiredImageCount(templateStr);
        
        let uploadedImageUrls = Array(requiredImages).fill(null);
        console.log("Iniciando guardado. Requeridas:", requiredImages, "En cola:", pendingImages.length);

        // Upload any pending edited image to Supabase Storage in 'promocion' bucket
        if (requiredImages > 0 && pendingImages.length > 0) {
            console.log("Enviando imágenes al bucket 'promocion'...", pendingImages);
            const uploadPromises = pendingImages.map(async (imgObj) => {
                const fName = `promo_${Math.random().toString(36).substring(2,9)}.png`;
                const { error: upErr } = await supabase.storage.from('promocion').upload(fName, imgObj.blob);
                
                if (!upErr) {
                    const { data: pubData } = supabase.storage.from('promocion').getPublicUrl(fName);
                    const publicUrl = pubData?.publicUrl;
                    if (publicUrl) {
                        uploadedImageUrls[imgObj.index] = publicUrl;
                    }
                } else {
                    console.error("Fallo al subir imagen:", upErr);
                    // Alertar al usuario para depuración inmediata
                    alert(`Error en bucket 'promocion': ${upErr.message}. Asegúrate que el bucket existe y es PÚBLICO.`);
                }
                return true;
            });
            await Promise.all(uploadPromises);
            console.log("URLs subidas:", uploadedImageUrls);
        }

        // The Magic Payload: bypass manual DB change by hiding advanced fields in 'description' text JSON
        const layoutData = {
            type: "advanced_layout",
            template: templateStr,
            bgColor: promoBgColor.value,
            animation: promoAnimation.value,
            heroPos: document.getElementById('heroImagePos')?.value || 'left',
            htmlTitle: quillTitle ? quillTitle.root.innerHTML : '',
            htmlContent: htmlContent,
            images: uploadedImageUrls.map((url, i) => url || existingImageUrls[i] || null) // Keep existing if not replaced
        };

        const finalDescription = JSON.stringify(layoutData);
        console.log("ENVIANDO A DB (Stingified):", finalDescription);
        console.log("DATOS EN ARRAY IMAGES:", layoutData.images);
        
        // Save to promotions table. We also backup the first image in image_url column for legacy reasons
        const { error } = await supabase.from('promotions').insert({ 
            title: "Promo " + templateStr, // Note: We use the rich title editor now, so root title is just for internal ID
            description: finalDescription,
            image_url: layoutData.images[0] || null
        });
        
        savePromoBtn.innerHTML = '<i class="fas fa-rocket"></i> AGREGAR CONTENEDOR (Promoción)';
        savePromoBtn.classList.remove('opacity-70', 'cursor-not-allowed', 'pointer-events-none');

        if (error) {
            alert('Error crítico de red: ' + error.message);
        } else {
            promoForm.reset();
            if (quillObj) quillObj.setContents([]);
            if (quillTitle) quillTitle.setContents([]);
            if (promoBgHex) promoBgHex.textContent = '#FFFFFF';
            pendingImages = [];
            existingImageUrls = [];
            updateTemplateUI();
            alert('✨ ¡El Bloque se ha insertado al sitio en vivo con éxito!');
            loadPromos();
        }
    });

    const loadActivePromo = async () => {
        const { data: activePromo } = await supabase.from('promotions').select('*').eq('active', true).maybeSingle();
        if (activePromo && activePromo.id) {
            window.reusePromo(activePromo.id);
        }
    };

    window.reusePromo = async (id) => {
        const { data: promo } = await supabase.from('promotions').select('*').eq('id', id).single();
        if (!promo) return;

        try {
            const pData = typeof promo.description === 'string' ? JSON.parse(promo.description) : promo.description;
            if (pData.type === 'advanced_layout') {
                // 1. Campos Básicos
                if (promoTemplate) promoTemplate.value = pData.template;
                if (promoBgColor) {
                    promoBgColor.value = pData.bgColor || '#ffffff';
                    if (promoBgHex) promoBgHex.textContent = (pData.bgColor || '#ffffff').toUpperCase();
                }
                if (promoAnimation) promoAnimation.value = pData.animation || 'none';
                if (document.getElementById('heroImagePos')) {
                    document.getElementById('heroImagePos').value = pData.heroPos || 'left';
                }

                // 2. Editores Quill
                if (quillTitle) quillTitle.root.innerHTML = pData.htmlTitle || pData.title || '';
                if (quillObj) quillObj.root.innerHTML = pData.htmlContent || '';

                // 3. Imágenes y UI
                updateTemplateUI(pData.images || []);
                updatePromoPreview();

                // 4. Scroll al editor para comodidad del usuario
                window.scrollTo({ top: 0, behavior: 'smooth' });
                
                // Notificar
                console.log("Promoción cargada para reutilizar:", pData);
            }
        } catch(e) {
            console.error("Error al reutilizar promoción:", e);
        }
    };

    window.deletePromo = async (id) => {
        if (!confirm('¿Estás seguro de eliminar esta promoción?')) return;
        
        // 1. Obtener datos para limpiar Storage
        const { data: promo } = await supabase.from('promotions').select('*').eq('id', id).single();
        if (promo) {
            let filesToDelete = [];
            if (promo.image_url) {
                const parts = promo.image_url.split('/');
                filesToDelete.push(parts[parts.length - 1]);
            }
            
            try {
                const pData = typeof promo.description === 'string' ? JSON.parse(promo.description) : promo.description;
                if (pData.images && Array.isArray(pData.images)) {
                    pData.images.forEach(url => {
                        if (url) {
                            const parts = url.split('/');
                            filesToDelete.push(parts[parts.length - 1]);
                        }
                    });
                }
            } catch(e) {}

            const uniqueFiles = [...new Set(filesToDelete)];
            if (uniqueFiles.length > 0) {
                console.log("Limpiando archivos de Storage:", uniqueFiles);
                await supabase.storage.from('promocion').remove(uniqueFiles);
                await supabase.storage.from('carousel').remove(uniqueFiles);
            }
        }

        // 2. Borrar de DB
        const { error } = await supabase.from('promotions').delete().eq('id', id);
        if (error) {
            alert("Error al eliminar de la base de datos: " + error.message);
        } else {
            loadPromos(); 
        }
    };

    // Start fetching
    loadPromos();
    loadActivePromo();
}

// --- FUNCIONES GLOBALES (Window access) ---

window.triggerPreviewAnimation = () => {
    const el = document.getElementById('promoPreviewContainer');
    if (!el) return;
    
    // Obtenemos la animación actual
    const anim = promoAnimation.value;
    if (anim === 'none') return;

    // Mapeo (mismo que en renderer)
    const map = {
        'fade-in': 'fadeIn', 'fade-up': 'fadeInUp', 'fade-down': 'fadeInDown', 'fade-left': 'fadeInLeft', 'fade-right': 'fadeInRight',
        'bounce-in': 'bounceIn', 'bounce-up': 'bounceInUp', 'bounce-down': 'bounceInDown',
        'zoom-in': 'zoomIn', 'zoom-up': 'zoomInUp', 'zoom-out': 'zoomOut',
        'flip-up': 'flipInX', 'flip-side': 'flipInY', 'rotate-in': 'rotateIn',
        'back-in-up': 'backInUp', 'heartbeat': 'heartbeat', 'tada': 'tada', 'jello': 'jello', 'swing': 'swing',
        'light-speed-in': 'lightSpeedInRight', 'roll-in': 'rollIn', 'rubber-band': 'rubberBand'
    };
    const keyframe = map[anim] || 'fadeIn';

    // Reiniciamos animación borrando y re-añadiendo el estilo
    el.style.animation = 'none';
    void el.offsetWidth; // Force reflow
    el.style.animation = `${keyframe} 0.8s both`;
};



window.deleteSlide = async (id, url) => {
    if (!confirm('¿Eliminar esta imagen del carrusel?')) return;
    
    // 1. DB
    await supabase.from('carousel').delete().eq('id', id);
    
    // 2. Storage
    try {
        const path = url.split('/').pop();
        await supabase.storage.from('carousel').remove([path]);
    } catch (e) {}

    window.location.reload(); // Recargar la página limpia
};

window.deleteHistoryItem = async (id, imageUrl) => {
    if (!confirm('¿Estás seguro de eliminar esta publicación de forma permanente de TODO el sistema?')) return;
    
    // 1. Eliminar de historial Y de la tabla banners (producción)
    const { error: historyError } = await supabase.from('banner_history').delete().eq('id', id);
    await supabase.from('banners').delete().eq('id', id);

    // 2. Eliminar imagen de storage
    if (imageUrl && imageUrl.includes('carousel')) {
        try {
            const fileName = imageUrl.split('/').pop();
            await supabase.storage.from('carousel').remove([fileName]);
        } catch (e) {
            console.error("Error al borrar imagen:", e);
        }
    }

    if (historyError) {
        alert('Error al eliminar: ' + historyError.message);
    } else {
        alert('✅ Eliminado con éxito del servidor');
        window.location.reload(); 
    }
};

window.toggleHistoryActive = async (id) => {
    // 1. Desactivar todos
    await supabase.from('banner_history').update({ is_active: false }).neq('id', '00000000-0000-0000-0000-000000000000');
    // 2. Activar el seleccionado
    await supabase.from('banner_history').update({ is_active: true }).eq('id', id);
    
    initBannerModule(); // Recargar UI
};

/**
 * Lógica de Analíticas Profesionales (Dashboard)
 */
async function initAnalytics() {
    const trafficChartCtx = document.getElementById('trafficChart')?.getContext('2d');
    const chartTypeSelector = document.getElementById('chartType');
    const statToday = document.getElementById('statToday');
    const statWeek = document.getElementById('statWeek');
    const statTotal = document.getElementById('statTotal');
    const pagesList = document.getElementById('pagesList');
    
    if (!trafficChartCtx) return;

    let myChart = null;

    const updateDashboard = async () => {
        // 1. Obtener Datos
        const { data: views, error } = await supabase
            .from('page_views')
            .select('*')
            .order('view_date', { ascending: true });

        if (error || !views) return;

        // 2. Estadísticas
        const todayStr = new Date().toISOString().split('T')[0];
        const lastWeekDate = new Date();
        lastWeekDate.setDate(lastWeekDate.getDate() - 7);

        const viewsToday = views.filter(v => v.view_date === todayStr).length;
        const viewsWeek = views.filter(v => new Date(v.view_date) >= lastWeekDate).length;
        const viewsTotal = views.length;

        if (statToday) statToday.innerText = viewsToday;
        if (statTotal) statTotal.innerText = viewsTotal;
        if (statWeek) statWeek.innerText = viewsWeek;

        // 3. Agrupar
        const groupedData = {};
        views.forEach(v => {
            groupedData[v.view_date] = (groupedData[v.view_date] || 0) + 1;
        });

        // 4. Chart.js
        if (myChart) myChart.destroy();
        
        const labels = Object.keys(groupedData).slice(-15);
        const counts = labels.map(l => groupedData[l]);

        const gradient = trafficChartCtx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(45, 92, 255, 0.4)');
        gradient.addColorStop(1, 'rgba(45, 92, 255, 0)');

        myChart = new Chart(trafficChartCtx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Visitas Únicas',
                    data: counts,
                    borderColor: '#2D5CFF', // Azul Brand Vibrante
                    backgroundColor: gradient,
                    borderWidth: 6, // Línea más gruesa
                    fill: true,
                    tension: 0.45, // Curvas más orgánicas para "montañas"
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#2D5CFF',
                    pointBorderWidth: 4,
                    pointRadius: 8, // "Velas" o puntos más grandes
                    pointHoverRadius: 12,
                    pointHoverBackgroundColor: '#2D5CFF',
                    pointHoverBorderColor: '#fff',
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { 
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#0F172A',
                        titleFont: { size: 14, weight: '900' },
                        padding: 12,
                        cornerRadius: 12,
                        displayColors: false
                    }
                },
                scales: {
                    y: { 
                        beginAtZero: true, 
                        grid: { display: true, color: 'rgba(0,0,0,0.03)', drawBorder: false },
                        ticks: { font: { weight: 'bold' }, stepSize: 1 }
                    },
                    x: { 
                        grid: { display: false },
                        ticks: { font: { weight: 'bold' } }
                    }
                }
            }
        });

        // 5. Distribución de Páginas
        if (pagesList) {
            const pages = {};
            views.forEach(v => pages[v.path] = (pages[v.path] || 0) + 1);
            
            pagesList.innerHTML = Object.entries(pages)
                .sort((a,b) => b[1] - a[1])
                .slice(0, 8) // Mostrar un poco más si hay espacio
                .map(([path, count]) => `
                    <div class="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group">
                        <span class="text-[10px] font-black uppercase text-slate-500 truncate mr-2 flex-1" title="${path}">${path}</span>
                        <span class="bg-brand text-white text-[8px] font-black px-2 py-1 rounded-lg shadow-sm group-hover:bg-blue-600 transition-colors">${count} VISTAS</span>
                    </div>
                `).join('') || '<p class="text-xs italic text-slate-400">Esperando datos...</p>';
        }
    };

    updateDashboard();
    setInterval(updateDashboard, 60000);
}

// Support for Animation Preview Button
window.triggerPreviewAnimation = () => {
    const container = document.getElementById('promoPreviewContainer');
    if (!container) return;
    const currentAnim = container.style.animation;
    if (!currentAnim || currentAnim === 'none') return;
    
    // Reset animation to trigger it again
    container.style.animation = 'none';
    void container.offsetWidth; // Trigger reflow
    container.style.animation = currentAnim;
};

/**
 * E. MÓDULO DE CONFIGURACIÓN DE CUOTAS / TRANSPARENCIA
 */
async function initCuotasConfigModule() {
    const cuotasForm = document.getElementById('cuotasForm');
    if (!cuotasForm) return;
    const saveBtn = document.getElementById('saveCuotasBtn');
    const previewContainer = document.getElementById('cuotasPreview');
    
    let quillTitle1, quillSubtitle1, quillDesc2;
    let pendingCuotasImages = [null, null]; // [0: Table, 1: Presentation]
    let currentCuotasCropper = null;
    let currentCuotasCropIndex = -1;

    // 1. Iniciar Editores Quill
    const quillConfig = {
        theme: 'snow',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline'],
                [{ 'color': [] }],
                [{ 'align': [] }],
                ['clean']
            ]
        }
    };

    quillTitle1 = new Quill('#editor-title1', quillConfig);
    quillSubtitle1 = new Quill('#editor-subtitle1', quillConfig);
    quillDesc2 = new Quill('#editor-desc2', quillConfig);

    // 2. Cargar Configuración Existente
    const loadConfig = async () => {
        const { data, error } = await supabase
            .from('promotions')
            .select('*')
            .eq('title', 'CONFIG_CUOTAS')
            .maybeSingle();

        if (data && data.description) {
            const config = typeof data.description === 'string' ? JSON.parse(data.description) : data.description;
            
            quillTitle1.root.innerHTML = config.title1 || '';
            quillSubtitle1.root.innerHTML = config.subtitle1 || '';
            quillDesc2.root.innerHTML = config.desc2 || '';
            document.getElementById('feature1').value = config.feature1 || '';
            document.getElementById('feature2').value = config.feature2 || '';
            document.getElementById('title2').value = config.title2 || '';
            document.getElementById('floatingText').value = config.floatingText || '';
            
            if (config.imgTable) {
                const img0 = document.getElementById('previewImg0');
                img0.src = config.imgTable;
                img0.classList.remove('hidden');
                pendingCuotasImages[0] = config.imgTable;
            }
            if (config.imgPresentation) {
                const img1 = document.getElementById('previewImg1');
                img1.src = config.imgPresentation;
                img1.classList.remove('hidden');
                pendingCuotasImages[1] = config.imgPresentation;
            }
            updatePreview();
        } else {
            // Default initial state (Cloud Fallbacks)
            quillTitle1.root.innerHTML = 'Transparencia <span class="text-brand">Total</span>';
            quillSubtitle1.root.innerHTML = '<p>Creemos en relaciones a largo plazo. Sin letras pequeñas, sin cargos ocultos. Solo soluciones reales.</p>';
            quillDesc2.root.innerHTML = '<p>En B&H Préstamos creemos en la claridad. Nuestra tabla de amortización te permite conocer exactamente lo que pagarás, sin sorpresas ni letras pequeñas.</p>';
            
            pendingCuotasImages[0] = 'https://rjstcmowxhlfbualhtao.supabase.co/storage/v1/object/public/promocion/img_tabla.jpg';
            pendingCuotasImages[1] = 'https://rjstcmowxhlfbualhtao.supabase.co/storage/v1/object/public/promocion/img_presentacion.jpg';
            
            updatePreview();
        }
    };

    // 3. Sistema de Previsualización
    const updatePreview = () => {
        if (!previewContainer) return;

        const data = {
            title1: quillTitle1.root.innerHTML,
            subtitle1: quillSubtitle1.root.innerHTML,
            feature1: document.getElementById('feature1').value,
            feature2: document.getElementById('feature2').value,
            title2: document.getElementById('title2').value,
            desc2: quillDesc2.root.innerHTML,
            floatingText: document.getElementById('floatingText').value,
            imgTable: pendingCuotasImages[0] || 'https://rjstcmowxhlfbualhtao.supabase.co/storage/v1/object/public/promocion/img_tabla.jpg',
            imgPresentation: pendingCuotasImages[1] || 'https://rjstcmowxhlfbualhtao.supabase.co/storage/v1/object/public/promocion/img_presentacion.jpg'
        };

        previewContainer.innerHTML = `
            <div class="space-y-8">
                <div class="editor-content ql-editor !p-0">
                    ${data.title1 || '<h3 class="text-3xl md:text-5xl font-extrabold mb-8 italic text-white">Transparencia <span class="text-brand">Total</span></h3>'}
                </div>
                <div class="editor-content ql-editor !p-0 !text-slate-300 !text-xl">
                    ${data.subtitle1 || '<p>Cargando descripción...</p>'}
                </div>
                <div class="flex flex-wrap gap-6 mt-8">
                    <div class="flex items-center gap-3">
                        <i class="fas fa-check-circle text-brand text-2xl"></i>
                        <span class="font-semibold text-white">${data.feature1 || 'Tasas Competitivas'}</span>
                    </div>
                    <div class="flex items-center gap-3">
                        <i class="fas fa-check-circle text-brand text-2xl"></i>
                        <span class="font-semibold text-white">${data.feature2 || 'Aprobación en 24h'}</span>
                    </div>
                </div>
                <div class="mt-12">
                    <h2 class="text-4xl font-bold mb-8 text-white">${data.title2 || 'Transparencia en cada cuota'}</h2>
                    <div class="editor-content ql-editor !p-0 !text-white/70 !text-lg !leading-relaxed mb-10">
                        ${data.desc2 || ''}
                    </div>
                    <img src="${data.imgTable}" alt="Tabla" class="rounded-2xl shadow-2xl border-4 border-white/10 w-full max-w-md">
                </div>
            </div>
            <div class="relative group mt-12 lg:mt-0">
                <img src="${data.imgPresentation}" alt="Presentación" class="rounded-3xl shadow-2xl skew-y-2 w-full">
                <div class="absolute -bottom-6 -left-6 bg-accent p-8 rounded-2xl text-slate-900 font-bold text-xl shadow-xl">
                    ${data.floatingText || '¡Somos tu mejor opción!'}
                </div>
            </div>
        `;
    };

    // Listeners para previsualización instantánea
    [quillTitle1, quillSubtitle1, quillDesc2].forEach(q => q.on('text-change', updatePreview));
    ['feature1', 'feature2', 'title2', 'floatingText'].forEach(id => {
        document.getElementById(id).addEventListener('input', updatePreview);
    });

    // 4. Gestión de Imágenes y Cropper
    window.openCuotasCrop = (index, input) => {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                currentCuotasCropIndex = index;
                const modal = document.getElementById('cuotasCropModal');
                const image = document.getElementById('cuotasImageToCrop');
                image.src = e.target.result;
                modal.classList.remove('hidden');

                if (currentCuotasCropper) currentCuotasCropper.destroy();
                currentCuotasCropper = new Cropper(image, {
                    aspectRatio: index === 0 ? 1.5 : 1.2, // Tabla vs Tarjeta
                    viewMode: 1,
                    background: false
                });
            };
            reader.readAsDataURL(input.files[0]);
        }
    };

    window.closeCuotasCrop = () => {
        document.getElementById('cuotasCropModal').classList.add('hidden');
        if (currentCuotasCropper) {
            currentCuotasCropper.destroy();
            currentCuotasCropper = null;
        }
    };

    window.applyCuotasCrop = async () => {
        const canvas = currentCuotasCropper.getCroppedCanvas();
        const base64 = canvas.toDataURL('image/jpeg', 0.8);
        
        pendingCuotasImages[currentCuotasCropIndex] = base64;
        const previewEl = document.getElementById(`previewImg${currentCuotasCropIndex}`);
        previewEl.src = base64;
        previewEl.classList.remove('hidden');
        
        updatePreview();
        window.closeCuotasCrop();
    };

    // 5. Guardado Final
    cuotasForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner animate-spin"></i> GUARDANDO...';

        try {
            // A. Subir imágenes si son nuevas (Base64)
            const finalImages = [...pendingCuotasImages];
            for (let i = 0; i < 2; i++) {
                if (finalImages[i] && finalImages[i].startsWith('data:image')) {
                    const blob = await (await fetch(finalImages[i])).blob();
                    const fileName = `cuotas_${Date.now()}_${i}.jpg`;
                    
                    const { data: uploadData, error: uploadError } = await supabase.storage
                        .from('promocion')
                        .upload(fileName, blob);

                    if (uploadError) throw uploadError;
                    
                    const { data: { publicUrl } } = supabase.storage
                        .from('promocion')
                        .getPublicUrl(fileName);
                    
                    finalImages[i] = publicUrl;
                }
            }

            // B. Preparar JSON de configuración
            const configData = {
                title1: quillTitle1.root.innerHTML,
                subtitle1: quillSubtitle1.root.innerHTML,
                feature1: document.getElementById('feature1').value,
                feature2: document.getElementById('feature2').value,
                title2: document.getElementById('title2').value,
                desc2: quillDesc2.root.innerHTML,
                floatingText: document.getElementById('floatingText').value,
                imgTable: finalImages[0],
                imgPresentation: finalImages[1]
            };

            // C. Guardar en Supabase (Upsert Manual)
            const { data: existing } = await supabase
                .from('promotions')
                .select('id')
                .eq('title', 'CONFIG_CUOTAS')
                .maybeSingle();

            const payload = {
                title: 'CONFIG_CUOTAS',
                description: configData,
                image_url: finalImages[0] || null,
                active: false 
            };

            let saveResult;
            if (existing) {
                saveResult = await supabase
                    .from('promotions')
                    .update(payload)
                    .eq('id', existing.id);
            } else {
                saveResult = await supabase
                    .from('promotions')
                    .insert([payload]);
            }

            if (saveResult.error) throw saveResult.error;

            alert('¡Configuración guardada correctamente!');
            window.location.reload();

        } catch (err) {
            console.error(err);
            alert('Error al guardar: ' + err.message);
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="fas fa-save"></i> GUARDAR CONFIGURACIÓN GLOBAL';
        }
    });

    loadConfig();
}

/**
 * --- MÓDULO DE PIE DE PÁGINA Y REDES SOCIALES ---
 */
async function initFooterModule() {
    const footerForm = document.getElementById('footerForm');
    if (!footerForm) return;

    const footerPreview = document.getElementById('footerPreview');
    const copyrightPreview = document.getElementById('copyrightPreview');
    const socialMediaItems = document.getElementById('socialMediaItems');
    const footerPreviewContainer = document.getElementById('footerPreviewContainer');

    // Inputs
    const footerBgColor = document.getElementById('footerBgColor');
    const logoTitle = document.getElementById('logoTitle');
    const copyrightText = document.getElementById('copyrightText');
    const hoursTitle = document.getElementById('hoursTitle');
    const contactTitle = document.getElementById('contactTitle');
    const btnLink = document.getElementById('btnLink');
    const saveFooterBtn = document.getElementById('saveFooterBtn');
    
    if (!saveFooterBtn) return;

    const presetIcons = [
        { name: 'Facebook', class: 'fab fa-facebook-f' },
        { name: 'Instagram', class: 'fab fa-instagram' },
        { name: 'WhatsApp', class: 'fab fa-whatsapp' },
        { name: 'X/Twitter', class: 'fab fa-x-twitter' },
        { name: 'TikTok', class: 'fab fa-tiktok' },
        { name: 'YouTube', class: 'fab fa-youtube' },
        { name: 'Web', class: 'fas fa-globe' }
    ];

    let socials = [];

    // --- INSTANT DEFAULTS (Fast Render) ---
    const setDefaults = () => {
        if (footerBgColor) footerBgColor.value = '#0f172a';
        if (logoTitle) logoTitle.value = 'B&H <span class="text-brand">PRÉSTAMOS</span>';
        if (copyrightText) copyrightText.value = '© 2026 B&H Préstamos. Todos los derechos reservados.';
        if (hoursTitle) hoursTitle.value = 'Horarios de Atención';
        if (contactTitle) contactTitle.value = 'Contacto Directo';
        
        const phoneEl = document.getElementById('phoneText');
        const btnTextEl = document.getElementById('btnText');
        if (phoneEl) phoneEl.value = '(809) 789-5676';
        if (btnTextEl) btnTextEl.value = 'Solicitar Crédito Online';
        if (btnLink) btnLink.value = 'solicitud_español.html';

        const descElem = document.getElementById('editor-description');
        const hoursElem = document.getElementById('editor-hours');
        if (descElem) descElem.innerHTML = '<p>Líderes en soluciones financieras personalizadas.</p>';
        if (hoursElem) hoursElem.innerHTML = '<p>Lunes - Viernes: 8:00 AM - 6:00 PM</p>';

        socials = [
            { id: '1', icon: 'fab fa-facebook-f', link: '#', color: '#ffffff', bgColor: '#1e293b' },
            { id: '2', icon: 'fab fa-instagram', link: '#', color: '#ffffff', bgColor: '#1e293b' },
            { id: '3', icon: 'fab fa-whatsapp', link: '#', color: '#ffffff', bgColor: '#1e293b' }
        ];
    };

    setDefaults();

    // Quill Editors
    const quillDesc = new Quill('#editor-description', { 
        theme: 'snow', 
        placeholder: 'Escribe una descripción...',
        modules: { toolbar: [['bold', 'italic', 'underline'], [{ 'color': [] }]] } 
    });
    const quillHours = new Quill('#editor-hours', { 
        theme: 'snow', 
        placeholder: 'Lunes - Viernes: 8:00 AM...',
        modules: { toolbar: [['bold', 'italic'], [{ 'list': 'unordered' }]] } 
    });

    // Initial render for instant feedback
    renderSocials();
    updatePreview();

    // 1. Gestión de Redes Sociales
    window.addSocialItem = (data = { icon: 'fab fa-facebook-f', link: '#', color: '#ffffff', bgColor: '#1e293b' }) => {
        const id = String(Date.now() + Math.random());
        socials.push({ ...data, id });
        renderSocials();
    };

    window.removeSocialItem = (id) => {
        id = String(id);
        socials = socials.filter(s => String(s.id) !== id);
        renderSocials();
    };

    window.updateSocialItem = (id, field, value) => {
        id = String(id);
        const item = socials.find(s => String(s.id) === id);
        if (item) {
            item[field] = value;
            updatePreview();
            // Si es un cambio visual, refrescamos la lista para mostrar el botón "activo"
            if (field === 'icon' || field === 'color' || field === 'bgColor') {
                renderSocials();
            }
        }
    };

    function renderSocials() {
        socialMediaItems.innerHTML = socials.map(s => `
            <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4">
                <div class="flex items-center justify-between">
                    <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Configurar Red Social</span>
                    <button type="button" onclick="window.removeSocialItem(${s.id})" class="text-red-400 hover:text-red-600 transition-colors text-xs">
                        <i class="fas fa-trash-alt"></i> ELIMINAR
                    </button>
                </div>
                
                <div class="space-y-3">
                    <label class="block text-[8px] font-bold text-slate-400 uppercase">1. Elige un Icono Visualmente</label>
                    <div class="flex flex-wrap gap-2 p-2 bg-slate-50 rounded-lg">
                        ${presetIcons.map(p => `
                            <button type="button" onclick="window.updateSocialItem('${s.id}', 'icon', '${p.class}')" 
                                class="w-8 h-8 rounded flex items-center justify-center transition-all ${s.icon === p.class ? 'bg-brand text-white shadow-md scale-110' : 'bg-white text-slate-400 hover:bg-slate-100'}"
                                title="${p.name}">
                                <i class="${p.class}"></i>
                            </button>
                        `).join('')}
                    </div>
                </div>

                <div class="grid grid-cols-1 gap-3">
                    <div class="space-y-1">
                        <label class="block text-[8px] font-bold text-slate-400 uppercase">2. Enlace (Link de la Red Social)</label>
                        <input type="text" placeholder="https://facebook.com/tu-pagina" value="${s.link}" oninput="window.updateSocialItem('${s.id}', 'link', this.value)" class="w-full p-2 border rounded-lg text-xs font-bold bg-slate-50">
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div class="flex items-center gap-2">
                        <label class="text-[8px] font-bold text-slate-400">COLOR ICONO</label>
                        <input type="color" value="${s.color}" oninput="window.updateSocialItem('${s.id}', 'color', this.value)" class="flex-1 h-8 rounded border p-0.5 cursor-pointer">
                    </div>
                    <div class="flex items-center gap-2">
                        <label class="text-[8px] font-bold text-slate-400">FONDO CÍRCULO</label>
                        <input type="color" value="${s.bgColor}" oninput="window.updateSocialItem('${s.id}', 'bgColor', this.value)" class="flex-1 h-8 rounded border p-0.5 cursor-pointer">
                    </div>
                </div>
            </div>
        `).join('');
        updatePreview();
    };

    // 2. Previsualización en Vivo
    function updatePreview() {
        if (!footerPreview || !footerPreviewContainer) return;

        footerPreviewContainer.style.backgroundColor = footerBgColor.value;
        
        const socialHtml = socials.map(s => `
            <a href="${s.link}" class="w-10 h-10 rounded-full flex items-center justify-center transition-all group" style="background-color: ${s.bgColor}">
                <i class="${s.icon}" style="color: ${s.color}"></i>
            </a>
        `).join('');

        footerPreview.innerHTML = `
            <div class="flex flex-col h-full">
                <h4 class="text-2xl font-bold text-white mb-6 uppercase tracking-tighter">${logoTitle.value || 'LOGO'}</h4>
                <div class="text-slate-400 text-sm leading-relaxed mb-8 ql-editor !p-0 flex-1">${quillDesc.root.innerHTML}</div>
                <div class="flex gap-4 mt-auto">${socialHtml}</div>
            </div>
            <div class="flex flex-col h-full">
                <h5 class="font-bold text-lg mb-6 text-white border-b border-white/5 pb-2">${hoursTitle.value || 'Horarios'}</h5>
                <div class="text-slate-400 space-y-3 ql-editor !p-0 flex-1">
                    ${quillHours.root.innerHTML}
                </div>
            </div>
            <div class="flex flex-col h-full">
                <h5 class="font-bold text-lg mb-6 text-white border-b border-white/5 pb-2">${contactTitle.value || 'Contacto'}</h5>
                <div class="space-y-4 flex-1">
                    <p class="text-slate-400 font-bold text-lg">${phoneText.value}</p>
                    <button class="w-full bg-white/10 px-6 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest border border-white/5 shadow-xl hover:bg-white/20 transition-all text-white text-center">${btnText.value}</button>
                </div>
            </div>
        `;
        copyrightPreview.innerHTML = copyrightText.value;
    };

    // Listeners
    [footerBgColor, logoTitle, copyrightText, phoneText, btnText, hoursTitle, contactTitle, btnLink].forEach(el => {
        el?.addEventListener('input', updatePreview);
    });
    quillDesc.on('text-change', updatePreview);
    quillHours.on('text-change', updatePreview);

    // 3. Cargar Datos
    const loadFooterData = async () => {
        const { data, error } = await supabase
            .from('promotions')
            .select('*')
            .eq('title', 'CONFIG_FOOTER')
            .maybeSingle();
        
        if (data && data.description) {
            const config = typeof data.description === 'string' ? JSON.parse(data.description) : data.description;
            
            footerBgColor.value = config.footerBg || '#0f172a';
            logoTitle.value = config.logoTitle || 'B&H <span class="text-brand">PRÉSTAMOS</span>';
            copyrightText.value = config.copyright || '© 2026 B&H Préstamos. Todos los derechos reservados.';
            
            hoursTitle.value = config.hoursTitle || 'Horarios de Atención';
            contactTitle.value = config.contactTitle || 'Contacto Directo';
            
            phoneText.value = config.phone || '(809) 789-5676';
            btnText.value = config.btnText || 'Solicitar Crédito Online';
            btnLink.value = config.btnLink || 'solicitud_español.html';
            
            quillDesc.root.innerHTML = config.description || '<p>Líderes en soluciones financieras personalizadas.</p>';
            quillHours.root.innerHTML = config.hoursContent || '<p>Lunes - Viernes: 8:00 AM - 6:00 PM</p>';
            
            socials = config.socials || [
                { id: '1', icon: 'fab fa-facebook-f', link: '#', color: '#ffffff', bgColor: '#1e293b' },
                { id: '2', icon: 'fab fa-instagram', link: '#', color: '#ffffff', bgColor: '#1e293b' },
                { id: '3', icon: 'fab fa-whatsapp', link: '#', color: '#ffffff', bgColor: '#1e293b' }
            ];
            socials.forEach(s => s.id = s.id || (Date.now() + Math.random()));
            renderSocials();
        } else {
            // Hard Defaults if no data at all
            footerBgColor.value = '#0f172a';
            logoTitle.value = 'B&H <span class="text-brand">PRÉSTAMOS</span>';
            copyrightText.value = '© 2026 B&H Préstamos. Todos los derechos reservados.';
            hoursTitle.value = 'Horarios de Atención';
            contactTitle.value = 'Contacto Directo';
            phoneText.value = '(809) 789-5676';
            btnText.value = 'Solicitar Crédito Online';
            btnLink.value = 'solicitud_español.html';
            
            quillDesc.root.innerHTML = '<p>Líderes en soluciones financieras personalizadas. Tu aliado estratégico comercial y personal.</p>';
            quillHours.root.innerHTML = '<p>Lunes - Viernes: 8:00 AM - 6:00 PM</p>';
            
            socials = [
                { id: '1', icon: 'fab fa-facebook-f', link: '#', color: '#ffffff', bgColor: '#1e293b' },
                { id: '2', icon: 'fab fa-instagram', link: '#', color: '#ffffff', bgColor: '#1e293b' },
                { id: '3', icon: 'fab fa-whatsapp', link: '#', color: '#ffffff', bgColor: '#1e293b' }
            ];
            renderSocials();
        }
        updatePreview();
    };

    // 4. Guardar
    footerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        saveFooterBtn.disabled = true;
        saveFooterBtn.innerHTML = '<i class="fas fa-circle-notch animate-spin"></i> GUARDANDO...';

        try {
            const configData = {
                footerBg: footerBgColor.value,
                logoTitle: logoTitle.value,
                description: quillDesc.root.innerHTML,
                copyright: copyrightText.value,
                hoursTitle: hoursTitle.value,
                hoursContent: quillHours.root.innerHTML,
                contactTitle: contactTitle.value,
                phone: phoneText.value,
                btnText: btnText.value,
                btnLink: btnLink.value,
                socials: socials.map(({ id, ...rest }) => rest) // Quitar IDs temporales
            };

            const { data: existing } = await supabase.from('promotions').select('id').eq('title', 'CONFIG_FOOTER').maybeSingle();

            const payload = {
                title: 'CONFIG_FOOTER',
                description: configData,
                active: true
            };

            let result;
            if (existing) {
                result = await supabase.from('promotions').update(payload).eq('id', existing.id);
            } else {
                result = await supabase.from('promotions').insert([payload]);
            }

            if (result.error) throw result.error;
            alert('¡Pie de página actualizado con éxito!');
        } catch (err) {
            console.error(err);
            alert('Error al guardar config: ' + err.message);
        } finally {
            saveFooterBtn.disabled = false;
            saveFooterBtn.innerHTML = '<i class="fas fa-save"></i> GUARDAR CONFIGURACIÓN PIE DE PÁGINA';
        }
    });

    loadFooterData();
}

// --- FUNCIONES AUXILIARES JCE ---
/**
 * Parsea el formato de fecha de la JCE ("M/D/YYYY h:mm:ss AM/PM" o ISO) a "YYYY-MM-DD".
 */
function parseJCEDate(jceDate) {
    if (!jceDate) return '';
    if (jceDate.includes('T') || /^\d{4}-\d{2}-\d{2}$/.test(jceDate)) {
        return jceDate.split('T')[0];
    }
    const match = jceDate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (match) {
        const month = String(match[1]).padStart(2, '0');
        const day = String(match[2]).padStart(2, '0');
        const year = match[3];
        return `${year}-${month}-${day}`;
    }
    return '';
}

/**
 * Obtiene el base URL del servidor local de la JCE probando puertos 3001, 8082 o ngrok.
 */
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

/**
 * Obtiene la foto del ciudadano en base64 desde la caché de la base de datos del servidor JCE local.
 */
async function getPhotoLocal(cedula) {
    const cleanCedula = String(cedula).replace(/\D/g, '');
    if (!cleanCedula) return null;
    
    try {
        const baseUrl = await getJCEBaseUrl();
        const res = await fetch(`${baseUrl}/api/v1/cedula-queries/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ cedula: cleanCedula })
        });
        if (res.ok) {
            const json = await res.json();
            if (json.success && json.data && json.data.result && json.data.result.fotoUrl) {
                return json.data.result.fotoUrl;
            }
        }
    } catch (err) {
        console.error('Error al traer la foto local:', err);
    }
    return null;
}

/**
 * Consulta la API de la JCE para traer los datos de un ciudadano por su cédula.
 */
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

// --- MÓDULO DE SOLICITUDES ---
async function initSolicitudesModule() {
    const form = document.getElementById('solicitudForm');
    if (!form) return;
    const refTableBody = document.getElementById('referenciasTableBody');
    const solicitudNoEl = document.getElementById('solicitudNo');
    const tipoPrestamoSelect = document.getElementById('tipoPrestamo');
    
    // Establecer fecha actual por defecto en fechaSolicitud (usando zona horaria local)
    const fechaSolicitudInput = document.getElementById('fechaSolicitud');
    if (fechaSolicitudInput) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        fechaSolicitudInput.value = `${yyyy}-${mm}-${dd}`;
    }

    const frecuenciaPagoSelect = document.getElementById('frecuenciaPago');
    const labelTiempoPrestamo = document.getElementById('labelTiempoPrestamo');
    if (frecuenciaPagoSelect && labelTiempoPrestamo) {
        const updateLabel = () => {
            const val = frecuenciaPagoSelect.value;
            if (val === 'diario') labelTiempoPrestamo.textContent = 'Tiempo (Días)';
            else if (val === 'semanal') labelTiempoPrestamo.textContent = 'Tiempo (Semanas)';
            else if (val === 'quincenal') labelTiempoPrestamo.textContent = 'Tiempo (Quincenas)';
            else labelTiempoPrestamo.textContent = 'Tiempo (Meses)';
        };
        frecuenciaPagoSelect.addEventListener('change', updateLabel);
        updateLabel();
    }

    // --- INTEGRACIÓN CON LA API DE LA JCE ---
    const setupJceLookup = (btnId, inputCedulaId, prefix) => {
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
                    // Llenar campos nombres y apellidos
                    const nombresField = document.getElementById(`nombres${prefix}`);
                    const apellidosField = document.getElementById(`apellidos${prefix}`);
                    
                    if (nombresField) nombresField.value = result.nombres || '';
                    if (apellidosField) {
                        apellidosField.value = `${result.apellido1 || ''} ${result.apellido2 || ''}`.trim();
                    }
                    
                    // Fecha de nacimiento
                    const fechaNacField = document.getElementById(`fechaNacimiento${prefix}`);
                    if (fechaNacField && result.fechaNacimiento) {
                        const parsedDate = parseJCEDate(result.fechaNacimiento);
                        fechaNacField.value = parsedDate;
                        
                        // Si es el solicitante o garante principal, disparar cambio para autocalcular edad
                        fechaNacField.dispatchEvent(new Event('change'));
                    }
                    
                    // Sexo (solo para el Solicitante, ya que el garante no tiene input select para sexo en el HTML)
                    const sexoField = document.getElementById(`sexo${prefix}`);
                    if (sexoField && result.sexo) {
                        const s = result.sexo.trim().toUpperCase();
                        sexoField.value = s.startsWith('F') ? 'F' : 'M';
                    }
                    
                    // Estado civil (solo para el solicitante o garante)
                    const estadoCivilField = document.getElementById(`estadoCivil${prefix}`);
                    const ecRaw = result.estadoCivil || result.estado_civil || result.EstadoCivil || result.estadocivil || result.estadoCivilDescripcion || result.idEstadoCivil || "";
                    if (estadoCivilField && ecRaw) {
                        const ec = String(ecRaw).trim().toLowerCase();
                        let selectedValue = "";
                        
                        if (ec.includes('solter') || ec === 's' || ec === '1') {
                            selectedValue = "Soltero/a";
                        } else if (ec.includes('casad') || ec === 'c' || ec === '2') {
                            selectedValue = "Casado/a";
                        } else if (ec.includes('divorc') || ec === 'd' || ec === '3') {
                            selectedValue = "Divorciado/a";
                        } else if (ec.includes('libre') || ec.includes('union') || ec === 'u' || ec === '4' || ec.includes('soltero c') || ec.includes('soltera c')) {
                            selectedValue = "Unión Libre";
                        } else if (ec.includes('viud') || ec === 'v') {
                            selectedValue = "Soltero/a";
                        }
                        
                        if (selectedValue) {
                            estadoCivilField.value = selectedValue;
                        } else {
                            if (estadoCivilField.tagName === 'INPUT') {
                                estadoCivilField.value = String(ecRaw).charAt(0).toUpperCase() + String(ecRaw).slice(1).toLowerCase();
                            }
                        }
                        
                        // Disparar cambio para que se muestre/oculte el cónyuge dinámicamente
                        estadoCivilField.dispatchEvent(new Event('change'));
                    }
                    
                    // Dirección
                    const direccionField = document.getElementById(`direccion${prefix}`);
                    if (direccionField) {
                        direccionField.value = result.direccion || result.dirección || 
                                               [result.lugarNacimiento].filter(Boolean).join(', ') || '';
                    }
                    
                    // Sector y Ciudad
                    const sectorField = document.getElementById(`sector${prefix}`);
                    const ciudadField = document.getElementById(`ciudad${prefix}`);
                    
                    let sectorVal = result.sector || result.barrio || result.paraje || "";
                    let ciudadVal = result.ciudad || result.municipio || result.provincia || "";
                    
                    const fullDir = result.direccion || result.dirección || "";
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
                    
                    if (sectorField && sectorVal) {
                        sectorField.value = sectorVal.toUpperCase();
                    }
                    if (ciudadField && ciudadVal) {
                        ciudadField.value = ciudadVal.toUpperCase();
                    }
                    
                    // Foto
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
    };
    
    setupJceLookup('buscarJceBtn', 'identificador', 'Sol');
    setupJceLookup('buscarJceGarBtn', 'identificadorGar', 'Gar');
    
    // Secciones condicionales
    const secGar = document.getElementById('sectionGarante');
    const secHipo = document.getElementById('sectionHipotecaria');
    const secVeh = document.getElementById('sectionVehiculo');

    const toggleLoanSections = (type) => {
        secGar?.classList.add('hidden');
        secHipo?.classList.add('hidden');
        secVeh?.classList.add('hidden');

        if (type === 'garante') secGar?.classList.remove('hidden');
        if (type === 'hipotecario') secHipo?.classList.remove('hidden');
        if (type === 'vehiculo') secVeh?.classList.remove('hidden');
    };

    tipoPrestamoSelect?.addEventListener('change', (e) => toggleLoanSections(e.target.value));

    // --- SISTEMA DE MÁSCARAS (FORMATO EN TIEMPO REAL) ---
    form?.addEventListener('input', (e) => {
        const target = e.target;
        
        // 1. Cédula (000-0000000-0)
        if (target.classList.contains('mask-cedula')) {
            let value = target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.slice(0, 11);
            let formatted = '';
            if (value.length > 0) formatted += value.substring(0, 3);
            if (value.length > 3) formatted += '-' + value.substring(3, 10);
            if (value.length > 10) formatted += '-' + value.substring(10, 11);
            target.value = formatted;
        }

        // 2. Teléfono (000-000-0000)
        if (target.classList.contains('mask-phone')) {
            let value = target.value.replace(/\D/g, '');
            if (value.length > 10) value = value.slice(0, 10);
            let formatted = '';
            if (value.length > 0) formatted += value.substring(0, 3);
            if (value.length > 3) formatted += '-' + value.substring(3, 6);
            if (value.length > 6) formatted += '-' + value.substring(6, 10);
            target.value = formatted;
        }

        // 3. Moneda (Comas y Punto)
        if (target.classList.contains('mask-currency')) {
            let value = target.value.replace(/[^\d.]/g, '');
            const parts = value.split('.');
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            if (parts[1]) parts[1] = parts[1].slice(0, 2);
            target.value = parts.join('.');
        }
    });

    // Cargar número correlativo aproximado
    const { count } = await supabase.from('loan_applications').select('*', { count: 'exact', head: true });
    solicitudNoEl.textContent = String((count || 0) + 1).padStart(5, '0');

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

    // --- LÓGICA DE EDAD (AUTO-CÁLCULO Y VALIDACIÓN 18+) ---
    const calculateAge = (dob) => {
        if (!dob) return '';
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
        return age;
    };

    const setupAgeValidation = (dobId, edadId) => {
        const dobEl = document.getElementById(dobId);
        const edadEl = document.getElementById(edadId);
        
        dobEl?.addEventListener('change', () => {
            const age = calculateAge(dobEl.value);
            if (edadEl) edadEl.value = age;
            
            if (age !== '' && age < 18) {
                dobEl.classList.add('border-red-500', 'ring-2', 'ring-red-100');
                if (edadEl) edadEl.classList.add('text-red-500', 'font-black');
                // Alerta sutil o visual (ya aplicada con clases)
            } else {
                dobEl.classList.remove('border-red-500', 'ring-2', 'ring-red-100');
                if (edadEl) edadEl.classList.remove('text-red-500', 'font-black');
            }
        });
    };

    setupAgeValidation('fechaNacimientoSol', 'edadSol');
    setupAgeValidation('fechaNacimientoCon', 'edadCon');
    setupAgeValidation('fechaNacimientoGar', 'edadGar');
    setupAgeValidation('fechaNacimientoConGar', 'edadConGar');
    // --- VISIBILIDAD DINÁMICA: CÓNYUGE ---
    const estadoCivilSol = document.getElementById('estadoCivilSol');
    const secConyuge = document.getElementById('sectionConyuge');

    const toggleConyuge = () => {
        const val = estadoCivilSol?.value.toLowerCase() || '';
        if (val.includes('casado') || val.includes('libre')) {
            secConyuge?.classList.remove('hidden');
        } else {
            secConyuge?.classList.add('hidden');
        }
    };

    estadoCivilSol?.addEventListener('change', toggleConyuge);
    toggleConyuge(); // Estado inicial

    const estadoCivilGar = document.getElementById('estadoCivilGar');
    const secConyugeGar = document.getElementById('sectionConyugeGar');

    const toggleConyugeGar = () => {
        const val = estadoCivilGar?.value.toLowerCase() || '';
        if (val.includes('casado') || val.includes('libre')) {
            secConyugeGar?.classList.remove('hidden');
        } else {
            secConyugeGar?.classList.add('hidden');
        }
    };

    estadoCivilGar?.addEventListener('change', toggleConyugeGar);
    toggleConyugeGar(); // Estado inicial

    // Filas iniciales
    if (refTableBody) {
        window.addReferenciaRow();
        window.addReferenciaRow();
    }

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const saveBtn = document.getElementById('saveSolicitudBtn');
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-circle-notch animate-spin"></i> GUARDANDO...';

        try {
            const type = tipoPrestamoSelect.value;
            const cedula = document.getElementById('identificador').value;
            const full_name = `${document.getElementById('nombresSol').value} ${document.getElementById('apellidosSol').value}`;
            
            // 1. Manejo del Cliente (Upsert)
            const { data: client } = await supabase.from('clients').select('id').eq('cedula', cedula).maybeSingle();
            let clientId;
            if (!client) {
                const { data: newClient, error: niErr } = await supabase
                    .from('clients')
                    .insert([{ full_name, cedula, phone: document.getElementById('telefonoSol').value }])
                    .select().single();
                if (niErr) throw niErr;
                clientId = newClient.id;
            } else {
                clientId = client.id;
                await supabase.from('clients').update({ full_name, phone: document.getElementById('telefonoSol').value }).eq('id', clientId);
            }

            // 2. Colectar Referencias
            const refs = Array.from(document.querySelectorAll('#referenciasTableBody tr')).map(tr => ({
                nombre: tr.querySelector('.ref-nombre').value,
                telefono: tr.querySelector('.ref-telefono').value,
                direccion: tr.querySelector('.ref-direccion').value
            }));

            // 3. Objeto de Datos Base
            const fullData = {
                tipoPrestamo: type,
                fechaSolicitud: document.getElementById('fechaSolicitud').value,
                frecuenciaPago: document.getElementById('frecuenciaPago') ? document.getElementById('frecuenciaPago').value : 'mensual',
                evaluador: document.getElementById('evaluador') ? document.getElementById('evaluador').value : 'jose.grullat',
                solicitante: {
                    nombres: document.getElementById('nombresSol').value,
                    apellidos: document.getElementById('apellidosSol').value,
                    identificador: cedula,
                    fotoUrl: document.getElementById('fotoUrlSol').value,
                    apodo: document.getElementById('apodoSol').value,
                    estadoCivil: document.getElementById('estadoCivilSol').value,
                    fechaNacimiento: document.getElementById('fechaNacimientoSol').value,
                    telefono: document.getElementById('telefonoSol').value,
                    edad: document.getElementById('edadSol').value,
                    dependientes: document.getElementById('dependientesSol').value,
                    sexo: document.getElementById('sexoSol').value,
                    profesion: document.getElementById('profesionSol').value,
                    vehiculo: document.getElementById('vehiculoSol').value,
                    sector: document.getElementById('sectorSol').value,
                    ciudad: document.getElementById('ciudadSol').value,
                    direccion: document.getElementById('direccionSol').value,
                    ocupaciones: document.getElementById('ocupacionesSol').value,
                    trabajo: document.getElementById('trabajoSol').value,
                    cargo: document.getElementById('cargoSol').value,
                    direccionTrabajo: document.getElementById('direccionTrabajoSol').value,
                    superior: document.getElementById('superiorSol').value,
                    telTrabajo: document.getElementById('telTrabajoSol').value,
                    tiempoTrabajo: document.getElementById('tiempoTrabajoSol').value,
                    ingresos: document.getElementById('ingresosSol').value,
                    otrosIngresos: document.getElementById('otrosIngresosSol').value,
                    tipoCasa: document.getElementById('tipoCasaSol').value,
                    destino: document.getElementById('destinoCredito').value,
                    chkCliente: document.getElementById('chkClienteSol') ? document.getElementById('chkClienteSol').checked : true,
                    chkEmpleado: document.getElementById('chkEmpleadoSol') ? document.getElementById('chkEmpleadoSol').checked : false,
                    chkFuncionario: document.getElementById('chkFuncionarioSol') ? document.getElementById('chkFuncionarioSol').checked : false,
                    chkAccionista: document.getElementById('chkAccionistaSol') ? document.getElementById('chkAccionistaSol').checked : false
                },
                conyuge: {
                    nombres: document.getElementById('nombresCon').value,
                    apellidos: document.getElementById('apellidosCon').value,
                    fechaNacimiento: document.getElementById('fechaNacimientoCon').value,
                    edad: document.getElementById('edadCon').value,
                    apodo: document.getElementById('apodoCon').value,
                    estadoCivil: document.getElementById('estadoCivilCon').value,
                    telefono: document.getElementById('telefonoCon').value,
                    ocupacion: document.getElementById('ocupacionCon').value,
                    trabajo: document.getElementById('trabajoCon').value,
                    sector: document.getElementById('sectorCon').value,
                    direccion: document.getElementById('direccionCon').value,
                    superior: document.getElementById('superiorCon').value,
                    telTrabajo: document.getElementById('telTrabajoCon').value,
                    tiempoTrabajo: document.getElementById('tiempoTrabajoCon').value,
                    ingresos: document.getElementById('ingresosCon').value
                },
                referencias: refs
            };

            // 4. Agregar Datos Condicionales
            if (type === 'garante') {
                fullData.garante = {
                    identificador: document.getElementById('identificadorGar').value,
                    nombres: document.getElementById('nombresGar').value,
                    apellidos: document.getElementById('apellidosGar').value,
                    fotoUrl: document.getElementById('fotoUrlGar').value,
                    apodo: document.getElementById('apodoGar').value,
                    estadoCivil: document.getElementById('estadoCivilGar').value,
                    fechaNacimiento: document.getElementById('fechaNacimientoGar').value,
                    edad: document.getElementById('edadGar').value,
                    telefono: document.getElementById('telefonoGar').value,
                    sector: document.getElementById('sectorGar').value,
                    ciudad: document.getElementById('ciudadGar').value,
                    direccion: document.getElementById('direccionGar').value,
                    ocupaciones: document.getElementById('ocupacionesGar').value,
                    trabajo: document.getElementById('trabajoGar').value,
                    cargo: document.getElementById('cargoGar').value,
                    direccionTrabajo: document.getElementById('direccionTrabajoGar').value,
                    superior: document.getElementById('superiorGar').value,
                    telTrabajo: document.getElementById('telTrabajoGar').value,
                    tiempoTrabajo: document.getElementById('tiempoTrabajoGar').value,
                    ingresos: document.getElementById('ingresosGar').value,
                    otrosIngresos: document.getElementById('otrosIngresosGar').value,
                    tipoCasa: document.getElementById('tipoCasaGar').value,
                    destino: document.getElementById('destinoGar').value,
                    chkCliente: document.getElementById('chkClienteGar') ? document.getElementById('chkClienteGar').checked : false,
                    chkEmpleado: document.getElementById('chkEmpleadoGar') ? document.getElementById('chkEmpleadoGar').checked : true,
                    chkFuncionario: document.getElementById('chkFuncionarioGar') ? document.getElementById('chkFuncionarioGar').checked : false,
                    chkAccionista: document.getElementById('chkAccionistaGar') ? document.getElementById('chkAccionistaGar').checked : false,
                    conyuge: {
                        nombres: document.getElementById('nombresConGar').value,
                        apellidos: document.getElementById('apellidosConGar').value,
                        fechaNacimiento: document.getElementById('fechaNacimientoConGar').value,
                        edad: document.getElementById('edadConGar').value,
                        telefono: document.getElementById('telefonoConGar').value,
                        ocupacion: document.getElementById('ocupacionConGar').value,
                        trabajo: document.getElementById('trabajoConGar').value,
                        sector: document.getElementById('sectorConGar').value,
                        direccion: document.getElementById('direccionConGar').value,
                        superior: document.getElementById('superiorConGar').value,
                        telTrabajo: document.getElementById('telTrabajoConGar').value,
                        tiempoTrabajo: document.getElementById('tiempoTrabajoConGar').value,
                        ingresos: document.getElementById('ingresosConGar').value
                    }
                };
            } else if (type === 'hipotecario') {
                fullData.garantiaHipotecaria = {
                    propietario: document.getElementById('propHipo').value,
                    distritoCatastral: document.getElementById('distHipo').value,
                    fechaExpedicion: document.getElementById('fechaHipo').value,
                    libro: document.getElementById('libroHipo').value,
                    folio: document.getElementById('folioHipo').value,
                    provincia: document.getElementById('provHipo').value,
                    ciudad: document.getElementById('ciudadHipo').value,
                    parcela: document.getElementById('parcelaHipo').value,
                    area: document.getElementById('areaHipo').value,
                    cedulaRNC: document.getElementById('cedulaHipo').value,
                    certificadoTitulo: document.getElementById('tituloHipo').value,
                    direccion: document.getElementById('dirHipo').value,
                    descripcion: document.getElementById('descHipo').value
                };
            } else if (type === 'vehiculo') {
                fullData.garantiaVehiculo = {
                    razonSocial: document.getElementById('razonVeh').value,
                    placa: document.getElementById('placaVeh').value,
                    fechaExpedicion: document.getElementById('fechaVeh').value,
                    chasis: document.getElementById('chasisVeh').value,
                    estatus: document.getElementById('estatusVeh').value,
                    emision: document.getElementById('emisionVeh').value,
                    matricula: document.getElementById('matriculaVeh').value,
                    fuerza: document.getElementById('fuerzaVeh').value,
                    cilindros: document.getElementById('cilindrosVeh').value,
                    cedulaProp: document.getElementById('cedulaPropVeh').value,
                    tipo: document.getElementById('tipoVeh').value,
                    marca: document.getElementById('marcaVeh').value,
                    modelo: document.getElementById('modeloVeh').value,
                    anio: document.getElementById('anioVeh').value,
                    color: document.getElementById('colorVeh').value,
                    motorSerie: document.getElementById('motorVeh').value,
                    pasajeros: document.getElementById('pasajerosVeh').value,
                    capCarga: document.getElementById('capCargaVeh').value,
                    puertas: document.getElementById('puertasVeh').value
                };
            }

            // 5. Guardar o Actualizar Solicitud
            const cleanNum = (str) => parseFloat(String(str).replace(/,/g, '')) || 0;
            const editId = new URLSearchParams(window.location.search).get('edit');

            let queryPromise;
            if (editId) {
                queryPromise = supabase.from('loan_applications').update({
                    loan_type: type,
                    applicant_name: full_name,
                    applicant_cedula: cedula,
                    monto: cleanNum(document.getElementById('montoSolicitado').value),
                    tiempo: parseInt(document.getElementById('tiempoPrestamo').value) || 0,
                    cuota: cleanNum(document.getElementById('cuotaPrestamo').value),
                    data: fullData
                }).eq('id', editId).select();
            } else {
                queryPromise = supabase.from('loan_applications').insert([{
                    client_id: clientId,
                    loan_type: type,
                    applicant_name: full_name,
                    applicant_cedula: cedula,
                    monto: cleanNum(document.getElementById('montoSolicitado').value),
                    tiempo: parseInt(document.getElementById('tiempoPrestamo').value) || 0,
                    cuota: cleanNum(document.getElementById('cuotaPrestamo').value),
                    status: 'Pendiente',
                    data: fullData
                }]).select();
            }

            const { data: resultData, error: sErr } = await queryPromise;

            if (sErr) throw sErr;
            const insertedId = resultData && resultData[0] ? resultData[0].id : null;

            // Enviar notificación por correo solo para solicitudes nuevas
            if (!editId) {
                try {
                    sendBrevoNotification(
                        cleanNum(document.getElementById('montoSolicitado').value),
                        parseInt(document.getElementById('tiempoPrestamo').value) || 0,
                        cleanNum(document.getElementById('cuotaPrestamo').value),
                        type,
                        full_name,
                        cedula,
                        { ...fullData, id: insertedId }
                    );
                } catch (emailErr) {
                    console.warn('Error al enviar notificación de correo:', emailErr);
                }
            }

            alert(editId ? '¡Solicitud actualizada con éxito!' : '¡Solicitud guardada con éxito!');
            window.location.href = editId ? 'solicitudes_list.html' : 'clientes.html';
        } catch (err) {
            console.error(err);
            alert('Error al guardar: ' + err.message);
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="fas fa-save text-xl"></i> GUARDAR SOLICITUD';
        }
    });

    // --- LÓGICA DE CARGA EN MODO EDICIÓN ---
    const loadEditData = async () => {
        const editId = new URLSearchParams(window.location.search).get('edit');
        if (!editId) return;

        try {
            // Cambiar textos del UI a Modo Edición
            const titleEl = document.querySelector('main header h2');
            if (titleEl) titleEl.textContent = 'Editar Solicitud de Crédito';
            const subtitleEl = document.querySelector('main header p');
            if (subtitleEl) subtitleEl.textContent = 'Edición de expediente crediticio existente';

            const saveBtn = document.getElementById('saveSolicitudBtn');
            if (saveBtn) {
                saveBtn.innerHTML = '<i class="fas fa-save text-xl"></i> ACTUALIZAR SOLICITUD';
            }

            // Consultar datos de la solicitud
            const { data: s, error } = await supabase
                .from('loan_applications')
                .select('*')
                .eq('id', editId)
                .maybeSingle();

            if (error) throw error;
            if (!s) {
                alert('No se encontró la solicitud especificada.');
                return;
            }

            const d = s.data || {};
            
            // Solicitud No
            if (solicitudNoEl) {
                solicitudNoEl.textContent = String(s.id).split('-')[0].toUpperCase();
            }

            // Datos Generales
            if (tipoPrestamoSelect) {
                tipoPrestamoSelect.value = s.loan_type || d.tipoPrestamo || 'personal';
                toggleLoanSections(tipoPrestamoSelect.value);
            }
            if (frecuenciaPagoSelect) {
                frecuenciaPagoSelect.value = d.frecuenciaPago || 'mensual';
                frecuenciaPagoSelect.dispatchEvent(new Event('change'));
            }
            const evaluadorInput = document.getElementById('evaluador');
            if (evaluadorInput) evaluadorInput.value = d.evaluador || 'jose.grullat';

            const montoSolicitadoInput = document.getElementById('montoSolicitado');
            if (montoSolicitadoInput) montoSolicitadoInput.value = Number(s.monto || 0).toLocaleString();
            
            const tiempoPrestamoInput = document.getElementById('tiempoPrestamo');
            if (tiempoPrestamoInput) tiempoPrestamoInput.value = s.tiempo || '';

            const cuotaPrestamoInput = document.getElementById('cuotaPrestamo');
            if (cuotaPrestamoInput) cuotaPrestamoInput.value = Number(d.cuota || s.cuota || 0).toLocaleString();

            const fechaSolicitudInput = document.getElementById('fechaSolicitud');
            if (fechaSolicitudInput) {
                fechaSolicitudInput.value = d.fechaSolicitud || (s.created_at ? s.created_at.split('T')[0] : '');
            }

            // 1. Solicitante
            const sol = d.solicitante || {};
            const setVal = (id, val) => {
                const el = document.getElementById(id);
                if (el) el.value = val || '';
            };
            setVal('identificador', s.applicant_cedula || sol.identificador);
            setVal('nombresSol', sol.nombres);
            setVal('apellidosSol', sol.apellidos);
            setVal('fotoUrlSol', sol.fotoUrl);
            setVal('apodoSol', sol.apodo);
            setVal('estadoCivilSol', sol.estadoCivil);
            setVal('fechaNacimientoSol', sol.fechaNacimiento);
            setVal('telefonoSol', sol.telefono);
            setVal('edadSol', sol.edad);
            setVal('dependientesSol', sol.dependientes);
            setVal('sexoSol', sol.sexo);
            setVal('profesionSol', sol.profesion);
            setVal('vehiculoSol', sol.vehiculo);
            setVal('sectorSol', sol.sector);
            setVal('ciudadSol', sol.ciudad);
            setVal('direccionSol', sol.direccion);
            setVal('ocupacionesSol', sol.ocupaciones);
            setVal('trabajoSol', sol.trabajo);
            setVal('cargoSol', sol.cargo);
            setVal('direccionTrabajoSol', sol.direccionTrabajo);
            setVal('superiorSol', sol.superior);
            setVal('telTrabajoSol', sol.telTrabajo);
            setVal('tiempoTrabajoSol', sol.tiempoTrabajo);
            setVal('ingresosSol', sol.ingresos);
            setVal('otrosIngresosSol', sol.otrosIngresos);
            setVal('tipoCasaSol', sol.tipoCasa);
            setVal('destinoCredito', sol.destino);

            if (document.getElementById('chkClienteSol')) {
                document.getElementById('chkClienteSol').checked = sol.chkCliente !== false;
            }
            if (document.getElementById('chkEmpleadoSol')) {
                document.getElementById('chkEmpleadoSol').checked = !!sol.chkEmpleado;
            }
            if (document.getElementById('chkFuncionarioSol')) {
                document.getElementById('chkFuncionarioSol').checked = !!sol.chkFuncionario;
            }
            if (document.getElementById('chkAccionistaSol')) {
                document.getElementById('chkAccionistaSol').checked = !!sol.chkAccionista;
            }

            // Foto Solicitante Preview
            const fotoUrlSol = sol.fotoUrl || '';
            const fotoImgSol = document.getElementById('solicitanteFoto');
            const fotoPlaceholderSol = document.getElementById('solicitanteFotoPlaceholder');
            if (fotoImgSol && fotoUrlSol) {
                fotoImgSol.src = fotoUrlSol;
                fotoImgSol.classList.remove('hidden');
                if (fotoPlaceholderSol) fotoPlaceholderSol.classList.add('hidden');
            }

            // Disparar cambio en estado civil de solicitante para abrir sección cónyuge si procede
            const estadoCivilSolEl = document.getElementById('estadoCivilSol');
            if (estadoCivilSolEl) estadoCivilSolEl.dispatchEvent(new Event('change'));

            // 2. Cónyuge
            const con = d.conyuge || {};
            setVal('nombresCon', con.nombres);
            setVal('apellidosCon', con.apellidos);
            setVal('fechaNacimientoCon', con.fechaNacimiento);
            setVal('edadCon', con.edad);
            setVal('apodoCon', con.apodo);
            setVal('estadoCivilCon', con.estadoCivil);
            setVal('telefonoCon', con.telefono);
            setVal('ocupacionCon', con.ocupacion);
            setVal('trabajoCon', con.trabajo);
            setVal('sectorCon', con.sector);
            setVal('direccionCon', con.direccion);
            setVal('superiorCon', con.superior);
            setVal('telTrabajoCon', con.telTrabajo);
            setVal('tiempoTrabajoCon', con.tiempoTrabajo);
            setVal('ingresosCon', con.ingresos);

            // 3. Referencias
            if (refTableBody) {
                refTableBody.innerHTML = '';
                const referencias = d.referencias || [];
                if (referencias.length > 0) {
                    referencias.forEach(ref => {
                        window.addReferenciaRow(ref);
                    });
                } else {
                    window.addReferenciaRow();
                    window.addReferenciaRow();
                }
            }

            // 4. Garante (si procede)
            if (d.garante) {
                const gar = d.garante || {};
                setVal('identificadorGar', gar.identificador);
                setVal('nombresGar', gar.nombres);
                setVal('apellidosGar', gar.apellidos);
                setVal('fotoUrlGar', gar.fotoUrl);
                setVal('apodoGar', gar.apodo);
                setVal('estadoCivilGar', gar.estadoCivil);
                setVal('fechaNacimientoGar', gar.fechaNacimiento);
                setVal('edadGar', gar.edad);
                setVal('telefonoGar', gar.telefono);
                setVal('sectorGar', gar.sector);
                setVal('ciudadGar', gar.ciudad);
                setVal('direccionGar', gar.direccion);
                setVal('ocupacionesGar', gar.ocupaciones);
                setVal('trabajoGar', gar.trabajo);
                setVal('cargoGar', gar.cargo);
                setVal('direccionTrabajoGar', gar.direccionTrabajo);
                setVal('superiorGar', gar.superior);
                setVal('telTrabajoGar', gar.telTrabajo);
                setVal('tiempoTrabajoGar', gar.tiempoTrabajo);
                setVal('ingresosGar', gar.ingresos);
                setVal('otrosIngresosGar', gar.otrosIngresos);
                setVal('tipoCasaGar', gar.tipoCasa);
                setVal('destinoGar', gar.destino);

                if (document.getElementById('chkClienteGar')) {
                    document.getElementById('chkClienteGar').checked = !!gar.chkCliente;
                }
                if (document.getElementById('chkEmpleadoGar')) {
                    document.getElementById('chkEmpleadoGar').checked = gar.chkEmpleado !== false;
                }
                if (document.getElementById('chkFuncionarioGar')) {
                    document.getElementById('chkFuncionarioGar').checked = !!gar.chkFuncionario;
                }
                if (document.getElementById('chkAccionistaGar')) {
                    document.getElementById('chkAccionistaGar').checked = !!gar.chkAccionista;
                }

                // Foto Garante Preview
                const fotoUrlGar = gar.fotoUrl || '';
                const fotoImgGar = document.getElementById('garanteFoto');
                const fotoPlaceholderGar = document.getElementById('garanteFotoPlaceholder');
                if (fotoImgGar && fotoUrlGar) {
                    fotoImgGar.src = fotoUrlGar;
                    fotoImgGar.classList.remove('hidden');
                    if (fotoPlaceholderGar) fotoPlaceholderGar.classList.add('hidden');
                }

                const estadoCivilGarEl = document.getElementById('estadoCivilGar');
                if (estadoCivilGarEl) estadoCivilGarEl.dispatchEvent(new Event('change'));

                // Cónyuge del garante
                const conGar = gar.conyuge || {};
                setVal('nombresConGar', conGar.nombres);
                setVal('apellidosConGar', conGar.apellidos);
                setVal('fechaNacimientoConGar', conGar.fechaNacimiento);
                setVal('edadConGar', conGar.edad);
                setVal('telefonoConGar', conGar.telefono);
                setVal('ocupacionConGar', conGar.ocupacion);
                setVal('trabajoConGar', conGar.trabajo);
                setVal('sectorConGar', conGar.sector);
                setVal('direccionConGar', conGar.direccion);
                setVal('superiorConGar', conGar.superior);
                setVal('telTrabajoConGar', conGar.telTrabajo);
                setVal('tiempoTrabajoConGar', conGar.tiempoTrabajo);
                setVal('ingresosConGar', conGar.ingresos);
            }

            // 5. Garantía Hipotecaria (si procede)
            if (d.garantiaHipotecaria) {
                const hipo = d.garantiaHipotecaria || {};
                setVal('propHipo', hipo.propietario);
                setVal('distHipo', hipo.distritoCatastral);
                setVal('fechaHipo', hipo.fechaExpedicion);
                setVal('libroHipo', hipo.libro);
                setVal('folioHipo', hipo.folio);
                setVal('provHipo', hipo.provincia);
                setVal('ciudadHipo', hipo.ciudad);
                setVal('parcelaHipo', hipo.parcela);
                setVal('areaHipo', hipo.area);
                setVal('cedulaHipo', hipo.cedulaRNC);
                setVal('tituloHipo', hipo.certificadoTitulo);
                setVal('dirHipo', hipo.direccion);
                setVal('descHipo', hipo.descripcion);
            }

            // 6. Garantía Vehículo (si procede)
            if (d.garantiaVehiculo) {
                const veh = d.garantiaVehiculo || {};
                setVal('razonVeh', veh.razonSocial);
                setVal('placaVeh', veh.placa);
                setVal('fechaVeh', veh.fechaExpedicion);
                setVal('chasisVeh', veh.chasis);
                setVal('estatusVeh', veh.estatus);
                setVal('emisionVeh', veh.emision);
                setVal('matriculaVeh', veh.matricula);
                setVal('fuerzaVeh', veh.fuerza);
                setVal('cilindrosVeh', veh.cilindros);
                setVal('cedulaPropVeh', veh.cedulaProp);
                setVal('tipoVeh', veh.tipo);
                setVal('marcaVeh', veh.marca);
                setVal('modeloVeh', veh.modelo);
                setVal('anioVeh', veh.anio);
                setVal('colorVeh', veh.color);
                setVal('motorVeh', veh.motorSerie);
                setVal('pasajerosVeh', veh.pasajeros);
                setVal('capCargaVeh', veh.capCarga);
                setVal('puertasVeh', veh.puertas);
            }

        } catch (err) {
            console.error('Error al cargar datos en modo edición:', err);
            alert('Error al cargar la solicitud en modo edición: ' + err.message);
        }
    };

    loadEditData();
}

// --- MÓDULO DE CLIENTES ---
async function initClientesModule() {
    const tableBody = document.getElementById('clientsTableBody');
    if (!tableBody) return;
    const emptyState = document.getElementById('clientsEmptyState');
    const searchInput = document.getElementById('clientSearch');

    const loadClients = async (query = '') => {
        let rpc = supabase.from('clients').select('*').order('created_at', { ascending: false });
        
        if (query) {
            rpc = rpc.or(`full_name.ilike.%${query}%,cedula.ilike.%${query}%`);
        }

        const { data: clients, error } = await rpc;

        if (error) {
            console.error(error);
            return;
        }

        if (!clients || clients.length === 0) {
            if (tableBody) tableBody.innerHTML = '';
            emptyState?.classList.remove('hidden');
            return;
        }

        emptyState?.classList.add('hidden');
        if (tableBody) {
            tableBody.innerHTML = clients.map(c => `
                <tr class="hover:bg-slate-50 transition-colors">
                    <td class="p-6 font-bold text-prime uppercase tracking-tighter">${c.full_name}</td>
                    <td class="p-6 text-sm font-black text-slate-500">${c.cedula}</td>
                    <td class="p-6 text-sm font-semibold">${c.phone || '---'}</td>
                    <td class="p-6 text-sm text-slate-400">${c.email || '---'}</td>
                    <td class="p-6 text-[10px] font-black uppercase text-slate-400">
                        ${new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td class="p-6 text-right">
                        <div class="flex justify-end gap-1.5">
                            <button onclick="window.deleteClient('${c.id}')" class="px-2.5 py-1 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-black border border-rose-100 hover:bg-rose-600 hover:text-white transition-all uppercase tracking-tighter" title="Eliminar Cliente">Borrar</button>
                            <button onclick="window.openLatestSolicitudForCliente('${c.id}', 'cliente_garante')" class="px-2.5 py-1 bg-sky-50 text-sky-600 rounded-lg text-[10px] font-black border border-sky-100 hover:bg-sky-600 hover:text-white transition-all uppercase tracking-tighter" title="Cliente y Garantía">Cli + Gar</button>
                            <button onclick="window.openLatestSolicitudForCliente('${c.id}', 'cliente_conyuge')" class="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all uppercase tracking-tighter" title="Datos Cliente y Cónyuge">Dat Cli</button>
                            <button onclick="window.openLatestSolicitudForCliente('${c.id}', 'garante_conyuge')" class="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all uppercase tracking-tighter" title="Datos Garante y Cónyuge">Dat Gar</button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    };

    searchInput?.addEventListener('input', (e) => loadClients(e.target.value));
    loadClients();
}

/**
 * --- MÓDULO DE LISTADO DE SOLICITUDES ---
 */
async function initSolicitudesListModule() {
    const tableBody = document.getElementById('solicitudesTableBody');
    if (!tableBody) return;
    const emptyState = document.getElementById('solicitudesEmptyState');
    const filterBtns = document.querySelectorAll('.filter-btn');

    const loadSolicitudes = async (typeFilter = 'all') => {
        let rpc = supabase.from('loan_applications')
            .select('*, clients(full_name, cedula)')
            .order('created_at', { ascending: false });
        
        const { data: sols, error } = await rpc;

        if (error) {
            console.error(error);
            return;
        }

        // Filtrar localmente por tipo si no es 'all'
        const filtered = typeFilter === 'all' 
            ? sols 
            : sols.filter(s => {
                const actualType = (s.loan_type || s.data?.tipoPrestamo || 'personal').toLowerCase();
                return actualType === typeFilter.toLowerCase();
            });

        if (!filtered || filtered.length === 0) {
            if (tableBody) tableBody.innerHTML = '';
            emptyState?.classList.remove('hidden');
            return;
        }

        emptyState?.classList.add('hidden');
        if (tableBody) {
            tableBody.innerHTML = filtered.map((s, index) => {
                const d = s.data || {};
                const sol = d.solicitante || {};
                
                // FALLBACKS ROBUSTOS
                const clientName = s.clients?.full_name || (sol.nombres ? `${sol.nombres} ${sol.apellidos || ''}` : 'Desconocido');
                const clientCedula = s.clients?.cedula || sol.identificador || '---';
                const loanType = (s.loan_type || d.tipoPrestamo || 'personal').toLowerCase();
                const monto = s.monto || d.monto || 0;
                
                // Estilos por tipo
                const typeStyles = {
                    'personal': 'bg-blue-100 text-blue-700',
                    'garante': 'bg-amber-100 text-amber-700',
                    'hipotecario': 'bg-emerald-100 text-emerald-700',
                    'vehiculo': 'bg-indigo-100 text-indigo-700'
                };
                const badgeClass = typeStyles[loanType] || 'bg-slate-100 text-slate-700';

                return `
                    <tr class="hover:bg-slate-50 transition-colors group">
                        <td class="p-6">
                            <span class="block text-sm font-black text-slate-800 tracking-tighter uppercase whitespace-nowrap">SOL-${String(s.id).split('-')[0]}</span>
                            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">${new Date(s.created_at).toLocaleDateString()}</span>
                        </td>
                        <td class="p-6">
                            <span class="block font-black text-prime uppercase tracking-tighter">${clientName}</span>
                            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">${clientCedula}</span>
                        </td>
                        <td class="p-6 text-center">
                            <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${badgeClass}">
                                ${loanType}
                            </span>
                        </td>
                        <td class="p-6 text-center font-black text-brand tracking-tighter">
                            RD$ ${Number(monto).toLocaleString()}
                        </td>
                        <td class="p-6 text-center">
                            <span class="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-200">
                                ${s.status || 'Pendiente'}
                            </span>
                        </td>
                        <td class="p-6 text-right">
                            <div class="flex justify-end gap-1.5 items-center">
                                <button onclick="window.editSolicitud('${s.id}')" class="p-2.5 bg-slate-100 text-slate-500 hover:bg-amber-600 hover:text-white rounded-xl transition-all shadow-sm" title="Editar Solicitud">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button onclick="window.deleteSolicitud('${s.id}')" class="p-2.5 bg-slate-100 text-slate-500 hover:bg-rose-600 hover:text-white rounded-xl transition-all shadow-sm" title="Eliminar Solicitud">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                                <button onclick="window.printEmailTemplate('${s.id}')" class="p-2.5 bg-slate-100 text-slate-500 hover:bg-amber-500 hover:text-white rounded-xl transition-all shadow-sm" title="Imprimir Formato Correo (Organizado)">
                                    <i class="fas fa-envelope"></i>
                                </button>
                                <button onclick="window.printSolicitud('${s.id}')" class="p-2.5 bg-slate-100 text-slate-500 hover:bg-brand hover:text-white rounded-xl transition-all shadow-sm" title="Imprimir Expediente Retro">
                                    <i class="fas fa-print"></i>
                                </button>
                                <button onclick="window.exportToWord('${s.id}')" class="p-2.5 bg-slate-100 text-slate-500 hover:bg-emerald-600 hover:text-white rounded-xl transition-all shadow-sm" title="Descargar Word">
                                    <i class="fas fa-file-word"></i>
                                </button>
                                <button onclick="window.openSolicitudRetro('${s.id}', 'cliente_garante', false)" class="px-2 py-1.5 bg-sky-50 text-sky-600 rounded-lg text-[9px] font-black border border-sky-100 hover:bg-sky-600 hover:text-white transition-all uppercase tracking-tighter" title="Cliente y Garantía">Cli + Gar</button>
                                <button onclick="window.openSolicitudRetro('${s.id}', 'cliente_conyuge', false)" class="px-2 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all uppercase tracking-tighter" title="Datos Cliente y Cónyuge">Dat Cli</button>
                                <button onclick="window.openSolicitudRetro('${s.id}', 'garante_conyuge', false)" class="px-2 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all uppercase tracking-tighter" title="Datos Garante y Cónyuge">Dat Gar</button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
        }
    };

    // Listeners para filtros
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // UI Toggle
            filterBtns.forEach(b => {
                b.classList.remove('bg-slate-800', 'text-white');
                b.classList.add('bg-white', 'text-slate-500');
            });
            btn.classList.remove('bg-white', 'text-slate-500');
            btn.classList.add('bg-slate-800', 'text-white');

            loadSolicitudes(btn.dataset.filter);
        });
    });

    await loadSolicitudes();

    // Comprobar si hay un ID de solicitud a imprimir automáticamente en la URL
    const urlParams = new URLSearchParams(window.location.search);
    const printId = urlParams.get('print');
    if (printId) {
        window.printSolicitud(printId);
    }
}

window.editSolicitud = (id) => {
    window.location.href = `./solicitudes.html?edit=${id}`;
};

window.deleteSolicitud = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta solicitud de préstamo de forma permanente?')) return;
    try {
        const { error } = await supabase.from('loan_applications').delete().eq('id', id);
        if (error) throw error;
        alert('¡Solicitud eliminada con éxito!');
        window.location.reload();
    } catch (err) {
        console.error(err);
        alert('Error al eliminar la solicitud: ' + err.message);
    }
};

window.deleteClient = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este cliente? Se eliminarán también todas sus solicitudes de préstamo asociadas de forma permanente.')) return;
    try {
        const { error } = await supabase.from('clients').delete().eq('id', id);
        if (error) throw error;
        alert('¡Cliente eliminado con éxito!');
        window.location.reload();
    } catch (err) {
        console.error(err);
        alert('Error al eliminar el cliente: ' + err.message);
    }
};

/**
 * --- SISTEMA DE IMPRESIÓN DE ALTA FIDELIDAD ---
 */
window.openLatestSolicitudForCliente = async (clientId, mode = 'cliente_garante') => {
    const { data: apps, error } = await supabase.from('loan_applications')
        .select('id')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
        .limit(1);
    
    if (error || !apps || apps.length === 0) {
        alert('Este cliente no tiene solicitudes de préstamo registradas.');
        return;
    }
    window.openSolicitudRetro(apps[0].id, mode, false);
};

window.printSolicitud = async (id) => {
    window.openSolicitudRetro(id, 'cliente_garante', true);
};

window.printEmailTemplate = async (id) => {
    // Abrir la ventana inmediatamente para evitar que el navegador bloquee la ventana emergente
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert('Por favor permite las ventanas emergentes (pop-ups) para abrir la versión de impresión.');
        return;
    }
    
    // Escribir un mensaje temporal de carga en la nueva ventana
    printWindow.document.write('<html><head><title>Cargando...</title></head><body style="font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; color: #64748b; background-color: #f1f5f9;"><div><h2 style="font-weight: 600;">Cargando plantilla de impresión...</h2></div></body></html>');
    printWindow.document.close();

    let s;
    if (id === 'prueba') {
        s = {
            id: 'prueba',
            loan_type: 'garante',
            created_at: new Date().toISOString(),
            tiempo: 12,
            monto: 150000,
            cuota: 15000,
            applicant_name: "GRISMELDY OSKARINA",
            applicant_cedula: "402-0916423-1",
            data: {
                solicitante: {
                    nombres: "GRISMELDY OSKARINA",
                    apellidos: "EVANGELISTA DE AMADOR",
                    apodo: "GRISMELDY",
                    identificador: "402-0916423-1",
                    fotoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=180&fit=crop&q=80",
                    estadoCivil: "Casado(a)",
                    fechaNacimiento: "24/11/2001",
                    telefono: "809-803-1215",
                    edad: "24",
                    dependientes: "2",
                    sexo: "Femenino",
                    profesion: "Estilista",
                    vehiculo: "No",
                    sector: "Sabaneta",
                    ciudad: "La Vega",
                    direccion: "Calle Principal No. 55 antes del Colmado Matica",
                    ocupaciones: "Estilista / Colorista",
                    trabajo: "Salón de Belleza La Moda",
                    cargo: "Administradora / Estilista Principal",
                    direccionTrabajo: "Av. Pedro A. Rivera #12, La Vega",
                    superior: "Yanna Núñez",
                    telTrabajo: "809-573-0000",
                    tiempoTrabajo: "3 Años",
                    ingresos: "25000",
                    otrosIngresos: "5000",
                    tipoCasa: "Alquilada",
                    destino: "Capital de trabajo para salón",
                    chkCliente: true,
                    chkEmpleado: false,
                    chkFuncionario: false,
                    chkAccionista: false
                },
                conyuge: {
                    nombres: "WASCAR RAFAEL",
                    apellidos: "EVANGELISTA PEGUERO",
                    fechaNacimiento: "15/05/2000",
                    edad: "25",
                    apodo: "Wascar",
                    estadoCivil: "Casado(a)",
                    telefono: "829-808-5760",
                    ocupacion: "Mecánico",
                    trabajo: "Auto Repuestos La Vega",
                    sector: "Sabaneta",
                    direccion: "Calle Principal No. 55",
                    superior: "Juan Pérez",
                    telTrabajo: "829-555-1234",
                    tiempoTrabajo: "5 Años",
                    ingresos: "30000"
                },
                garante: {
                    identificador: "047-0139257-5",
                    nombres: "WASCAR RAFAEL",
                    apellidos: "EVANGELISTA PEGUERO",
                    fotoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=180&fit=crop&q=80",
                    apodo: "Wascar",
                    estadoCivil: "Casado(a)",
                    fechaNacimiento: "15/05/2000",
                    edad: "25",
                    telefono: "829-808-5760",
                    sector: "Sabaneta",
                    ciudad: "La Vega",
                    direccion: "Calle Principal, Villa Paraíso frente a la Agroquímica Morill",
                    ocupaciones: "Mecánico de Vehículos",
                    trabajo: "Auto Repuestos La Vega",
                    cargo: "Técnico Mecánico",
                    direccionTrabajo: "Av. Pedro Rivera #45, La Vega",
                    superior: "José Gómez",
                    telTrabajo: "829-660-8236",
                    tiempoTrabajo: "5 Años",
                    ingresos: "30000",
                    otrosIngresos: "0",
                    tipoCasa: "Propia",
                    destino: "Garantía de préstamo personal",
                    chkCliente: false,
                    chkEmpleado: true,
                    chkFuncionario: false,
                    chkAccionista: false,
                    conyuge: {
                        nombres: "GRISMELDY OSKARINA",
                        apellidos: "EVANGELISTA DE AMADOR",
                        fechaNacimiento: "24/11/2001",
                        edad: "24",
                        apodo: "GRISMELDY",
                        estadoCivil: "Casado(a)",
                        telefono: "809-803-1215",
                        ocupacion: "Estilista",
                        trabajo: "Salón de Belleza La Moda",
                        sector: "Sabaneta",
                        direccion: "Calle Principal No. 55 antes del Colmado Matica",
                        superior: "Yanna Núñez",
                        telTrabajo: "809-573-0000",
                        tiempoTrabajo: "3 Años",
                        ingresos: "25000"
                    }
                }
            }
        };
    } else {
        try {
            const { data: realS, error } = await supabase.from('loan_applications')
                .select('*, clients(*)')
                .eq('id', id)
                .single();
            
            if (error || !realS) {
                printWindow.close();
                alert('Error al cargar la solicitud');
                return;
            }
            s = realS;
        } catch (err) {
            printWindow.close();
            alert('Error de conexión al cargar la solicitud');
            return;
        }
    }

    const d = s.data || {};
    d.id = s.id || id;

    // Obtener logo de la empresa para la plantilla de impresión
    try {
        const { data: iconData } = await supabase.from('site_settings').select('value').eq('key', 'portal_icon').single();
        if (iconData && iconData.value) {
            d.portalLogo = iconData.value;
        }
    } catch (logoErr) {
        console.error('Error fetching portal logo for print:', logoErr);
    }

    const htmlContent = generateLoanApplicationHtml(
        false, 
        s.applicant_name, 
        s.applicant_cedula, 
        s.loan_type, 
        s.monto, 
        s.tiempo, 
        s.cuota, 
        d
    );

    // Escribir el contenido real en la ventana que ya estaba abierta
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Evitar que la ventana emergente imprima dos veces usando una bandera
    let isPrinted = false;
    const triggerPrint = () => {
        if (isPrinted) return;
        isPrinted = true;
        printWindow.print();
    };
    
    printWindow.onload = triggerPrint;
    // Fallback por si onload no se dispara en algunos motores de navegador
    setTimeout(triggerPrint, 1500);
};

window.openSolicitudRetro = async (id, mode = 'cliente_garante', autoPrint = false) => {
    let s;
    if (id === 'prueba') {
        s = {
            loan_type: 'garante',
            created_at: new Date().toISOString(),
            tiempo: 12,
            data: {
                solicitante: {
                    nombres: "GRISMELDY OSKARINA",
                    apellidos: "EVANGELISTA DE AMADOR",
                    apodo: "GRISMELDY",
                    identificador: "402-0916423-1",
                    fotoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=180&fit=crop&q=80",
                    estadoCivil: "Casado(a)",
                    fechaNacimiento: "24/11/2001",
                    telefono: "809-803-1215",
                    edad: "24",
                    dependientes: "2",
                    sexo: "Femenino",
                    profesion: "Estilista",
                    vehiculo: "No",
                    sector: "Sabaneta",
                    ciudad: "La Vega",
                    direccion: "Calle Principal No. 55 antes del Colmado Matica",
                    ocupaciones: "Estilista / Colorista",
                    trabajo: "Salón de Belleza La Moda",
                    cargo: "Administradora / Estilista Principal",
                    direccionTrabajo: "Av. Pedro A. Rivera #12, La Vega",
                    superior: "Yanna Núñez",
                    telTrabajo: "809-573-0000",
                    tiempoTrabajo: "3 Años",
                    ingresos: "25000",
                    otrosIngresos: "5000",
                    tipoCasa: "Alquilada",
                    destino: "Capital de trabajo para salón",
                    chkCliente: true,
                    chkEmpleado: false,
                    chkFuncionario: false,
                    chkAccionista: false
                },
                conyuge: {
                    nombres: "WASCAR RAFAEL",
                    apellidos: "EVANGELISTA PEGUERO",
                    fechaNacimiento: "15/05/2000",
                    edad: "25",
                    apodo: "Wascar",
                    estadoCivil: "Casado(a)",
                    telefono: "829-808-5760",
                    ocupacion: "Mecánico",
                    trabajo: "Auto Repuestos La Vega",
                    sector: "Sabaneta",
                    direccion: "Calle Principal No. 55",
                    superior: "Juan Pérez",
                    telTrabajo: "829-555-1234",
                    tiempoTrabajo: "5 Años",
                    ingresos: "30000"
                },
                garante: {
                    identificador: "047-0139257-5",
                    nombres: "WASCAR RAFAEL",
                    apellidos: "EVANGELISTA PEGUERO",
                    fotoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=180&fit=crop&q=80",
                    apodo: "Wascar",
                    estadoCivil: "Casado(a)",
                    fechaNacimiento: "15/05/2000",
                    edad: "25",
                    telefono: "829-808-5760",
                    sector: "Sabaneta",
                    ciudad: "La Vega",
                    direccion: "Calle Principal, Villa Paraíso frente a la Agroquímica Morill",
                    ocupaciones: "Mecánico de Vehículos",
                    trabajo: "Auto Repuestos La Vega",
                    cargo: "Técnico Mecánico",
                    direccionTrabajo: "Av. Pedro Rivera #45, La Vega",
                    superior: "José Gómez",
                    telTrabajo: "829-660-8236",
                    tiempoTrabajo: "5 Años",
                    ingresos: "30000",
                    otrosIngresos: "0",
                    tipoCasa: "Propia",
                    destino: "Garantía de préstamo personal",
                    chkCliente: false,
                    chkEmpleado: true,
                    chkFuncionario: false,
                    chkAccionista: false,
                    conyuge: {
                        nombres: "GRISMELDY OSKARINA",
                        apellidos: "EVANGELISTA DE AMADOR",
                        fechaNacimiento: "24/11/2001",
                        edad: "24",
                        apodo: "GRISMELDY",
                        estadoCivil: "Casado(a)",
                        telefono: "809-803-1215",
                        ocupacion: "Estilista",
                        trabajo: "Salón de Belleza La Moda",
                        sector: "Sabaneta",
                        direccion: "Calle Principal No. 55 antes del Colmado Matica",
                        superior: "Yanna Núñez",
                        telTrabajo: "809-573-0000",
                        tiempoTrabajo: "3 Años",
                        ingresos: "25000"
                    }
                }
            }
        };
    } else {
        const { data: realS, error } = await supabase.from('loan_applications')
            .select('*, clients(*)')
            .eq('id', id)
            .single();
        
        if (error || !realS) {
            alert('Error al cargar la solicitud');
            return;
        }
        s = realS;
    }

    const { data: iconData } = await supabase.from('site_settings').select('value').eq('key', 'portal_icon').single();
    const portalLogo = iconData?.value || 'https://files.catbox.moe/yz89qv.png';

    const d = s.data || {};
    const sol = d.solicitante || {};
    const con = d.conyuge || {};
    const veh = d.garantiaVehiculo || {};
    const hipo = d.garantiaHipotecaria || {};
    const gar = d.garante || {};
    const conGar = d.conyugeGarante || (d.garante ? d.garante.conyuge : null) || {};

    const type = s.loan_type || 'personal';

    // Calculate dates based on frequency
    const freq = d.frecuenciaPago || 'mensual';
    const tiempoVal = s.tiempo || 18;
    
    let fechaFinalDate = s.created_at ? new Date(s.created_at) : new Date();
    let fechaPagoDate = s.created_at ? new Date(s.created_at) : new Date();
    
    if (freq === 'diario') {
        fechaFinalDate.setDate(fechaFinalDate.getDate() + tiempoVal);
        fechaPagoDate.setDate(fechaPagoDate.getDate() + 1);
    } else if (freq === 'semanal') {
        fechaFinalDate.setDate(fechaFinalDate.getDate() + (tiempoVal * 7));
        fechaPagoDate.setDate(fechaPagoDate.getDate() + 7);
    } else if (freq === 'quincenal') {
        fechaFinalDate.setDate(fechaFinalDate.getDate() + (tiempoVal * 15));
        fechaPagoDate.setDate(fechaPagoDate.getDate() + 15);
    } else { // mensual
        fechaFinalDate.setMonth(fechaFinalDate.getMonth() + tiempoVal);
        fechaPagoDate.setMonth(fechaPagoDate.getMonth() + 1);
    }

    const fechaInicio = s.created_at ? new Date(s.created_at).toLocaleDateString('es-DO') : new Date().toLocaleDateString('es-DO');
    const fechaFinal = s.created_at ? fechaFinalDate.toLocaleDateString('es-DO') : '---';
    const fechaPago = s.created_at ? fechaPagoDate.toLocaleDateString('es-DO') : '---';
    const fechaImpresion = new Date().toLocaleDateString('es-DO');
    const horaImpresion = new Date().toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Remove existing modal if any
    const existingModal = document.getElementById('retro-modal-container');
    if (existingModal) existingModal.remove();

    // Create modal element
    const modalDiv = document.createElement('div');
    modalDiv.id = 'retro-modal-container';

    // Helper to render card row for a person
    const renderRow = (title, person, roleType) => {
        if (!person || (!person.nombres && !person.identificador)) {
            return `
            <div class="cards-row">
                <div class="content-card" style="grid-column: span 2;">
                    <div class="card-header">${title}</div>
                    <div class="card-body" style="justify-content: center; align-items: center; height: 150px; background-color: #f7fbfb;">
                        <div style="text-align: center; color: #689c9c;">
                            <i class="fas fa-folder-open" style="font-size: 32px; margin-bottom: 8px; color: #4c7a7a;"></i>
                            <p style="font-size: 11px; font-weight: bold; margin: 0; text-transform: uppercase; letter-spacing: 0.05em;">NO TIENE REGISTRADO</p>
                        </div>
                    </div>
                </div>
            </div>
            `;
        }

        let photoHtml = '';
        if (person.fotoUrl && (person.fotoUrl.startsWith('data:') || person.fotoUrl.startsWith('http'))) {
            photoHtml = `<img src="${person.fotoUrl}">`;
        } else {
            photoHtml = `
                <img src="${person.fotoUrl || ''}" data-cedula="${person.identificador || ''}" style="${person.fotoUrl ? 'display:block;' : 'display:none;'}">
                <i class="fas fa-user photo-placeholder" style="${person.fotoUrl ? 'display:none;' : 'display:block;'}"></i>
            `;
        }

        const isCliente = person.chkCliente === true || (person.chkCliente === undefined && roleType === 'cliente');
        const isEmpleado = person.chkEmpleado === true || (person.chkEmpleado === undefined && roleType === 'garante');
        const isFuncionario = person.chkFuncionario === true;
        const isAccionista = person.chkAccionista === true;

        let checkboxesHtml = `
            <span class="chk-box ${isCliente ? 'checked' : 'unchecked'}">CLIENTE</span>
            <span class="chk-box ${isEmpleado ? 'checked' : 'unchecked'}">EMPLEADO</span>
            <span class="chk-box ${isFuncionario ? 'checked' : 'unchecked'}">FUNCIONARIO</span>
            <span class="chk-box ${isAccionista ? 'checked' : 'unchecked'}">ACCIONISTA</span>
        `;

        const firstAddressPart = person.direccion ? person.direccion.split(',')[0] : '---';

        return `
        <div class="cards-row">
            <!-- Datos Personales -->
            <div class="content-card">
                <div class="card-header">${title}</div>
                <div class="card-body">
                    <div class="photo-frame">
                        ${photoHtml}
                    </div>
                    <div class="card-data-grid">
                        <span class="card-data-label">Cedula:</span>
                        <span class="card-data-val" style="font-weight:bold;">${person.identificador || '---'}</span>
                        
                        <span class="card-data-label">Nombres:</span>
                        <span class="card-data-val" style="font-weight:bold; font-size: 12px; color: #1e3a3a;">${person.nombres || '---'}</span>
                        
                        <span class="card-data-val" style="font-weight:bold; font-size: 12px; color: #1e3a3a;">${person.apellidos || '---'}</span>
                        
                        <span class="card-data-label">Apodo:</span>
                        <span class="card-data-val">${person.apodo || '---'}</span>
                        
                        <span class="card-data-label">Direccion:</span>
                        <span class="card-data-val" style="font-size:10.5px;">${person.direccion || '---'} ${person.sector ? ', ' + person.sector : ''}</span>
                        
                        <div class="card-data-inline">
                            <div class="card-data-inline-item">
                                <span class="card-data-inline-label">Edad:</span>
                                <span>${person.edad || '---'} Años</span>
                            </div>
                            <div class="card-data-inline-item">
                                <span class="card-data-inline-label">Celular:</span>
                                <span>${person.telefono || '---'}</span>
                            </div>
                            <div class="card-data-inline-item">
                                <span class="card-data-inline-label">Trabajo:</span>
                                <span>${person.telTrabajo || '---'}</span>
                            </div>
                        </div>

                        <div class="checkboxes-line">
                            ${checkboxesHtml}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Lugar de Residencia -->
            <div class="content-card">
                <div class="card-header">Lugar de Residencia</div>
                <div class="card-body" style="padding: 10px 15px;">
                    <div class="card-data-grid">
                        <span class="card-data-label">Pais:</span>
                        <span class="card-data-val">REPUBLICA DOMINICANA</span>
                        
                        <span class="card-data-label">Provincia:</span>
                        <span class="card-data-val">${person.ciudad || '---'}</span>
                        
                        <span class="card-data-label">Municipio:</span>
                        <span class="card-data-val">${person.sector || '---'}</span>
                        
                        <span class="card-data-label">Ciudad:</span>
                        <span class="card-data-val">${person.ciudad || '---'}</span>
                        
                        <span class="card-data-label">Sector:</span>
                        <span class="card-data-val">${firstAddressPart}</span>
                        
                        <span class="card-data-label">Zona:</span>
                        <span class="card-data-val">---</span>
                    </div>
                </div>
            </div>
        </div>
        `;
    };

    let row1Html = '';
    let row2Html = '';

    if (mode === 'cliente_garante') {
        row1Html = renderRow('Datos del Cliente', sol, 'cliente');
        row2Html = renderRow('Datos del Co-Deudor (Garante)', gar, 'garante');
    } else if (mode === 'cliente_conyuge') {
        row1Html = renderRow('Datos del Cliente', sol, 'cliente');
        row2Html = renderRow('Datos del Cónyuge', con, 'conyuge');
    } else if (mode === 'garante_conyuge') {
        row1Html = renderRow('Datos del Garante', gar, 'garante');
        row2Html = renderRow('Datos del Cónyuge del Garante', conGar, 'conyuge');
    }

    const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <title>Solicitud de Préstamo - ${s.id.split('-')[0].toUpperCase()}</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
        <style>
            @page {
                size: landscape;
                margin: 5mm;
            }
            * {
                box-sizing: border-box;
            }
            body {
                font-family: Tahoma, 'Segoe UI', Geneva, sans-serif;
                font-size: 11px;
                color: #0c2b2b;
                margin: 0;
                padding: 0;
            }
            #retro-modal-container {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background-color: rgba(15, 23, 42, 0.65);
                z-index: 999999;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 20px 10px;
                backdrop-filter: blur(4px);
                box-sizing: border-box;
            }
            .action-bar {
                background-color: #1e293b;
                color: white;
                padding: 10px 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                width: 100%;
                max-width: 1300px;
                border-radius: 12px 12px 0 0;
                box-sizing: border-box;
            }
            .action-bar h2 {
                margin: 0;
                font-size: 13px;
                font-weight: 800;
                letter-spacing: 0.05em;
                text-transform: uppercase;
            }
            .action-bar .btn {
                background-color: #4c7a7a;
                color: white;
                border: none;
                padding: 6px 14px;
                font-size: 11px;
                font-weight: bold;
                border-radius: 4px;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 6px;
                transition: all 0.2s;
                text-decoration: none;
            }
            .action-bar .btn:hover {
                background-color: #689c9c;
            }
            .action-bar .btn-danger {
                background-color: #ef4444;
            }
            .action-bar .btn-danger:hover {
                background-color: #dc2626;
            }
            
            .screen-wrapper {
                padding: 15px;
                width: 100%;
                max-width: 1300px;
                margin: 0 auto;
                background-color: #f0f7f7;
                border-radius: 0 0 12px 12px;
                box-sizing: border-box;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            }

            /* Retro System Border & Frame */
            .system-frame {
                border: 3px double #4c7a7a;
                background-color: #fff;
                padding: 15px;
                border-radius: 6px;
                box-shadow: 0 0 15px rgba(0,0,0,0.05);
            }

            /* 1. Header Layout */
            .system-header {
                display: flex;
                justify-content: space-between;
                background-color: #b8d3d3;
                border: 2px solid #4c7a7a;
                padding: 12px;
                margin-bottom: 8px;
                border-radius: 4px;
            }
            .header-left {
                width: 50%;
            }
            .system-title {
                font-size: 16px;
                font-weight: bold;
                color: #2b5252;
                margin: 0 0 5px 0;
                letter-spacing: 0.02em;
            }
            .header-info-grid {
                display: grid;
                grid-template-columns: auto 1fr;
                column-gap: 12px;
                row-gap: 2px;
            }
            .header-info-label {
                font-weight: bold;
                color: #2b5252;
            }
            .header-info-val {
                color: #333;
            }
            
            .header-right {
                width: 45%;
                text-align: right;
                display: flex;
                flex-direction: column;
                align-items: flex-end;
            }
            .risk-grid {
                display: grid;
                grid-template-columns: auto auto;
                column-gap: 15px;
                row-gap: 2px;
                text-align: left;
                margin-bottom: 6px;
            }
            .risk-label {
                font-weight: bold;
                color: #2b5252;
            }
            .risk-val {
                color: #008000;
                font-weight: bold;
            }
            .print-time {
                font-size: 10px;
                color: #555;
                margin-top: auto;
            }

            /* 2. Menu Navigation Simulator */
            .nav-menu-bar {
                background-color: #4c7a7a;
                color: white;
                padding: 6px 12px;
                font-weight: bold;
                display: flex;
                gap: 20px;
                margin-bottom: 8px;
                border-radius: 4px;
            }
            .nav-item {
                cursor: pointer;
            }
            .nav-item:hover {
                text-decoration: underline;
                color: #e0eeee;
            }

            /* 3. Breadcrumb / Title block */
            .breadcrumb-bar {
                background-color: #e0eeee;
                border: 1px solid #689c9c;
                padding: 6px 12px;
                font-weight: bold;
                font-size: 11px;
                color: #2b5252;
                margin-bottom: 12px;
                border-radius: 4px;
            }

            /* Tabs Style */
            .retro-tab-btn {
                background: #c9e2e2;
                border: 1.5px solid #4c7a7a;
                border-bottom: none;
                padding: 6px 14px;
                font-weight: bold;
                font-size: 10.5px;
                cursor: pointer;
                color: #2b5252;
                border-radius: 4px 4px 0 0;
                transition: background-color 0.2s;
            }
            .retro-tab-btn.active {
                background: #ffffff;
                border-bottom: 2px solid #ffffff;
                color: #0c2b2b;
                z-index: 10;
            }
            .retro-tab-btn:hover:not(.active) {
                background: #dbeef5;
            }

            /* Main Layout Grid */
            .main-grid {
                display: grid;
                grid-template-columns: 280px 1fr;
                gap: 12px;
            }

            /* 4. Left Sidebar Details Panel */
            .sidebar-panel {
                border: 2px solid #4c7a7a;
                background-color: #f0f7f7;
                display: flex;
                flex-direction: column;
                border-radius: 4px;
                overflow: hidden;
                font-size: 10px;
            }
            .panel-header {
                background-color: #4c7a7a;
                color: white;
                padding: 4px 8px;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                font-size: 10px;
            }
            .card-header {
                background-color: #b8d3d3;
                color: #2b5252;
                border-bottom: 2px solid #4c7a7a;
                padding: 5px 10px;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                font-size: 11px;
            }
            .sidebar-rows {
                padding: 4px 6px;
                flex-grow: 1;
            }
            .sidebar-row {
                display: flex;
                justify-content: space-between;
                padding: 2px 0;
                border-bottom: 1px dashed #b8d3d3;
            }
            .sidebar-row:last-child {
                border-bottom: none;
            }
            .sidebar-label {
                font-weight: bold;
                color: #2b5252;
            }
            .sidebar-val {
                text-align: right;
                font-weight: bold;
                color: #111;
            }
            .sidebar-val.highlight-red {
                color: #a90000;
                font-weight: bold;
            }

            .sidebar-footer-boxes {
                padding: 8px;
                border-top: 1px solid #4c7a7a;
                background-color: #e5efef;
            }
            .footer-input-row {
                display: flex;
                align-items: center;
                margin-bottom: 6px;
            }
            .footer-input-label {
                width: 60px;
                font-weight: bold;
                color: #2b5252;
            }
            .footer-input-box {
                flex-grow: 1;
                border: 1px solid #689c9c;
                background-color: white;
                padding: 2px 5px;
                font-size: 11px;
                font-family: inherit;
                height: 19px;
            }
            .footer-buttons {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 4px;
                margin-top: 8px;
            }
            .retro-btn {
                background: #e0eeee;
                border: 1px solid #4c7a7a;
                border-bottom: 2px solid #2b5252;
                border-right: 2px solid #2b5252;
                padding: 4px 6px;
                text-align: center;
                font-weight: bold;
                font-size: 10px;
                cursor: pointer;
                color: #0c2b2b;
                border-radius: 3px;
            }
            .retro-btn:active {
                border: 1px solid #2b5252;
                border-top: 2px solid #2b5252;
                border-left: 2px solid #2b5252;
                background: #c9e2e2;
            }

            .sidebar-cargos-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 10px;
                font-size: 10px;
            }
            .sidebar-cargos-table th {
                background-color: #4c7a7a;
                color: white;
                font-weight: bold;
                text-align: left;
                padding: 4px 6px;
                border: 1px solid #4c7a7a;
            }
            .sidebar-cargos-table td {
                padding: 4px 6px;
                border: 1px solid #b8d3d3;
                background-color: white;
            }

            /* 5. Right Cards Container */
            .workspace-panel {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            .cards-row {
                display: grid;
                grid-template-columns: 1.5fr 1fr;
                gap: 12px;
            }
            .content-card {
                border: 2px solid #4c7a7a;
                background-color: #f0f7f7;
                border-radius: 4px;
                overflow: hidden;
            }
            .card-body {
                padding: 10px;
                display: flex;
                gap: 12px;
            }
            .photo-frame {
                width: 110px;
                height: 130px;
                border: 2px solid #4c7a7a;
                background-color: #e5efef;
                display: flex;
                justify-content: center;
                align-items: center;
                overflow: hidden;
                flex-shrink: 0;
                border-radius: 4px;
            }
            .photo-frame img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            .photo-placeholder {
                color: #689c9c;
                font-size: 28px;
            }
            .card-data-grid {
                flex-grow: 1;
                display: grid;
                grid-template-columns: auto 1fr;
                column-gap: 10px;
                row-gap: 3.5px;
                align-content: start;
            }
            .card-data-label {
                font-weight: bold;
                color: #2b5252;
                text-transform: uppercase;
                font-size: 10.5px;
            }
            .card-data-val {
                color: #111;
                border-bottom: 1.5px solid #b8d3d3;
                padding-bottom: 2px;
                font-weight: bold;
            }
            .card-data-inline {
                grid-column: 1 / span 2;
                display: flex;
                flex-wrap: wrap;
                column-gap: 15px;
                row-gap: 2px;
                background-color: #e4f0f0;
                padding: 4px 8px;
                border: 1.5px dashed #4c7a7a;
                margin-top: 6px;
                border-radius: 4px;
            }
            .card-data-inline-item {
                display: flex;
                gap: 4px;
            }
            .card-data-inline-label {
                font-weight: bold;
                color: #2b5252;
            }
            
            /* Custom styled Checkboxes */
            .checkboxes-line {
                grid-column: 1 / span 2;
                display: flex;
                gap: 18px;
                margin-top: 8px;
                padding: 6px 0 0 0;
                border-top: 1px solid #b8d3d3;
            }
            .chk-box {
                display: inline-flex;
                align-items: center;
                font-size: 10px;
                font-weight: bold;
                color: #0c2b2b;
            }
            .chk-box.checked::before {
                content: "✔";
                display: inline-flex;
                justify-content: center;
                align-items: center;
                width: 13px;
                height: 13px;
                border: 1.5px solid #4c7a7a;
                background-color: #4c7a7a;
                color: white;
                margin-right: 6px;
                border-radius: 2px;
                font-size: 10px;
            }
            .chk-box.unchecked::before {
                content: "";
                display: inline-block;
                width: 13px;
                height: 13px;
                border: 1.5px solid #4c7a7a;
                background-color: white;
                margin-right: 6px;
                border-radius: 2px;
            }

            /* Print modifications */
            @media print {
                body > :not(#retro-modal-container) {
                    display: none !important;
                }
                #retro-modal-container {
                    position: absolute !important;
                    left: 0 !important;
                    top: 0 !important;
                    width: 100% !important;
                    height: auto !important;
                    background: transparent !important;
                    padding: 0 !important;
                    overflow: visible !important;
                }
                .no-print {
                    display: none !important;
                }
                .screen-wrapper {
                    padding: 0 !important;
                    max-width: 100% !important;
                    margin: 0 !important;
                    box-shadow: none !important;
                    background-color: transparent !important;
                }
                .system-frame {
                    border: none !important;
                    box-shadow: none !important;
                    padding: 0 !important;
                }
            }
        </style>
    </head>
    <body>
        <div class="action-bar no-print">
            <h2>DETALLES DE LA SOLICITUD DE CRÉDITO</h2>
            <div style="display: flex; gap: 8px;">
                <button id="modal-print-email-btn" class="btn" style="background-color: #f59e0b; border-color: #d97706; color: #ffffff;"><i class="fas fa-envelope"></i> Formato Correo (Organizado)</button>
                <button id="modal-print-btn" class="btn"><i class="fas fa-print"></i> Imprimir Expediente</button>
                <button id="modal-close-btn" class="btn btn-danger"><i class="fas fa-times"></i> Cerrar Ventana</button>
            </div>
        </div>

        <div class="screen-wrapper">
            <div class="system-frame">
                <!-- System Header -->
                <div class="system-header">
                    <div class="header-left">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                            <img src="${portalLogo}" style="height: 32px; width: 32px; object-fit: cover; border-radius: 6px; border: 1.5px solid #4d7a7a;">
                            <h1 class="system-title" style="margin: 0; font-size: 16px; font-weight: bold;">B&H PRÉSTAMOS</h1>
                        </div>
                        <div class="header-info-grid">
                            <span class="header-info-label">Tipo de Oficina :</span>
                            <span class="header-info-val">AGENCIA</span>
                            <span class="header-info-label">RNC :</span>
                            <span class="header-info-val">1-04-00068-4</span>
                            <span class="header-info-label">Teléfono :</span>
                            <span class="header-info-val">809-574-1142</span>
                            <span class="header-info-label">Trabajando en :</span>
                            <span class="header-info-val">${fechaInicio}</span>
                        </div>
                    </div>
                    <div class="header-right">
                        <div class="risk-grid">
                            <span class="risk-label">Usuario :</span>
                            <span style="color:#333; font-weight:bold;">ADMINISTRADOR</span>
                            <span class="risk-label">Riesgo :</span>
                            <span class="risk-val">en Línea</span>
                            <span class="risk-label">Padrón :</span>
                            <span class="risk-val">en Línea</span>
                            <span class="risk-label">Contabilidad :</span>
                            <span class="risk-val">en Línea</span>
                        </div>
                        <div class="print-time">
                            ${fechaImpresion} ${horaImpresion}
                        </div>
                    </div>
                </div>

                <!-- Simulado Menu Navigation -->
                <div class="nav-menu-bar">
                    <span class="nav-item">Inicio</span>
                    <span class="nav-item">Evaluación</span>
                    <span class="nav-item" style="border-bottom: 2px solid white;">Préstamos</span>
                    <span class="nav-item">Gerencia</span>
                    <span class="nav-item">Enc. Agencia</span>
                    <span class="nav-item" id="modal-exit-item">Salir</span>
                </div>

                <!-- Breadcrumb Title -->
                <div class="breadcrumb-bar">
                    CONSULTA :: Estatus del Prestamos
                </div>

                <!-- Tabs for View Mode -->
                <div class="no-print" style="display: flex; gap: 4px; margin-bottom: -1px; padding-left: 2px; position: relative; z-index: 5;">
                    <button class="retro-tab-btn ${mode === 'cliente_garante' ? 'active' : ''}" onclick="window.openSolicitudRetro('${id}', 'cliente_garante', false)">Cliente y Co-Deudor</button>
                    <button class="retro-tab-btn ${mode === 'cliente_conyuge' ? 'active' : ''}" onclick="window.openSolicitudRetro('${id}', 'cliente_conyuge', false)">Cliente y Cónyuge</button>
                    <button class="retro-tab-btn ${mode === 'garante_conyuge' ? 'active' : ''}" onclick="window.openSolicitudRetro('${id}', 'garante_conyuge', false)">Garante y Cónyuge</button>
                </div>

                <!-- Main Layout -->
                <div class="main-grid" style="border-top: 1.5px solid #4c7a7a; padding-top: 10px;">
                    <!-- Left Sidebar -->
                    <div class="sidebar-panel">
                        <div class="panel-header">Datos del Prestamo</div>
                        <div class="sidebar-rows">
                            <div class="sidebar-row">
                                <span class="sidebar-label">Prestamo No :</span>
                                <span class="sidebar-val highlight-red">250-00000${s.id.split('-')[0].slice(0, 5).toUpperCase()}</span>
                            </div>
                            <div class="sidebar-row">
                                <span class="sidebar-label">Solicitud No :</span>
                                <span class="sidebar-val highlight-red">250-00000${s.id.split('-')[0].slice(0, 5).toUpperCase()}</span>
                            </div>
                            <div class="sidebar-row">
                                <span class="sidebar-label">a Pagar :</span>
                                <span class="sidebar-val">${freq.charAt(0).toUpperCase() + freq.slice(1)}</span>
                            </div>
                            <div class="sidebar-row">
                                <span class="sidebar-label">Debe Pagar el :</span>
                                <span class="sidebar-val">${fechaPago}</span>
                            </div>
                            <div class="sidebar-row">
                                <span class="sidebar-label">Cuotas de :</span>
                                <span class="sidebar-val">RD$ ${Number(s.cuota || d.cuota || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                            </div>
                            <div class="sidebar-row">
                                <span class="sidebar-label">Interes :</span>
                                <span class="sidebar-val">2.25</span>
                            </div>
                            <div class="sidebar-row">
                                <span class="sidebar-label">Plazo :</span>
                                <span class="sidebar-val">${s.tiempo || 18} ${freq === 'diario' ? 'Días' : freq === 'semanal' ? 'Semanas' : freq === 'quincenal' ? 'Quincenas' : 'Meses'}</span>
                            </div>
                            <div class="sidebar-row">
                                <span class="sidebar-label">Ultimo Pago :</span>
                                <span class="sidebar-val">---</span>
                            </div>
                            <div class="sidebar-row">
                                <span class="sidebar-label">Monto :</span>
                                <span class="sidebar-val highlight-red">RD$ ${Number(s.monto || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                            </div>
                            <div class="sidebar-row">
                                <span class="sidebar-label">Balance :</span>
                                <span class="sidebar-val highlight-red">RD$ ${s.status === 'Completado' ? '0.00' : Number(s.monto || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                            </div>
                            <div class="sidebar-row">
                                <span class="sidebar-label">Interés Pagado :</span>
                                <span class="sidebar-val">RD$ 0.00</span>
                            </div>
                            <div class="sidebar-row">
                                <span class="sidebar-label">Estatus :</span>
                                <span class="sidebar-val" style="font-weight:bold; color: ${s.status === 'Aprobado' ? '#008000' : s.status === 'Rechazado' ? '#a90000' : '#d97706'}">${s.status || 'Pendiente'}</span>
                            </div>
                            <div class="sidebar-row">
                                <span class="sidebar-label">Evaluador :</span>
                                <span class="sidebar-val">${d.evaluador || s.evaluador || 'jose.grullat'}</span>
                            </div>
                            <div class="sidebar-row">
                                <span class="sidebar-label">Fecha Inicio :</span>
                                <span class="sidebar-val">${fechaInicio}</span>
                            </div>
                            <div class="sidebar-row">
                                <span class="sidebar-label">Fecha Final :</span>
                                <span class="sidebar-val">${fechaFinal}</span>
                            </div>
                            <div class="sidebar-row">
                                <span class="sidebar-label">Transferido al :</span>
                                <span class="sidebar-val">0</span>
                            </div>
                            <div class="sidebar-row">
                                <span class="sidebar-label">Tipo Garantia :</span>
                                <span class="sidebar-val" style="font-size:9.5px; font-weight:bold;">${type === 'garante' ? 'PERSONAL CON DEUDOR' : type === 'vehiculo' ? 'GARANTÍA VEHÍCULO' : type === 'hipotecario' ? 'GARANTÍA HIPOTECARIA' : 'PERSONAL'}</span>
                            </div>
                            <div class="sidebar-row">
                                <span class="sidebar-label">Tipo según SIB :</span>
                                <span class="sidebar-val">Comercial</span>
                            </div>
                        </div>

                        <div class="sidebar-footer-boxes">
                            <div class="footer-input-row">
                                <span class="footer-input-label">Fecha :</span>
                                <input type="text" class="footer-input-box" value="${fechaImpresion}" readonly>
                            </div>
                            <div class="footer-input-row">
                                <span class="footer-input-label">Monto :</span>
                                <input type="text" class="footer-input-box" value="" placeholder="---">
                            </div>
                            <div class="footer-buttons">
                                <div class="retro-btn" onclick="alert('Consulta de comportamiento del deudor')">Comportamiento</div>
                                <div class="retro-btn" onclick="alert('Retornar solicitud a estado anterior')">Retornar</div>
                                <div class="retro-btn" onclick="alert('Distribuir cargos')">Distribuir</div>
                            </div>

                            <table class="sidebar-cargos-table">
                                <thead>
                                    <tr>
                                        <th>Descripcion</th>
                                        <th>aCobrar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Capital Atrasado</td>
                                        <td style="text-align:right; font-weight:bold;">0.00</td>
                                    </tr>
                                    <tr>
                                        <td>Interés Acumulado</td>
                                        <td style="text-align:right; font-weight:bold;">0.00</td>
                                    </tr>
                                </tbody>
                            </table>

                            <div style="margin-top: 10px; border-top: 1.5px solid #4c7a7a; padding-top: 8px;">
                                <span class="sidebar-label" style="display:block; margin-bottom: 4px; font-weight:bold; color:#2b5252;">Detalle / Nota:</span>
                                <div style="display: flex; gap: 4px;">
                                    <input type="text" id="retro-detalle-nota" class="footer-input-box" style="flex-grow: 1; height: 22px; font-size: 10px; padding: 2px 4px; border: 1px solid #4c7a7a;" value="${d.detallesNota || ''}" placeholder="Escribir cualquier detalle...">
                                    <button id="retro-save-nota-btn" class="retro-btn" style="padding: 2px 6px; height: 22px; font-size: 9px; line-height: 1;">Guardar</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Right Main Workspace -->
                    <div class="workspace-panel">
                        ${row1Html}
                        ${row2Html}
                    </div>
                </div>
            </div>
        </div>

    </body>
    </html>
    `;

    modalDiv.innerHTML = html;
    document.body.appendChild(modalDiv);

    // Wire action buttons
    const closeBtn = modalDiv.querySelector('.action-bar #modal-close-btn');
    const exitItem = modalDiv.querySelector('#modal-exit-item');
    const printBtn = modalDiv.querySelector('.action-bar #modal-print-btn');
    const printEmailBtn = modalDiv.querySelector('.action-bar #modal-print-email-btn');

    const closeModal = () => modalDiv.remove();

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (exitItem) exitItem.addEventListener('click', closeModal);
    if (printBtn) printBtn.addEventListener('click', () => window.print());
    if (printEmailBtn) printEmailBtn.addEventListener('click', () => window.printEmailTemplate(id));

    // Guardar detalles/nota in Supabase JSONB data
    const saveNotaBtn = modalDiv.querySelector('#retro-save-nota-btn');
    if (saveNotaBtn) {
        saveNotaBtn.addEventListener('click', async () => {
            const noteInput = modalDiv.querySelector('#retro-detalle-nota');
            const noteVal = noteInput ? noteInput.value : '';
            saveNotaBtn.disabled = true;
            saveNotaBtn.textContent = '...';
            try {
                const { data: latestApp, error: fetchErr } = await supabase
                    .from('loan_applications')
                    .select('data')
                    .eq('id', id)
                    .single();

                if (fetchErr) throw fetchErr;

                const updatedData = {
                    ...(latestApp.data || {}),
                    detallesNota: noteVal
                };

                const { error: updateErr } = await supabase
                    .from('loan_applications')
                    .update({ data: updatedData })
                    .eq('id', id);

                if (updateErr) throw updateErr;
                alert('¡Detalle / Nota guardada correctamente!');
            } catch (err) {
                console.error(err);
                alert('Error al guardar la nota: ' + err.message);
            } finally {
                saveNotaBtn.disabled = false;
                saveNotaBtn.textContent = 'Guardar';
            }
        });
    }

    // Asynchronously load photos from local JCE query cache if not stored in Supabase
    const imgsToLoad = modalDiv.querySelectorAll('img[data-cedula]');
    imgsToLoad.forEach(async (img) => {
        const ced = img.dataset.cedula;
        if (ced && !img.src.startsWith('data:')) {
            const localPhoto = await getPhotoLocal(ced);
            if (localPhoto) {
                img.src = localPhoto;
                img.style.display = 'block';
                const frame = img.closest('.photo-frame');
                if (frame) {
                    const placeholder = frame.querySelector('.photo-placeholder');
                    if (placeholder) placeholder.style.display = 'none';
                }
            }
        }
    });

    if (autoPrint) {
        setTimeout(() => {
            window.print();
            closeModal();
        }, 1000);
    }
};

window.exportToWord = async (id) => {
    const { data: iconData } = await supabase.from('site_settings').select('value').eq('key', 'portal_icon').single();
    const portalLogo = iconData?.value || 'https://files.catbox.moe/yz89qv.png';

    const { data: s, error } = await supabase.from('loan_applications')
        .select('*, clients(*)')
        .eq('id', id)
        .single();
    
    if (error || !s) return;
    const d = s.data || {};

    const freq = d.frecuenciaPago || 'mensual';
    let freqLabel = 'MESES';
    let cuotaLabel = 'CUOTA MENSUAL:';
    if (freq === 'diario') {
        freqLabel = 'DÍAS';
        cuotaLabel = 'CUOTA DIARIA:';
    } else if (freq === 'semanal') {
        freqLabel = 'SEMANAS';
        cuotaLabel = 'CUOTA SEMANAL:';
    } else if (freq === 'quincenal') {
        freqLabel = 'QUINCENAS';
        cuotaLabel = 'CUOTA QUINCENAL:';
    } else {
        freqLabel = 'MESES';
        cuotaLabel = 'CUOTA MENSUAL:';
    }

    const sol = d.solicitante || {};
    const con = d.conyuge || {};
    const veh = d.garantiaVehiculo || {};
    const hipo = d.garantiaHipotecaria || {};
    const gar = d.garante || {};
    const conGar = d.conyugeGarante || (d.garante ? d.garante.conyuge : null) || {};

    let type = s.loan_type;
    if (!type && s.data && s.data.tipoPrestamo) type = s.data.tipoPrestamo;
    if (!type) type = 'personal';

    const buildWordTable = (obj1, obj2, fields1, fields2) => {
        let rows = '';
        const maxLen = Math.max(fields1.length, fields2.length);
        for (let i = 0; i < maxLen; i++) {
            const f1 = fields1[i];
            const f2 = fields2[i];
            const c1 = f1 ? `<td width="50%"><span class="label">${f1.l}:</span> ${obj1[f1.k] || ''}</td>` : '<td width="50%"></td>';
            const c2 = f2 ? `<td width="50%"><span class="label">${f2.l}:</span> ${obj2[f2.k] || ''}</td>` : '<td width="50%"></td>';
            rows += `<tr>${c1}${c2}</tr>`;
        }
        return `<table class="data-table" cellspacing="0" cellpadding="0">${rows}</table>`;
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
        {l:'EDAD',k:'edad'},{l:'APODO',k:'apodo'},{l:'ESTADO CIVIL',k:'estadoCivil'},
        {l:'TELEFONO',k:'telefono'},{l:'OCUPACION',k:'ocupacion'}
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

    let dynamicWord = `<div class="section">DATOS DE SOLICITANTE</div>`;
    dynamicWord += buildWordTable(sol, sol, solFields1, solFields2);
    
    dynamicWord += `<div class="section">DATOS DEL CONYUGE</div>`;
    dynamicWord += buildWordTable(con, con, conFields1, conFields2);

    if (type === 'vehiculo') {
        dynamicWord += `<div class="section">DATOS DE GARANTIA</div>`;
        dynamicWord += buildWordTable(veh, veh, vehFields1, vehFields2);
    } else if (type === 'hipotecario') {
         dynamicWord += `<div class="section">DATOS DE GARANTIA HIPOTECARIA</div>`;
         dynamicWord += `<table class="data-table" cellspacing="0" cellpadding="0">
            <tr><td width="50%"><span class="label">PROPIETARIO:</span> ${hipo.propietario || ''}</td><td width="50%"><span class="label">TIPO INMUEBLE:</span> ${hipo.tipoInmueble || ''}</td></tr>
            <tr><td><span class="label">CEDULA:</span> ${hipo.cedulaRNC || ''}</td><td><span class="label">VALOR:</span> ${hipo.valorAproximado || ''}</td></tr>
         </table>`;
    } else if (type === 'garante') {
        dynamicWord += `<div class="section">DATOS DEL GARANTE</div>`;
        dynamicWord += buildWordTable(gar, gar, conFields1, conFields2); 
        dynamicWord += `<div class="section">DATOS DEL CONYUGE DEL GARANTE</div>`;
        dynamicWord += buildWordTable(conGar, conGar, conFields1, conFields2); 
    }

    const content = `
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
                <td width="35%" align="center" valign="top">
                    <img src="${portalLogo}" width="120" height="auto"><br>
                    <span style="font-size: 11pt;">1-33-34406-8</span>
                </td>
                <td width="10%"></td>
                <td width="55%" align="left" valign="top" style="font-size: 11pt; padding-top: 15px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr><td width="160"><p style="margin:2px 0;">SOLICITUD NO:</p></td><td><p style="margin:2px 0;">${String(s.id).split('-')[0].toUpperCase()}</p></td></tr>
                        <tr><td><p style="margin:2px 0;">FECHA SOLICITUD:</p></td><td><p style="margin:2px 0;">${new Date(s.created_at).toLocaleDateString()}</p></td></tr>
                        <tr><td><p style="margin:2px 0;">MONTO RD$:</p></td><td><p style="margin:2px 0;">${Number(s.monto).toLocaleString()}</p></td></tr>
                        <tr><td><p style="margin:2px 0;">TIEMPO:</p></td><td><p style="margin:2px 0;">${s.tiempo} ${freqLabel}</p></td></tr>
                        <tr><td><p style="margin:2px 0;">${cuotaLabel.replace(':', '')}:</p></td><td><p style="margin:2px 0;">RD$ ${Number(d.cuota || 0).toLocaleString()}</p></td></tr>
                    </table>
                </td>
            </tr>
        </table>

        ${dynamicWord}

        <br><br><br>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
                <td width="${type === 'garante' ? '50%' : '100%'}" align="center">
                    <p style="margin:0;">__________________________</p>
                    <p style="margin:4px 0 0 0;">FIRMA DEUDOR</p>
                </td>
                ${type === 'garante' ? `
                <td width="50%" align="center">
                    <p style="margin:0;">__________________________</p>
                    <p style="margin:4px 0 0 0;">FIRMA FIADOR</p>
                </td>
                ` : ''}
            </tr>
        </table>

        <p style="font-size:9pt; margin-top:30px; text-align:center;"><i>El cliente autoriza a la empresa a consultar su información en los buros de crédito por la presente doy constancia de haber leído esta solicitud y que las contestaciones dadas por mí son ciertas y correctas en fe de la cual firmo.</i></p>
    </body></html>`;

    const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Solicitud_${sol.nombres || 'Expediente'}.doc`;
    link.click();
};

/**
 * MÓDULO DE CONFIGURACIÓN DE NOTIFICACIONES POR CORREO (BREVO)
 */
async function initEmailConfigModule() {
    const emailForm = document.getElementById('emailForm');
    if (!emailForm) return;

    const saveBtn = document.getElementById('saveEmailBtn');
    const testBtn = document.getElementById('testEmailBtn');
    const brevoKeyInput = document.getElementById('brevoKey');
    const senderEmailInput = document.getElementById('senderEmail');
    const senderNameInput = document.getElementById('senderName');
    const recipientEmailInput = document.getElementById('recipientEmail');
    const emailEnabledInput = document.getElementById('emailEnabled');
    
    // Toggle de visibilidad de la API Key
    window.toggleKeyVisibility = () => {
        const type = brevoKeyInput.type === 'password' ? 'text' : 'password';
        brevoKeyInput.type = type;
        const icon = document.getElementById('toggleKeyIcon');
        if (icon) {
            icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
        }
    };

    // Cargar configuración existente
    const loadConfig = async () => {
        try {
            const { data, error } = await supabase
                .from('promotions')
                .select('*')
                .eq('title', 'CONFIG_EMAIL')
                .maybeSingle();

            if (error) throw error;

            let config = {
                enabled: true,
                brevo_key: '',
                sender_email: 'josegrullat.byhprestamoengeneral@outlook.com',
                sender_name: 'B&H Préstamos',
                recipient_email: 'josegrullat.byhprestamoengeneral@outlook.com'
            };

            if (data && data.description) {
                const desc = typeof data.description === 'string' ? JSON.parse(data.description) : data.description;
                config = { ...config, ...desc };
            }

            brevoKeyInput.value = config.brevo_key || '';
            senderEmailInput.value = config.sender_email || '';
            senderNameInput.value = config.sender_name || '';
            recipientEmailInput.value = config.recipient_email || '';
            emailEnabledInput.checked = config.enabled;

        } catch (err) {
            console.error('Error cargando configuración de correo:', err);
        }
    };

    await loadConfig();

    // Guardar configuración
    emailForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-circle-notch animate-spin"></i> GUARDANDO...';

        try {
            const configData = {
                brevo_key: brevoKeyInput.value.trim(),
                sender_email: senderEmailInput.value.trim(),
                sender_name: senderNameInput.value.trim(),
                recipient_email: recipientEmailInput.value.trim(),
                enabled: emailEnabledInput.checked
            };

            const { data: existing } = await supabase
                .from('promotions')
                .select('id')
                .eq('title', 'CONFIG_EMAIL')
                .maybeSingle();

            const payload = {
                title: 'CONFIG_EMAIL',
                description: configData,
                active: true
            };

            let saveResult;
            if (existing) {
                saveResult = await supabase
                    .from('promotions')
                    .update(payload)
                    .eq('id', existing.id);
            } else {
                saveResult = await supabase
                    .from('promotions')
                    .insert([payload]);
            }

            if (saveResult.error) throw saveResult.error;

            alert('¡Configuración de correo guardada con éxito!');
        } catch (err) {
            console.error(err);
            alert('Error al guardar configuración: ' + err.message);
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="fas fa-save text-xl"></i> GUARDAR CONFIGURACIÓN';
        }
    });

    // Enviar correo de prueba
    testBtn?.addEventListener('click', async () => {
        testBtn.disabled = true;
        testBtn.innerHTML = '<i class="fas fa-circle-notch animate-spin"></i> ENVIANDO PRUEBA...';

        try {
            const tempConfig = {
                brevo_key: brevoKeyInput.value.trim(),
                sender_email: senderEmailInput.value.trim(),
                sender_name: senderNameInput.value.trim(),
                recipient_email: recipientEmailInput.value.trim(),
                enabled: emailEnabledInput.checked
            };

            if (!tempConfig.brevo_key) {
                throw new Error('Debe proveer una clave API de Brevo para realizar la prueba.');
            }
            if (!tempConfig.sender_email || !tempConfig.recipient_email) {
                throw new Error('Debe proveer el correo remitente y destinatario para realizar la prueba.');
            }

            await sendBrevoTestEmail(tempConfig);
            alert('¡Correo de prueba enviado con éxito! Revisa la bandeja de entrada del destinatario.');
        } catch (err) {
            console.error(err);
            alert('Error al enviar correo de prueba: ' + err.message);
        } finally {
            testBtn.disabled = false;
            testBtn.innerHTML = '<i class="fas fa-paper-plane"></i> ENVIAR CORREO DE PRUEBA';
        }
    });
}

