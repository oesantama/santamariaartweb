/* =====================================================================
   CONTENIDO CENTRAL DEL SITIO
   ---------------------------------------------------------------------
   Alimenta todas las páginas, separadas por oficio:
     index.html                      → museo virtual 3D (la casa, piso 1 pintor, piso 2 ebanista)
     sitio.html                      → versión clásica: secciones El pintor / El ebanista
     catalogo-arte.html              → catálogo del pintor
     catalogo-ebanisteria.html       → catálogo del ebanista
     hoja-de-vida-artista.html       → hoja de vida como pintor
     hoja-de-vida-ebanista.html      → hoja de vida como ebanista

   Hay dos formas de actualizar:
   A) RÁPIDA: hoja de Google con 2 pestañas publicadas como CSV
        obras        → titulo | categoria | tecnica | medidas | anio | imagen | disponible | destacada | concepto
        trayectoria  → area | anio | tipo | titulo | lugar | detalle | certificado
      Pegue los enlaces CSV en CONFIG.hojaObras y CONFIG.hojaTrayectoria.
   B) MANUAL: editar los arreglos OBRAS y TRAYECTORIA de este archivo
      (también son el respaldo si la hoja no está configurada).

   La columna "area" decide en qué oficio aparece cada hito:
     arte   → pintor        madera → ebanista        ambas → en los dos

   Fuentes: Media Kit 2019 del artista, certificados originales (2018–2021)
   y publicaciones de sus redes sociales.
   ===================================================================== */

const CONFIG = {
  hojaObras: '',        // enlace CSV de la pestaña "obras"
  hojaTrayectoria: '',  // enlace CSV de la pestaña "trayectoria"

  whatsapp: '573208296045',
  whatsapp2: '573173935276',
  correo: 'santamaria.art1@gmail.com',
  facebook: 'https://www.facebook.com/santamaria.art',
  instagram: 'https://www.instagram.com/santamaria_art',

  // Autorretrato "Soy yo y qué…" (se puede cambiar por una foto del maestro pintando)
  retrato: 'img/obras/soy-yo-y-que.jpg',
  // REEMPLAZAR por una foto del maestro en el taller de madera cuando la tengan (vacío = textura de madera)
  retratoEbanista: '',
  // REEMPLAZAR por una foto del maestro enseñando cuando la tengan
  fotoTaller: 'img/obras/la-antigua-finca.jpg',
  // Obra de la portada del catálogo de arte (formato horizontal)
  portadaCatalogo: 'img/obras/cuadrilleros.jpg'
};

/* Perfil por oficio. Lo usan la página, los catálogos y las hojas de vida. */
const PERFIL = {
  nombre: 'Edgar Santamaría Caleño',
  origen: 'San Martín de los Llanos, Meta (1970)',
  ubicacion: 'Meta, Colombia',
  arte: {
    rol: 'Artista plástico',
    subtitulo: 'Pintor · Retrato, paisaje y folclor llanero',
    resumen: 'Pintor colombiano nacido en San Martín de los Llanos, Meta. Su obra une el realismo, sobre todo en la mirada de sus personajes, con una técnica libre de empastes vibrantes aplicados en capas de color. Pinta el folclor, la cultura y la gente del Llano, retratos y paisajes urbanos de Nueva York, donde expuso y recibió reconocimientos entre 2018 y 2021.',
    empirico: 'Pintor empírico: su escuela fue el taller, y sus influencias, el realismo y luego el impresionismo.',
    tecnicas: ['Óleo sobre lienzo', 'Acrílico sobre lienzo', 'Empaste con espátula', 'Carbón sobre papel', 'Pastel sobre papel', 'Retrato realista', 'Paisaje', 'Folclor llanero'],
    servicios: ['Obra original disponible', 'Retratos y obras por encargo', 'Envíos internacionales asegurados', 'Certificado de autenticidad', 'Talleres de pintura y dibujo']
  },
  madera: {
    rol: 'Ebanista y carpintero',
    subtitulo: 'Maestro ebanista · Muebles, puertas y enmarcado de autor',
    resumen: 'Ebanista y carpintero formado en el taller familiar en San Martín de los Llanos. Durante trece años fundó y dirigió su propia fábrica de muebles, que surtió al departamento del Meta. Hoy diseña y construye a la medida muebles, puertas, closets, cocinas, marcos y bastidores, con ensambles tradicionales y acabados hechos a mano.',
    empirico: 'Aprendió la carpintería en su familia y la perfeccionó al frente de su propia empresa: su escuela fue el taller.',
    tecnicas: ['Diseño de muebles a medida', 'Talla en madera', 'Ensambles tradicionales', 'Selección y secado de maderas', 'Acabados a mano', 'Puertas y portones', 'Closets y cocinas', 'Restauración de muebles', 'Marcos y molduras', 'Bastidores estructurales', 'Dirección de taller y producción'],
    servicios: ['Muebles a medida', 'Puertas, portones y ventanería', 'Closets, cocinas y carpintería integral', 'Restauración de muebles', 'Marcos de autor y bastidores', 'Talleres de ebanistería']
  }
};

