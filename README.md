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
│   ├── obras/            ← fotos de las obras y de los trabajos en madera
│   ├── certificados/     ← fotos de los certificados y premios
│   └── marca/            ← firma del maestro y código QR de WhatsApp
└── contenido/            ← plantilla de Excel para Google Sheets (opcional)
```

## Cómo actualizar el contenido

**Agregar una obra**
1. Guarde la foto en `img/obras/`, con un nombre sin tildes ni espacios, por ejemplo `atardecer-llanero.jpg`.
2. Abra `js/datos.js`, busque `let OBRAS = [` y copie un bloque existente. Cambie título, técnica, medidas, año e imagen.
3. Con `destacada: 'si'` la obra también aparece en el catálogo.

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
- **Piso 1 · Sala del pintor:** las obras de `OBRAS` que tienen foto se cuelgan solas (hasta 12), con su marco, cartela y luz. El muro de reconocimientos abre los certificados.
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
- Formulario de contacto: FormSubmit hacia santamaria.art1@gmail.com (la primera vez llega un correo de activación que hay que confirmar).
- Dominio propio: Cloudflare → *Workers & Pages* → el proyecto → *Custom domains*.

## Pendientes

- [ ] Confirmar técnica y medidas de cada obra (en `datos.js` están como "Óleo sobre lienzo" salvo que se sepa otra cosa).
- [ ] Confirmar los años de experiencia (1990–2002 Bogotá y 2002–2015 fábrica de muebles se calcularon con el Media Kit).
- [ ] Confirmar el año de "Mujeres en el Poder" (se asumió 2019) y el del reconocimiento del Consulado del Ecuador.
- [ ] Fotos de ebanistería: marcos, muebles y puertas del taller (hoy aparecen como "Fotografía próximamente" y en el museo como piezas ilustrativas).
- [ ] Foto del maestro en el taller de madera (`CONFIG.retratoEbanista`), para el catálogo y la hoja de vida de ebanista.
- [ ] Datos de la fábrica de muebles: nombre, tipo de clientes o proyectos destacados, para la hoja de vida de ebanista.
- [ ] Foto del maestro enseñando, para la sección de formación (hoy usa *La antigua finca*).
- [ ] Foto de la obra *Solidaridad y bondad* y del retrato en carbón y pastel de 2024.
