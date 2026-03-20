import { supabase } from './supabase.js';

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

    // A. PÁGINA DE BANNERS
    const bannerForm = document.getElementById('bannerForm');
    if (bannerForm) {
        initBannerModule();
    }

    // B. PÁGINA DE CARRUSEL
    const carouselUpload = document.getElementById('carouselUpload');
    if (carouselUpload) {
        initCarouselModule();
    }

    // C. PÁGINA DE PROMOCIONES
    const promoForm = document.getElementById('promoForm');
    if (promoForm) {
        initPromotionsModule();
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
    const uploadInput = document.getElementById('carouselUpload');
    const carouselList = document.getElementById('carouselList');

    const loadCarousel = async () => {
        carouselList.innerHTML = '<div class="col-span-full text-center py-10 text-slate-400 italic">Cargando imágenes...</div>';
        const { data: slides } = await supabase.from('carousel').select('*').order('created_at', { ascending: false });
        
        carouselList.innerHTML = slides?.map(slide => `
            <div class="relative group aspect-video rounded-3xl overflow-hidden shadow-lg border border-white">
                <img src="${slide.image_url}" class="w-full h-full object-cover">
                <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                    <button onclick="deleteSlide('${slide.id}', '${slide.image_url}')" class="bg-red-500 text-white p-4 rounded-xl shadow-2xl hover:bg-red-600 transition-colors">
                        <i class="fas fa-trash-alt"></i> ELIMINAR
                    </button>
                </div>
            </div>
        `).join('') || '<p class="col-span-full text-center py-10">No hay imágenes en el carrusel.</p>';
    };

    uploadInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Feedback visual
        uploadInput.parentElement.classList.add('opacity-50', 'pointer-events-none');
        
        const fileName = `carousel/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage.from('carousel').upload(fileName, file);

        if (uploadError) {
            alert('Error al subir: ' + uploadError.message);
        } else {
            const { data: { publicUrl } } = supabase.storage.from('carousel').getPublicUrl(fileName);
            await supabase.from('carousel').insert({ image_url: publicUrl });
            alert('✅ Imagen agregada con éxito');
            loadCarousel();
        }
        
        uploadInput.parentElement.classList.remove('opacity-50', 'pointer-events-none');
    });

    loadCarousel();
}

async function initPromotionsModule() {
    const promoForm = document.getElementById('promoForm');
    const promoList = document.getElementById('promoList');

    const loadPromos = async () => {
        const { data: promos } = await supabase.from('promotions').select('*').order('created_at', { ascending: false });
        promoList.innerHTML = promos?.map(promo => `
            <div class="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 relative group flex flex-col">
                <h4 class="text-xl font-black text-prime mb-2">${promo.title}</h4>
                <p class="text-slate-500 italic flex-1">${promo.description}</p>
                <button onclick="deletePromo('${promo.id}')" class="mt-6 text-red-400 font-bold hover:text-red-500 flex items-center gap-2">
                    <i class="fas fa-trash-alt"></i> Eliminar
                </button>
            </div>
        `).join('') || '<p class="text-slate-400 italic">No hay promociones activas.</p>';
    };

    promoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('promoTitle').value;
        const description = document.getElementById('promoDesc').value;

        await supabase.from('promotions').insert({ title, description });
        alert('✅ Promoción publicada');
        promoForm.reset();
        loadPromos();
    });

    loadPromos();
}

// --- FUNCIONES GLOBALES (Window access) ---

window.deletePromo = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta promoción?')) return;
    await supabase.from('promotions').delete().eq('id', id);
    initPromotionsModule(); // Recargar
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

    initCarouselModule(); // Recargar
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
        // El initBannerModule recargará la lista
        initBannerModule(); 
    }
};

window.toggleHistoryActive = async (id) => {
    // 1. Desactivar todos
    await supabase.from('banner_history').update({ is_active: false }).neq('id', '00000000-0000-0000-0000-000000000000');
    // 2. Activar el seleccionado
    await supabase.from('banner_history').update({ is_active: true }).eq('id', id);
    
    initBannerModule(); // Recargar UI
};