/* Servicios de cada oficio (tarjetas de la página y del catálogo) */
const SERVICIOS = {
  arte: [
    ['Obra original', 'Pinturas firmadas y listas para colgar, con bastidor y marco hechos por el mismo autor.'],
    ['Retratos por encargo', 'Retratos realistas, paisajes y escenas a partir de sus recuerdos o fotografías, en óleo, acrílico, carbón o pastel.'],
    ['Envíos mundiales asegurados', 'Tubo rígido para lienzos o caja de madera reforzada bajo norma NIMF 15, con seguimiento y certificado de autenticidad.']
  ],
  maderaArte: [
    ['Marcos de autor', 'Diseñados en diálogo con cada obra. Talla, ensamble y acabado a mano, con ceras, pátinas, dorados o maderas al natural.'],
    ['Molduras personalizadas', 'Perfiles a medida para obra gráfica, fotografía y espejos. Réplica, restauración o reinterpretación de molduras clásicas.'],
    ['Bastidores indeformables', 'Madera seca, ensambles de precisión, travesaños y cuñas de retensado. No se alabean, incluso en clima tropical.']
  ],
  maderaHogar: [
    ['Muebles a medida', 'Mesas, comedores, bibliotecas, aparadores y piezas únicas pensadas para su espacio y hechas para durar generaciones.'],
    ['Puertas y portones', 'Puertas principales e interiores, portones y ventanería en madera maciza, con tallas o líneas contemporáneas.'],
    ['Carpintería integral', 'Closets, cocinas, escaleras, pasamanos y revestimientos, además de la restauración de muebles antiguos.']
  ]
};

/* Obras.
   categoria: pintura | dibujo | ebanisteria
   disponible: si | no        destacada: si → aparece en el catálogo (4 por página)
   imagen: ruta dentro de /img/obras, enlace de Google Drive o vacío (muestra un marcador)
   Técnica y medidas marcadas "por confirmar" deben validarse con el maestro. */
