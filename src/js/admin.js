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
        }
    });

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn?.addEventListener('click', async () => {
        await supabase.auth.signOut();
        window.location.href = './login.html';
    });
}
