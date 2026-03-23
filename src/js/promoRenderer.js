// promoRenderer.js - Centralized logic for Advanced Layout Builder

export function getRequiredImageCount(templateStr) {
    const counts = {
        'text_only': 0, 'hero_split': 1, 'mosaic': 3,
        'hero_full': 1, 'two_cols': 0, 'feature_grid_2': 2,
        'feature_grid_4': 4, 'gallery_4': 4, 'banner_simple': 0,
        'card_carousel': 3, 'video_placeholder': 1, 'quote_block': 0,
        'stats_row': 0, 'zigzag': 2, 'circle_team': 3,
        'polaroid_gallery': 3, 'countdown_promo': 1, 'ticket_coupon': 0,
        'diagonal_split': 1, 'floating_app': 1,
        'glass_floating': 1, 'photo_popout': 1, 'accordion_faq': 0,
        'neo_brutalism': 1, 'frame_elegant': 2, 'magazine_grid': 3,
        'parallax_window': 1, 'split_skew': 1, 'pricing_3': 0,
        'timeline_steps': 3, 'blob_mask': 1, 'overlay_cards': 3,
        'canva_scrapbook': 3, 'canva_paper_torn': 1, 'canva_watercolor': 1,
        'brush_stroke': 1, 'comic_book': 2, 'origami_fold': 0,
        'canva_neon_glow': 1, 'canva_retro_wave': 1, 'retro_windows_95': 1,
        'holographic_card': 1, 'luxury_gold': 2, 'minimalist_editorial': 1,
        'duotone_split': 1, 'brutal_typography': 1, 'soft_ui_neumorphism': 0,
        'film_strip': 4, 'offset_grid_4': 4, 'polaroid_scatter': 4,
        'stamp_collection': 3, 'geometric_clipping': 3, 'glass_cards_row': 3,
        'floating_bubbles': 4, 'marquee_scroll': 0, 'split_screen_sticky': 1,
        'instagram_post': 1
    };
    return counts[templateStr] || 0;
}

