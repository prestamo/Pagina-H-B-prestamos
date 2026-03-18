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

    // Chatbot Logic
    initBot();
});

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