let OBRAS = [
  { titulo: 'Reserva guadual', categoria: 'pintura', tecnica: 'Óleo sobre lienzo, empaste', medidas: '', anio: '2018', disponible: 'si', destacada: 'si',
    concepto: 'Nuestro planeta es el reflejo de cómo queremos ver nuestros paisajes: abundante verde, burbujas de buenos sentimientos y color alegría.',
    imagen: 'img/obras/reserva-guadual.jpg' },
  { titulo: 'Cuadrilleros', categoria: 'pintura', tecnica: 'Óleo sobre lienzo', medidas: '', anio: '', disponible: 'si', destacada: 'si',
    concepto: 'Las cuadrillas de San Martín son la esencia de la raza llanera: cuarenta y ocho jinetes que conmemoran nuestra herencia.',
    imagen: 'img/obras/cuadrilleros.jpg' },
  { titulo: 'Shakira', categoria: 'pintura', tecnica: 'Óleo sobre lienzo, empaste', medidas: '', anio: '2018', disponible: 'no', destacada: 'si',
    concepto: 'Obra reconocida en los Premios Talentos Latinos 2018 de Colombia. Un homenaje a quien representa al país en el mundo.',
    imagen: 'img/obras/shakira.jpg' },
  { titulo: 'Vientos de Rockaway', categoria: 'pintura', tecnica: 'Óleo sobre lienzo, empaste', medidas: '', anio: '2018', disponible: 'si', destacada: 'si',
    concepto: 'Si los buenos pensamientos no fluyen, basta con mirar el panorama y escuchar lo que las olas traen a la playa.',
    imagen: 'img/obras/vientos-de-rockaway.jpg' },
  { titulo: 'Contemplando a Manhattan', categoria: 'pintura', tecnica: 'Óleo sobre lienzo', medidas: '', anio: '', disponible: 'si', destacada: 'si',
    concepto: 'No importa qué tan rápido o qué tan lento se avance: lo importante es seguir hacia adelante.',
    imagen: 'img/obras/contemplando-a-manhattan.jpg' },
  { titulo: 'La antigua finca', categoria: 'pintura', tecnica: 'Óleo sobre lienzo', medidas: '', anio: '', disponible: 'si', destacada: 'si',
    concepto: 'Nuestros ancestros respiraban el verde de los campos, sin horario ni límites, entre árboles, jardines y el canto de las aves.',
    imagen: 'img/obras/la-antigua-finca.jpg' },
  { titulo: 'Primavera en Forest Park', categoria: 'pintura', tecnica: 'Óleo sobre lienzo', medidas: '', anio: '', disponible: 'si', destacada: 'si',
    concepto: 'La primavera en Queens: una razón más para pintar y para sonreír.',
    imagen: 'img/obras/primavera-en-forest-park.jpg' },
  { titulo: 'Mi Daniel', categoria: 'pintura', tecnica: 'Óleo sobre lienzo', medidas: '', anio: '', disponible: 'no', destacada: 'si',
    concepto: 'Retrato de su hijo mirando por la ventana en otoño, cuando cada hoja parece convertirse en flor.',
    imagen: 'img/obras/mi-daniel.jpg' },
  { titulo: 'Flatiron', categoria: 'pintura', tecnica: 'Óleo sobre lienzo', medidas: '', anio: '', disponible: 'si', destacada: 'no',
    concepto: 'La salida del sol sobre Nueva York como la primera bendición del día.',
    imagen: 'img/obras/flatiron.jpg' },
  { titulo: 'Amado Mora', categoria: 'pintura', tecnica: 'Óleo sobre lienzo, empaste', medidas: '', anio: '', disponible: 'no', destacada: 'no',
    concepto: 'Retrato del artista y curador Félix Amado Mora, encontrado en pleno corazón de Manhattan.',
    imagen: 'img/obras/amado-mora.jpg' },
  { titulo: 'Primero mi felicidad', categoria: 'pintura', tecnica: 'Óleo sobre lienzo, empaste', medidas: '', anio: '2017', disponible: 'si', destacada: 'no',
    concepto: 'La felicidad es una realidad, y no hay que permitir que nos la arrebaten.',
    imagen: 'img/obras/primero-mi-felicidad.jpg' },
  { titulo: 'Soy yo y qué…', categoria: 'pintura', tecnica: 'Óleo sobre lienzo, empaste', medidas: '', anio: '2019', disponible: 'no', destacada: 'no',
    concepto: 'Autorretrato. Fiel a sí mismo, encontrando felicidad dondequiera que vaya.',
    imagen: 'img/obras/soy-yo-y-que.jpg' },
  { titulo: 'Solidaridad y bondad', categoria: 'pintura', tecnica: 'Óleo sobre lienzo', medidas: '91 × 122 cm (36 × 48 in)', anio: '', disponible: 'si', destacada: 'no',
    concepto: 'Obra presentada en la muestra Arte Joven de Colombia Fest.', imagen: '' },
  { titulo: 'Obra por encargo', categoria: 'dibujo', tecnica: 'Carbón y pastel sobre papel', medidas: '91 × 122 cm (36 × 48 in)', anio: '2024', disponible: 'no', destacada: 'no',
    concepto: 'Retrato de gran formato realizado por encargo y entregado personalmente a su destinataria.', imagen: '' },
  // Ebanistería: agregar fotos reales de marcos, muebles y puertas del taller
  { titulo: 'Marcos de autor', categoria: 'ebanisteria', tecnica: 'Talla a mano, acabado en cera', medidas: 'A medida', anio: '', disponible: 'si', destacada: 'no', concepto: '', imagen: '' },
  { titulo: 'Muebles a medida', categoria: 'ebanisteria', tecnica: 'Madera maciza, ensambles tradicionales', medidas: 'A medida', anio: '', disponible: 'si', destacada: 'no', concepto: '', imagen: '' },
  { titulo: 'Puertas y portones', categoria: 'ebanisteria', tecnica: 'Madera maciza, talla decorativa', medidas: 'A medida', anio: '', disponible: 'si', destacada: 'no', concepto: '', imagen: '' }
];

