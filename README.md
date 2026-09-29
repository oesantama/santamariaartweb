# Maestro Edgar Santamaría Caleño · Sitio web

Sitio oficial del pintor y ebanista Edgar Santamaría Caleño (San Martín de los Llanos, Meta).
Son tres páginas hechas completamente en código, sin archivos PDF subidos:

| Página | Archivo | Qué es |
|---|---|---|
| Inicio | `index.html` | Presentación, colección con filtros, servicios, trayectoria y contacto |
| Catálogo | `catalogo.html` | Catálogo de autor en hojas A4. El botón **Guardar como PDF** lo descarga |
| Hoja de vida | `hoja-de-vida.html` | Hoja de vida artística con certificados. También se guarda como PDF |

## Estructura

```
santamaria-web/
├── index.html · catalogo.html · hoja-de-vida.html
├── js/
│   ├── datos.js      ← TODO el contenido: obras, trayectoria, textos y contactos
│   └── marca.js      ← colores y tipografías de la marca
├── css/marca.css     ← texturas de madera y marco de autor
├── img/
│   ├── obras/        ← fotos de las obras (JPG, ancho recomendado 1200 px)
│   ├── certificados/ ← fotos de los certificados y premios
│   └── marca/        ← firma del maestro (oscura y dorada)
└── contenido/        ← plantilla de Excel para Google Sheets (opcional)
```

## Cómo actualizar el contenido

**Agregar una obra**
1. Guarde la foto en `img/obras/`, con un nombre sin tildes ni espacios, por ejemplo `atardecer-llanero.jpg`.
2. Abra `js/datos.js`, busque `let OBRAS = [` y copie un bloque existente. Cambie título, técnica, medidas, año e imagen.
3. Con `destacada: 'si'` la obra también aparece en el catálogo.

**Agregar una exposición o un premio**
1. Guarde la foto del certificado en `img/certificados/`.
2. En `js/datos.js`, dentro de `let TRAYECTORIA = [`, copie una línea del mismo tipo y cambie los datos.
   Aparece automáticamente en la página, en el catálogo y en la hoja de vida, y los contadores se actualizan solos.

**Alternativa sin tocar código:** la plantilla `contenido/contenido-pagina-santamaria.xlsx` se sube a Google Sheets y se publica como CSV (instrucciones en su pestaña LEAME).

## Ver el sitio en el computador

Abra `index.html` con doble clic. Para una vista idéntica a la publicada, con Visual Studio Code instale la extensión **Live Server** y use *Open with Live Server*.

## Publicación

El sitio se publica en Netlify conectado a este repositorio: cada vez que se suben cambios a GitHub, Netlify actualiza la página en uno o dos minutos.

- Formulario de contacto: FormSubmit hacia santamaria.art1@gmail.com (la primera vez llega un correo de activación que hay que confirmar).
- Dominio: se conecta en Netlify → *Domain management*.

## Pendientes

- [ ] Confirmar técnica y medidas de cada obra (en `datos.js` están como "Óleo sobre lienzo" salvo que se sepa otra cosa).
- [ ] Confirmar los años de experiencia (1990–2002 Bogotá y 2002–2015 fábrica de muebles se calcularon con el Media Kit).
- [ ] Confirmar el año de "Mujeres en el Poder" (se asumió 2019) y el del reconocimiento del Consulado del Ecuador.
- [ ] Fotos de ebanistería: marcos, muebles y puertas del taller.
- [ ] Foto del maestro enseñando, para la sección de formación (hoy usa *La antigua finca*).
- [ ] Foto de la obra *Solidaridad y bondad* y del retrato en carbón y pastel de 2024.
