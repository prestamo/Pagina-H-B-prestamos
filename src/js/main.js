import { supabase, getBanners, getCarouselImages } from './supabase.js';
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
    if (document.getElementById('carousel-dynamic')) {
        loadDynamicContent();
    }

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

        // 2. Cargar Carrusel
        const { data: slides } = await window.supabase.from('carousel').select('*').order('created_at', { ascending: false });
        if (slides && slides.length > 0) {
            const carouselContainer = document.getElementById('carousel-dynamic');
            if (carouselContainer) {
                // Limpiar fallback si hay slides en la DB
                carouselContainer.innerHTML = slides.map((slide, index) => `
                    <div class="carousel-slide h-full bg-cover bg-center transition-opacity duration-1000 ${index === 0 ? 'opacity-100 z-10' : 'opacity-0 z-0'} absolute inset-0" 
                         style="background-image: linear-gradient(to bottom, rgba(10,37,64,0.4), rgba(10,37,64,0.8)), url('${slide.image_url}');">
                        <div class="flex flex-col items-center justify-center h-full text-center px-4">
                            <h2 class="text-4xl md:text-7xl font-bold text-white mb-6 drop-shadow-2xl animate-fade-in-up">B&H Préstamos</h2>
                            <p class="text-lg md:text-2xl text-white/80 max-w-2xl mb-10 leading-relaxed font-semibold">Soluciones dinámicas para tu futuro.</p>
                            <a href="solicitud_español.html" class="bg-accent text-prime px-10 py-4 rounded-xl font-black text-lg hover:bg-yellow-600 transition-all shadow-[0_0_30px_rgba(193,162,42,0.4)] hover:-translate-y-1 uppercase tracking-tighter">COMENZAR SOLICITUD</a>
                        </div>
                    </div>
                `).join('');
                
                // Reiniciar intervalo de rotación
                let current = 0;
                const dynamicSlides = carouselContainer.querySelectorAll('.carousel-slide');
                if (dynamicSlides.length > 1) {
                    setInterval(() => {
                        dynamicSlides[current].classList.replace('opacity-100', 'opacity-0');
                        dynamicSlides[current].classList.replace('z-10', 'z-0');
                        current = (current + 1) % dynamicSlides.length;
                        dynamicSlides[current].classList.replace('opacity-0', 'opacity-100');
                        dynamicSlides[current].classList.replace('z-0', 'z-10');
                    }, 5000);
                }
            }
        }
    } catch (err) {
        console.error('Error cargando Supabase:', err);
    }
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