/* Trayectoria. tipo: experiencia | exposicion | reconocimiento | formacion | hito
   certificado: imagen(es) en /img/certificados, separadas por coma.
   area: arte | madera | ambas
   Los años de experiencia se calcularon con el Media Kit ("a sus 20 años", "12 años",
   "13 años"): confirmarlos con el maestro. */
let TRAYECTORIA = [
  // Formación y experiencia
  { area: 'arte', anio: 'Desde niño', tipo: 'formacion', titulo: 'Formación empírica en pintura', lugar: 'San Martín de los Llanos, Meta', detalle: 'En sus cuadernos de escuela degradaba colores y sombras para pintar los paisajes y personajes de su región, y moldeaba arcilla.' },
  { area: 'madera', anio: 'Desde niño', tipo: 'formacion', titulo: 'Formación empírica en carpintería y talla', lugar: 'San Martín de los Llanos, Meta', detalle: 'Aprendió el oficio en el taller familiar de carpintería y tallaba madera desde la escuela.' },
  { area: 'arte', anio: '1990 – 2002', tipo: 'experiencia', titulo: 'Pintor independiente', lugar: 'Bogotá', detalle: 'Doce años de trabajo pictórico continuo, abriéndose camino con coleccionistas y clientes de arte en la capital.' },
  { area: 'madera', anio: '2002 – 2015', tipo: 'experiencia', titulo: 'Fundador y director de una fábrica de muebles', lugar: 'San Martín de los Llanos, Meta', detalle: 'Diseño, fabricación y venta de muebles. Durante trece años su empresa surtió al departamento del Meta.' },
  { area: 'arte', anio: '2016 – 2021', tipo: 'experiencia', titulo: 'Artista plástico en Nueva York y Nueva Jersey', lugar: 'Estados Unidos', detalle: 'Exposiciones colectivas con el New Jersey Artist Collective, consulados y organizaciones culturales latinas; retratos y obra por encargo.' },
  { area: 'arte', anio: 'Actualidad', tipo: 'experiencia', titulo: 'Taller de pintura', lugar: 'Meta, Colombia', detalle: 'Obra original, retratos por encargo y talleres de pintura y dibujo.' },
  { area: 'madera', anio: 'Actualidad', tipo: 'experiencia', titulo: 'Taller de ebanistería y carpintería', lugar: 'Meta, Colombia', detalle: 'Muebles, puertas, closets y cocinas a la medida; marcos de autor, bastidores y restauración.' },
  { area: 'madera', anio: 'Desde sus inicios', tipo: 'experiencia', titulo: 'Marcos y bastidores para su propia obra', lugar: 'Colombia y Estados Unidos', detalle: 'Construye los soportes y marcos de sus pinturas, uniendo los dos oficios en cada pieza.' },

  // Exposiciones colectivas
  { area: 'arte', anio: '2018', tipo: 'exposicion', titulo: 'Cartas de Amor y Arte', lugar: 'Bethune Center, Jersey City, NJ · 20 de abril', detalle: 'Exposición de arte y literatura del New Jersey Artist Collective, La Magia de las Bellas Artes y la Fundación El Sol Sale para Todos.', certificado: 'img/certificados/cert-15.jpg' },
  { area: 'arte', anio: '2018', tipo: 'exposicion', titulo: 'Ecléctica', lugar: 'Mason Civic League, Hoboken, NJ · 7 al 20 de julio', detalle: 'Muestra colectiva curada por Amado Mora y Juan Ramiro Torres.', certificado: 'img/certificados/cert-17.jpg,img/certificados/cert-05.jpg' },
  { area: 'arte', anio: '2018', tipo: 'exposicion', titulo: 'Muestra de Arte en Rosado', lugar: 'Elizabeth, NJ · 13 de julio', detalle: 'Organizada por el Consulado de El Salvador para Nueva Jersey y Delaware y el New Jersey Artist Collective, por el Día de la Prevención contra el Cáncer.', certificado: 'img/certificados/cert-02.jpg' },
  { area: 'arte', anio: '2018', tipo: 'exposicion', titulo: 'Huellas Trashumantes · Exhibición Internacional de Arte', lugar: 'Nueva York · 18 al 24 de julio', detalle: 'Organizada por Arte al Paso Gallery con el apoyo del New Jersey Artist Collective y el Comisionado Dominicano de Cultura.', certificado: 'img/certificados/cert-18.jpg' },
  { area: 'arte', anio: '2018', tipo: 'exposicion', titulo: 'Celebración de la Herencia Hispana', lugar: 'Union County Performing Arts Center, Rahway, NJ · 23 de septiembre', detalle: 'Certificado de participación de la Junta de Freeholders del Condado de Union.', certificado: 'img/certificados/cert-01.jpg' },
  { area: 'arte', anio: '2018', tipo: 'exposicion', titulo: 'Black & White', lugar: 'AC-PIX Studio, Union City, NJ · 14 de diciembre', detalle: 'Su obra en carbón fue la imagen del afiche de la exposición.', certificado: 'img/certificados/cert-04.jpg,img/certificados/cert-03.jpg' },
  { area: 'arte', anio: '2019', tipo: 'exposicion', titulo: 'Muestra de Arte en Rosado', lugar: 'Queens, NY · 16 de febrero', detalle: 'Mujeres Exitosas NY, por el Día de la Prevención contra el Cáncer.', certificado: 'img/certificados/cert-26.jpg' },
  { area: 'arte', anio: '2019', tipo: 'exposicion', titulo: 'Día Internacional del Niño', lugar: 'Nueva York · 6 de abril', detalle: 'Diploma de agradecimiento del Comité Cívico Cultural Boliviano de Nueva York.', certificado: 'img/certificados/cert-27.jpg' },
  { area: 'arte', anio: '2019', tipo: 'exposicion', titulo: 'Celebrating International Day for the Children', lugar: 'The Latin American Institute · 28 de abril', detalle: 'Muestra de pintura, dibujo, escultura y fotografía curada por Amado Mora.', certificado: 'img/certificados/cert-06.jpg' },
  { area: 'arte', anio: '2019', tipo: 'exposicion', titulo: 'Exposición del Día de la Madre', lugar: 'Consulado del Ecuador en Queens, NY · 4 de mayo', detalle: 'Certificado de agradecimiento por su aporte cultural a la comunidad migrante.', certificado: 'img/certificados/cert-25.jpg' },
  { area: 'arte', anio: '2019', tipo: 'exposicion', titulo: 'Mujeres en el Poder', lugar: 'Manhattan, NY · 20 al 24 de agosto', detalle: 'Exhibición colectiva de la Asamblea Nacional del Ecuador en celebración de las mujeres que inspiran.', certificado: 'img/certificados/cert-29.jpg' },
  { area: 'arte', anio: '2019', tipo: 'exposicion', titulo: 'VIVA Bradley Beach!', lugar: 'Bradley Beach, NJ · 14 de septiembre', detalle: 'Certificado de participación de la Comisión de Turismo de Bradley Beach.', certificado: 'img/certificados/cert-14.jpg' },
  { area: 'arte', anio: '2019', tipo: 'exposicion', titulo: 'Arte en Rosado 2019', lugar: 'Nueva Jersey', detalle: 'Asociación Iberoamericana Unida USA, New Jersey Artist Collective, They Have a Name y F.A.I.T.H.', certificado: 'img/certificados/cert-13.jpg' },
  { area: 'arte', anio: '2019', tipo: 'exposicion', titulo: 'Black and White Art Expo', lugar: 'Hoboken, NJ · 29 de noviembre', detalle: 'New Jersey Artist Collective, They Have a Name y F.A.I.T.H.', certificado: 'img/certificados/cert-11.jpg' },
  { area: 'arte', anio: '2019', tipo: 'exposicion', titulo: 'To Sir, With Love Art Exp. 2019', lugar: 'Garfield, NJ · 30 de noviembre', detalle: 'Reconocimiento especial del Colectivo de Artistas de New Jersey.', certificado: 'img/certificados/cert-10.jpg' },
  { area: 'arte', anio: '2021', tipo: 'exposicion', titulo: 'Earth Day Art Expo 2021', lugar: 'Second Ave. Firehouse Gallery, Bay Shore, NY · 24 de abril', detalle: 'Certificado de reconocimiento del Teatro Experimental Yerbabruja.', certificado: 'img/certificados/cert-09.jpg' },
  { area: 'arte', anio: '2021', tipo: 'exposicion', titulo: 'Ever Green Art Expo 2021 · Artista destacado', lugar: 'PRONTO of Long Island, NY', detalle: 'Artista invitado del Lobby Art Show.', certificado: 'img/certificados/cert-08.jpg' },
  { area: 'arte', anio: '', tipo: 'exposicion', titulo: 'Arte Joven · Colombia Fest', lugar: 'V Feria de Servicios', detalle: 'Participó con la obra "Solidaridad y bondad", óleo sobre lienzo de 36 × 48 pulgadas.', certificado: 'img/certificados/cert-23.jpg' },

  // Premios y reconocimientos
  { area: 'arte', anio: '2018', tipo: 'reconocimiento', titulo: 'Premios Talentos Latinos 2018 de Colombia', lugar: 'Ciudad Latina FM', detalle: 'Reconocimiento a la obra "Shakira".', certificado: 'img/certificados/cert-20.jpg' },
  { area: 'arte', anio: '2018', tipo: 'reconocimiento', titulo: 'Premios Latinos del Mundo New York VIP 2018', lugar: 'Nueva York', detalle: 'Reconocimiento al Talento Colombiano, otorgado por Anafiestas Entertainment.', certificado: 'img/certificados/cert-21.jpg,img/certificados/cert-22.jpg' },
  { area: 'arte', anio: '2018', tipo: 'reconocimiento', titulo: 'Latino NY Awards', lugar: 'Nueva York', detalle: 'Reconocimiento "Artista en el Arte", Orgullo Hispano 2018.', certificado: 'img/certificados/cert-24.jpg' },
  { area: 'arte', anio: '2018', tipo: 'reconocimiento', titulo: 'Asamblea Nacional del Ecuador', lugar: 'Centro de Arte Julia de Burgos, Nueva York · 5 de septiembre', detalle: 'Reconocimiento al artista por su participación en la exhibición colectiva "Mujer: Inmigración y Progreso".', certificado: 'img/certificados/cert-19.jpg' },
  { area: 'arte', anio: '2019', tipo: 'reconocimiento', titulo: 'The Latin American Institute', lugar: 'Hackensack, NJ · 3 de mayo', detalle: 'Reconocimiento especial, con la curaduría de Amado Mora.', certificado: 'img/certificados/cert-07.jpg' },
  { area: 'arte', anio: '2019', tipo: 'reconocimiento', titulo: 'Certificado de apreciación', lugar: 'Nueva Jersey · 11 de noviembre', detalle: 'Por sus contribuciones a Clear Choices, New Jersey Artist Collective, They Have a Name, F.A.I.T.H. y Latin Project Foundations.', certificado: 'img/certificados/cert-12.jpg' },
  { area: 'arte', anio: '', tipo: 'reconocimiento', titulo: 'Consulado del Ecuador en Queens', lugar: 'Nueva York', detalle: 'Reconocimiento por su destacada trayectoria y desempeño artístico, enalteciendo la cultura en el exterior.', certificado: 'img/certificados/cert-16.jpg' },

  // Hitos recientes
  { area: 'arte', anio: '2024', tipo: 'hito', titulo: 'Retrato por encargo en carbón y pastel', lugar: 'Estados Unidos', detalle: 'Pieza de gran formato, 91 × 122 cm, entregada personalmente a su destinataria.' },
  { area: 'ambas', anio: 'Actualidad', tipo: 'hito', titulo: 'Regreso al Meta', lugar: 'Meta, Colombia', detalle: 'Pintura, ebanistería de autor y formación comunitaria desde su tierra natal.' }
];

