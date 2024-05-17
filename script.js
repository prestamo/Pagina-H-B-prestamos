// partes del menu
const menuBtn = document.getElementById('menuBtn');
const menu = document.querySelector('.menu');

menuBtn.addEventListener('click', () => {
    menu.classList.toggle('active');
});

window.onload = () => {
    const slides = document.querySelectorAll('.carousel-slide');
    let currentSlide = 0;

    function showSlide(slideIndex) {
        slides.forEach(slide => {
            slide.style.display = 'none';
        });
        slides[slideIndex].style.display = 'block';
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }

    showSlide(currentSlide);
    setInterval(nextSlide, 3000);
};
// pastes de la animacion del menu 
document.getElementById('menuBtn').addEventListener('click', function() {
    this.classList.toggle('open');
});

// Función para aplicar el efecto de zoom

document.addEventListener('DOMContentLoaded', function() {
    const slides = document.querySelectorAll('.carousel-slide');
    let currentSlide = 0;

    function applyZoom() {
        slides.forEach(slide => {
            slide.classList.add('zoomed');
        });
        setTimeout(() => {
            slides.forEach(slide => {
                slide.classList.remove('zoomed');
            });
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('zoomed');
        }, 5000); // Aplica el efecto de zoom cada 5 segundos (ajusta según sea necesario)
    }

    applyZoom();
});

  // Configuracion del boton subir 
  // Obtener el botón
  var mybutton = document.getElementById("myBtn");

  // Mostrar u ocultar el botón cuando se desplaza hacia abajo 20px desde la parte superior de la página
  window.onscroll = function() {scrollFunction()};

  function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
  mybutton.style.display = "block";
    } else {
     mybutton.style.display = "none";
    }
 }

   // Cuando se hace clic en el botón, volver al principio de la página
  function topFunction() {
   document.body.scrollTop = 0; // Para Safari
   document.documentElement.scrollTop = 0; // Para Chrome, Firefox, IE y Opera
  }
  // Función para validar el formulario antes de enviarlo
function validarFormulario() {
    var nombre = document.forms["contact"]["Nombre"].value;
    if (nombre == "") {
      alert("Por favor, ingrese su nombre");
      return false;
    }
    
    var correo = document.forms["contact"]["email"].value;
    if (correo == "") {
      alert("Por favor, ingrese su correo electrónico");
      return false;
    }
    
    // Agregar más validaciones según sea necesario
    
    return true; // Si todas las validaciones pasan, devuelve true y envía el formulario
  }


  // funcion para habilitar boton de enviar

  function habilitarBoton() {
    var botonEnviar = document.getElementById('botonEnviar');
    var aceptaTerminos = document.getElementById('small').checked;
    
    // Verificar si se aceptaron los términos y habilitar el botón
   
    if (aceptaTerminos) {
        botonEnviar.disabled = false;
        botonEnviar.style.backgroundColor = "rgba(0, 128, 0, 0.5)"; // Cambiar color a verde opaco
      } else {
        botonEnviar.disabled = true;
        botonEnviar.style.backgroundColor = "rgba(128, 128, 128, 0.5)"; // Cambiar color a gris opaco
      }
  }
   // Parte para cambiar el idioma de la pagina
   
   document.getElementById('language-select').addEventListener('change', function() {
    console.log("Cambio de idioma detectado");
    var lang = this.value;
    console.log("Valor seleccionado:", lang);
    var url;
   
    if (lang === 'en') {
      url = 'index_english.html'; // Página en english
  } else if (lang === 'es') {
      url = 'index.html'; // Página en español
  }
  if (lang === 'en1') {
    url = 'solicitud_english.html'; // Página en english
} else if (lang === 'es1') {
    url = 'solicitud_español.html'; // Página en español
}
if (lang === 'en2') {
  url = 'tipos_prestamos_english.html'; // Página en english
} else if (lang === 'es2') {
  url = 'tipos_prestamos.html'; // Página en español
}
if (lang === 'en3') {
  url = 'nosotros_english.html'; // Página en english
} else if (lang === 'es3') {
  url = 'nosotros.html'; // Página en español
}
    console.log("Redireccionando a:", url);
    window.location.href = url;
});

    // Redirecciona a la página deseada
function redirigir() {
  // Redirecciona a la página deseada
  window.location.href = 'solicitud_español.html';

}

  
 // Crea un mapa con Leaflet.js

 var map = L.map('map').setView([19.2208145, -70.5345771], 15);
 L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
   attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
 }).addTo(map);
 L.marker([19.2208145, -70.5345771]).addTo(map)
   .bindPopup('B&amp;H PRÉSTAMOS EN GENERAL')
   .openPopup();