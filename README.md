# B&H Préstamos 💰

Modernización de la plataforma de **B&H Préstamos en General**, desarrollada con un enfoque en rendimiento, diseño moderno y capacidad de aplicación web progresiva (PWA).

## 🚀 Tecnologías Principales

- **Frontend:** HTML5, JavaScript (ES6+), Vanilla CSS.
- **Estilos:** [Tailwind CSS v4](https://tailwindcss.com/) para un diseño rápido y responsivo.
- **Build Tool:** [Vite](https://vitejs.dev/) para una experiencia de desarrollo ultrarrápida.
- **Backend:** [Supabase](https://supabase.com/) para la gestión de base de datos y contenido dinámico.
- **PWA:** [Vite PWA Plugin](https://vite-pwa-org.netlify.app/) para soporte fuera de línea e instalación en dispositivos.

## 📋 Requisitos Previos

Asegúrate de tener instalado:
- **Node.js** (Versión 18 o superior, se recomienda v22).
- **npm** (incluido con Node.js).

## 🛠️ Instalación y Configuración

1.  **Clonar el repositorio** (si aplica):
    ```bash
    git clone https://github.com/prestamo/Pagina-H-B-prestamos.git
    cd Pagina-H-B-prestamos-1
    ```

2.  **Instalar dependencias**:
    ```bash
    npm install
    ```

## 💻 Ejecución en Desarrollo

Para iniciar el servidor de desarrollo local con recarga en caliente:

```bash
npm run dev
```

El sitio estará disponible por defecto en `http://localhost:5173`.

## 📦 Construcción para Producción

Para generar los archivos optimizados para producción en la carpeta `/dist`:

```bash
npm run build
```

Para previsualizar la construcción localmente:

```bash
npm run preview
```

## 🔐 Administración y Contenido

El proyecto cuenta con una sección de administración para gestionar banners, imágenes del carrusel y promociones:

- **Ruta:** `/admin/login.html` (o directamente `/admin/` si estás usando el servidor de producción).
- **Backend:** Los datos se sincronizan con Supabase. La configuración de conexión se encuentra en `src/js/supabase.js`.

## 🌐 Despliegue

Este proyecto está configurado para desplegarse fácilmente en **Netlify**. El archivo `netlify.toml` ya contiene las reglas de redirección necesarias para el correcto funcionamiento de las rutas y la administración.

---
*Desarrollado con ❤️ para B&H Préstamos.*