const TIPOS = {
  experiencia: 'Experiencia', exposicion: 'Exposiciones colectivas', reconocimiento: 'Premios y reconocimientos',
  formacion: 'Formación', hito: 'Hitos recientes'
};
const CATEGORIAS = { pintura: 'Óleo y acrílico', dibujo: 'Carbón y pastel', ebanisteria: 'Ebanistería' };

/* ================= UTILIDADES ================= */

const esc = t => String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const esSi = v => /^(si|sí|x|1|true)$/i.test(String(v || '').trim());
const enlaceWA = (mensaje, numero = CONFIG.whatsapp) => `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;

// Convierte un enlace de Google Drive en uno que sirva para mostrar la imagen
function enlaceDrive(url) {
  const m = (url || '').match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?.*id=)([\w-]+)/);
  return m ? `https://drive.google.com/thumbnail?id=${m[1]}&sz=w1400` : url;
}

// Interpreta la categoría escrita en la hoja con cierta tolerancia
function normalizarCategoria(c) {
  c = (c || '').toLowerCase();
  if (/ebanist|marco|madera|mueble|puerta|bastidor|carpint/.test(c)) return 'ebanisteria';
  if (/carb|pastel|dibujo|papel/.test(c)) return 'dibujo';
  return 'pintura';
}

