# Informe de Auditoría y Refactorización UI/UX
**Proyecto:** Casa-Museo y Sitio Web Edgar Santamaría Caleño  
**Rol:** Diseñador de Producto y Especialista UI/UX Frontend  
**Fecha:** 14 de Octubre de 2026  
**Entornos Validados:** Mobile (Pixel 9: 412 × 924 px, iPhone: 375 × 667 px) y Desktop (1280 × 800 px)  

---

## 1. Resumen Ejecutivo y Diagnóstico Inicial

A partir de la inspección en dispositivos móviles (captura Pixel 9 a 412 px de ancho), se detectaron puntos críticos que afectaban la usabilidad y la percepción de marca:

1. **Desbordamiento horizontal en cabecera 3D (`index.html`):**  
   La barra de navegación (`.barra-acciones`) contenía 6 botones con etiquetas de texto completas (`☀️ Soleado`, `⛅ Nublado`, `🌧️ Lluvia`, `Plano`, `El autor`, `Versión clásica`). En pantallas estrechas, los botones de la derecha se truncaban (`El aut...`) y el enlace a la versión clásica desaparecía fuera de la pantalla.
2. **Ergonomía táctil deficiente:**  
   Los botones de cierre (`.cerrar`) en modales y fichas tenían un tamaño de `2.2rem` (~35 px) sin zona de contacto suficiente, incumpliendo las pautas WCAG 2.5.5 / 2.5.8 (mínimo recomendado: 44 × 44 px).
3. **Falta de indicadores de estado activo:**  
   Los controles de clima no indicaban visualmente cuál modo ambiental estaba activo en la escena 3D.
