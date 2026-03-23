import { supabase } from './supabase.js';
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

            // Exito -> Redirigir al dashboard
            window.location.href = './index.html';

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
        window.location.href = './login.html';
        return null;
    }
    return session;
};

// 2. Lógica General para todas las páginas administrativas (Banners, Carrusel, Promociones, Index)
document.addEventListener('DOMContentLoaded', async () => {
    // Si es la página de login, no procesar nada más
    if (document.getElementById('loginForm')) return;

    // Protección de Ruta & Sesión
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        window.location.href = './login.html';
        return;
    }

    console.log('Admin autenticado:', session.user.email);

    // Logout Genérico
    document.getElementById('logoutBtn')?.addEventListener('click', async () => {
        await supabase.auth.signOut();
        window.location.href = './login.html';
    });

    // --- INICIALIZACIÓN POR PÁGINA ---
    const path = window.location.pathname;
    
    if (path.includes('banners.html')) {
        initBannerModule();
    } else if (path.includes('carousel.html')) {
        initCarouselModule();
    } else if (path.includes('promotions.html')) {
        initPromotionsModule();
    } else if (path.includes('cuotas.html')) {
        initCuotasConfigModule(); 
    } else if (path.includes('footer.html')) {
        initFooterModule();
    } else if (path.includes('solicitudes_list.html')) {
        initSolicitudesListModule();
    } else if (path.includes('solicitudes.html')) {
        initSolicitudesModule();
    } else if (path.includes('clientes.html')) {
        initClientesModule();
    } else if (path.includes('index.html') || path.endsWith('/admin/')) {
        if (typeof initStats === 'function') initStats();
        else if (typeof initAnalytics === 'function') initAnalytics();
    }
});

// --- MÓDULOS DE GESTIÓN ---

async function initBannerModule() {
    const bannerText = document.getElementById('bannerText');
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

    window.previewBanner = updatePreview;
}