// Lector de CSV que respeta comillas y comas dentro de los textos
function leerCSV(texto) {
  const filas = []; let fila = [], campo = '', comillas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (comillas) {
      if (c === '"' && texto[i + 1] === '"') { campo += '"'; i++; }
      else if (c === '"') comillas = false;
      else campo += c;
    } else if (c === '"') comillas = true;
    else if (c === ',') { fila.push(campo); campo = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && texto[i + 1] === '\n') i++;
      fila.push(campo); filas.push(fila); fila = []; campo = '';
    } else campo += c;
  }
  if (campo || fila.length) { fila.push(campo); filas.push(fila); }
  const [enc, ...resto] = filas.filter(f => f.some(v => v.trim() !== ''));
  if (!enc) return [];
  const claves = enc.map(k => k.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
  return resto.map(f => Object.fromEntries(claves.map((k, i) => [k, (f[i] || '').trim()])));
}

async function cargarHoja(url) {
  if (!url) return null;
  try {
    const r = await fetch(url + (url.includes('?') ? '&' : '?') + 't=' + Date.now());
    if (!r.ok) throw new Error(r.status);
    return leerCSV(await r.text());
  } catch (e) { console.warn('No se pudo leer la hoja:', e); return null; }
}

/* Carga la hoja de Google (si está configurada) y llama a "alActualizar"
   con los datos. Primero se llama con los datos de respaldo, para que la
   página nunca aparezca vacía. */