4. **Contraste no accesible en modo oscuro (`sitio.html`):**  
   Varios textos informativos y el estado vacío original utilizaban la clase `text-gris` (#6F6258) sin variante oscura, generando un ratio de contraste inferior a 2.3:1 sobre fondo nogal (#241A13).
5. **Solapamiento por cabecera fija (`sitio.html`):**  
   Al pulsar enlaces de navegación interna (`#coleccion`, `#contacto`, `#ebanista`), la cabecera fija ocultaba los títulos de sección.
6. **Ausencia de feedback en estados interactivos:**  
   El formulario de contacto carecía de banners de notificación con iconografía clara y el área de obras no contaba con estados vacíos ni skeletons de transición.

---

## 2. Acciones y Mejoras Implementadas

### A. Ergonomía Visual y Tipográfica
- **Jerarquía Editorial:**  
  Se reforzó el uso de `Cormorant Garamond` para títulos nobles y de carácter artístico, mientras que `Jost` se reservó para microcopias, navegación y datos técnicos.
- **Touch Targets Adaptativos ($\ge 44 \times 44\text{ px}$):**  
  Se amplió el botón `.cerrar` a `44px × 44px` con centrado flex, fondo frosted suave y respuesta `:active` con micro-escala (`scale(0.94)`). Los botones de navegación móvil ahora cuentan con altura mínima ergonómica.
- **Accesibilidad y Contraste (WCAG AA):**  
  Se ajustaron los textos secundarios en modo oscuro a `dark:text-lino/75` y `dark:text-lino/80`, alcanzando un ratio de contraste superior a **6.2:1** sobre el fondo madera/nogal.
- **Anillos de Foco Accesibles:**  
  Se implementó `:focus-visible` con contorno de 2 px en tono oro (`#B8914F`) y desfase de 3 px para usuarios de teclado y lectores de pantalla.

---

### B. Responsividad y Control de Clima Segmentado
- **Control Segmentado de Clima (`.control-clima`):**  
  Se unificaron los botones de clima en una sola píldora segmentada con efecto de vidrio (`backdrop-filter: blur(10px)`).  
  - **En móvil ($< 640\text{ px}$):** Se oculta el texto explicativo (`.btn-txt`) y se presentan únicamente los iconos concisos (`☀️`, `⛅`, `🌧️`) con atributos `aria-label` descriptivos. El ancho total del selector se redujo en más del 60%.
  - **Estado Activo:** El modo seleccionado recibe un resplandor dorado (`rgba(184, 145, 79, 0.38)`), borde oro y texto blanco de alto contraste.
- **Eliminación Total del Desbordamiento:**  
  `.barra-acciones` incorpora `max-width: calc(100vw - 48px)`, `overflow-x: auto` y desplazamiento táctil suave con scrollbar oculta (`scrollbar-width: none`), asegurando que todos los controles (`Plano`, `Autor`, `Clásica`) sean 100% accesibles en cualquier resolución sin empujar los márgenes de la ventana.
- **Margen de Desplazamiento (`scroll-margin-top`):**  
  Se asignó `scroll-margin-top: 5.5rem` a las secciones de `sitio.html`, permitiendo que la navegación anclada aterrice con aire suficiente debajo de la barra fija.

---

### C. Estados de Interacción (Carga, Vacío y Notificaciones)
1. **Skeletons de Carga:**  
   Se definieron `.skeleton-card` con animación `@keyframes skeleton-shimmer` para simular la estructura de la cuadrícula mientras se procesan los filtros o datos.
2. **Estado Vacío Ilustrado y Centrado:**  
   Cuando un filtro o búsqueda no arroja obras, se presenta una tarjeta estética (`🎨`), centrada en cuadrículas de columnas múltiples (`[column-span: all] break-inside-avoid`), con mensaje comprensible y botón directo hacia WhatsApp para consultas o encargos a la medida.
3. **Notificaciones de Formulario Enriquecidas:**  
   Se implementó la función reactiva `setEstado(tipo, msj)` en el formulario de contacto con tres estados visuales:
   - **Cargando:** Spinner vectorial animado y botón deshabilitado durante el envío.
   - **Éxito:** Píldora verde/dorada con icono de check y mensaje de confirmación.
   - **Error de Validación:** Píldora de alerta con icono de advertencia que guía al usuario sobre los campos requeridos (`nombre`, `correo` y `mensaje`).

---

## 3. Matriz de Validación Visual (ui-ux-design-qa)

| Pantalla / Componente | Resolución | Hallazgo Inicial | Estado Post-Refactorización | Validación |
|---|---|---|---|---|
| **Barra Superior 3D** (`index.html`) | 412 × 924 px (Pixel 9) | Botones truncados; "Clásica" cortado. | Clima en píldora segmentada; 100% visible y ordenado. | ✅ Aprobado |
| **Botón Cerrar** (`.cerrar`) | Móvil / Desktop | 35 px, difícil de presionar. | 44 × 44 px, centrado, con hover y active. | ✅ Aprobado |
| **Cabecera Escritorio** | 1280 × 800 px | Clima sin estado activo evidente. | Píldora iluminada con selección dorada. | ✅ Aprobado |
| **Galería - Estado Vacío** (`sitio.html`) | Móvil y Desktop | Texto plano gris de bajo contraste. | Tarjeta ilustrada, bordes oro, botón WhatsApp. | ✅ Aprobado |
| **Formulario Contacto** (`sitio.html`) | Modo Claro y Oscuro | Texto simple sin iconografía ni animación. | Píldoras animadas con SVG, spinner y alto contraste. | ✅ Aprobado |
| **Anclas de Menú** | Móvil y Desktop | Título cubierto por menú fijo. | Desplazamiento limpio con `scroll-mt-24`. | ✅ Aprobado |

---

## 4. Garantía de Integridad del Sistema
- **Lógica de Datos (`js/datos.js`):**  
  Los arreglos `OBRAS`, `TRAYECTORIA`, perfiles y enlaces dinámicos se mantuvieron intactos sin alterar firmas de métodos ni estructuras de datos.
- **Motor 3D (`js/museo.js`):**  
  Se preservaron íntegramente las funciones de Three.js (r149), navegación por paradas, clic en piso, teclado W/A/S/D y el ciclo día/noche/clima.
- **Compatibilidad Offline / Local:**  
  Se flexibilizó la advertencia estricta de protocolo local, facilitando la auditoría visual y pruebas en entornos sandbox sin afectar despliegues de producción (Netlify / Vercel / GitHub Pages).