async function initCarouselModule() {
    // Global Settings Elements
    const globalOverlayForm = document.getElementById('globalOverlayForm');
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
    // DOM Elements
    const promoForm = document.getElementById('promoForm');
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
        
        if (!promos || promos.length === 0) {
            promoList.innerHTML = '<div class="p-8 border-2 border-dashed border-slate-200 rounded-3xl text-center"><p class="text-slate-400 italic">No tienes bloques de promoción. ¡Crea el primero arriba!</p></div>';
            return;
        }

        promoList.innerHTML = promos.map(promo => {
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

    // Start fetching
    loadPromos();
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

window.reusePromo = async (id) => {
    const { data: promo } = await supabase.from('promotions').select('*').eq('id', id).single();
    if (!promo) return;

    try {
        const pData = JSON.parse(promo.description);
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
        // De image_url raíz si existe
        if (promo.image_url) {
            const parts = promo.image_url.split('/');
            filesToDelete.push(parts[parts.length - 1]);
        }
        
        // De description JSON (array de imágenes)
        try {
            const pData = JSON.parse(promo.description);
            if (pData.images && Array.isArray(pData.images)) {
                pData.images.forEach(img => {
                    if (img && typeof img === 'string') {
                        const parts = img.split('/');
                        filesToDelete.push(parts[parts.length - 1]);
                    }
                });
            }
            if (pData.image_url && typeof pData.image_url === 'string') {
                const parts = pData.image_url.split('/');
                filesToDelete.push(parts[parts.length - 1]);
            }
        } catch(e) {}

        // Borrar archivos únicos de los buckets posibles
        if (filesToDelete.length > 0) {
            const uniqueFiles = [...new Set(filesToDelete)];
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
        window.location.reload(); 
    }
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

    const presetIcons = [
        { name: 'Facebook', class: 'fab fa-facebook-f' },
        { name: 'Instagram', class: 'fab fa-instagram' },
        { name: 'WhatsApp', class: 'fab fa-whatsapp' },
        { name: 'X/Twitter', class: 'fab fa-x-twitter' },
        { name: 'TikTok', class: 'fab fa-tiktok' },
        { name: 'YouTube', class: 'fab fa-youtube' },
        { name: 'Web', class: 'fas fa-globe' }
    ];

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

    let socials = [];

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

    const renderSocials = () => {
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
    const updatePreview = () => {
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

// --- MÓDULO DE SOLICITUDES ---
async function initSolicitudesModule() {
    const form = document.getElementById('solicitudForm');
    const refTableBody = document.getElementById('referenciasTableBody');
    const solicitudNoEl = document.getElementById('solicitudNo');
    const tipoPrestamoSelect = document.getElementById('tipoPrestamo');
    
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
                solicitante: {
                    nombres: document.getElementById('nombresSol').value,
                    apellidos: document.getElementById('apellidosSol').value,
                    identificador: cedula,
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
                    destino: document.getElementById('destinoCredito').value
                },
                conyuge: {
                    nombres: document.getElementById('nombresCon').value,
                    apellidos: document.getElementById('apellidosCon').value,
                    fechaNacimiento: document.getElementById('fechaNacimientoCon').value,
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

            // 5. Guardar Solicitud
            const cleanNum = (str) => parseFloat(String(str).replace(/,/g, '')) || 0;

            const { error: sErr } = await supabase.from('loan_applications').insert([{
                client_id: clientId,
                loan_type: type,
                applicant_name: full_name,
                applicant_cedula: cedula,
                monto: cleanNum(document.getElementById('montoSolicitado').value),
                tiempo: parseInt(document.getElementById('tiempoPrestamo').value) || 0,
                cuota: cleanNum(document.getElementById('cuotaPrestamo').value),
                status: 'Pendiente',
                data: fullData
            }]);

            if (sErr) throw sErr;
            alert('¡Solicitud guardada con éxito!');
            window.location.href = 'clientes.html';
        } catch (err) {
            console.error(err);
            alert('Error al guardar: ' + err.message);
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="fas fa-save text-xl"></i> GUARDAR SOLICITUD';
        }
    });
}

// --- MÓDULO DE CLIENTES ---
async function initClientesModule() {
    const tableBody = document.getElementById('clientsTableBody');
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
                        <button onclick="alert('Detalles del cliente: ' + String('${c.id}'))" class="p-3 bg-slate-100 hover:bg-brand hover:text-white rounded-xl transition-all">
                            <i class="fas fa-eye"></i>
                        </button>
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
                // El tipo se guarda en s.data.tipoPrestamo (según mi implementación previa)
                return s.data?.tipoPrestamo === typeFilter;
            });

        if (!filtered || filtered.length === 0) {
            if (tableBody) tableBody.innerHTML = '';
            emptyState?.classList.remove('hidden');
            return;
        }

        emptyState?.classList.add('hidden');
        if (tableBody) {
            tableBody.innerHTML = filtered.map((s, index) => {
                const clientName = s.clients?.full_name || 'Desconocido';
                const loanType = s.data?.tipoPrestamo || 'Personal';
                
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
                            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">${s.clients?.cedula || '---'}</span>
                        </td>
                        <td class="p-6 text-center">
                            <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${badgeClass}">
                                ${loanType}
                            </span>
                        </td>
                        <td class="p-6 text-center font-black text-brand tracking-tighter">
                            RD$ ${Number(s.monto).toLocaleString()}
                        </td>
                        <td class="p-6 text-center">
                            <span class="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-200">
                                ${s.status || 'Pendiente'}
                            </span>
                        </td>
                        <td class="p-6 text-right">
                            <div class="flex justify-end gap-2">
                                <button onclick="window.printSolicitud('${s.id}')" class="p-3 bg-slate-100 text-slate-500 hover:bg-brand hover:text-white rounded-xl transition-all shadow-sm" title="Imprimir Formulario">
                                    <i class="fas fa-print"></i>
                                </button>
                                <button onclick="window.exportToWord('${s.id}')" class="p-3 bg-slate-100 text-slate-500 hover:bg-emerald-600 hover:text-white rounded-xl transition-all shadow-sm" title="Descargar Word">
                                    <i class="fas fa-file-word"></i>
                                </button>
                                <button onclick="alert('Ver detalles de ${String(s.id).split('-')[0]}')" class="p-3 bg-slate-100 text-slate-500 hover:bg-slate-800 hover:text-white rounded-xl transition-all shadow-sm">
                                    <i class="fas fa-eye"></i>
                                </button>
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

    loadSolicitudes();
}

/**
 * --- SISTEMA DE IMPRESIÓN DE ALTA FIDELIDAD ---
 */
window.printSolicitud = async (id) => {
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

    let type = s.loan_type;
    if (!type && s.data && s.data.tipoPrestamo) type = s.data.tipoPrestamo;
    if (!type) type = 'personal';

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
    dynamicSections += `<div class="section-label">DATOS DEL CONYUGE</div>` + renderConyuge(con);

    if (type === 'vehiculo') {
        dynamicSections += renderVehiculo();
    } else if (type === 'hipotecario') {
         dynamicSections += renderHipotecario();
    } else if (type === 'garante') {
         dynamicSections += `<div class="section-label">DATOS DEL GARANTE</div>` + renderConyuge(gar);
         dynamicSections += `<div class="section-label">DATOS DEL CONYUGE DEL GARANTE</div>` + renderConyuge(conGar);
    }

    const printWindow = window.open('', '_blank');
    
    // Customization: Arial 12pt, normal weights for fields, bold ONLY for .section-label
    const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <title>Solicitud - ${s.id}</title>
        <style>
            @page { size: portrait; margin: 5mm 10mm; }
            body { font-family: 'Arial', sans-serif; font-size: 11pt; color: #000; line-height: 1.15; margin: 0; padding: 0; }
            .container { width: 100%; max-width: 800px; margin: auto; padding: 5px 10px; }
            
            /* Header Image 4 Style */
            .header-top { display: flex; justify-content: flex-start; margin-bottom: 25px; }
            .logo-left { width: 35%; text-align: center; }
            .logo-left img { max-width: 130px; height: auto; display: block; margin: 0 auto; }
            .rnc-center { font-weight: normal; font-size: 11pt; margin-top: 5px; }
            
            .meta-right { width: 60%; font-size: 11pt; margin-top: 5px; padding-left: 10px; }
            .meta-item { display: flex; margin-bottom: 2px; justify-content: flex-start; }
            .meta-label { text-align: left; width: 180px; }
            .meta-value { font-weight: normal; text-align: left; }

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
            .sig-area { margin-top: 40px; text-align: center; display: flex; justify-content: ${type === 'garante' ? 'space-around' : 'center'}; }
            .sig-line { width: 250px; border-top: 1px solid #000; padding-top: 5px; font-weight: normal; text-transform: uppercase; font-size: 11pt; }
            .legal-disclaimer { margin-top: 20px; font-size: 8.5pt; color: #444; text-align: center; padding: 0 40px; line-height: 1.1; }
        </style>
    </head>
    <body onload="setTimeout(() => { window.print(); window.close(); }, 1200);">
        <div class="container">
            <div class="header-top">
                <div class="logo-left">
                    <img src="${portalLogo}">
                    <div class="rnc-center">1-33-34406-8</div>
                </div>
                <div class="meta-right">
                    <div class="meta-item"><span class="meta-label">SOLICITUD NO:</span> <span class="meta-value">${String(s.id).split('-')[0].toUpperCase()}</span></div>
                    <div class="meta-item"><span class="meta-label">FECHA DE SOLICITUD:</span> <span class="meta-value">${new Date(s.created_at).toLocaleDateString()}</span></div>
                    <div class="meta-item"><span class="meta-label">MONTO SOLICITADO RD$:</span> <span class="meta-value">${Number(s.monto).toLocaleString()}</span></div>
                    <div class="meta-item"><span class="meta-label">TIEMPO:</span> <span class="meta-value">${s.tiempo} MESES</span></div>
                    <div class="meta-item"><span class="meta-label">CUOTA:</span> <span class="meta-value">RD$ ${Number(d.cuota || 0).toLocaleString()}</span></div>
                </div>
            </div>

            ${dynamicSections}

            <div class="section-label">REFERENCIA SONSE</div>
            <div class="ref-grid">
                <div class="ref-header">
                    <div class="ref-col" style="flex:1.5">NOMBRES</div>
                    <div class="ref-col">TELEFONO</div>
                    <div class="ref-col" style="flex:1.5">DIRECCION</div>
                </div>
                ${(d.referencias || []).slice(0, 3).map(r => `
                    <div class="ref-row">
                        <div class="ref-col" style="flex:1.5">${r.nombre || ''}</div>
                        <div class="ref-col">${r.telefono || ''}</div>
                        <div class="ref-col" style="flex:1.5">${r.direccion || ''}</div>
                    </div>
                `).join('')}
            </div>

            <div class="sig-area">
                <div class="sig-line">FIRMA DEUDOR</div>
                ${type === 'garante' ? '<div class="sig-line">FIRMA FIADOR</div>' : ''}
            </div>

            <div class="legal-disclaimer">
                El cliente autoriza a la empresa a consultar su información en los buros de crédito por la presente doy constancia de haber leído esta solicitud y que las contestaciones dadas por mí son ciertas y correctas en fe de la cual firmo.
            </div>
        </div>
    </body>
    </html>
    `;
    
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
                        <tr><td><p style="margin:2px 0;">TIEMPO:</p></td><td><p style="margin:2px 0;">${s.tiempo} MESES</p></td></tr>
                        <tr><td><p style="margin:2px 0;">CUOTA:</p></td><td><p style="margin:2px 0;">RD$ ${Number(d.cuota || 0).toLocaleString()}</p></td></tr>
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