async function cargarDatos(alActualizar) {
  alActualizar();
  const [obras, trayectoria] = await Promise.all([cargarHoja(CONFIG.hojaObras), cargarHoja(CONFIG.hojaTrayectoria)]);
  let cambio = false;
  if (obras && obras.length) {
    OBRAS = obras.filter(o => o.titulo).map(o => ({ ...o, categoria: normalizarCategoria(o.categoria) }));
    cambio = true;
  }
  if (trayectoria && trayectoria.length) {
    TRAYECTORIA = trayectoria.filter(t => t.titulo).map(t => ({ ...t, tipo: (t.tipo || 'hito').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''), area: normalizarArea(t.area) }));
    cambio = true;
  }
  if (cambio) alActualizar();
}

/* Enlaces comunes: WhatsApp, redes, correo y año del pie de página */
function aplicarEnlacesComunes() {
  document.querySelectorAll('[data-wa]').forEach(a => {
    a.href = enlaceWA(a.dataset.wa, a.dataset.waNum || CONFIG.whatsapp);
    a.target = '_blank'; a.rel = 'noopener';
  });
  document.querySelectorAll('[data-red]').forEach(a => {
    a.href = CONFIG[a.dataset.red]; a.target = '_blank'; a.rel = 'noopener';
  });
  document.querySelectorAll('[data-anio]').forEach(el => el.textContent = new Date().getFullYear());

  const btnTema = document.getElementById('btnTema');
  if (btnTema) btnTema.addEventListener('click', () => {
    const oscuro = document.documentElement.classList.toggle('dark');
    try { localStorage.setItem('tema', oscuro ? 'oscuro' : 'claro'); } catch (e) {}
  });
}

/* ================= AYUDAS PARA IMÁGENES Y TRAYECTORIA ================= */

// Oficio de cada hito: arte (pintor), madera (ebanista) o ambas
function normalizarArea(a) {
  a = String(a || '').toLowerCase();
  if (/amb|los dos|todo/.test(a)) return 'ambas';
  if (/mader|ebanist|carpint/.test(a)) return 'madera';
  return 'arte';
}
// Hitos de un oficio (incluye los marcados como "ambas")
const deArea = area => TRAYECTORIA.filter(t => (t.area || 'arte') === area || t.area === 'ambas');
// Obras de un oficio
const obrasDe = area => OBRAS.filter(o => area === 'madera' ? o.categoria === 'ebanisteria' : o.categoria !== 'ebanisteria');

