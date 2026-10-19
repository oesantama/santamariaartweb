# Maestro Edgar Santamaría Caleño · Sitio web

Sitio oficial del pintor y ebanista Edgar Santamaría Caleño (San Martín de los Llanos, Meta).
El sitio separa sus dos oficios. Todo está hecho en código, sin archivos PDF subidos:

| Oficio | Página | Archivo |
|---|---|---|
| Los dos | **Casa-museo 3D** (página de inicio): la casa, el atril del autor, piso 1 pintor, piso 2 ebanista | `index.html` |
| Los dos | Versión clásica, con las secciones **El pintor** y **El ebanista** | `sitio.html` |
| Pintor | Catálogo de arte (A4, botón **Guardar como PDF**) | `catalogo-arte.html` |
| Pintor | Hoja de vida artística, con certificados | `hoja-de-vida-artista.html` |
| Ebanista | Catálogo de ebanistería (A4, botón **Guardar como PDF**) | `catalogo-ebanisteria.html` |
| Ebanista | Hoja de vida como ebanista | `hoja-de-vida-ebanista.html` |

## Estructura

```
santamaria-web/
├── index.html            ← casa-museo 3D
├── sitio.html            ← versión clásica
├── catalogo-arte.html · catalogo-ebanisteria.html
├── hoja-de-vida-artista.html · hoja-de-vida-ebanista.html
├── js/
│   ├── datos.js          ← TODO el contenido: perfiles, servicios, obras, trayectoria y contactos
│   ├── catalogo.js       ← código común de los dos catálogos
│   ├── hoja-de-vida.js   ← plantilla común de las dos hojas de vida
│   ├── museo.js          ← la casa-museo 3D: escena, recorrido y navegación
│   ├── vendor/three.min.js ← motor 3D Three.js r149 (licencia MIT)
│   └── marca.js          ← colores y tipografías de la marca
├── css/                  ← marca.css, catalogo.css, hoja-de-vida.css, museo.css
├── img/
│   ├── obras/            ← obras de la exposición y del taller (con su versión liviana en obras/mini/)
│   ├── vendidas/         ← obras vendidas, colección privada (con vendidas/mini/)
│   ├── certificados/     ← fotos de los certificados y premios
│   └── marca/            ← firma del maestro y código QR de WhatsApp
├── originales/           ← fotos originales de WhatsApp y el script que las mejora (no se publica)
└── contenido/            ← plantilla de Excel para Google Sheets (opcional, no se publica)
```

## Cómo actualizar el contenido

**Agregar una obra**
1. Prepare la foto (ver *Mejorar fotos nuevas* abajo) o guárdela en `img/obras/` con un nombre sin tildes ni espacios, por ejemplo `atardecer-llanero.jpg`, y una copia más pequeña (800 px) con el mismo nombre en `img/obras/mini/`.
2. Abra `js/datos.js`, busque `let OBRAS = [` y copie un bloque existente. Cambie título, técnica, medidas, año e imagen.
3. `coleccion: 'exposicion'` la cuelga en la sala del piso 1 (19 lugares, en el orden de la lista: caballete, muro central, fondo y muro de la entrada). El taller del piso 2 no lleva obras. Con `destacada: 'si'` también aparece en el catálogo.

**Marcar una obra como vendida**
Cambie `coleccion: 'vendida'` y `disponible: 'no'`, y mueva la foto a `img/vendidas/` (y `img/vendidas/mini/`). Pasa sola al muro verde de la *Colección privada* del museo, con su punto rojo, y al filtro *Vendidas* de la versión clásica. Si hay una foto del maestro con la obra, póngala en `fotoAutor`.

**Mejorar fotos nuevas**
Las fotos se recortan, se enderezan y se mejoran sin tocar la pintura (niveles que respetan los colores y enfoque suave) con `originales/procesar.py`. En `originales/specs.py` se anota cada foto con las esquinas de la obra dentro de la foto (en fracciones de 0 a 1). Luego:
```
python3 originales/specs.py > /tmp/specs.json
python3 originales/procesar.py /tmp/specs.json .
```
Requiere Python con Pillow. Genera la versión grande (1600 px, para el visor) y la liviana en `mini/` (800 px, para el museo 3D y la galería).

**Agregar un trabajo en madera**
Igual que una obra, pero con `categoria: 'ebanisteria'`. Aparece en "Trabajos realizados" de la sección del ebanista y en su catálogo.

**Agregar una exposición, un premio o una experiencia**
1. Si tiene certificado, guarde la foto en `img/certificados/`.
2. En `js/datos.js`, dentro de `let TRAYECTORIA = [`, copie una línea del mismo tipo y cambie los datos.
3. El campo `area` decide dónde aparece: `'arte'` (pintor), `'madera'` (ebanista) o `'ambas'`.
   Se actualizan solos la página, el catálogo y la hoja de vida de ese oficio, y los contadores.

**Cambiar textos de perfil o servicios**
En `js/datos.js`: `PERFIL.arte` y `PERFIL.madera` (resumen, técnicas o competencias, servicios) y `SERVICIOS` (tarjetas de la página y los catálogos).

**Alternativa sin tocar código:** la plantilla `contenido/contenido-pagina-santamaria.xlsx` se sube a Google Sheets y se publica como CSV (instrucciones en su pestaña LEAME).

## La casa-museo 3D

