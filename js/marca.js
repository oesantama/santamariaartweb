/* =====================================================================
   CONFIGURACIÓN VISUAL COMPARTIDA
   Se carga justo después de Tailwind en las tres páginas.
   ===================================================================== */

// Paleta y tipografías de la marca (las mismas del catálogo impreso)
tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        lino: '#EEE7DA', papel: '#F6F2EA', nogal: '#241A13', nogal2: '#30241B',
        oro: '#B8914F', oroclaro: '#D9BD86', moriche: '#33443A', arcilla: '#8E4F32',
        tinta: '#2E2621', gris: '#6F6258'
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Jost', 'system-ui', 'sans-serif']
      }
    }
  }
};

// Tema claro/oscuro guardado por el visitante (se aplica antes de pintar)
try {
  if (localStorage.getItem('tema') === 'oscuro' && !document.documentElement.dataset.soloClaro) {
    document.documentElement.classList.add('dark');
  }
} catch (e) {}

// Si una imagen no carga, se reemplaza por un marcador con el nombre de la obra
window.imgFallback = function (img) {
  img.onerror = null;
  const label = (img.getAttribute('alt') || 'Imagen').replace(/[<>&'"]/g, '');
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 1000'>
    <defs><linearGradient id='g' x1='0' y1='0' x2='0' y2='1'>
    <stop offset='0' stop-color='#5a4535'/><stop offset='1' stop-color='#241A13'/></linearGradient></defs>
    <rect width='800' height='1000' fill='url(#g)'/>
    <text x='400' y='500' text-anchor='middle' font-family='Georgia' font-style='italic' font-size='34' fill='#D9BD86'>${label}</text></svg>`;
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
};