// Marcador elegante para obras que aún no tienen fotografía
function marcadorObra(titulo) {
  const t = String(titulo || 'Fotografía próximamente').replace(/[<>&'"]/g, '');
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 1000'>
    <defs><linearGradient id='g' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#5a4535'/><stop offset='1' stop-color='#241A13'/></linearGradient></defs>
    <rect width='800' height='1000' fill='url(#g)'/>
    <text x='400' y='480' text-anchor='middle' font-family='Georgia' font-style='italic' font-size='40' fill='#D9BD86'>${t}</text>
    <text x='400' y='540' text-anchor='middle' font-family='Georgia' font-size='22' fill='#b3a58f'>Fotografía próximamente</text></svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
const fotoObra = o => o && o.imagen ? enlaceDrive(o.imagen) : marcadorObra(o && o.titulo);

// Lista de certificados de un hito (acepta varias rutas separadas por coma)
const certificadosDe = t => String(t.certificado || '').split(',').map(s => s.trim()).filter(Boolean).map(enlaceDrive);

// Año "ordenable": toma el primer número de 4 cifras; los textos sin año van al final
function anioNum(a) {
  const m = String(a || '').match(/\d{4}/);
  if (m) return +m[0];
  return /actual/i.test(a) ? 9999 : /niñ|inicio/i.test(a) ? 0 : 5000;
}
// Orden por año; los hitos sin año quedan siempre al final de la lista
const porAnio = (a, b, desc = false) => {
  const k = t => String(t.anio || '').trim() ? anioNum(t.anio) : (desc ? -1 : 99999);
  return desc ? k(b) - k(a) : k(a) - k(b);
};

/* Visor de certificados a pantalla completa (lo usan inicio y hoja de vida) */
function abrirVisor(fotos, inicio = 0, titulo = '') {
  let i = inicio;
  const v = document.createElement('div');
  v.setAttribute('role', 'dialog'); v.setAttribute('aria-modal', 'true'); v.setAttribute('aria-label', titulo || 'Certificado');
  v.style.cssText = 'position:fixed;inset:0;z-index:100;background:rgba(20,13,8,.92);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px';
  v.innerHTML = `
    <img style="max-width:100%;max-height:82vh;box-shadow:0 20px 60px rgba(0,0,0,.5);background:#fff" alt="">
    <p style="color:#EEE7DA;font-family:'Cormorant Garamond',serif;font-size:20px;margin-top:14px;text-align:center"></p>
    <div style="display:flex;gap:10px;margin-top:10px">
      <button data-a="-1" style="color:#EEE7DA;border:1px solid rgba(238,231,218,.4);border-radius:999px;padding:6px 16px">Anterior</button>
      <button data-a="0" style="color:#241A13;background:#EEE7DA;border-radius:999px;padding:6px 16px">Cerrar</button>
      <button data-a="1" style="color:#EEE7DA;border:1px solid rgba(238,231,218,.4);border-radius:999px;padding:6px 16px">Siguiente</button>
    </div>`;
  const img = v.querySelector('img'), cap = v.querySelector('p');
  const pintar = () => {
    const f = fotos[i]; img.src = f.src || f; cap.textContent = f.titulo || titulo;
    v.querySelectorAll('[data-a="-1"],[data-a="1"]').forEach(b => b.style.visibility = fotos.length > 1 ? 'visible' : 'hidden');
  };
  const cerrar = () => { v.remove(); document.removeEventListener('keydown', tecla); };
  const mover = d => { i = (i + d + fotos.length) % fotos.length; pintar(); };
  const tecla = e => { if (e.key === 'Escape') cerrar(); if (e.key === 'ArrowRight') mover(1); if (e.key === 'ArrowLeft') mover(-1); };
  v.addEventListener('click', e => {
    const a = e.target.closest('button')?.dataset.a;
    if (a === '0' || e.target === v) cerrar(); else if (a) mover(+a);
  });
  document.addEventListener('keydown', tecla);
  document.body.appendChild(v); pintar(); v.querySelector('[data-a="0"]').focus();
}
