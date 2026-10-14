/* =====================================================================
   CÓDIGO COMPARTIDO DE LOS CATÁLOGOS
   Lo usan catalogo-arte.html y catalogo-ebanisteria.html.
   Requiere js/datos.js cargado antes.
   ===================================================================== */

// Ficha de una obra dentro de una página de colección (respeta el formato de la foto)
function fichaObra(o, i) {
  const nota = o.categoria === 'ebanisteria'
    ? 'Pieza a la medida · Cotización sin compromiso'
    : esVendida(o) ? 'Colección privada · Se aceptan encargos similares'
    : /^no$/i.test(o.disponible || '') ? 'Obra de exposición · Se aceptan encargos similares' : 'Precio a consultar · Incluye certificado de autenticidad';
  return `<div>
    <div class="flex h-[60mm] items-end"><div class="marco" style="padding: clamp(6px, 1vw, 12px)"><div class="paspartu" style="padding: clamp(3px, .6vw, 6px)"><div class="lienzo" style="height:48mm;max-width:74mm">
      <img src="${esc(fotoObra(o))}" alt="${esc(o.titulo)}" onerror="imgFallback(this)" style="width:auto;max-width:74mm;height:48mm;object-fit:cover"></div></div></div></div>
    <p class="serif mt-[3.5mm]" style="font-size:14pt!important;font-weight:600;line-height:1.15"><span class="mr-[2mm] italic" style="font-weight:400;color:#B8914F">${['I', 'II', 'III', 'IV'][i]}</span>${esc(o.titulo)}</p>
    <p class="mb-[1.5mm] mt-[1mm]" style="font-size:7.5pt!important;color:#6F6258;line-height:1.4">${esc([o.tecnica, o.medidas, o.anio].filter(Boolean).join(' · '))}<br>${nota}</p>
    ${o.concepto ? `<p class="serif italic" style="font-size:9.5pt!important;line-height:1.3;color:#3b2f26">${esc(o.concepto)}</p>` : ''}
  </div>`;
}

// Páginas de colección: 4 obras por página
function paginasColeccion(contenedor, obras, { titulo = 'Colección', texto = '', pie = '' } = {}) {
  const grupos = []; for (let i = 0; i < obras.length; i += 4) grupos.push(obras.slice(i, i + 4));
  document.getElementById(contenedor).innerHTML = grupos.map((g, n) => `
    <section class="hoja" style="background:#F6F2EA">
      <div class="px-[18mm] pt-[18mm]">
        <div class="mb-[6mm] flex items-end justify-between gap-[10mm]">
          <h2 class="serif whitespace-nowrap" style="font-size:30pt;font-weight:500">${titulo}${grupos.length > 1 ? ` <span class="italic" style="color:#B8914F">${n + 1}</span>` : ''}</h2>
          <p style="font-size:8.4pt!important;max-width:86mm;color:#6F6258;line-height:1.4">${texto}</p>
        </div>
        <div class="grid grid-cols-2 gap-x-[12mm] gap-y-[5mm]">${g.map(fichaObra).join('')}</div>
      </div>
      <p class="absolute inset-x-[18mm] bottom-[18mm] border-t border-tinta/20 pt-[3mm]" style="font-size:8pt!important;color:#6F6258">${pie}</p>
      <div class="folio"><span>${titulo}</span><span class="n"></span></div>
    </section>`).join('');
}

// Tarjetas de servicios (título + texto) en columnas
function tarjetasServicio(lista, { color = '#B8914F', texto = '' } = {}) {
  return lista.map(([t, d]) => `
    <div class="border-t-[.4mm] pt-[3mm]" style="border-color:${color}">
      <h3 class="serif mb-[2mm]" style="font-size:14pt;font-weight:600">${t}</h3>
      <p style="font-size:8.3pt!important;line-height:1.5${texto ? ';color:' + texto : ''}">${d}</p>
    </div>`).join('');
}

// Contadores automáticos: cualquier elemento con data-n="exposicion" muestra cuántas hay
function contadores() {
  document.querySelectorAll('[data-n]').forEach(el => el.textContent = TRAYECTORIA.filter(t => t.tipo === el.dataset.n).length);
}

function numerarPaginas() {
  document.querySelectorAll('.hoja').forEach((h, i) => { const n = h.querySelector('.folio .n'); if (n) n.textContent = i + 1; });
}

// En celulares, las hojas A4 se reducen para caber en la pantalla
function ajustarEscala() {
  const z = Math.min(1, (window.innerWidth - 24) / 794);
  document.querySelectorAll('.hoja').forEach(h => h.style.zoom = z);
}

// Arranque común: pinta con los datos de respaldo, luego con la hoja de Google si existe
function iniciarCatalogo(pintar) {
  aplicarEnlacesComunes();
  cargarDatos(() => { pintar(); contadores(); numerarPaginas(); ajustarEscala(); });
  addEventListener('resize', ajustarEscala);
  // Al imprimir se quita la reducción para que salga en tamaño real
  addEventListener('beforeprint', () => document.querySelectorAll('.hoja').forEach(h => h.style.zoom = 1));
  addEventListener('afterprint', ajustarEscala);
}
