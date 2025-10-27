// ==================================================
// DEXI’S NAILS – Funcionalidades Globales
// ==================================================

document.addEventListener('DOMContentLoaded', function () {

  // 1. Alternar modo claro/oscuro
  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  };

  // Cargar tema guardado
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  }

  // 2. Menú móvil (si usas el ícono de menú)
  const mobileMenuButton = document.querySelector('.mobile-menu-button');
  const mobileMenu = document.querySelector('.mobile-menu');

  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  // 3. Cerrar menú al hacer clic fuera (opcional)
  document.addEventListener('click', (e) => {
    if (mobileMenu && !mobileMenu.contains(e.target) && !mobileMenuButton?.contains(e.target)) {
      mobileMenu.classList.add('hidden');
    }
  });

  // 4. Filtros de galería o blog (consola por ahora)
  const filterButtons = document.querySelectorAll('[name="gallery-filter"]');
  if (filterButtons.length > 0) {
    filterButtons.forEach(button => {
      button.addEventListener('change', (e) => {
        console.log('Filtro seleccionado:', e.target.value);
        // Aquí iría la lógica para filtrar tarjetas
      });
    });
  }

  // 5. Smooth scroll a secciones (ej: "Reservar Cita")
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // 6. Formulario básico: prevenir envío vacío (opcional)
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', function (e) {
      const inputs = form.querySelectorAll('input, textarea');
      let isEmpty = false;
      inputs.forEach(input => {
        if (!input.value.trim()) isEmpty = true;
      });
      if (isEmpty) {
        e.preventDefault();
        alert('Por favor, completa todos los campos.');
      }
    });
  });

});