export function renderAdvancedPromo(pData, promoId, isPreview = false) {
    const templateStr = pData.template;
    const bg = pData.bgColor || '#ffffff';
    let animAttr = '';
    
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
    const keyframe = map[pData.animation] || 'fadeIn';

    const previewId = isPreview ? 'id="promoPreviewContainer"' : '';
    const aosAttr = !isPreview ? (pData.animation && pData.animation !== 'none' ? `data-aos="${pData.animation}"` : 'data-aos="fade-up"') : '';
    const animStyle = (isPreview && pData.animation && pData.animation !== 'none') ? `animation: ${keyframe} 0.8s both;` : '';

    const titleTag = (pData.htmlTitle || pData.title) ? `<div class="editor-content mb-6 w-full">${pData.htmlTitle || pData.title}</div>` : '';
    const htmlContent = pData.htmlContent || '';
    
    // Helper to safely fetch an image URL
    const getImg = (idx, fallbackText = 'FOTO') => {
        let url = null;
        if (pData.images && Array.isArray(pData.images) && pData.images[idx]) {
            url = pData.images[idx];
        } else if (idx === 0 && pData.image_url) {
            url = pData.image_url;
        }
        
        if (url) return url;

        // Solo loguear si NO es vista previa para no ensuciar consola del admin
        if (!isPreview) console.warn(`Imagen no encontrada para el slot ${idx} en la plantilla ${templateStr}.`, pData);
        return `https://placehold.co/800x600/e2e8f0/94a3b8?text=${fallbackText}+${idx+1}`;
    };

    let htmlOut = '';

    switch (templateStr) {
        case 'hero_split': {
            const isRight = pData.heroPos === 'right';
            const flexDir = isRight ? 'md:flex-row-reverse' : 'md:flex-row';
            htmlOut = `
                <div class="w-full flex flex-col ${flexDir} items-stretch min-h-[500px] relative ${isPreview ? 'pointer-events-none' : 'mb-1'}" style="background-color: ${bg}; ${animStyle}" ${previewId} ${aosAttr}>
                    <div class="w-full md:w-1/2 min-h-[350px] md:min-h-full relative overflow-hidden">
                        <div class="absolute inset-0 bg-cover bg-center ${!isPreview ? 'transition-transform duration-[10s] hover:scale-110' : ''}" style="background-image: url('${getImg(0)}');"></div>
                    </div>
                    <div class="w-full md:w-1/2 p-10 md:p-24 flex flex-col justify-center text-left">
                        ${titleTag}
                        <div class="prose prose-lg prose-slate max-w-none text-slate-700 editor-content" style="font-family: 'Inter', sans-serif;">
                            ${htmlContent}
                        </div>
                    </div>
                </div>`;
            break;
        }
        case 'mosaic': {
            htmlOut = `
                <div class="w-full py-24 px-4 border-y border-slate-100/50 relative ${isPreview ? 'pointer-events-none' : ''}" style="background-color: ${bg}; ${animStyle}" ${previewId} ${aosAttr}>
                    <div class="max-w-7xl mx-auto flex flex-col gap-16">
                        <div class="text-center max-w-4xl mx-auto">
                            ${titleTag}
                            <div class="prose prose-lg prose-slate mx-auto text-slate-700 text-left md:text-center editor-content" style="font-family: 'Inter', sans-serif;">
                                ${htmlContent}
                            </div>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div class="aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl relative border-4 border-white/20 group"><img src="${getImg(0)}" class="w-full h-full object-cover ${!isPreview ? 'transition-transform duration-700 group-hover:scale-110' : ''}"></div>
                            <div class="aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl relative md:-translate-y-12 border-4 border-white/20 group"><img src="${getImg(1)}" class="w-full h-full object-cover ${!isPreview ? 'transition-transform duration-700 group-hover:scale-110' : ''}"></div>
                            <div class="aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl relative border-4 border-white/20 group"><img src="${getImg(2)}" class="w-full h-full object-cover ${!isPreview ? 'transition-transform duration-700 group-hover:scale-110' : ''}"></div>
                        </div>
                    </div>
                </div>`;
            break;
        }
        case 'text_only': {
            htmlOut = `
                <div class="w-full py-24 px-4 relative ${isPreview ? 'pointer-events-none' : ''}" style="background-color: ${bg}; ${animStyle}" ${previewId} ${aosAttr}>
                    <div class="max-w-4xl mx-auto bg-white p-10 md:p-16 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 text-center">
                        ${titleTag}
                        <div class="prose prose-lg prose-slate max-w-none text-slate-700 text-left md:text-center editor-content" style="font-family: 'Inter', sans-serif;">
                            ${htmlContent}
                        </div>
                    </div>
                </div>`;
            break;
        }
        case 'hero_full': {
            htmlOut = `
                <div class="w-full min-h-[60vh] md:min-h-[80vh] flex items-center justify-center p-8 relative overflow-hidden ${isPreview ? 'pointer-events-none' : 'mb-1'}" style="${animStyle}" ${previewId} ${aosAttr}>
                    <div class="absolute inset-0 bg-cover bg-center z-0" style="background-image: url('${getImg(0)}'); filter: brightness(0.4);"></div>
                    <div class="relative z-10 max-w-4xl mx-auto text-center text-white" style="background-color: ${bg !== '#ffffff' && bg !== '#FFFFFF'? bg : 'transparent'}; padding: ${bg !== '#ffffff' && bg !== '#FFFFFF' ? '3rem' : '0'}; border-radius: 2rem;">
                        ${pData.title ? `<h2 class="text-5xl md:text-7xl font-black mb-6 tracking-tighter drop-shadow-xl" style="font-family: 'Montserrat', sans-serif;">${pData.title}</h2>` : ''}
                        <div class="prose prose-xl prose-invert mx-auto editor-content font-[Inter]">
                            ${htmlContent}
                        </div>
                    </div>
                </div>`;
            break;
        }
        case 'two_cols': {
            htmlOut = `
                <div class="w-full py-24 px-4 relative ${isPreview ? 'pointer-events-none' : ''}" style="background-color: ${bg};" ${!isPreview ? animAttr : ''}>
                    ${isPreview ? animAttr : ''}
                    <div class="max-w-7xl mx-auto">
                        <div class="mb-12 text-center">${titleTag}</div>
                        <div class="columns-1 md:columns-2 gap-12 prose prose-lg prose-slate max-w-none text-slate-700 editor-content" style="font-family: 'Inter', sans-serif;">
                            ${htmlContent}
                        </div>
                    </div>
                </div>`;
            break;
        }
        case 'feature_grid_2': {
            htmlOut = `
                <div class="w-full py-24 px-4 relative ${isPreview ? 'pointer-events-none' : ''}" style="background-color: ${bg}; ${animStyle}" ${previewId} ${aosAttr}>
                    <div class="max-w-7xl mx-auto">
                        <div class="text-center mb-16">${titleTag}</div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div class="space-y-6">
                                <div class="w-full aspect-video rounded-3xl overflow-hidden shadow-lg"><img src="${getImg(0)}" class="w-full h-full object-cover"></div>
                                <div class="prose prose-slate editor-content">${htmlContent}</div>
                            </div>
                            <div class="space-y-6">
                                <div class="w-full aspect-video rounded-3xl overflow-hidden shadow-lg"><img src="${getImg(1)}" class="w-full h-full object-cover"></div>
                                <div class="prose prose-slate editor-content pl-4 border-l-4 border-brand opacity-80">${htmlContent}</div>
                            </div>
                        </div>
                    </div>
                </div>`;
            break;
        }
        case 'feature_grid_4': {
            htmlOut = `
                <div class="w-full py-24 px-4 relative ${isPreview ? 'pointer-events-none' : ''}" style="background-color: ${bg}; ${animStyle}" ${previewId} ${aosAttr}>
                    <div class="max-w-7xl mx-auto text-center">
                        <div class="mb-16">${titleTag}<div class="prose mx-auto editor-content">${htmlContent}</div></div>
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
                            ${[0,1,2,3].map(i => `<div class="bg-white p-4 rounded-2xl shadow-xl border border-slate-100"><img src="${getImg(i)}" class="w-full aspect-square object-cover rounded-xl shadow-inner mb-4"></div>`).join('')}
                        </div>
                    </div>
                </div>`;
            break;
        }
        case 'gallery_4': {
            htmlOut = `
                <div class="w-full py-24 px-4 relative ${isPreview ? 'pointer-events-none' : ''}" style="background-color: ${bg}; ${animStyle}" ${previewId} ${aosAttr}>
                    <div class="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 items-center">
                        <div class="w-full lg:w-1/3 text-left">
                            ${titleTag}
                            <div class="prose prose-lg editor-content">${htmlContent}</div>
                        </div>
                        <div class="w-full lg:w-2/3 grid grid-cols-2 gap-4">
                            ${[0,1,2,3].map(i => `<div class="aspect-square rounded-[2rem] overflow-hidden shadow-lg border-4 border-white"><img src="${getImg(i)}" class="w-full h-full object-cover"></div>`).join('')}
                        </div>
                    </div>
                </div>`;
            break;
        }
        case 'banner_simple': {
            htmlOut = `
                <div class="w-full py-16 px-4 relative ${isPreview ? 'pointer-events-none' : ''}" style="background-color: ${bg}; border-top: 8px solid #0A2540; border-bottom: 8px solid #0A2540; ${animStyle}" ${previewId} ${aosAttr}>
                    <div class="max-w-5xl mx-auto text-center">
                        ${titleTag}
                        <div class="prose prose-xl prose-slate mx-auto font-bold editor-content italic">
                            ${htmlContent}
                        </div>
                    </div>
                </div>`;
            break;
        }
        case 'card_carousel': {
            htmlOut = `
                <div class="w-full py-24 px-4 relative overflow-hidden ${isPreview ? 'pointer-events-none' : ''}" style="background-color: ${bg}; ${animStyle}" ${previewId} ${aosAttr}>
                    <div class="max-w-7xl mx-auto">
                        <div class="text-center mb-16">${titleTag}<div class="prose mx-auto editor-content">${htmlContent}</div></div>
                        <div class="flex flex-col md:flex-row justify-center items-center gap-8 px-4">
                            <div class="w-full md:w-1/3 bg-white rounded-3xl shadow-xl overflow-hidden md:rotate-[-2deg] hover:rotate-0 hover:z-10 transition-all border border-slate-100"><img src="${getImg(0)}" class="w-full aspect-video object-cover"></div>
                            <div class="w-full md:w-1/3 bg-white text-white rounded-3xl shadow-2xl overflow-hidden z-10 scale-105 border-4 border-brand"><img src="${getImg(1)}" class="w-full aspect-video object-cover"></div>
                            <div class="w-full md:w-1/3 bg-white rounded-3xl shadow-xl overflow-hidden md:rotate-[2deg] hover:rotate-0 hover:z-10 transition-all border border-slate-100"><img src="${getImg(2)}" class="w-full aspect-video object-cover"></div>
                        </div>
                    </div>
                </div>`;
            break;
        }
        case 'video_placeholder': {
            htmlOut = `
                <div class="w-full py-24 px-4 relative ${isPreview ? 'pointer-events-none' : ''}" style="background-color: ${bg};" ${!isPreview ? animAttr : ''}>
                    ${isPreview ? animAttr : ''}
                    <div class="max-w-6xl mx-auto flex flex-col md:flex-row gap-12 items-center">
                        <div class="w-full md:w-1/2 relative rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white group">
                            <img src="${getImg(0)}" class="w-full aspect-video object-cover filter brightness-75 group-hover:brightness-90 transition-all">
                            <div class="absolute inset-0 flex items-center justify-center">
                                <div class="w-20 h-20 bg-brand text-white rounded-full flex items-center justify-center text-3xl opacity-90 shadow-[0_0_30px_rgba(45,92,255,0.6)] cursor-pointer hover:scale-110 transition-transform"><i class="fas fa-play ml-2"></i></div>
                            </div>
                        </div>
                        <div class="w-full md:w-1/2">
                            ${titleTag}
                            <div class="prose prose-lg editor-content">${htmlContent}</div>
                        </div>
                    </div>
                </div>`;
            break;
        }
        case 'quote_block': {
            htmlOut = `
                <div class="w-full py-24 px-4 relative ${isPreview ? 'pointer-events-none' : ''}" style="background-color: ${bg}; ${animStyle}" ${previewId} ${aosAttr}>
                    <div class="max-w-4xl mx-auto text-center relative border-y-2 border-brand/20 py-16">
                        <i class="fas fa-quote-left text-6xl text-brand/20 absolute top-4 left-4"></i>
                        ${titleTag}
                        <div class="prose prose-2xl prose-slate mx-auto font-serif italic text-prime editor-content font-light">
                            "${htmlContent.replace(/<[^>]*>?/gm, '')}"
                        </div>
                        <i class="fas fa-quote-right text-6xl text-brand/20 absolute bottom-4 right-4"></i>
                    </div>
                </div>`;
            break;
        }
        case 'stats_row': {
            htmlOut = `
                <div class="w-full py-20 px-4 relative ${isPreview ? 'pointer-events-none' : ''}" style="background-color: ${bg}; ${animStyle}" ${previewId} ${aosAttr}>
                    <div class="max-w-5xl mx-auto text-center">
                        ${titleTag}
                        <div class="bg-white/80 backdrop-blur-md rounded-[3rem] shadow-xl border border-slate-100 p-12 editor-content text-3xl font-black text-brand uppercase tracking-widest leading-relaxed">
                            ${htmlContent}
                        </div>
                    </div>
                </div>`;
            break;
        }
        case 'zigzag': {
            htmlOut = `
                <div class="w-full py-24 px-4 relative ${isPreview ? 'pointer-events-none' : ''}" style="background-color: ${bg}; ${animStyle}" ${previewId} ${aosAttr}>
                    <div class="max-w-6xl mx-auto space-y-24">
                        <div class="text-center">${titleTag}</div>
                        <div class="flex flex-col md:flex-row gap-12 items-center">
                            <div class="w-full md:w-1/2 rounded-[2rem] overflow-hidden shadow-2xl"><img src="${getImg(0)}" class="w-full aspect-[4/3] object-cover"></div>
                            <div class="w-full md:w-1/2 prose prose-lg editor-content">${htmlContent}</div>
                        </div>
                        <div class="flex flex-col md:flex-row-reverse gap-12 items-center pt-12 border-t border-slate-200">
                            <div class="w-full md:w-1/2 rounded-[2rem] overflow-hidden shadow-2xl"><img src="${getImg(1)}" class="w-full aspect-[4/3] object-cover"></div>
                            <div class="w-full md:w-1/2 prose prose-lg editor-content text-right">${htmlContent}</div>
                        </div>
                    </div>
                </div>`;
            break;
        }
        case 'circle_team': {
            htmlOut = `
                <div class="w-full py-24 px-4 relative text-center ${isPreview ? 'pointer-events-none' : ''}" style="background-color: ${bg}; ${animStyle}" ${previewId} ${aosAttr}>
                    <div class="max-w-7xl mx-auto">
                        <div class="mb-16">${titleTag}<div class="prose mx-auto editor-content">${htmlContent}</div></div>
                        <div class="flex justify-center items-center gap-8 md:gap-16 flex-wrap">
                            ${[0,1,2].map(i => `<div class="flex flex-col items-center"><div class="w-48 h-48 rounded-full overflow-hidden shadow-2xl border-4 border-brand mb-6"><img src="${getImg(i)}" class="w-full h-full object-cover"></div></div>`).join('')}
                        </div>
                    </div>
                </div>`;
            break;
        }
        case 'polaroid_gallery': {
            htmlOut = `
                <div class="w-full py-32 px-4 relative overflow-hidden bg-[url('assets/img/pattern.png')] bg-repeat ${isPreview ? 'pointer-events-none' : ''}" style="background-color: ${bg};" ${!isPreview ? animAttr : ''}>
                    ${isPreview ? animAttr : ''}
                    <div class="max-w-7xl mx-auto flex flex-col items-center gap-12">
                        <div class="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-xl w-full max-w-3xl text-center border border-slate-100 z-10">
                            ${titleTag}
                            <div class="prose prose-lg editor-content">${htmlContent}</div>
                        </div>
                        <div class="flex flex-col sm:flex-row justify-center gap-8 sm:-mt-12">
                            <div class="bg-white p-4 pb-12 shadow-2xl rounded-sm sm:rotate-[-6deg] z-0"><img src="${getImg(0)}" class="w-64 aspect-square object-cover border border-slate-200"></div>
                            <div class="bg-white p-4 pb-12 shadow-2xl rounded-sm sm:rotate-[4deg] sm:-translate-y-8 z-10"><img src="${getImg(1)}" class="w-64 aspect-square object-cover border border-slate-200"></div>
                            <div class="bg-white p-4 pb-12 shadow-2xl rounded-sm sm:rotate-[-2deg] z-20"><img src="${getImg(2)}" class="w-64 aspect-square object-cover border border-slate-200"></div>
                        </div>
                    </div>
                </div>`;
            break;
        }
        case 'countdown_promo': {
            htmlOut = `
                <div class="w-full py-20 px-4 relative ${isPreview ? 'pointer-events-none' : ''}" style="background-color: ${bg}; ${animStyle}" ${previewId} ${aosAttr}>
                    <div class="max-w-5xl mx-auto bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl relative border-4 border-accent">
                        <div class="absolute inset-0 opacity-20 bg-cover bg-center" style="background-image: url('${getImg(0)}');"></div>
                        <div class="relative z-10 p-12 md:p-20 text-center flex flex-col items-center">
                            <span class="inline-block bg-accent text-prime font-black uppercase px-4 py-2 rounded-xl mb-6 tracking-widest animate-pulse"><i class="fas fa-clock"></i> Oferta Limitada</span>
                            ${titleTag}
                            <div class="prose prose-xl prose-invert editor-content font-bold shadow-lg bg-black/40 p-8 rounded-3xl backdrop-blur-sm border border-white/10">${htmlContent}</div>
                        </div>
                    </div>
                </div>`;
            break;
        }
        case 'ticket_coupon': {
            htmlOut = `
                <div class="w-full py-24 px-4 relative ${isPreview ? 'pointer-events-none' : ''}" style="background-color: ${bg}; ${animStyle}" ${previewId} ${aosAttr}>
                    <div class="max-w-4xl mx-auto flex items-center shadow-2xl rounded-[2rem] overflow-hidden bg-brand relative">
                        <div class="w-10 flex flex-col justify-between py-4 items-center border-r-4 border-dashed border-white/30 h-full absolute left-0 shrink-0">
                            <div class="w-4 h-4 bg-[${bg}] rounded-full -translate-x-2"></div>
                            <div class="w-4 h-4 bg-[${bg}] rounded-full -translate-x-2"></div>
                            <div class="w-4 h-4 bg-[${bg}] rounded-full -translate-x-2"></div>
                        </div>
                        <div class="flex-1 bg-brand p-12 md:p-20 text-center text-white ml-2">
                            <div class="pb-4 inline-block">${titleTag}</div>
                            <div class="prose prose-xl prose-invert mx-auto editor-content font-bold mt-6 text-yellow-300 drop-shadow-sm">${htmlContent}</div>
                        </div>
                         <div class="w-10 flex flex-col justify-between py-4 items-center border-l-4 border-dashed border-white/30 h-full absolute right-0 shrink-0">
                            <div class="w-4 h-4 bg-[${bg}] rounded-full translate-x-2"></div>
                            <div class="w-4 h-4 bg-[${bg}] rounded-full translate-x-2"></div>
                            <div class="w-4 h-4 bg-[${bg}] rounded-full translate-x-2"></div>
                        </div>
                    </div>
                </div>`;
            break;
        }
        case 'diagonal_split': {
            htmlOut = `
                <div class="w-full relative min-h-[60vh] flex items-center overflow-hidden ${isPreview ? 'pointer-events-none' : 'mb-1'}" style="background-color: ${bg}; ${animStyle}" ${previewId} ${aosAttr}>
                    <div class="absolute inset-0 bg-cover bg-center" style="background-image: url('${getImg(0)}'); z-index: 0;"></div>
                    <div class="absolute inset-0 z-10" style="background: linear-gradient(105deg, ${bg} 0%, ${bg} 50%, transparent 50%, transparent 100%);"></div>
                    <div class="relative z-20 w-full md:w-1/2 p-12 md:p-24 text-left">
                        ${titleTag}
                        <div class="prose prose-lg editor-content text-slate-800">${htmlContent}</div>
                    </div>
                </div>`;
            break;
        }
        case 'floating_app': {
             htmlOut = `
                <div class="w-full py-24 px-4 relative overflow-hidden ${isPreview ? 'pointer-events-none' : ''}" style="background-color: ${bg}; ${animStyle}" ${previewId} ${aosAttr}>
                    <div class="max-w-6xl mx-auto flex flex-col md:flex-row gap-16 items-center">
                        <div class="w-full md:w-1/2 text-left z-10">
                            ${titleTag}
                            <div class="prose prose-lg editor-content mt-8 bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100">${htmlContent}</div>
                        </div>
                        <div class="w-full md:w-1/2 flex justify-center z-0 relative">
                            <div class="absolute w-64 h-64 bg-accent/30 rounded-full blur-3xl -z-10 animate-pulse"></div>
                            <div class="w-[300px] h-[600px] bg-slate-800 rounded-[3rem] p-4 shadow-2xl border-8 border-slate-900 overflow-hidden relative rotate-[-5deg] hover:rotate-0 transition-transform duration-500">
                                <div class="w-32 h-6 bg-slate-900 absolute top-0 left-1/2 transform -translate-x-1/2 rounded-b-3xl z-20"></div>
                                <img src="${getImg(0)}" class="w-full h-full object-cover rounded-[2rem]">
                            </div>
                        </div>
                    </div>
                </div>`;
            break;
        }
        case 'glass_floating': {
            htmlOut = `
                <div class="w-full py-32 px-4 relative overflow-hidden ${isPreview ? 'pointer-events-none' : ''}" style="background-color: ${bg}; ${animStyle}" ${previewId} ${aosAttr}>
                    <div class="absolute -top-32 -left-32 w-96 h-96 bg-brand rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
                    <div class="absolute -bottom-32 -right-32 w-96 h-96 bg-accent rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style="animation-delay: 2000ms;"></div>
                    <div class="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 items-center relative z-10">
                        <div class="w-full md:w-1/2 p-12 bg-white/30 backdrop-blur-2xl rounded-[3rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] border border-white/40 z-10">
                            ${titleTag}
                            <div class="prose prose-lg editor-content text-slate-800">${htmlContent}</div>
                        </div>
                        <div class="w-full md:w-1/2 -ml-0 md:-ml-12 z-0 mt-8 md:mt-0 transform md:rotate-[4deg] hover:rotate-0 transition-transform duration-500">
                            <img src="${getImg(0)}" class="w-full rounded-[2rem] shadow-2xl object-cover hover:scale-105 transition-transform duration-500">
                        </div>
                    </div>
                </div>`;
            break;
        }
        case 'photo_popout': {
            htmlOut = `
                <div class="w-full py-32 px-4 relative ${isPreview ? 'pointer-events-none' : 'mt-12'}" style="background-color: ${bg};" ${!isPreview ? animAttr : ''}>
                    ${isPreview ? animAttr : ''}
                    <div class="max-w-5xl mx-auto bg-prime rounded-[3rem] p-8 md:p-16 text-white relative shadow-2xl mt-24 md:mt-0">
                        <div class="flex flex-col md:flex-row items-center gap-12">
                            <div class="w-full md:w-1/2 shrink-0 relative flex justify-center mt-[-150px] md:mt-0 md:-ml-24">
                                <img src="${getImg(0)}" class="w-64 md:w-full h-[300px] md:h-[450px] object-cover rounded-[2rem] border-8 border-white shadow-2xl transform md:-rotate-3 hover:rotate-0 transition-all duration-300">
                            </div>
                            <div class="w-full md:w-1/2 text-center md:text-left z-10">
                                <div class="mb-6">${titleTag}</div>
                                <div class="prose prose-xl prose-invert editor-content">${htmlContent}</div>
                            </div>
                        </div>
                    </div>
                </div>`;
            break;
        }
        case 'accordion_faq': {
            htmlOut = `
                <div class="w-full py-24 px-4 relative ${isPreview ? 'pointer-events-none' : ''}" style="background-color: ${bg}; ${animStyle}" ${previewId} ${aosAttr}>
                    <div class="max-w-4xl mx-auto bg-white rounded-[3rem] p-8 md:p-16 shadow-xl border border-slate-100">
                        <div class="text-center mb-12">${titleTag}</div>
                        <div class="prose prose-lg prose-slate max-w-none editor-content faq-style">${htmlContent}</div>
                    </div>
                </div>`;
            break;
        }
        case 'neo_brutalism': {
            htmlOut = `
                <div class="w-full py-24 px-4 relative ${isPreview ? 'pointer-events-none' : ''}" style="background-color: ${bg}; ${animStyle}" ${previewId} ${aosAttr}>
                    <div class="max-w-6xl mx-auto flex flex-col md:flex-row gap-12 items-center">
                        <div class="w-full md:w-1/2 bg-white border-4 border-black p-8 md:p-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-3 hover:translate-y-3 transition-all duration-300">
                            ${titleTag}
                            <div class="prose prose-xl font-bold editor-content text-black">${htmlContent}</div>
                        </div>
                        <div class="w-full md:w-1/2">
                            <div class="w-full aspect-square border-4 border-black shadow-[12px_12px_0px_0px_rgba(10,37,64,1)] overflow-hidden">
                                <img src="${getImg(0)}" class="w-full h-full object-cover filter contrast-125 saturate-150">
                            </div>
                        </div>
                    </div>
                </div>`;
            break;
        }
        case 'frame_elegant': {
            htmlOut = `
                <div class="w-full py-24 px-4 relative ${isPreview ? 'pointer-events-none' : ''}" style="background-color: ${bg}; ${animStyle}" ${previewId} ${aosAttr}>
                    <div class="max-w-7xl mx-auto flex flex-col items-center">
                        <div class="text-center mb-16">${titleTag}<div class="prose mx-auto editor-content text-slate-700 italic font-serif">${htmlContent}</div></div>
                        <div class="flex flex-col md:flex-row gap-12 justify-center items-center">
                            <div class="bg-white p-4 shadow-2xl border border-slate-200">
                                <div class="border-2 border-yellow-600/30 p-2">
                                    <img src="${getImg(0)}" class="w-full md:w-80 h-auto object-cover filter sepia-[0.2]">
                                </div>
                            </div>
                            <div class="bg-white p-4 shadow-2xl border border-slate-200 sm:-translate-y-12">
                                <div class="border-2 border-yellow-600/30 p-2">
                                    <img src="${getImg(1)}" class="w-full md:w-80 h-auto object-cover filter sepia-[0.2]">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
            break;
        }
        case 'magazine_grid': {
            htmlOut = `
                <div class="w-full py-24 px-4 relative ${isPreview ? 'pointer-events-none' : ''}" style="background-color: ${bg}; ${animStyle}" ${previewId} ${aosAttr}>
                    <div class="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
                        <div class="w-full md:w-7/12 rounded-[2rem] overflow-hidden shadow-xl relative group">
                            <img src="${getImg(0)}" class="w-full h-full object-cover min-h-[400px]">
                            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 md:p-12 text-white">
                                ${titleTag}
                            </div>
                        </div>
                        <div class="w-full md:w-5/12 flex flex-col gap-8">
                            <div class="w-full aspect-video rounded-[2rem] overflow-hidden shadow-xl"><img src="${getImg(1)}" class="w-full h-full object-cover"></div>
                            <div class="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 flex-1">
                                <div class="prose editor-content">${htmlContent}</div>
                            </div>
                            <div class="w-full aspect-video rounded-[2rem] overflow-hidden shadow-xl"><img src="${getImg(2)}" class="w-full h-full object-cover"></div>
                        </div>
                    </div>
                </div>`;
            break;
        }
        case 'parallax_window': {
            htmlOut = `
                <div class="w-full relative min-h-[70vh] flex items-center justify-center p-4 overflow-hidden ${isPreview ? 'pointer-events-none' : 'mb-1'}" style="${animStyle}" ${previewId} ${aosAttr}>
                    <div class="absolute inset-0 bg-cover ${isPreview ? 'bg-center' : 'bg-fixed bg-center'} z-0" style="background-image: url('${getImg(0)}'); filter: brightness(0.5);"></div>
                    <div class="relative z-10 bg-white/10 backdrop-blur-md p-10 md:p-20 rounded-[3rem] border border-white/20 text-center max-w-4xl text-white shadow-2xl">
                        ${titleTag}
                        <div class="prose prose-xl prose-invert mx-auto editor-content font-light">${htmlContent}</div>
                    </div>
                </div>`;
            break;
        }
        case 'split_skew': {
            htmlOut = `
                <div class="w-full relative overflow-hidden flex flex-col md:flex-row min-h-[600px] ${isPreview ? 'pointer-events-none' : ''}" style="background-color: ${bg}; ${animStyle}" ${previewId} ${aosAttr}>
                    <div class="w-full md:w-1/2 p-12 md:p-24 flex flex-col justify-center text-left z-10 bg-white md:bg-transparent" style="clip-path: polygon(0 0, 100% 0, 90% 100%, 0% 100%);">
                        ${titleTag}
                        <div class="prose prose-lg editor-content">${htmlContent}</div>
                    </div>
                    <div class="w-full md:w-1/2 absolute top-0 bottom-0 right-0 z-0 hidden md:block" style="clip-path: polygon(10% 0, 100% 0, 100% 100%, 0% 100%);">
                        <img src="${getImg(0)}" class="w-full h-full object-cover">
                    </div>
                     <div class="w-full h-[300px] z-0 md:hidden">
                        <img src="${getImg(0)}" class="w-full h-full object-cover">
                    </div>
                </div>`;
            break;
        }
        case 'pricing_3': {
            htmlOut = `
                <div class="w-full py-24 px-4 relative ${isPreview ? 'pointer-events-none' : ''}" style="background-color: ${bg}; ${animStyle}" ${previewId} ${aosAttr}>
                    <div class="max-w-7xl mx-auto">
                        <div class="text-center mb-16">${titleTag}</div>
                        <div class="prose prose-lg mx-auto editor-content pricing-table-style">${htmlContent}</div>
                    </div>
                </div>`;
            break;
        }
        case 'timeline_steps': {
            htmlOut = `
                <div class="w-full py-24 px-4 relative ${isPreview ? 'pointer-events-none' : ''}" style="background-color: ${bg}; ${animStyle}" ${previewId} ${aosAttr}>
                    <div class="max-w-6xl mx-auto">
                        <div class="text-center mb-24">${titleTag}<div class="prose mx-auto editor-content">${htmlContent}</div></div>
                        <div class="relative">
                            <div class="hidden md:block absolute top-[120px] left-0 right-0 h-1 bg-brand/20 -z-10"></div>
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-16 px-4">
                                ${[0,1,2].map(i => `
                                <div class="flex flex-col items-center text-center relative">
                                    <div class="w-16 h-16 bg-brand text-white rounded-full flex items-center justify-center text-2xl font-black mb-8 shadow-xl outline outline-8 outline-white z-10">${i+1}</div>
                                    <div class="w-full aspect-[4/3] rounded-[2rem] overflow-hidden shadow-lg border-4 border-slate-50 mb-6"><img src="${getImg(i)}" class="w-full h-full object-cover filter hover:brightness-110 transition-all"></div>
                                </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>`;
            break;
        }
        case 'blob_mask': {
             htmlOut = `
                <div class="w-full py-24 px-4 relative ${isPreview ? 'pointer-events-none' : ''}" style="background-color: ${bg}; ${animStyle}" ${previewId} ${aosAttr}>
                    <div class="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16">
                        <div class="w-full md:w-1/2 flex justify-center">
                            <div class="w-[300px] md:w-[450px] aspect-square bg-slate-200 overflow-hidden shadow-2xl" style="border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; animation: morphShape_${typeof window !== 'undefined' ? Date.now() : 'id'} 8s ease-in-out infinite;">
                                <img src="${getImg(0)}" class="w-full h-full object-cover">
                            </div>
                        </div>
                        <div class="w-full md:w-1/2 text-left">
                            ${titleTag}
                            <div class="prose prose-lg editor-content text-slate-800">${htmlContent}</div>
                        </div>
                    </div>
                </div>
                <!-- Animación interna para simplificar el Blob -->
                <style>@keyframes morphShape_${typeof window !== 'undefined' ? Date.now() : 'id'} { 0% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; } 50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; } 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; } }</style>`;
            break;
        }
        case 'overlay_cards': {
             htmlOut = `
                <div class="w-full py-32 px-4 relative overflow-hidden ${isPreview ? 'pointer-events-none' : ''}" style="background-color: ${bg}; ${animStyle}" ${previewId} ${aosAttr}>
                    <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
                        <div class="w-full md:w-1/2 text-left z-20">
                            ${titleTag}
                            <div class="prose prose-lg editor-content bg-white/80 p-8 rounded-3xl backdrop-blur-sm shadow-xl">${htmlContent}</div>
                        </div>
                        <div class="w-full md:w-1/2 relative min-h-[400px]">
                            <div class="absolute inset-0 flex items-center justify-center">
                                <img src="${getImg(0)}" class="w-48 h-64 object-cover rounded-2xl shadow-2xl absolute transform -rotate-12 -translate-x-20 saturate-50 hover:saturate-100 transition-all hover:z-30 hover:scale-110">
                                <img src="${getImg(1)}" class="w-48 h-64 object-cover rounded-2xl shadow-2xl absolute transform rotate-12 translate-x-20 saturate-50 hover:saturate-100 transition-all hover:z-30 hover:scale-110">
                                <img src="${getImg(2)}" class="w-56 h-72 object-cover rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] absolute z-20 border-4 border-white hover:scale-105 transition-all">
                            </div>
                        </div>
                    </div>
                </div>`;
            break;
        }
        case 'canva_scrapbook': {
            htmlOut = `
                <div class="w-full py-32 px-4 relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/notebook-dark.png')] shadow-inner ${isPreview ? 'pointer-events-none' : ''}" style="background-color: ${bg}; ${animStyle}" ${previewId} ${aosAttr}>
                    <div class="max-w-6xl mx-auto flex flex-col items-center">
                        <div class="bg-yellow-100 p-8 transform rotate-2 shadow-md border border-yellow-200 mb-16 max-w-2xl text-center relative z-10">
                            <div class="absolute -top-4 left-1/2 w-16 h-8 bg-slate-200/80 -translate-x-1/2 rotate-[-5deg] shadow-sm"></div>
                            ${titleTag}
                            <div class="prose prose-lg editor-content font-serif">${htmlContent}</div>
                        </div>
                        <div class="flex flex-col md:flex-row gap-8 justify-center items-center">
                            <div class="relative transform rotate-[-6deg] hover:rotate-0 transition-transform hover:z-20 cursor-pointer">
                                <div class="absolute -top-3 left-4 w-12 h-6 bg-slate-200/80 rotate-12 shadow-sm z-10 w-20"></div>
                                <div class="bg-white p-4 shadow-xl"><img src="${getImg(0)}" class="w-64 h-64 object-cover"></div>
                            </div>
                            <div class="relative transform rotate-[4deg] md:-translate-y-12 hover:rotate-0 transition-transform shadow-2xl hover:z-20 z-10 cursor-pointer">
                                <div class="absolute -top-4 right-4 w-12 h-6 bg-slate-200/80 -rotate-12 shadow-sm z-10 w-20"></div>
                                <div class="bg-white p-6 shadow-2xl relative"><img src="${getImg(1)}" class="w-72 h-72 object-cover filter contrast-125"></div>
                            </div>
                            <div class="relative transform rotate-[-2deg] hover:rotate-0 transition-transform hover:z-20 cursor-pointer">
                                <div class="absolute -top-3 left-1/2 w-12 h-6 bg-slate-200/80 rotate-6 shadow-sm z-10 w-20"></div>
                                <div class="bg-white p-4 shadow-xl"><img src="${getImg(2)}" class="w-64 h-64 object-cover filter sepia-50"></div>
                            </div>
                        </div>
                    </div>
                </div>`;
            break;
        }
        case 'canva_paper_torn': {
            htmlOut = `
                <div class="w-full relative py-32 px-4 ${isPreview ? 'pointer-events-none' : ''}" style="background-color: ${bg}; ${animStyle}" ${previewId} ${aosAttr}>
                    <div class="max-w-6xl mx-auto bg-white relative shadow-2xl">
                        <!-- CSS ZigZag Torn paper top & bottom -->
                        <div class="absolute -top-4 left-0 right-0 h-8 bg-[${bg}]" style="clip-path: polygon(0 0, 5% 100%, 10% 0, 15% 100%, 20% 0, 25% 100%, 30% 0, 35% 100%, 40% 0, 45% 100%, 50% 0, 55% 100%, 60% 0, 65% 100%, 70% 0, 75% 100%, 80% 0, 85% 100%, 90% 0, 95% 100%, 100% 0, 100% 100%, 0 100%); transform: rotate(180deg);"></div>
                        
                        <div class="flex flex-col md:flex-row min-h-[500px]">
                            <div class="w-full md:w-1/2 p-12 md:p-20 flex flex-col justify-center">
                                ${titleTag}
                                <div class="prose prose-lg editor-content">${htmlContent}</div>
                            </div>
                            <div class="w-full md:w-1/2 bg-cover bg-center" style="background-image: url('${getImg(0)}'); min-h-[400px];"></div>
                        </div>
                        
                        <div class="absolute -bottom-4 left-0 right-0 h-8 bg-[${bg}] z-10" style="clip-path: polygon(0 0, 5% 100%, 10% 0, 15% 100%, 20% 0, 25% 100%, 30% 0, 35% 100%, 40% 0, 45% 100%, 50% 0, 55% 100%, 60% 0, 65% 100%, 70% 0, 75% 100%, 80% 0, 85% 100%, 90% 0, 95% 100%, 100% 0, 100% 100%, 0 100%);"></div>
                    </div>
                </div>`;
            break;
        }
        case 'canva_watercolor': {
            htmlOut = `
                <div class="w-full py-32 px-4 relative overflow-hidden ${isPreview ? 'pointer-events-none' : ''}" style="background-color: ${bg}; ${animStyle}" ${previewId} ${aosAttr}>
                    <div class="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 z-10 relative">
                        <div class="w-full md:w-1/2 z-10">
                            ${titleTag}
                            <div class="prose prose-xl editor-content text-slate-800 font-serif">${htmlContent}</div>
                        </div>
                        <div class="w-full md:w-1/2 relative flex justify-center z-0">
                            <div class="absolute inset-0 bg-brand/30 rounded-full blur-[100px] transform scale-150"></div>
                            <div class="absolute inset-0 bg-accent/30 rounded-full blur-[100px] transform translate-x-32 translate-y-32 scale-150"></div>
                            <img src="${getImg(0)}" class="w-80 h-80 md:w-96 md:h-96 object-cover rounded-full shadow-2xl relative z-10 border-8 border-white/50 backdrop-blur-sm">
                        </div>
                    </div>
                </div>`;
            break;
        }
        case 'brush_stroke': {
            htmlOut = `
                <div class="w-full py-24 px-4 relative ${isPreview ? 'pointer-events-none' : ''}" style="background-color: ${bg}; ${animStyle}" ${previewId} ${aosAttr}>
                    <div class="max-w-6xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
                        <div class="w-full lg:w-1/2" style="mask-image: url('https://www.transparenttextures.com/patterns/stardust.png'); -webkit-mask-image: url('https://raw.githubusercontent.com/robin-dela/css-mask-animation/master/img/nature-sprite.png'); -webkit-mask-size: 2300% 100%; mask-size: 2300% 100%; border-radius: 20px;">
                            <div class="w-full aspect-square border-0" style="background-image: url('${getImg(0)}'); background-size: cover; background-position: center; border-radius: 80% 20% 30% 70% / 60% 30% 70% 40%;"></div>
                        </div>
                        <div class="w-full lg:w-1/2 text-left">
                            ${titleTag}
                            <div class="prose prose-xl editor-content">${htmlContent}</div>
                        </div>
                    </div>
                </div>`;
            break;
        }
        case 'comic_book': {
            htmlOut = `
                <div class="w-full py-24 px-4 relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/micro-carbon.png')] ${isPreview ? 'pointer-events-none' : ''}" style="background-color: ${bg}; ${animStyle}" ${previewId} ${aosAttr}>
                    <div class="max-w-6xl mx-auto bg-white border-8 border-black p-8 shadow-[20px_20px_0_0_rgba(0,0,0,1)] relative">
                        <div class="bg-yellow-400 absolute -top-8 -left-8 border-4 border-black font-black uppercase tracking-widest px-6 py-2 transform -rotate-12 text-2xl shadow-[8px_8px_0_0_rgba(0,0,0,1)]">¡NUEVO!</div>
                        <div class="text-center mb-12">${titleTag}</div>
                        <div class="flex flex-col md:flex-row gap-8">
                            <div class="w-full md:w-1/2 border-4 border-black relative group">
                                <img src="${getImg(0)}" class="w-full aspect-square object-cover filter contrast-150 saturate-150">
                                <div class="absolute bottom-4 left-4 bg-white border-4 border-black p-4 font-bold text-lg max-w-[80%] uppercase">${htmlContent.replace(/<[^>]*>?/gm, '').substring(0,60)}...</div>
                            </div>
                            <div class="w-full md:w-1/2 flex flex-col gap-8">
                                <div class="bg-white border-4 border-black p-8 flex-1 relative flex items-center justify-center">
                                    <div class="prose prose-xl font-bold uppercase text-center">${htmlContent}</div>
                                </div>
                                <div class="w-full aspect-video border-4 border-black overflow-hidden relative">
                                    <img src="${getImg(1)}" class="w-full h-full object-cover filter contrast-150 saturate-150">
                                    <div class="absolute top-4 right-4 bg-red-500 text-white rounded-full w-24 h-24 flex items-center justify-center font-black text-xl border-4 border-black transform rotate-12 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">WOW!</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
            break;
        }
        case 'origami_fold': {
            htmlOut = `
                <div class="w-full py-32 px-4 relative ${isPreview ? 'pointer-events-none' : ''}" style="background-color: ${bg}; perspective: 1000px; ${animStyle}" ${previewId} ${aosAttr}>
                    <div class="max-w-4xl mx-auto flex">
                        <div class="w-1/2 bg-white p-12 shadow-2xl origin-right transform rotate-y-[-10deg] border-r border-slate-200 z-10">
                            ${titleTag}
                        </div>
                        <div class="w-1/2 bg-slate-50 p-12 shadow-2xl origin-left transform rotate-y-[10deg] border-l border-slate-200 z-0 flex items-center">
                            <div class="prose prose-lg editor-content">${htmlContent}</div>
                        </div>
                    </div>
                </div>`;
            break;
        }
        case 'canva_neon_glow': {
             htmlOut = `
                <div class="w-full py-24 px-4 relative bg-slate-900 ${isPreview ? 'pointer-events-none' : ''}" style="background-color: ${bg !== '#ffffff' && bg !== '#FFFFFF'? bg : '#0f172a'}; ${animStyle}" ${previewId} ${aosAttr}>
                    <div class="max-w-6xl mx-auto flex flex-col md:flex-row gap-16 items-center">
                        <div class="w-full md:w-1/2 text-white">
                            <div class="mb-6">${titleTag}</div>
                            <div class="prose prose-xl prose-invert editor-content drop-shadow-md">${htmlContent}</div>
                        </div>
                        <div class="w-full md:w-1/2 relative p-2">
                            <div class="absolute inset-0 bg-gradient-to-tr from-fuchsia-500 to-cyan-500 blur-xl opacity-70 animate-pulse rounded-[2rem]"></div>
                            <img src="${getImg(0)}" class="w-full aspect-square object-cover rounded-[2rem] relative z-10 border-2 border-white/20">
                        </div>
                    </div>
                </div>`;
            break;
        }
        case 'canva_retro_wave': {
            htmlOut = `
                <div class="w-full py-32 px-4 relative overflow-hidden bg-indigo-950 ${isPreview ? 'pointer-events-none' : ''}" style="background-color: ${bg !== '#ffffff' && bg !== '#FFFFFF'? bg : '#1e1b4b'}; ${animStyle}" ${previewId} ${aosAttr}>
                    <!-- CSS Sun -->
                    <div class="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-gradient-to-b from-yellow-400 via-pink-500 to-purple-600 blur-[2px] opacity-80" style="box-shadow: 0 0 60px #ec4899; z-index: 0;"></div>
                    <!-- CSS Grid Floor -->
                    <div class="absolute bottom-0 left-0 right-0 h-1/2 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30 z-0" style="perspective: 500px; transform: rotateX(80deg) scale(2); transform-origin: top;"></div>
                    
                    <div class="max-w-5xl mx-auto text-center relative z-10 mt-16">
                        <div class="mb-8">${titleTag}</div>
                        
                        <div class="bg-black/40 backdrop-blur-md p-10 rounded-xl border-y border-pink-500/50 flex flex-col md:flex-row gap-12 items-center text-left">
                            <div class="w-full md:w-1/3">
                                <img src="${getImg(0)}" class="w-full aspect-square object-cover rounded shadow-[0_0_30px_rgba(236,72,153,0.5)] border-2 border-pink-500">
                            </div>
                            <div class="w-full md:w-2/3 prose prose-xl prose-invert editor-content text-pink-100 font-bold tracking-wide">${htmlContent}</div>
                        </div>
                    </div>
                </div>`;
            break;
        }
        case 'retro_windows_95': {
            htmlOut = `
                <div class="w-full py-24 px-4 relative bg-teal-600 ${isPreview ? 'pointer-events-none' : ''}" style="background-color: ${bg !== '#ffffff' && bg !== '#FFFFFF'? bg : '#0d9488'}; ${animStyle}" ${previewId} ${aosAttr}>
                    <div class="max-w-4xl mx-auto bg-slate-200 border-2 border-white border-r-slate-400 border-b-slate-400 shadow-[2px_2px_0px_rgba(0,0,0,1)] flex flex-col p-1">
                        <!-- Toolbar -->
                        <div class="bg-blue-800 text-white font-bold p-2 flex justify-between items-center relative text-sm font-sans tracking-wide">
                            <span><i class="fas fa-window-maximize mr-2 text-slate-300"></i>${pData.title || 'Información.exe'}</span>
                            <div class="flex gap-1">
                                <div class="w-5 h-5 bg-slate-200 border-2 border-white border-r-slate-400 border-b-slate-400 text-black flex items-center justify-center cursor-pointer font-black text-[10px]">-</div>
                                <div class="w-5 h-5 bg-slate-200 border-2 border-white border-r-slate-400 border-b-slate-400 text-black flex items-center justify-center cursor-pointer font-black text-[10px]">☐</div>
                                <div class="w-5 h-5 bg-slate-200 border-2 border-white border-r-slate-400 border-b-slate-400 text-black flex items-center justify-center cursor-pointer font-black text-[10px]">X</div>
                            </div>
                        </div>
                        <!-- Content -->
                        <div class="bg-white m-1 p-6 border-2 border-slate-400 border-r-white border-b-white overflow-y-auto max-h-[600px] flex flex-col md:flex-row gap-8">
                            <div class="w-full md:w-1/3">
                                <img src="${getImg(0)}" class="w-full border-2 border-slate-400 border-r-white border-b-white p-1">
                            </div>
                            <div class="w-full md:w-2/3 prose prose-sm text-black font-sans leading-relaxed">
                                <h1 class="font-bold underline text-xl mb-4">${pData.title || 'Bienvenido'}</h1>
                                ${htmlContent}
                                <div class="mt-8 flex justify-end">
                                    <button class="px-6 py-2 bg-slate-200 border-2 border-white border-r-slate-400 border-b-slate-400 text-black font-bold active:border-slate-400 active:border-r-white active:border-b-white">Aceptar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
            break;
        }
        case 'holographic_card': {
             htmlOut = `
                <div class="w-full py-32 px-4 relative flex justify-center items-center ${isPreview ? 'pointer-events-none' : ''}" style="background-color: ${bg}; ${animStyle}" ${previewId} ${aosAttr}>
                    <div class="w-full max-w-sm aspect-[2/3] rounded-2xl p-6 relative group transform-gpu perspective-1000">
                        <div class="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 pointer-events-none mix-blend-overlay" style="background-size: 200% 200%; animation: shimmer 2s infinite linear;"></div>
                        <div class="absolute inset-0 rounded-2xl overflow-hidden z-0 shadow-2xl border flex flex-col bg-white">
                            <div class="h-1/2 bg-cover bg-center" style="background-image: url('${getImg(0)}');"></div>
                            <div class="h-1/2 p-6 flex flex-col justify-center text-center bg-gradient-to-br from-slate-50 to-slate-200 text-slate-800 relative">
                                <!-- CSS rainbow overlay for holo effect -->
                                <div class="absolute inset-0 bg-gradient-to-tr from-red-500/20 via-green-500/20 to-blue-500/20 mix-blend-color z-0 pointer-events-none"></div>
                                <div class="relative z-10">
                                    ${pData.title ? `<h3 class="text-2xl font-black uppercase tracking-tight mb-2">${pData.title}</h3>` : ''}
                                    <div class="prose prose-sm">${htmlContent}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <style>@keyframes shimmer { 0% { background-position: -200% -200%; } 100% { background-position: 200% 200%; } }</style>
                </div>`;
            break;
        }
        case 'luxury_gold': {
            htmlOut = `
                <div class="w-full py-24 px-4 relative text-white ${isPreview ? 'pointer-events-none' : ''}" style="background-color: ${bg !== '#ffffff' && bg !== '#FFFFFF'? bg : '#0a0a0a'}; ${animStyle}" ${previewId} ${aosAttr}>
                    <div class="max-w-5xl mx-auto border border-yellow-600/50 p-4 relative">
                        <!-- Corner ornaments -->
                        <div class="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-yellow-500 -translate-x-2 -translate-y-2"></div>
                        <div class="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-yellow-500 translate-x-2 -translate-y-2"></div>
                        <div class="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-yellow-500 -translate-x-2 translate-y-2"></div>
                        <div class="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-yellow-500 translate-x-2 translate-y-2"></div>
                        
                        <div class="border border-yellow-600/30 p-12 md:p-20 text-center flex flex-col items-center">
                            <div class="mb-8">${titleTag}</div>
                            <hr class="w-24 border-yellow-600/50 mb-12">
                            <div class="flex flex-col md:flex-row gap-12 w-full mb-12">
                                <img src="${getImg(0)}" class="w-full md:w-1/2 min-h-[400px] object-cover filter grayscale contrast-125 border border-yellow-900/50">
                                <img src="${getImg(1)}" class="w-full md:w-1/2 min-h-[400px] object-cover filter grayscale contrast-125 border border-yellow-900/50">
                            </div>
                            <div class="prose prose-xl prose-invert font-serif font-light leading-loose text-slate-300 max-w-3xl editor-content">${htmlContent}</div>
                        </div>
                    </div>
                </div>`;
            break;
        }
        case 'minimalist_editorial': {
            htmlOut = `
                <div class="w-full py-32 px-4 relative bg-white text-black ${isPreview ? 'pointer-events-none' : ''}" style="background-color: ${bg}; ${animStyle}" ${previewId} ${aosAttr}>
                    <div class="max-w-6xl mx-auto">
                        <div class="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                            <div class="lg:col-span-4 self-start sticky top-32">
                                <div class="mb-10">${titleTag}</div>
                                <div class="prose prose-lg font-serif text-slate-500 editor-content tracking-wide leading-relaxed">${htmlContent}</div>
                            </div>
                            <div class="lg:col-span-8">
                                <img src="${getImg(0)}" class="w-full aspect-auto min-h-[80vh] object-cover grayscale opacity-90 hover:grayscale-0 transition-all duration-1000">
                            </div>
                        </div>
                    </div>
                </div>`;
            break;
        }
        case 'duotone_split': {
             htmlOut = `
                <div class="w-full relative min-h-[700px] flex flex-col md:flex-row shadow-inner ${isPreview ? 'pointer-events-none' : ''}" style="background-color: ${bg !== '#ffffff' && bg !== '#FFFFFF'? bg : '#0f172a'}; ${animStyle}" ${previewId} ${aosAttr}>
                    <div class="w-full md:w-1/2 relative overflow-hidden group">
                        <!-- Duotone effect via CSS mix-blend-mode -->
                        <div class="absolute inset-0 bg-brand mix-blend-multiply z-10 transition-opacity group-hover:opacity-50"></div>
                        <div class="absolute inset-0 bg-accent mix-blend-screen z-10 opacity-70 transition-opacity group-hover:opacity-30"></div>
                        <img src="${getImg(0)}" class="w-full h-full object-cover filter grayscale contrast-125 absolute inset-0 z-0">
                    </div>
                    <div class="w-full md:w-1/2 p-16 md:p-32 flex flex-col justify-center text-white relative z-20">
                        <div class="mb-8">${titleTag}</div>
                        <div class="prose prose-xl prose-invert font-mono editor-content text-slate-300">${htmlContent}</div>
                    </div>
                </div>`;
            break;
        }
        case 'brutal_typography': {
            htmlOut = `
                <div class="w-full py-32 px-4 relative overflow-hidden ${isPreview ? 'pointer-events-none' : ''}" style="background-color: ${bg}; ${animStyle}" ${previewId} ${aosAttr}>
                    <div class="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none overflow-hidden z-0">
                        <div class="text-[100px] md:text-[200px] font-black uppercase leading-none text-transparent break-all w-full text-center" style="-webkit-text-stroke: 4px #000; overflow: hidden; max-height: 1em;">${pData.title || 'BRUTAL'}</div>
                    </div>
                    <div class="max-w-5xl mx-auto flex flex-col md:flex-row items-end gap-8 relative z-10">
                        <div class="w-full md:w-2/3 bg-black text-white p-12 shadow-[16px_16px_0px_#facc15]">
                            <div class="mb-6">${titleTag}</div>
                            <div class="prose prose-xl prose-invert font-mono editor-content">${htmlContent}</div>
                        </div>
                        <div class="w-full md:w-1/3 z-20 md:-ml-32 mb-8 shadow-2xl border-8 border-white">
                            <img src="${getImg(0)}" class="w-full aspect-[3/4] object-cover">
                        </div>
                    </div>
                </div>`;
            break;
        }
        case 'soft_ui_neumorphism': {
            htmlOut = `
                <div class="w-full py-24 px-4 relative ${isPreview ? 'pointer-events-none' : ''}" style="background-color: ${bg !== '#ffffff' && bg !== '#FFFFFF'? bg : '#e0e5ec'}; ${animStyle}" ${previewId} ${aosAttr}>
                    <div class="max-w-4xl mx-auto text-center rounded-[3rem] p-12 md:p-24" style="background: ${bg !== '#ffffff' && bg !== '#FFFFFF'? bg : '#e0e5ec'}; box-shadow: 20px 20px 60px #bec3c9, -20px -20px 60px #ffffff;">
                        <div class="mb-10 text-slate-500 tracking-wide uppercase">${titleTag}</div>
                        <div class="prose prose-lg mx-auto editor-content font-medium text-slate-600 rounded-[2rem] p-8 md:p-12 mb-8" style="background: ${bg !== '#ffffff' && bg !== '#FFFFFF'? bg : '#e0e5ec'}; box-shadow: inset 10px 10px 20px #bec3c9, inset -10px -10px 20px #ffffff;">${htmlContent}</div>
                        <button class="px-12 py-4 rounded-full font-bold text-slate-500 hover:text-brand transition-all uppercase tracking-widest text-sm" style="background: ${bg !== '#ffffff' && bg !== '#FFFFFF'? bg : '#e0e5ec'}; box-shadow: 10px 10px 20px #bec3c9, -10px -10px 20px #ffffff; active:box-shadow: inset 5px 5px 10px #bec3c9, inset -5px -5px 10px #ffffff;">Descubrir Más</button>
                    </div>
                </div>`;
            break;
        }
        case 'film_strip': {
             htmlOut = `
                <div class="w-full py-32 relative overflow-hidden bg-black text-white ${isPreview ? 'pointer-events-none' : ''}" style="background-color: ${bg !== '#ffffff' && bg !== '#FFFFFF'? bg : '#000000'}; ${animStyle}" ${previewId} ${aosAttr}>
                    <div class="max-w-4xl mx-auto text-center mb-16 px-4">
                        ${titleTag}
                        <div class="prose prose-xl prose-invert mx-auto editor-content font-serif italic text-slate-300 border-b border-white/20 pb-8">${htmlContent}</div>
                    </div>
                    <!-- Film Strip Container -->
                    <div class="w-full flex justify-center py-6 bg-[#111] overflow-x-auto scroller-hidden px-12 relative border-y-8 border-[#333]">
                        <!-- Top holes -->
                        <div class="absolute top-0 left-0 right-0 h-4 flex justify-between px-2 gap-4 opacity-50"><div class="w-4 h-3 bg-white mt-1 rounded-sm"></div><div class="w-4 h-3 bg-white mt-1 rounded-sm"></div><div class="w-4 h-3 bg-white mt-1 rounded-sm"></div><div class="w-4 h-3 bg-white mt-1 rounded-sm"></div><div class="w-4 h-3 bg-white mt-1 rounded-sm"></div><div class="w-4 h-3 bg-white mt-1 rounded-sm"></div><div class="w-4 h-3 bg-white mt-1 rounded-sm"></div><div class="w-4 h-3 bg-white mt-1 rounded-sm"></div><div class="w-4 h-3 bg-white mt-1 rounded-sm"></div><div class="w-4 h-3 bg-white mt-1 rounded-sm"></div></div>
                        <div class="flex gap-4 shrink-0">
                            ${[0,1,2,3].map(i => `<img src="${getImg(i)}" class="h-[300px] w-auto aspect-video object-cover filter grayscale hover:grayscale-0 transition-all duration-700 cursor-pointer">`).join('')}
                        </div>
                        <!-- Bottom holes -->
                        <div class="absolute bottom-0 left-0 right-0 h-4 flex justify-between px-2 gap-4 opacity-50"><div class="w-4 h-3 bg-white mb-1 rounded-sm"></div><div class="w-4 h-3 bg-white mb-1 rounded-sm"></div><div class="w-4 h-3 bg-white mb-1 rounded-sm"></div><div class="w-4 h-3 bg-white mb-1 rounded-sm"></div><div class="w-4 h-3 bg-white mb-1 rounded-sm"></div><div class="w-4 h-3 bg-white mb-1 rounded-sm"></div><div class="w-4 h-3 bg-white mb-1 rounded-sm"></div><div class="w-4 h-3 bg-white mb-1 rounded-sm"></div><div class="w-4 h-3 bg-white mb-1 rounded-sm"></div><div class="w-4 h-3 bg-white mb-1 rounded-sm"></div></div>
                    </div>
                </div>`;
            break;
        }
        case 'offset_grid_4': {
            htmlOut = `
                <div class="w-full py-24 px-4 relative ${isPreview ? 'pointer-events-none' : ''}" style="background-color: ${bg}; ${animStyle}" ${previewId} ${aosAttr}>
                    <div class="max-w-6xl mx-auto flex flex-col items-center">
                        <div class="text-center mb-16 max-w-2xl">${titleTag}<div class="prose prose-lg editor-content">${htmlContent}</div></div>
                        <div class="grid grid-cols-2 md:grid-cols-3 gap-8 w-full">
                            <div class="md:col-span-2 aspect-[16/9] rounded-3xl overflow-hidden shadow-xl"><img src="${getImg(0)}" class="w-full h-full object-cover"></div>
                            <div class="aspect-square rounded-3xl overflow-hidden shadow-xl md:translate-y-12"><img src="${getImg(1)}" class="w-full h-full object-cover"></div>
                            <div class="aspect-square rounded-3xl overflow-hidden shadow-xl md:-translate-y-12"><img src="${getImg(2)}" class="w-full h-full object-cover"></div>
                            <div class="md:col-span-2 aspect-[16/6] rounded-3xl overflow-hidden shadow-xl"><img src="${getImg(3)}" class="w-full h-full object-cover filter hover:contrast-125 transition-all"></div>
                        </div>
                    </div>
                </div>`;
            break;
        }
        case 'polaroid_scatter': {
            htmlOut = `
                <div class="w-full py-32 px-4 relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] shadow-inner border-y-8 border-[#5c4033] ${isPreview ? 'pointer-events-none' : ''}" style="background-color: ${bg !== '#ffffff' && bg !== '#FFFFFF'? bg : '#8b5a2b'}; ${animStyle}" ${previewId} ${aosAttr}>
                    <div class="max-w-5xl mx-auto relative min-h-[700px]">
                        <div class="bg-yellow-100 p-8 shadow-2xl rounded-sm absolute top-10 left-10 md:left-32 z-20 w-80 transform rotate-[3deg] border border-yellow-200">
                            <div class="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full w-4 h-4 bg-red-600 shadow-md"></div>
                            <div class="mb-4">${titleTag}</div>
                            <div class="prose prose-sm font-serif text-slate-700 italic editor-content">${htmlContent}</div>
                        </div>
                        
                        <div class="absolute top-[20%] right-[10%] bg-white p-4 pb-12 shadow-2xl rotate-[12deg] z-10 w-72 hover:z-30 transition-all hover:scale-110 cursor-pointer">
                            <img src="${getImg(0)}" class="w-full aspect-square object-cover mb-4 filter sepia-[0.3]">
                            <p class="font-handwriting text-center text-xl text-slate-600">Momento 1</p>
                        </div>
                        <div class="absolute bottom-[10%] left-[5%] md:left-[20%] bg-white p-4 pb-12 shadow-2xl -rotate-[8deg] z-10 w-64 hover:z-30 transition-all hover:scale-110 cursor-pointer">
                            <img src="${getImg(1)}" class="w-full aspect-square object-cover mb-4 filter contrast-125">
                            <p class="font-handwriting text-center text-xl text-slate-600">Recuerdos</p>
                        </div>
                        <div class="absolute bottom-[20%] right-[20%] md:right-[30%] bg-white p-4 pb-12 shadow-2xl rotate-[-15deg] z-0 w-80 hover:z-30 transition-all hover:scale-110 cursor-pointer">
                            <img src="${getImg(2)}" class="w-full aspect-square object-cover mb-4 filter saturate-150">
                        </div>
                        <div class="absolute top-[10%] left-[40%] bg-white p-4 pb-12 shadow-2xl rotate-[5deg] z-0 w-60 hover:z-30 transition-all hover:scale-110 cursor-pointer">
                            <img src="${getImg(3)}" class="w-full aspect-square object-cover mb-4 filter hue-rotate-15">
                        </div>
                    </div>
                </div>`;
            break;
        }
        case 'stamp_collection': {
             htmlOut = `
                <div class="w-full py-24 px-4 relative text-center ${isPreview ? 'pointer-events-none' : ''}" style="background-color: ${bg}; ${animStyle}" ${previewId} ${aosAttr}>
                    <div class="max-w-6xl mx-auto">
                        <div class="mb-16 max-w-2xl mx-auto">${titleTag}<div class="prose mx-auto editor-content text-slate-500">${htmlContent}</div></div>
                        <div class="flex justify-center gap-12 flex-wrap">
                            ${[0,1,2].map(i => `
                            <!-- Stamp CSS Wrapper -->
                            <div class="bg-[#f8f9fa] p-3 shadow-md relative filter drop-shadow-lg transform hover:-translate-y-2 transition-transform rotate-[${i%2===0?2:-3}deg]" style="background: radial-gradient(transparent 3px, #f8f9fa 3px); background-size: 15px 15px; background-position: -7.5px -7.5px;">
                                <div class="border border-slate-300 p-2 bg-white">
                                    <div class="absolute top-6 right-6 z-10 w-16 h-16 border-4 border-slate-800 rounded-full flex items-center justify-center opacity-40 transform rotate-[25deg]"><span class="text-[10px] font-black uppercase text-slate-800 text-center leading-none">Aprobado<br>202${i+4}</span></div>
                                    <img src="${getImg(i)}" class="w-64 h-[350px] object-cover filter contrast-125">
                                </div>
                            </div>
                            `).join('')}
                        </div>
                    </div>
                </div>`;
            break;
        }
        case 'geometric_clipping': {
            htmlOut = `
                <div class="w-full py-24 px-4 relative ${isPreview ? 'pointer-events-none' : ''}" style="background-color: ${bg}; ${animStyle}" ${previewId} ${aosAttr}>
                    <div class="max-w-6xl mx-auto flex flex-col items-center text-center">
                        <div class="mb-16">${titleTag}<div class="prose mx-auto editor-content">${htmlContent}</div></div>
                        <div class="flex justify-center items-center -space-x-8 md:-space-x-12 relative h-[350px]">
                            <img src="${getImg(0)}" class="w-64 md:w-80 h-auto aspect-square object-cover z-0 shadow-2xl hover:z-30 transition-all hover:scale-110" style="clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); background: #fff;">
                            <img src="${getImg(1)}" class="w-72 md:w-[350px] h-auto aspect-square object-cover z-10 shadow-2xl hover:z-30 transition-all hover:scale-110" style="clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); background: #fff;">
                            <img src="${getImg(2)}" class="w-64 md:w-80 h-auto aspect-square object-cover z-0 shadow-2xl hover:z-30 transition-all hover:scale-110" style="clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); background: #fff;">
                        </div>
                    </div>
                </div>`;
            break;
        }
        case 'glass_cards_row': {
            htmlOut = `
                <div class="w-full py-32 px-4 relative overflow-hidden ${isPreview ? 'pointer-events-none' : ''}" style="background-color: ${bg !== '#ffffff' && bg !== '#FFFFFF'? bg : '#1e293b'}; ${animStyle}" ${previewId} ${aosAttr}>
                    <!-- Animated Gradient BG -->
                    <div class="absolute inset-0 bg-gradient-to-r from-blue-600 via-pink-600 to-amber-500 opacity-40 blur-3xl rounded-[100%] scale-150 animate-pulse"></div>
                    
                    <div class="max-w-7xl mx-auto relative z-10">
                        <div class="text-center text-white mb-20">
                            <div class="mb-6 drop-shadow">${titleTag}</div>
                            <div class="prose prose-xl prose-invert mx-auto editor-content shadow-lg p-6 rounded-3xl bg-black/20 backdrop-blur-sm border border-white/10 max-w-3xl">${htmlContent}</div>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                            ${[0,1,2].map(i => `
                            <div class="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-[2rem] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] hover:-translate-y-4 hover:bg-white/15 transition-all duration-500 cursor-pointer group">
                                <div class="w-full aspect-square rounded-[1.5rem] overflow-hidden mb-6 relative">
                                    <div class="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-all z-10"></div>
                                    <img src="${getImg(i)}" class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700">
                                </div>
                                <h4 class="text-xl font-bold text-white mb-2 ml-2">Destacado ${i+1}</h4>
                                <div class="w-12 h-1 bg-gradient-to-r from-white to-transparent ml-2 rounded-full"></div>
                            </div>
                            `).join('')}
                        </div>
                    </div>
                </div>`;
            break;
        }
        case 'floating_bubbles': {
            htmlOut = `
                <div class="w-full py-32 px-4 relative overflow-hidden ${isPreview ? 'pointer-events-none' : ''}" style="background-color: ${bg !== '#ffffff' && bg !== '#FFFFFF'? bg : '#eff6ff'}; ${animStyle}" ${previewId} ${aosAttr}>
                    <div class="max-w-5xl mx-auto text-center relative z-20 bg-white/50 backdrop-blur-md p-12 rounded-[3rem] shadow-xl border border-white">
                        <div class="mb-4">${titleTag}</div>
                        <div class="prose prose-lg mx-auto editor-content text-slate-700">${htmlContent}</div>
                    </div>
                    
                    <div class="absolute inset-0 z-0 pointer-events-none">
                        <div class="absolute top-10 left-10 w-48 h-48 rounded-full overflow-hidden shadow-2xl border-4 border-white animate-bounce" style="animation-duration: 4s;"><img src="${getImg(0)}" class="w-full h-full object-cover"></div>
                        <div class="absolute bottom-20 left-1/4 w-32 h-32 rounded-full overflow-hidden shadow-xl border-4 border-white animate-bounce" style="animation-duration: 5s; animation-delay: 1s;"><img src="${getImg(1)}" class="w-full h-full object-cover"></div>
                        <div class="absolute top-32 right-20 w-56 h-56 rounded-full overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.2)] border-8 border-white animate-bounce" style="animation-duration: 6s; animation-delay: 2s;"><img src="${getImg(2)}" class="w-full h-full object-cover filter contrast-125"></div>
                        <div class="absolute bottom-10 right-1/4 w-40 h-40 rounded-full overflow-hidden shadow-2xl border-4 border-white animate-bounce" style="animation-duration: 4.5s; animation-delay: 1.5s;"><img src="${getImg(3)}" class="w-full h-full object-cover"></div>
                    </div>
                </div>`;
            break;
        }
        case 'marquee_scroll': {
             htmlOut = `
                <div class="w-full py-16 px-0 relative overflow-hidden flex flex-col justify-center ${isPreview ? 'pointer-events-none' : ''}" style="background-color: ${bg}; border-top: 4px solid #000; border-bottom: 4px solid #000; ${animStyle}" ${previewId} ${aosAttr}>
                    <div class="text-center px-4 mb-8">${titleTag}</div>
                    <div class="w-[200vw] text-3xl md:text-5xl font-black uppercase text-slate-800 tracking-widest whitespace-nowrap overflow-hidden py-4 border-y border-black/10 relative">
                        <div class="inline-block animate-[scrollMarquee_15s_linear_infinite]" style="animation: scrollMarquee 15s linear infinite;">
                            <span class="mx-8">${htmlContent.replace(/<[^>]*>?/gm, '')}</span> <i class="fas fa-star text-brand text-2xl mx-4"></i>
                            <span class="mx-8">${htmlContent.replace(/<[^>]*>?/gm, '')}</span> <i class="fas fa-star text-brand text-2xl mx-4"></i>
                            <span class="mx-8">${htmlContent.replace(/<[^>]*>?/gm, '')}</span> <i class="fas fa-star text-brand text-2xl mx-4"></i>
                            <span class="mx-8">${htmlContent.replace(/<[^>]*>?/gm, '')}</span> <i class="fas fa-star text-brand text-2xl mx-4"></i>
                        </div>
                    </div>
                    <style>@keyframes scrollMarquee { 0% { transform: translate3d(0,0,0); } 100% { transform: translate3d(-50%,0,0); } }</style>
                </div>`;
            break;
        }
        case 'split_screen_sticky': {
             htmlOut = `
                <div class="w-full relative flex flex-col lg:flex-row ${isPreview ? 'pointer-events-none h-[600px] overflow-hidden' : ''}" style="background-color: ${bg}; ${animStyle}" ${previewId} ${aosAttr}>
                    <div class="w-full lg:w-1/2 lg:sticky top-0 h-[60vh] lg:h-screen">
                        <img src="${getImg(0)}" class="w-full h-full object-cover object-center filter saturate-150">
                    </div>
                    <div class="w-full lg:w-1/2 p-12 lg:p-32 flex flex-col justify-center min-h-screen">
                        ${titleTag}
                        <div class="prose prose-xl font-serif text-slate-600 editor-content leading-loose">${htmlContent}</div>
                        ${!isPreview ? `<div class="prose prose-xl font-serif text-slate-600 editor-content leading-loose opacity-50 blur-[2px] mt-20">Este texto fluiría más abajo en una implementación larga. Continúa bajando para explorar el resto de la página.</div>` : ''}
                    </div>
                </div>`;
            break;
        }
        case 'instagram_post': {
            htmlOut = `
                <div class="w-full py-24 px-4 relative ${isPreview ? 'pointer-events-none' : ''}" style="background-color: ${bg}; ${animStyle}" ${previewId} ${aosAttr}>
                    <div class="max-w-xl mx-auto bg-white border border-slate-200 rounded-lg shadow-md overflow-hidden font-sans">
                        <!-- IG Header -->
                        <div class="flex items-center justify-between p-4 border-b border-slate-100">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-[2px]">
                                    <div class="w-full h-full bg-white rounded-full flex items-center justify-center p-[2px]"><img src="https://placehold.co/100x100/logo/png" class="w-full h-full rounded-full object-cover"></div>
                                </div>
                                <div><div class="font-bold text-sm tracking-tight leading-none">${titleTag}</div><p class="text-xs text-slate-400">Patrocinado</p></div>
                            </div>
                            <i class="fas fa-ellipsis-h text-slate-400 cursor-pointer"></i>
                        </div>
                        <!-- IG Photo -->
                        <div class="w-full aspect-square bg-slate-100">
                            <img src="${getImg(0)}" class="w-full h-full object-cover">
                        </div>
                        <!-- IG Actions -->
                        <div class="p-4">
                            <div class="flex justify-between items-center mb-4">
                                <div class="flex gap-4 text-2xl text-slate-800">
                                    <i class="far fa-heart hover:text-red-500 cursor-pointer transition-colors"></i>
                                    <i class="far fa-comment cursor-pointer"></i>
                                    <i class="far fa-paper-plane cursor-pointer"></i>
                                </div>
                                <i class="far fa-bookmark text-2xl cursor-pointer"></i>
                            </div>
                            <p class="font-bold text-sm mb-2">1,204 Me gusta</p>
                            <p class="text-sm">
                                <span class="font-bold mr-2">Publicación</span>
                                <span class="editor-content inline">${htmlContent.replace(/<p>/g, '').replace(/<\/p>/g, '<br>')}</span>
                            </p>
                            <p class="text-slate-400 text-xs mt-3 uppercase">Ver traducción</p>
                        </div>
                    </div>
                </div>`;
            break;
        }
        default:
            htmlOut = `<div class="p-8 bg-red-100 text-red-600 font-bold border-2 border-red-500 rounded-xl text-center">Plantilla desconocida: ${templateStr}</div>`;
    }

    return htmlOut;
}
