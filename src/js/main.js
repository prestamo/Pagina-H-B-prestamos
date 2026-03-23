import { supabase, getBanners, getCarouselImages } from './supabase.js';
import { renderAdvancedPromo } from './promoRenderer.js';
// B&H Main Logic - Modern ESM
document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle Premium
    const menuBtn = document.getElementById('menuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    
    const toggleMenu = () => {
        menuBtn?.classList.toggle('open');
        const isOpen = menuBtn?.classList.contains('open');
        mobileMenu?.classList.toggle('translate-x-full', !isOpen);
        mobileMenu?.classList.toggle('open', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
    };

    menuBtn?.addEventListener('click', toggleMenu);
    mobileLinks.forEach(link => link.addEventListener('click', toggleMenu));

    // Carousel Logic
    const slides = document.querySelectorAll('.carousel-slide');
    if (slides.length > 0) {
        let currentSlide = 0;
        const bgImages = [
            'assets/img/imgp.png',
            'assets/img/img 3.png',
            'assets/img/img 4.png',
            'assets/img/img 5.png'
        ];

        const nextSlide = () => {
            slides[0].style.backgroundImage = `linear-gradient(to bottom, rgba(10,37,64,0.4), rgba(10,37,64,0.8)), url('${bgImages[currentSlide]}')`;
            currentSlide = (currentSlide + 1) % bgImages.length;
        };
        setInterval(nextSlide, 5000);
    }

    // Scroll Effects
    const header = document.querySelector('header');
    const topBtn = document.getElementById('topBtn');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header?.classList.add('bg-slate-900', 'shadow-2xl', 'h-16');
            header?.classList.remove('bg-slate-900/80', 'h-20');
            topBtn?.classList.remove('hidden', 'opacity-0');
            topBtn?.classList.add('flex', 'opacity-100');
        } else {
            header?.classList.remove('bg-slate-900', 'shadow-2xl', 'h-16');
            header?.classList.add('bg-slate-900/80', 'h-20');
            topBtn?.classList.add('hidden', 'opacity-0');
            topBtn?.classList.remove('flex', 'opacity-100');
        }
    });

    topBtn?.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Form Logic - Robust with multiple possible IDs
    const submitBtn = document.getElementById('botonEnviar') || document.getElementById('submitButton');
    const termsCheck = document.getElementById('small') || document.getElementById('terms');
    
    termsCheck?.addEventListener('change', () => {
        if (termsCheck.checked) {
            submitBtn.disabled = false;
            submitBtn.classList.remove('bg-gray-400', 'bg-slate-200', 'text-slate-400', 'cursor-not-allowed');
            submitBtn.classList.add('bg-green-600', 'text-white', 'hover:bg-green-700');
        } else {
            submitBtn.disabled = true;
            submitBtn.classList.add('bg-gray-400', 'cursor-not-allowed');
            submitBtn.classList.remove('bg-green-600', 'text-white', 'hover:bg-green-700');
        }
    });

    // Language Selector
    const langSelect = document.getElementById('language-select');
    langSelect?.addEventListener('change', (e) => {
        const lang = e.target.value;
        const pageMap = {
            'es': 'index.html', 'en': 'index_english.html',
            'es1': 'solicitud_español.html', 'en1': 'solicitud_english.html',
            'es2': 'tipos_prestamos.html', 'en2': 'tipos_prestamos_english.html',
            'es3': 'nosotros.html', 'en3': 'nosotros_english.html'
        };
        if (pageMap[lang]) window.location.href = pageMap[lang];
    });

    // Cargar contenido dinámico si estamos en el index
    if (document.getElementById('cuotas-title-1')) {
        loadDynamicContent();
        loadCuotasConfig();
    }

    // Configuración Global de Footer
    loadFooterConfig();

    // Chatbot Logic
    initBot();
});

