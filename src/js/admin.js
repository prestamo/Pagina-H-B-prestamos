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

// Si estamos en la página del dashboard, verificar sesión al cargar
if (window.location.pathname.includes('admin/index.html')) {
    checkSession().then(session => {
        if (session) {
            document.getElementById('userEmail').textContent = session.user.email;
            loadAdminData();
        }
    });

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn?.addEventListener('click', async () => {
        await supabase.auth.signOut();
        window.location.href = './login.html';
    });

    // 1. Manejo de Banner
    const bannerForm = document.getElementById('bannerForm');
    bannerForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = document.getElementById('bannerText').value;
        const color = document.getElementById('bannerColor').value;
        const { error } = await supabase.from('banners').update({ text, bg_color: color }).eq('id', 'TU-ID-AQUÍ'); 
        // Nota: En una implementación real, buscarías el id activo o el único registro.
        // Simplificado:
        const { data: currentBanners } = await supabase.from('banners').select('id').limit(1);
        if (currentBanners && currentBanners.length > 0) {
            await supabase.from('banners').update({ text, bg_color: color }).eq('id', currentBanners[0].id);
            alert('Banner actualizado con éxito');
        } else {
             await supabase.from('banners').insert({ text, bg_color: color });
             alert('Banner creado con éxito');
        }
    });

    // 2. Manejo de Carrusel (Upload)
    const carouselForm = document.getElementById('carouselForm');
    carouselForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const file = document.getElementById('carouselInput').files[0];
        if (!file) return alert('Selecciona una imagen');

        const fileName = `${Date.now()}-${file.name}`;
        const { data, error } = await supabase.storage.from('carousel').upload(fileName, file);

        if (error) return alert('Error subiendo: ' + error.message);

        const { data: publicUrl } = supabase.storage.from('carousel').getPublicUrl(fileName);
        await supabase.from('carousel').insert({ image_url: publicUrl.publicUrl });
        
        alert('Imagen agregada al carrusel');
        loadAdminData(); // Recargar lista
    });

    // 3. Manejo de Promociones
    const promoForm = document.getElementById('promoForm');
    promoForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('promoTitle').value;
        const description = document.getElementById('promoDesc').value;
        
        const { error } = await supabase.from('promotions').insert({ title, description });
        if (error) return alert('Error: ' + error.message);
        
        alert('Promoción añadida');
        loadAdminData();
    });
}

async function loadAdminData() {
    const list = document.getElementById('carouselList');
    const pList = document.getElementById('promoList');
    if (!list) return;

    // Cargar Carrusel
    const { data: slides } = await supabase.from('carousel').select('*').order('created_at', { ascending: false });
    list.innerHTML = slides?.map(slide => `
        <div class="relative group aspect-video rounded-xl overflow-hidden shadow-md border border-slate-100">
            <img src="${slide.image_url}" class="w-full h-full object-cover">
            <button onclick="deleteSlide('${slide.id}', '${slide.image_url}')" class="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center shadow-lg">
                <i class="fas fa-trash-alt"></i>
            </button>
        </div>
    `).join('') || '<p class="text-xs text-slate-400">No hay imágenes</p>';

    // Cargar Promociones
    const { data: promos } = await supabase.from('promotions').select('*').order('created_at', { ascending: false });
    if (pList) {
        pList.innerHTML = promos?.map(promo => `
            <div class="bg-slate-50 p-6 rounded-2xl border border-slate-100 relative group">
                <h5 class="font-black text-slate-900 mb-1">${promo.title}</h5>
                <p class="text-sm text-slate-500">${promo.description}</p>
                <button onclick="deletePromo('${promo.id}')" class="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                    <i class="fas fa-times-circle"></i>
                </button>
            </div>
        `).join('') || '<p class="text-xs text-slate-400">No hay promociones</p>';
    }
}

// Globales para onclick
window.deletePromo = async (id) => {
    if (!confirm('¿Eliminar esta promoción?')) return;
    await supabase.from('promotions').delete().eq('id', id);
    loadAdminData();
};

window.deleteSlide = async (id, url) => {
    if (!confirm('¿Seguro que deseas eliminar esta imagen?')) return;
    
    // 1. Borrar de la tabla
    await supabase.from('carousel').delete().eq('id', id);
    
    // 2. Borrar del Storage (opcional pero recomendado)
    const path = url.split('/').pop();
    await supabase.storage.from('carousel').remove([path]);
    
    alert('Imagen eliminada');
    loadAdminData();
};
