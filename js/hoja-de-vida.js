/* =====================================================================
   HOJA DE VIDA · plantilla común para los dos oficios
   La página indica su oficio con <html data-area="arte"> o data-area="madera".
   Requiere js/datos.js cargado antes.
   ===================================================================== */

const AREA = document.documentElement.dataset.area || 'arte';

// Lo que cambia entre la hoja de vida del pintor y la del ebanista
const HV = {
  arte: {
    documento: 'Hoja de vida artística',
    tituloTecnicas: 'Técnicas',
    lema: 'Obra original, hecha a mano y firmada por su autor.',
    orden: ['experiencia', 'reconocimiento', 'exposicion', 'hito', 'formacion'],
    cifras: () => [['+40', 'años de oficio'], ['12', 'años pintando en Bogotá'],
      [cuenta('exposicion'), 'exposiciones colectivas'], [cuenta('reconocimiento'), 'premios y reconocimientos']]
  },
  madera: {
    documento: 'Hoja de vida como ebanista',
    tituloTecnicas: 'Competencias',
    lema: 'Muebles, puertas y marcos hechos a la medida.',
    orden: ['experiencia', 'hito', 'formacion'],
    cifras: () => [['13', 'años al frente de su fábrica de muebles'], [PERFIL.madera.servicios.length, 'líneas de trabajo a la medida']]
  }
};
const cuenta = tipo => deArea(AREA).filter(t => t.tipo === tipo).length;
let FOTOS = [];

function itemHV(t, tipo) {
  return `
    <li class="bloque grid gap-1 sm:grid-cols-[6.5rem_1fr] sm:gap-5">
      <span class="font-serif text-lg italic text-oro">${esc(t.anio)}</span>
      <div>
        <h3 class="font-serif text-xl font-semibold leading-snug">${esc(t.titulo)}</h3>
        ${t.lugar ? `<p class="text-sm text-gris">${esc(t.lugar)}</p>` : ''}
        ${t.detalle ? `<p class="${tipo === 'exposicion' ? 'det-expo ' : ''}mt-1 leading-relaxed text-tinta/85">${esc(t.detalle)}</p>` : ''}
        ${certificadosDe(t).length ? `<button data-cert="${esc(t.certificado)}" data-tit="${esc(t.titulo)}" class="no-imprimir mt-1 text-sm text-oro underline underline-offset-4">Ver certificado</button>` : ''}
      </div>
    </li>`;
}

function pintarHV() {
  const P = PERFIL[AREA], C = HV[AREA], hitos = deArea(AREA);

  document.getElementById('retrato').src = enlaceDrive(AREA === 'madera' && CONFIG.retratoEbanista ? CONFIG.retratoEbanista : CONFIG.retrato);
  document.getElementById('subtitulo').textContent = P.subtitulo;
  document.getElementById('origen').textContent = `Nacido en ${PERFIL.origen.replace(/ \(\d{4}\)/, '')} · ${AREA === 'arte' ? 'Trayectoria en Colombia y Estados Unidos' : 'Taller en el Meta, Colombia'}`;
  document.getElementById('resumen').textContent = P.resumen;
  document.getElementById('empirico').textContent = P.empirico;
  document.getElementById('tituloTecnicas').textContent = C.tituloTecnicas;
  document.getElementById('tecnicas').innerHTML = P.tecnicas.map(t => `<li class="rounded-full border border-oro/60 px-3 py-1">${esc(t)}</li>`).join('');
  document.getElementById('servicios').innerHTML = P.servicios.map(t => `<li>${esc(t)}</li>`).join('');
  document.getElementById('cifras').innerHTML = C.cifras().map(([n, t]) => `<div><dd class="font-serif text-3xl">${n}</dd><dt class="text-xs text-gris">${t}</dt></div>`).join('');
  document.getElementById('nombreDoc').textContent = C.documento;
  document.getElementById('lema').textContent = C.lema;

  // Secciones de trayectoria del oficio, lo más reciente primero
  let html = C.orden.map(tipo => {
    const items = hitos.filter(t => (t.tipo || 'hito') === tipo).sort((a, b) => porAnio(a, b, true));
    if (!items.length) return '';
    return `<section class="bloque"><h2 class="font-serif text-3xl">${TIPOS[tipo]}</h2>
      <ol class="mt-5 space-y-5">${items.map(t => itemHV(t, tipo)).join('')}</ol></section>`;
  }).join('');

  // En la hoja del ebanista, los servicios se describen en detalle
  if (AREA === 'madera') {
    const servicios = [...SERVICIOS.maderaHogar, ...SERVICIOS.maderaArte];
    const bloque = `<section class="bloque"><h2 class="font-serif text-3xl">Especialidades</h2>
      <div class="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2">${servicios.map(([t, d]) => `
        <div class="bloque border-t border-oro/50 pt-2"><h3 class="font-serif text-xl font-semibold">${t}</h3><p class="mt-1 leading-relaxed text-tinta/85">${d}</p></div>`).join('')}
      </div></section>`;
    // Va después de la experiencia
    const corte = html.indexOf('</section>') + '</section>'.length;
    html = html.slice(0, corte) + bloque + html.slice(corte);
  }
  document.getElementById('secciones').innerHTML = html;

  // Galería de certificados (solo si el oficio tiene)
  FOTOS = [...hitos].sort((a, b) => porAnio(a, b)).flatMap(t => certificadosDe(t).map(src => ({ src, titulo: [t.titulo, t.anio].filter(Boolean).join(' · ') })));
  document.getElementById('bloqueCert').classList.toggle('hidden', !FOTOS.length);
  document.getElementById('galeriaCert').innerHTML = FOTOS.map((f, i) => `
    <button data-foto="${i}" class="group overflow-hidden bg-papel text-left">
      <img src="${esc(f.src)}" alt="${esc(f.titulo)}" loading="lazy" class="aspect-[4/3] w-full object-cover transition group-hover:scale-105" />
      <span class="block p-2 text-xs leading-snug text-gris">${esc(f.titulo)}</span>
    </button>`).join('');

  document.getElementById('fecha').textContent = new Date().toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
}

document.addEventListener('click', e => {
  const c = e.target.closest('[data-cert]');
  if (c) return abrirVisor(certificadosDe({ certificado: c.dataset.cert }), 0, c.dataset.tit);
  const f = e.target.closest('[data-foto]');
  if (f) abrirVisor(FOTOS, +f.dataset.foto);
});

aplicarEnlacesComunes();
cargarDatos(pintarHV);