// Función para cargar contenido desde Supabase
async function loadDynamicContent() {
    try {        // 1. Cargar Banner Avanzado (Solo Activos)
        const { data: banners, error: bError } = await window.supabase.from('banners').select('*').eq('is_visible', true);
        
        const positions = ['hero_bottom', 'center', 'bottom'];
        positions.forEach(pos => {
            const el = document.getElementById(`banner-${pos}`);
            if (el) el.classList.add('hidden');
        });

        if (banners && banners.length > 0) {
            banners.forEach(b => {
                if (!b.is_visible) return;
                
                // SEGURIDAD ANTI-FANTASMAS: Si no hay texto real ni se muestra imagen, ignorar
                const cleanText = (b.text || "").trim();
                if (!cleanText && !b.show_image) return;

                const activeEl = document.getElementById(`banner-${b.position}`);
                if (activeEl) {
                    activeEl.classList.remove('hidden');
                    activeEl.style.height = `${b.height || 60}px`;

                    const fontScaleY = b.font_scale_y || 1.0;
                    const textAlign = b.text_align || 'center';
                    const imgPos = b.image_position || 'left';
                    const imgScaleY = b.image_height || 100;
                    const imgSize = b.image_size || 40;
                    const fontSize = b.font_size || 32;
                    const lineHeight = b.line_height || 1.2;
                    const fontColor = b.font_color || '#FFFFFF';
                    const bgColor = b.bg_color || '#000000';
                    const font = b.font_family || "Inter";
                    
                    const horizontalAlign = textAlign === 'left' ? 'flex-start' : (textAlign === 'right' ? 'flex-end' : 'center');
                    const flexDirVal = imgPos === 'right' ? 'row-reverse' : 'row';
                    
                    // Limpiar fuente para evitar errores de sintaxis
                    let cleanFont = font.split(',')[0].replace(/['"]/g, '').trim();
                    const fontStyle = `'${cleanFont}', sans-serif`;

                    const commonTypography = `font-family: ${fontStyle} !important; font-size: ${fontSize}px !important; line-height: ${lineHeight} !important; color: ${fontColor} !important; transform: scaleY(${fontScaleY}) !important; transform-origin: center !important; text-decoration: none !important; font-weight: 900 !important; text-transform: uppercase !important; letter-spacing: 0.2em !important;`;
                    const containerStyle = `display: flex !important; align-items: center !important; justify-content: ${horizontalAlign} !important; flex-direction: ${flexDirVal} !important; width: 100% !important; height: 100% !important; padding: 0 40px !important; box-sizing: border-box !important; position: relative !important; overflow: hidden !important; background-color: ${bgColor} !important; ${commonTypography}`;
                    
                    let bannerContent = "";
                    const imgMode = b.image_mode || 'icon';
                    const spanStyle = `position: relative; z-index: 2; display: flex !important; align-items: center !important; height: 100% !important; white-space: nowrap !important; ${commonTypography}`;

                    if (b.show_image && b.image_url) {
                        if (imgMode === 'icon') {
                            const margin = imgPos === 'right' ? 'margin-left: 20px;' : 'margin-right: 20px;';
                            const imgStyle = `width: ${imgSize}%; height: ${imgScaleY}%; max-height: 95%; object-fit: contain; ${margin} position: relative; z-index: 2; flex-shrink: 0;`;
                            bannerContent = `<img src="${b.image_url}" style="${imgStyle}" alt="Icon"> <span style="${spanStyle}">${b.text}</span>`;
                        } else {
                            const imgStyle = `position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.6; z-index: 1;`;
                            bannerContent = `<img src="${b.image_url}" style="${imgStyle}" alt="BG"> <span style="${spanStyle} width: 100%; justify-content: inherit; text-align: ${textAlign};">${b.text}</span>`;
                        }
                    } else {
                        bannerContent = `<span style="${spanStyle} width: 100%; justify-content: inherit;">${b.text}</span>`;
                    }

                    if (b.scroll_text) {
                        const speed = parseFloat(b.scroll_speed) || 20;
                        const delay = parseFloat(b.loop_delay) || 4;
                        const total = speed + delay;
                        const pausePercent = (speed / total) * 100;
                        const animId = `marquee_live_${Math.floor(Math.random()*1000)}`;
                        const styleTag = document.createElement('style');
                        styleTag.innerHTML = `
                            @keyframes ${animId} {
                                0% { transform: translateX(100vw); }
                                ${pausePercent}% { transform: translateX(-100%); }
                                0%, 100% { transform: translateX(100vw); } 
                                ${pausePercent}%, 99.9% { transform: translateX(-100%); }
                            }
                            .${animId}-class {
                                display: flex !important;
                                align-items: center !important;
                                flex-direction: inherit !important;
                                height: 100% !important;
                                animation: ${animId} ${total}s linear infinite !important;
                                width: max-content !important;
                                min-width: 100% !important;
                            }
                        `;
                        document.head.appendChild(styleTag);
                        activeEl.innerHTML = `<div class="${b.show_stripes ? 'bg-stripes' : ''}" style="${containerStyle}"><span class="${animId}-class">${bannerContent}</span></div>`;
                    } else {
                        activeEl.innerHTML = `<div class="${b.show_stripes ? 'bg-stripes' : ''}" style="${containerStyle}">${bannerContent}</div>`;
                    }
                }
            });
        }

        // 2. Cargar Carrusel y Configuraciones Globales
        const { data: settings } = await window.supabase.from('site_settings').select('*');
        const settingsMap = {};
        if (settings) {
            settings.forEach(s => settingsMap[s.key] = s.value);
        }

        // Actualizar Icono Global
        if (settingsMap['portal_icon']) {
            const portalIcons = document.querySelectorAll('.global-portal-icon');
            portalIcons.forEach(icon => icon.src = settingsMap['portal_icon']);
        }

        const { data: slides } = await window.supabase.from('carousel').select('*').order('created_at', { ascending: false });
        
        const swiperWrapper = document.getElementById('carousel-swiper-wrapper');
        const globalOverlay = document.getElementById('carousel-global-overlay');
        const globalOverlayContent = document.getElementById('global-overlay-content');

        if (slides && slides.length > 0 && swiperWrapper) {
            // Construir los slides
            swiperWrapper.innerHTML = slides.map((slide) => {
                // Lógica de Capa Individual (si existe)
                let individualOverlay = '';
                if (slide.text_content || slide.button_text) {
                    const posClass = getPositionClass(slide.button_position || 'inherit', settingsMap['carousel_global_position']);
                    
                    individualOverlay = `
                        <div class="absolute inset-0 z-20 flex p-8 md:p-16 pointer-events-none ${posClass}">
                            <div class="pointer-events-auto flex flex-col max-w-3xl text-white animate-fade-in-up">
                                ${slide.text_content ? `<h2 class="text-3xl md:text-6xl font-black mb-4 drop-shadow-2xl" style="font-family: '${slide.text_font || 'Inter'}'; color: ${slide.text_color || '#FFF'}">${slide.text_content}</h2>` : ''}
                                ${slide.button_text ? `<a href="${slide.button_link || '#'}" class="mt-6 inline-block bg-accent text-prime px-8 py-3 rounded-xl font-black hover:bg-yellow-600 transition-all shadow-xl hover:-translate-y-1 uppercase w-fit">${slide.button_text}</a>` : ''}
                            </div>
                        </div>
                    `;
                }

                return `
                    <div class="swiper-slide w-full h-full relative overflow-hidden bg-slate-900 border-none outline-none">
                        <div class="absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] hover:scale-105" 
                             style="background-image: linear-gradient(to bottom, rgba(10,37,64,0.3), rgba(10,37,64,0.7)), url('${slide.image_url}'); filter: ${slide.image_filters || 'none'};"></div>
                        ${individualOverlay}
                    </div>
                `;
            }).join('');

            // Construir Capa Global si está activada
            if (settingsMap['carousel_global_overlay'] === 'true' && globalOverlay && globalOverlayContent) {
                globalOverlay.classList.remove('hidden');
                globalOverlay.className = `absolute inset-0 z-[40] pointer-events-none flex p-8 md:p-16 ${getPositionClass(settingsMap['carousel_global_position'])}`;
                
                globalOverlayContent.innerHTML = `
                    ${settingsMap['carousel_global_title'] ? `<h1 class="text-4xl md:text-7xl font-bold text-white mb-6 drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)] uppercase tracking-tighter">${settingsMap['carousel_global_title']}</h1>` : ''}
                    ${settingsMap['carousel_global_subtitle'] ? `<p class="text-lg md:text-2xl text-white/90 max-w-2xl leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] font-semibold mb-10">${settingsMap['carousel_global_subtitle']}</p>` : ''}
                    ${settingsMap['carousel_global_btn_text'] ? `<a href="${settingsMap['carousel_global_btn_link'] || '#'}" class="bg-accent text-prime px-10 py-4 rounded-xl font-black text-lg hover:bg-yellow-600 transition-all shadow-[0_0_30px_rgba(193,162,42,0.6)] hover:-translate-y-1 uppercase tracking-tighter inline-block pointer-events-auto">${settingsMap['carousel_global_btn_text']}</a>` : ''}
                `;
            }

            // Inicializar Swiper
            // Usaremos el efecto del primer slide como efecto global del carrusel, por defecto 'fade'
            const mainEffect = slides[0]?.transition_type || 'fade';
            
            new Swiper(".mySwiper", {
                effect: mainEffect,
                fadeEffect: { crossFade: true },
                speed: 1000,
                loop: true,
                autoplay: {
                    delay: 5000,
                    disableOnInteraction: false,
                },
                pagination: {
                    el: ".swiper-pagination",
                    clickable: true,
                },
                navigation: {
                    nextEl: ".swiper-button-next",
                    prevEl: ".swiper-button-prev",
                },
                // Configuraciones para efectos 3D si se eligen
                cubeEffect: { shadow: true, slideShadows: true, shadowOffset: 20, shadowScale: 0.94 },
                flipEffect: { slideShadows: true },
                cardsEffect: { slideShadows: true },
            });
        }
        
        // 3. Load Advanced Promotions Builder
        const promoSection = document.getElementById('dynamic-promotions-section');
        if (promoSection) {
            const { data: promos } = await window.supabase.from('promotions').select('*').order('created_at', { ascending: false });
            console.log("Promociones cargadas:", promos);
            if (promos && promos.length > 0) {
                let htmlOut = '';
                promos.forEach((promo) => {
                    let pData = null;
                    try { pData = JSON.parse(promo.description); } catch(e){}
                    
                    if (pData && pData.type === 'advanced_layout') {
                        // Inyectar propiedades de la fila raíz si faltan en el JSON
                        if (!pData.htmlTitle && !pData.title && promo.title) pData.title = promo.title;
                        if (!pData.image_url && promo.image_url) pData.image_url = promo.image_url;
                        
                        htmlOut += renderAdvancedPromo(pData, promo.id, false);
                    } else {
                        // Legacy Simple Text
                        htmlOut += `
                            <div class="w-full py-16 px-4 bg-white border-b border-slate-100">
                                <div class="max-w-4xl mx-auto text-center" data-aos="fade-up">
                                    <h2 class="text-4xl font-black text-prime mb-4">${promo.title}</h2>
                                    <p class="text-lg text-slate-600">${promo.description}</p>
                                </div>
                            </div>
                        `;
                    }
                });
                promoSection.innerHTML = htmlOut;
                
                // Aplicar estilos nativos de Quill al contenido para que respete fuentes, encabezados y alineaciones
                promoSection.querySelectorAll('.editor-content').forEach(el => el.classList.add('ql-editor'));

                initScrollAnimations();
                loadCuotasConfig(); // Call the new function here
            } else {
                promoSection.innerHTML = '';
                promoSection.style.display = 'none';
            }
        }

    } catch (err) {
        console.error('Error cargando Supabase:', err);
    }
}

function initScrollAnimations() {
    const obv = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const anim = entry.target.getAttribute('data-aos');
            if(entry.isIntersecting) {
                entry.target.style.opacity = '1';
                
                // Mapeo dinámico de animaciones
                const map = {
                    'fade-in': 'fadeIn', 'fade-up': 'fadeInUp', 'fade-down': 'fadeInDown', 'fade-left': 'fadeInLeft', 'fade-right': 'fadeInRight',
                    'fade-up-big': 'fadeInUpBig', 'fade-down-big': 'fadeInDownBig', 'fade-out': 'fadeOut',
                    'bounce-in': 'bounceIn', 'bounce-up': 'bounceInUp', 'bounce-down': 'bounceInDown', 'bounce-left': 'bounceInLeft', 'bounce-right': 'bounceInRight',
                    'flip-up': 'flipInX', 'flip-side': 'flipInY', 'flip-out-x': 'flipOutX', 'rotate-in': 'rotateIn',
                    'rotate-down-left': 'rotateInDownLeft', 'rotate-up-right': 'rotateInUpRight',
                    'zoom-in': 'zoomIn', 'zoom-up': 'zoomInUp', 'zoom-down': 'zoomInDown', 'zoom-left': 'zoomInLeft', 'zoom-out': 'zoomOut',
                    'light-speed-in': 'lightSpeedInRight', 'light-speed-left': 'lightSpeedInLeft', 'roll-in': 'rollIn',
                    'back-in-up': 'backInUp', 'back-in-down': 'backInDown', 'back-in-left': 'backInLeft',
                    'swing': 'swing', 'wobble': 'wobble', 'heartbeat': 'heartbeat', 'rubber-band': 'rubberBand',
                    'pulse': 'pulse', 'tada': 'tada', 'jello': 'jello', 'slide-out-up': 'slideOutUp'
                };

                const keyframe = map[anim] || 'fadeIn';
                entry.target.style.animation = `${keyframe} 0.8s cubic-bezier(0.16, 1, 0.3, 1) both`;
            } else {
                entry.target.style.opacity = '0';
                entry.target.style.animation = 'none';
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    
    document.querySelectorAll('[data-aos]').forEach(el => {
        el.style.opacity = '0';
        obv.observe(el);
    });
}

// Función auxiliar para clases Flexbox de posición
function getPositionClass(pos, globalPos = 'center') {
    if (pos === 'inherit' && globalPos) pos = globalPos;
    const map = {
        'center': 'items-center justify-center text-center',
        'center-left': 'items-center justify-start text-left',
        'center-right': 'items-center justify-end text-right',
        'top-center': 'items-start justify-center text-center pt-24',
        'top-left': 'items-start justify-start text-left pt-24',
        'top-right': 'items-start justify-end text-right pt-24',
        'bottom-center': 'items-end justify-center text-center pb-24',
        'bottom-left': 'items-end justify-start text-left pb-24',
        'bottom-right': 'items-end justify-end text-right pb-24',
    };
    return map[pos] || map['center'];
}

function initBot() {
    const isEnglish = window.location.pathname.includes('english');
    const botToggle = document.getElementById('bot-toggle');
    const botWindow = document.getElementById('bot-window');
    const chatMessages = document.getElementById('chat-messages');
    const botInput = document.getElementById('bot-input');
    const sendBtn = document.getElementById('send-btn');

    botToggle?.addEventListener('click', () => {
        botWindow.classList.toggle('hidden');
    });

    const addMessage = (text, isBot = true) => {
        const div = document.createElement('div');
        div.className = isBot ? 'flex gap-2' : 'flex gap-2 justify-end';
        div.innerHTML = `
            <div class="${isBot ? 'bg-white text-slate-700' : 'bg-accent text-slate-900'} p-3 rounded-2xl ${isBot ? 'rounded-tl-none' : 'rounded-tr-none'} shadow-sm border border-slate-100 max-w-[85%] text-sm">
                ${text}
            </div>
        `;
        chatMessages?.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    const handleBotResponse = (userMsg) => {
        const msg = userMsg.toLowerCase();
        setTimeout(() => {
            if (isEnglish) {
                if (msg.includes('loan') || msg.includes('credit')) {
                    addMessage("We offer personal, vehicle, and mortgage loans. Which one are you interested in?");
                } else if (msg.includes('requirement')) {
                    addMessage("We only need your ID and collateral (vehicle or property title) to start.");
                } else {
                    addMessage("Great! You can start your application by clicking the 'Apply Now' button above.");
                }
            } else {
                if (msg.includes('prestamo') || msg.includes('préstamo')) {
                    addMessage("Ofrecemos préstamos personales, vehiculares e hipotecarios. ¿En cuál estás interesado?");
                } else if (msg.includes('requisito')) {
                    addMessage("Solo necesitamos tu cédula y una garantía (vehículo o título) para empezar.");
                } else {
                    addMessage("¡Excelente! Puedes iniciar tu solicitud haciendo clic en el botón 'Solicitar Ahora' de arriba.");
                }
            }
        }, 1000);
    };

    sendBtn?.addEventListener('click', () => {
        const text = botInput.value.trim();
        if (text) {
            addMessage(text, false);
            botInput.value = '';
            handleBotResponse(text);
        }
    });

    botInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendBtn.click();
    });
}

// 4. Registrar Visita (Analiticas Profesionales)
const registerVisit = async () => {
    try {
        let viewerId = localStorage.getItem('bh_viewer_id');
        if (!viewerId) {
            viewerId = (window.crypto && window.crypto.randomUUID) ? window.crypto.randomUUID() : Math.random().toString(36).substring(2);
            localStorage.setItem('bh_viewer_id', viewerId);
        }

        // Analytics disabled temporarily to stop 400 errors
        /*
        await window.supabase.from('page_views').upsert({
            viewer_id: viewerId,
            path: window.location.pathname || '/',
            user_agent: navigator.userAgent
        }, { onConflict: 'viewer_id, path' });
        */
    } catch (e) { }
};
registerVisit();

/**
 * Carga la configuración de la sección de Transparencia/Cuotas (Fix 400)
 */
async function loadCuotasConfig() {
    try {
        const { data, error } = await supabase
            .from('promotions')
            .select('*')
            .eq('title', 'CONFIG_CUOTAS')
            .maybeSingle();

        if (error || !data || !data.description) return;

        const config = typeof data.description === 'string' ? JSON.parse(data.description) : data.description;

        // Inyectar textos de forma quirúrgica para no romper el diseño original
        const title1El = document.getElementById('cuotas-title-1');
        const subtitle1El = document.getElementById('cuotas-subtitle-1');
        const feature1El = document.getElementById('cuotas-feature-1');
        const feature2El = document.getElementById('cuotas-feature-2');
        const title2El = document.getElementById('cuotas-title-2');
        const desc2El = document.getElementById('cuotas-desc-2');
        const imgTableEl = document.getElementById('cuotas-img-table');
        const imgPresentationEl = document.getElementById('cuotas-img-presentation');
        const floatingTextEl = document.getElementById('cuotas-floating-text');

        // Para "tal cual la tarjeta", preservamos los estilos del contenedor inyectando el HTML
        if (title1El) title1El.innerHTML = config.title1 || title1El.innerHTML;
        if (subtitle1El) subtitle1El.innerHTML = config.subtitle1 || subtitle1El.innerHTML;
        if (feature1El) feature1El.textContent = config.feature1 || feature1El.textContent;
        if (feature2El) feature2El.textContent = config.feature2 || feature2El.textContent;
        if (title2El) title2El.textContent = config.title2 || title2El.textContent;
        if (desc2El) desc2El.innerHTML = config.desc2 || desc2El.innerHTML;
        if (floatingTextEl) floatingTextEl.textContent = config.floatingText || floatingTextEl.textContent;

        if (imgTableEl) imgTableEl.src = config.imgTable || 'https://rjstcmowxhlfbualhtao.supabase.co/storage/v1/object/public/promocion/img_tabla.jpg';
        if (imgPresentationEl) imgPresentationEl.src = config.imgPresentation || 'https://rjstcmowxhlfbualhtao.supabase.co/storage/v1/object/public/promocion/img_presentacion.jpg';

        // Clases de Quill para consistencia visual
        [title1El, subtitle1El, desc2El].forEach(el => {
            if (el) el.classList.add('editor-content', 'ql-editor', '!p-0');
        });

    } catch (err) {
        console.error('Error cargando configuración de cuotas:', err);
    }
}

/**
 * --- SINCRONIZACIÓN DE FOOTER & REDES ---
 */
async function loadFooterConfig() {
    const footerMain = document.getElementById('footer-main');
    const footerLogo = document.getElementById('footer-logo');
    const footerDesc = document.getElementById('footer-description');
    const footerSocials = document.getElementById('footer-socials');
    const footerHoursTitle = document.getElementById('footer-hours-title');
    const footerHoursContent = document.getElementById('footer-hours-content');
    const footerContactTitle = document.getElementById('footer-contact-title');
    const footerPhone = document.getElementById('footer-phone');
    const footerBtn = document.getElementById('footer-btn');
    const footerCopyright = document.getElementById('footer-copyright');

    if (!footerMain) return;

    try {
        const { data, error } = await supabase
            .from('promotions')
            .select('description')
            .eq('title', 'CONFIG_FOOTER')
            .maybeSingle();
        
        if (error || !data) return;

        const config = typeof data.description === 'string' ? JSON.parse(data.description) : data.description;

        // 1. Estética General
        if (config.footerBg) footerMain.style.backgroundColor = config.footerBg;

        // 2. Textos & Logo
        if (footerLogo && config.logoTitle) footerLogo.innerHTML = config.logoTitle;
        if (footerDesc && config.description) {
            footerDesc.innerHTML = config.description;
            footerDesc.classList.add('editor-content', 'ql-editor', '!p-0', '!text-slate-400');
        }
        if (footerCopyright && config.copyright) footerCopyright.innerHTML = config.copyright;

        // 3. Secciones Específicas
        if (footerHoursTitle && config.hoursTitle) footerHoursTitle.textContent = config.hoursTitle;
        if (footerHoursContent && config.hoursContent) {
            footerHoursContent.innerHTML = config.hoursContent;
            footerHoursContent.classList.add('editor-content', 'ql-editor', '!p-0', '!text-slate-400');
        }
        
        if (footerContactTitle && config.contactTitle) footerContactTitle.textContent = config.contactTitle;
        if (footerPhone && config.phone) footerPhone.textContent = config.phone;
        if (footerBtn) {
            if (config.btnText) footerBtn.textContent = config.btnText;
            if (config.btnLink) footerBtn.href = config.btnLink;
        }

        // 4. Redes Sociales
        if (footerSocials && config.socials) {
            footerSocials.innerHTML = config.socials.map(s => `
                <a href="${s.link}" class="w-10 h-10 rounded-full flex items-center justify-center transition-all group" style="background-color: ${s.bgColor}">
                    <i class="${s.icon} group-hover:scale-110" style="color: ${s.color}"></i>
                </a>
            `).join('');
        }

    } catch (err) {
        console.error('Error syncing footer:', err);
    }
}