- **Exterior:** casa llanera de dos pisos al atardecer, con palmas de moriche y un atril en la entrada que abre la información del autor y los catálogos.
- **Murales de los costados** (dibujados en código en `js/murales.js`, sin imágenes de terceros): a la derecha, las *Cuadrillas de San Martín* (galanes, moros, guahibos y cachaceros); a la izquierda, *Postales del Llano* (Caño Cristales, morichal, joropo, obelisco de Puerto López, garzas y faena llanera). Se puede caminar por los costados de la casa para verlos.
- **Fotos de San Martín en la fachada:** dos cuadros a los lados de la puerta, para la iglesia y El Embrujo Llanero («La Bola»). Mientras no haya foto muestran "Fotografía próximamente". Para ponerlas, guarde fotos **propias o con permiso del autor** en `img/san-martin/` y escriba la ruta en `CONFIG.fotosSanMartin` de `js/datos.js` (por ejemplo `iglesia: 'img/san-martin/iglesia.jpg'`).
- **Los aperos del llanero:** a la izquierda del camino, frente al atril, una cerca con la silla de montar, el sombrero y la soga.
- **Piso 1 · Sala del pintor (exposición de noviembre 2026):** las obras con `coleccion: 'exposicion'` se cuelgan solas (hasta 19): una en el caballete de la entrada y las demás en el muro central vinotinto (óleo, carbón, óleo, carbón), el muro del fondo y el muro de la entrada, también vinotinto, con marco, cartela y luz.
- **Piso 1 · Colección privada:** todas las obras vendidas en montaje de salón sobre el muro izquierdo verde, con el punto rojo de "vendida". Al tocar una, la cámara se acerca y muestra su ficha. El muro de reconocimientos abre los certificados.
- **Piso 2 · Taller del ebanista:** cocina integral, closet, puerta tallada, comedor, biblioteca, marcos y bastidores, y banco de trabajo. Son piezas modeladas en 3D, marcadas como *representación ilustrativa* hasta tener fotos de trabajos reales.
- **Navegación:** arrastrar para mirar, clic en el piso para caminar, W A S D o flechas, rueda del mouse, clic en una obra o mueble para ver su ficha, y recorrido guiado con las flechas de abajo o el **Plano**. En celular funciona igual con el dedo.
- **Textos de las piezas de madera y puntos de vista:** en `js/museo.js`, objetos `TEXTOS_MADERA` y `VISTAS`.

## Ver el sitio en el computador

El museo 3D **no abre con doble clic** sobre `index.html`: por seguridad, el navegador bloquea las fotos de las obras en archivos locales (sale un aviso con el enlace a la versión clásica). Para verlo en el computador:

1. En Visual Studio Code instale la extensión **Live Server**.
2. Abra la carpeta `santamaria-web`, clic derecho sobre `index.html` → *Open with Live Server*.

Las demás páginas (`sitio.html`, catálogos y hojas de vida) sí abren con doble clic. Publicado en Netlify, todo funciona normal.

## Publicación

El sitio se publica en **Cloudflare Pages** conectado a este repositorio: cada vez que se suben cambios a GitHub (`git push`), la página se actualiza sola en uno o dos minutos.

- Configuración del proyecto en Cloudflare: *Framework preset* = **None**, *Build command* = vacío, *Build output directory* = `/`.
- Cabeceras de caché y seguridad: archivo `_headers` (sirve también en Netlify; `netlify.toml` queda como alternativa).
- `.assetsignore`: lo que no se publica (`.git`, `originales/`, `contenido/`, este README).
- WhatsApp del maestro: +57 320 829 6045 (`CONFIG.whatsapp`). Administrador del sitio: Oscar Santamaría, +57 311 422 5536 (`CONFIG.soporte`, solo en el pie de la versión clásica).
- Correo del sitio: contacto@santamariaart.com (Cloudflare Email Routing lo reenvía a oscars.santamaria@gmail.com).
- Formulario de contacto: FormSubmit hacia contacto@santamariaart.com (la primera vez llega un correo de activación que hay que confirmar).
- Dominio propio: Cloudflare → *Workers & Pages* → el proyecto → *Custom domains*.

## Pendientes

- [x] Foto de la iglesia de San Martín para la fachada (`img/san-martin/iglesia.jpg`).
- [ ] Foto propia (o con permiso) de El Embrujo Llanero («La Bola») para el cuadro derecho de la fachada.

- [ ] **Confirmar títulos, técnicas, medidas y años de las obras nuevas** (exposición y vendidas). Los títulos de `datos.js` son provisionales y descriptivos, por ejemplo "Tarde en el muelle" o "Retrato de caballero I".
- [ ] Confirmar si *Shakira* y *Soy yo y qué…* están a la venta en la exposición (hoy figuran como `disponible: 'no'`).

- [ ] Confirmar técnica y medidas de cada obra (en `datos.js` están como "Óleo sobre lienzo" salvo que se sepa otra cosa).
- [ ] Confirmar los años de experiencia (1990–2002 Bogotá y 2002–2015 fábrica de muebles se calcularon con el Media Kit).
- [ ] Confirmar el año de "Mujeres en el Poder" (se asumió 2019) y el del reconocimiento del Consulado del Ecuador.
- [ ] Fotos de ebanistería: marcos, muebles y puertas del taller (hoy aparecen como "Fotografía próximamente" y en el museo como piezas ilustrativas).
- [ ] Foto del maestro en el taller de madera (`CONFIG.retratoEbanista`), para el catálogo y la hoja de vida de ebanista.
- [ ] Datos de la fábrica de muebles: nombre, tipo de clientes o proyectos destacados, para la hoja de vida de ebanista.
- [ ] Foto del maestro enseñando, para la sección de formación (hoy usa *La antigua finca*).
- [ ] Foto de la obra *Solidaridad y bondad* y del retrato en carbón y pastel de 2024.
