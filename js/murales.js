/* =====================================================================
   MURALES DE LA CASA-MUSEO (dibujados en código, sin fotos de terceros)
   ---------------------------------------------------------------------
   dibujarMuralCuadrillas → muro derecho de la casa: las Cuadrillas de
     San Martín (galanes, moros, guahibos y cachaceros, 12 jinetes cada una).
   dibujarMuralLlano      → muro izquierdo: postales del Llano y del Meta.
   dibujarMarcoFoto       → cuadro de la fachada mientras llega la foto real.
   Cada función recibe un contexto 2D de canvas y su ancho y alto.
   ===================================================================== */
const MURAL_SERIF = '"Cormorant Garamond", Georgia, serif';
const MURAL_SANS = 'Jost, "Segoe UI", system-ui, sans-serif';

// Azar repetible: el mural se ve igual en cada visita
function azarMural(semilla) {
  let s = semilla >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

/* ---------- Piezas comunes ---------- */
function cieloLlanero(x, W, H, horizonte, colores = ['#1d2a5c', '#6a2d6b', '#d9534f', '#f39c32', '#ffd36b']) {
  const g = x.createLinearGradient(0, 0, 0, horizonte);
  colores.forEach((c, i) => g.addColorStop(i / (colores.length - 1), c));
  x.fillStyle = g; x.fillRect(0, 0, W, horizonte + 2);
}

function solPoniente(x, cx, cy, r) {
  const h = x.createRadialGradient(cx, cy, r * .2, cx, cy, r * 3.2);
  h.addColorStop(0, 'rgba(255,240,180,.9)'); h.addColorStop(.35, 'rgba(255,190,90,.35)'); h.addColorStop(1, 'rgba(255,150,60,0)');
  x.fillStyle = h; x.fillRect(cx - r * 3.2, cy - r * 3.2, r * 6.4, r * 6.4);
  x.fillStyle = '#fff1c1'; x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.fill();
}

// Palma de moriche en silueta: tronco y abanico de hojas
function moricheSilueta(x, bx, by, alto, color = '#2a1a22', azar = Math.random) {
  x.strokeStyle = color; x.fillStyle = color; x.lineCap = 'round';
  const tx = bx + (azar() - .5) * alto * .08, ty = by - alto;
  x.lineWidth = alto * .035; x.beginPath(); x.moveTo(bx, by); x.quadraticCurveTo(bx, by - alto * .5, tx, ty); x.stroke();
  for (let i = 0; i < 15; i++) {
    const a = -Math.PI * (.05 + .9 * i / 14) + (azar() - .5) * .12, l = alto * (.28 + azar() * .1);
    const ex = tx + Math.cos(a) * l, ey = ty + Math.sin(a) * l * .8 + l * .25;
    x.lineWidth = alto * .012; x.beginPath(); x.moveTo(tx, ty); x.quadraticCurveTo(tx + Math.cos(a) * l * .5, ty + Math.sin(a) * l * .5 - l * .1, ex, ey); x.stroke();
    x.beginPath(); x.ellipse(ex, ey, l * .16, l * .05, a, 0, Math.PI * 2); x.fill();
  }
}

// Caballo al galope mirando a la derecha (cuerpo de largo 1 en unidades locales)
function caballo(x, cx, cy, s, color, crin = '#1b1009', fase = 0) {
  x.save(); x.translate(cx, cy); x.scale(s, s);
  x.fillStyle = color; x.strokeStyle = color; x.lineCap = 'round'; x.lineJoin = 'round';
  // Patas: [cadera, rodilla, casco] con dos poses de galope
  const p = fase % 2 ? [
    [[.34, .1], [.6, .27], [.78, .33]], [[.3, .12], [.42, .36], [.33, .52]],
    [[-.36, .08], [-.6, .28], [-.8, .36]], [[-.3, .12], [-.18, .37], [-.27, .55]]
  ] : [
    [[.34, .1], [.5, .34], [.62, .52]], [[.3, .12], [.5, .2], [.6, .05]],
    [[-.36, .08], [-.5, .34], [-.44, .55]], [[-.3, .12], [-.52, .26], [-.72, .2]]
  ];
  p.forEach(([a, b, c], i) => {
    x.globalAlpha = i % 2 ? .82 : 1;
    x.lineWidth = .085; x.beginPath(); x.moveTo(...a); x.lineTo(...b); x.stroke();
    x.lineWidth = .055; x.beginPath(); x.moveTo(...b); x.lineTo(...c); x.stroke();
    x.fillStyle = crin; x.beginPath(); x.arc(c[0], c[1], .035, 0, Math.PI * 2); x.fill(); x.fillStyle = color;
  });
  x.globalAlpha = 1;
  // Cuerpo, pecho, cuello y cabeza
  x.beginPath(); x.ellipse(0, 0, .5, .21, -.04, 0, Math.PI * 2); x.fill();
  x.beginPath(); x.ellipse(.36, -.04, .18, .19, 0, 0, Math.PI * 2); x.fill();
  x.beginPath(); x.moveTo(.26, -.14); x.lineTo(.5, .02); x.quadraticCurveTo(.68, -.2, .8, -.38); x.lineTo(.6, -.52); x.quadraticCurveTo(.44, -.4, .26, -.14); x.fill();
  x.beginPath(); x.ellipse(.84, -.43, .2, .085, .62, 0, Math.PI * 2); x.fill();
  x.beginPath(); x.moveTo(.64, -.56); x.lineTo(.67, -.67); x.lineTo(.72, -.55); x.fill();
  // Crin, cola y ojo
  x.fillStyle = crin;
  x.beginPath(); x.moveTo(.6, -.53); x.quadraticCurveTo(.42, -.46, .24, -.18); x.quadraticCurveTo(.36, -.38, .5, -.5); x.fill();
  x.beginPath(); x.moveTo(-.48, -.08); x.bezierCurveTo(-.7, -.2, -.85, -.02, -.98, .16); x.bezierCurveTo(-.82, .04, -.66, -.02, -.47, .02); x.fill();
  x.beginPath(); x.arc(.83, -.47, .016, 0, Math.PI * 2); x.fill();
  x.restore();
}

// Jinete sobre el caballo (mismas unidades). traje: { camisa, capa, piel, pantalon, tocado, arma, bandera }
function jinete(x, cx, cy, s, t) {
  x.save(); x.translate(cx, cy); x.scale(s, s); x.lineCap = 'round'; x.lineJoin = 'round';
  // Capa al viento
  if (t.capa) {
    x.fillStyle = t.capa; x.beginPath(); x.moveTo(.08, -.58); x.bezierCurveTo(-.15, -.6, -.32, -.45, -.48, -.42);
    x.bezierCurveTo(-.36, -.34, -.24, -.3, -.04, -.26); x.fill();
    if (t.ribete) { x.strokeStyle = t.ribete; x.lineWidth = .014; x.stroke(); }
  }
  // Pierna
  x.strokeStyle = t.pantalon; x.lineWidth = .075; x.beginPath(); x.moveTo(0, -.24); x.lineTo(.12, -.05); x.lineTo(.07, .12); x.stroke();
  x.fillStyle = '#1b1009'; x.beginPath(); x.ellipse(.09, .14, .05, .025, 0, 0, Math.PI * 2); x.fill();
  // Torso y brazo con la lanza o la bandera
  x.strokeStyle = t.camisa; x.lineWidth = .14; x.beginPath(); x.moveTo(.01, -.28); x.lineTo(.09, -.56); x.stroke();
  x.lineWidth = .05; x.beginPath(); x.moveTo(.09, -.53); x.lineTo(.24, -.48); x.lineTo(.32, -.62); x.stroke();
  if (t.arma) {
    x.strokeStyle = '#5a3a1e'; x.lineWidth = .022; x.beginPath(); x.moveTo(.22, -.28); x.lineTo(.46, -1.12); x.stroke();
    if (t.bandera) {
      t.bandera.forEach((c, i) => {
        x.fillStyle = c; x.beginPath();
        const y0 = -1.1 + i * .08; x.moveTo(.46 - i * .02, y0); x.quadraticCurveTo(.66, y0 - .03, .82, y0 + .03); x.lineTo(.8, y0 + .11); x.quadraticCurveTo(.64, y0 + .06, .44 - i * .02, y0 + .08); x.fill();
      });
    } else { x.fillStyle = '#d8d2c4'; x.beginPath(); x.moveTo(.46, -1.12); x.lineTo(.43, -1.02); x.lineTo(.5, -1.03); x.fill(); }
  }
  // Cabeza
  x.fillStyle = t.piel; x.beginPath(); x.arc(.12, -.66, .065, 0, Math.PI * 2); x.fill();
  const tc = t.tocado;
  if (tc === 'sombrero') {
    x.fillStyle = t.sombrero || '#f4eee2'; x.beginPath(); x.ellipse(.12, -.7, .14, .025, -.1, 0, Math.PI * 2); x.fill();
    x.beginPath(); x.ellipse(.12, -.75, .07, .05, 0, Math.PI, 0); x.fill();
    x.fillStyle = t.ribete || '#1b1009'; x.fillRect(.05, -.735, .14, .014);
  } else if (tc === 'turbante') {
    x.fillStyle = '#f7f1e6'; x.beginPath(); x.ellipse(.12, -.72, .085, .06, 0, 0, Math.PI * 2); x.fill();
    x.fillStyle = t.capa; x.beginPath(); x.arc(.12, -.77, .03, 0, Math.PI * 2); x.fill();
    x.strokeStyle = '#f7f1e6'; x.lineWidth = .025; x.beginPath(); x.moveTo(.06, -.7); x.quadraticCurveTo(-.06, -.62, -.12, -.5); x.stroke();
  } else if (tc === 'plumas') {
    ['#c0392b', '#f1c40f', '#27ae60', '#2980b9', '#e67e22', '#c0392b', '#f1c40f'].forEach((c, i) => {
      const a = -Math.PI * (.15 + .7 * i / 6);
      x.fillStyle = c; x.beginPath(); x.ellipse(.12 + Math.cos(a) * .1, -.7 + Math.sin(a) * .1, .022, .07, a + Math.PI / 2, 0, Math.PI * 2); x.fill();
    });
    x.fillStyle = '#7b3f1d'; x.fillRect(.05, -.715, .14, .025);
  } else if (tc === 'mascara') {
    x.fillStyle = '#16100c'; x.beginPath(); x.arc(.12, -.66, .075, 0, Math.PI * 2); x.fill();
    x.strokeStyle = '#e8dcc0'; x.lineWidth = .022;
    x.beginPath(); x.moveTo(.08, -.72); x.quadraticCurveTo(.02, -.8, .04, -.88); x.stroke();
    x.beginPath(); x.moveTo(.16, -.72); x.quadraticCurveTo(.24, -.8, .22, -.88); x.stroke();
    x.fillStyle = '#e74c3c'; x.beginPath(); x.arc(.15, -.66, .014, 0, Math.PI * 2); x.fill();
    ['#f1c40f', '#e74c3c', '#3498db'].forEach((c, i) => { x.fillStyle = c; x.fillRect(.0 + i * .045, -.5, .04, .04); });
  }
  x.restore();
}

// Cinta con texto (cartela de cada cuadrilla)
function cinta(x, cx, cy, ancho, texto, fondo, color = '#fff6e0', tam = 40) {
  const h = tam * 1.5;
  x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(cx - ancho / 2 + 6, cy - h / 2 + 6, ancho, h);
  x.fillStyle = fondo; x.beginPath();
  x.moveTo(cx - ancho / 2 - h * .4, cy - h / 2); x.lineTo(cx + ancho / 2 + h * .4, cy - h / 2); x.lineTo(cx + ancho / 2, cy); x.lineTo(cx + ancho / 2 + h * .4, cy + h / 2);
  x.lineTo(cx - ancho / 2 - h * .4, cy + h / 2); x.lineTo(cx - ancho / 2, cy); x.closePath(); x.fill();
  x.fillStyle = color; x.font = `600 ${tam}px ${MURAL_SERIF}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(texto, cx, cy + 2);
  x.textBaseline = 'alphabetic';
}

// Marco de tejido llanero (triángulos alternados)
function marcoTejido(x, W, H, g, colores = ['#8e2b1f', '#e2a33a', '#1f3b2c', '#f3e3c3']) {
  x.fillStyle = colores[0]; x.fillRect(0, 0, W, g); x.fillRect(0, H - g, W, g); x.fillRect(0, 0, g, H); x.fillRect(W - g, 0, g, H);
  const paso = g * 1.2;
  const tri = (px, py, ang, c) => { x.save(); x.translate(px, py); x.rotate(ang); x.fillStyle = c; x.beginPath(); x.moveTo(-paso / 2, g * .38); x.lineTo(0, -g * .38); x.lineTo(paso / 2, g * .38); x.fill(); x.restore(); };
  for (let i = 0, px = paso / 2; px < W; px += paso, i++) { tri(px, g / 2, 0, colores[1 + i % 2]); tri(px, H - g / 2, Math.PI, colores[1 + i % 2]); }
  for (let i = 0, py = paso / 2; py < H; py += paso, i++) { tri(g / 2, py, -Math.PI / 2, colores[1 + i % 2]); tri(W - g / 2, py, Math.PI / 2, colores[1 + i % 2]); }
  x.strokeStyle = colores[3]; x.lineWidth = g * .08; x.strokeRect(g, g, W - 2 * g, H - 2 * g);
}

/* ---------- Mural 1: Cuadrillas de San Martín ---------- */
const CUADRILLAS = [
  { nombre: 'Galanes', camisa: '#f4eee2', capa: '#b3261e', ribete: '#e2b13c', piel: '#e2b48c', pantalon: '#1f2d4d', tocado: 'sombrero', sombrero: '#f4eee2', arma: true, bandera: ['#c0392b', '#f1c40f'], caballo: '#f2ede4' },
  { nombre: 'Moros', camisa: '#1e6b46', capa: '#d4a017', ribete: '#7a1f1f', piel: '#b9835a', pantalon: '#f7f1e6', tocado: 'turbante', arma: true, bandera: ['#1e6b46', '#f7f1e6'], caballo: '#3a2a20' },
  { nombre: 'Guahibos', camisa: '#a5552e', capa: null, piel: '#a5552e', pantalon: '#6b3a1b', tocado: 'plumas', arma: true, caballo: '#8a5a32' },
  { nombre: 'Cachaceros', camisa: '#e67e22', capa: '#2c3e8f', ribete: '#f1c40f', piel: '#3b2418', pantalon: '#c0392b', tocado: 'mascara', arma: true, caballo: '#5b3b26' }
];

function dibujarMuralCuadrillas(x, W, H) {
  const azar = azarMural(1735), hz = H * .6;
  cieloLlanero(x, W, H, hz);
  solPoniente(x, W * .5, hz - H * .02, H * .09);
  // Rayos del atardecer
  x.save(); x.globalAlpha = .1; x.fillStyle = '#fff3c4';
  for (let i = 0; i < 18; i++) { const a = Math.PI * (1 + i / 18), b = a + .05; x.beginPath(); x.moveTo(W * .5, hz); x.lineTo(W * .5 + Math.cos(a) * W, hz + Math.sin(a) * W); x.lineTo(W * .5 + Math.cos(b) * W, hz + Math.sin(b) * W); x.fill(); }
  x.restore();
  // Sabana con morichales en el horizonte
  const sab = x.createLinearGradient(0, hz, 0, H); sab.addColorStop(0, '#6b6a2c'); sab.addColorStop(.4, '#8a7a34'); sab.addColorStop(1, '#5a4a20');
  x.fillStyle = sab; x.fillRect(0, hz, W, H - hz);
  for (let i = 0; i < 26; i++) { const bx = azar() * W; if (Math.abs(bx - W * .5) > W * .05) moricheSilueta(x, bx, hz + 4, H * (.07 + azar() * .08), '#2a1a22', azar); }
  x.strokeStyle = 'rgba(40,30,10,.35)'; x.lineWidth = 2;
  for (let i = 0; i < 1400; i++) { const gx = azar() * W, gy = hz + Math.pow(azar(), .7) * (H - hz), l = 6 + (gy - hz) / (H - hz) * 22; x.beginPath(); x.moveTo(gx, gy); x.lineTo(gx + (azar() - .5) * 6, gy - l); x.stroke(); }
  // Polvo de la cabalgata
  for (let i = 0; i < 40; i++) {
    const px = azar() * W, py = H * (.72 + azar() * .18), r = H * (.03 + azar() * .06);
    const g = x.createRadialGradient(px, py, 0, px, py, r); g.addColorStop(0, 'rgba(240,215,170,.35)'); g.addColorStop(1, 'rgba(240,215,170,0)');
    x.fillStyle = g; x.fillRect(px - r, py - r, 2 * r, 2 * r);
  }
  // Las cuatro cuadrillas: tres jinetes por cuadrilla (fila de atrás más pequeña)
  const ancho = W / 4;
  CUADRILLAS.forEach((c, k) => {
    const cx = ancho * (k + .5);
    [[-.24, .74, .1], [.22, .76, .1], [-.02, .86, .135]].forEach(([dx, fy, fs], j) => {
      const s = H * fs * 1.25, px = cx + dx * ancho, py = H * fy;
      x.fillStyle = 'rgba(0,0,0,.25)'; x.beginPath(); x.ellipse(px, py + s * .56, s * .7, s * .06, 0, 0, Math.PI * 2); x.fill();
      caballo(x, px, py, s, c.caballo, '#1b1009', j + k);
      jinete(x, px, py, s, c);
    });
    cinta(x, cx, H * .945, ancho * .5, c.nombre, ['#7a1f1f', '#1e5b3c', '#8a4b1a', '#2c3e8f'][k], '#fff6e0', H * .036);
  });
  // Título
  x.textAlign = 'center';
  x.fillStyle = 'rgba(20,10,20,.35)'; x.fillRect(W * .2, H * .06, W * .6, H * .2);
  x.fillStyle = '#ffe6a8'; x.font = `600 ${H * .1}px ${MURAL_SERIF}`; x.fillText('Cuadrillas de San Martín', W / 2, H * .165);
  x.fillStyle = '#fff6e0'; x.font = `italic 400 ${H * .042}px ${MURAL_SERIF}`;
  x.fillText('48 jinetes · 12 galanes, 12 moros, 12 guahibos y 12 cachaceros · tradición desde 1735', W / 2, H * .225);
  x.font = `300 ${H * .028}px ${MURAL_SANS}`; x.fillStyle = '#ffe6a8';
  x.fillText('San Martín de los Llanos, Meta · tierra del maestro Edgar Santamaría Caleño', W / 2, H * .3);
  marcoTejido(x, W, H, H * .035);
}

/* ---------- Mural 2: postales del Llano ---------- */
function postal(x, cx, cy, w, h, ang, titulo, dibujar) {
  const b = w * .045, pie = h * .14;
  x.save(); x.translate(cx, cy); x.rotate(ang);
  x.fillStyle = 'rgba(0,0,0,.35)'; x.fillRect(-w / 2 + 12, -h / 2 + 14, w, h);
  x.fillStyle = '#fbf6ea'; x.fillRect(-w / 2, -h / 2, w, h);
  const iw = w - 2 * b, ih = h - b - pie;
  x.save(); x.translate(-w / 2 + b, -h / 2 + b); x.beginPath(); x.rect(0, 0, iw, ih); x.clip(); dibujar(x, iw, ih); x.restore();
  x.fillStyle = '#3a2a1e'; x.textAlign = 'center'; x.font = `italic 500 ${pie * .52}px ${MURAL_SERIF}`; x.fillText(titulo, 0, h / 2 - pie * .35);
  x.restore();
}

const VIÑETAS = {
  canoCristales(x, w, h) {
    const azar = azarMural(7);
    // Roca oscura de la serranía y vegetación en las orillas
    x.fillStyle = '#4e4a40'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#2f5a2a'; x.beginPath(); x.moveTo(0, 0); x.lineTo(w, 0); x.lineTo(w, h * .18); x.quadraticCurveTo(w * .5, h * .3, 0, h * .16); x.fill();
    for (let i = 0; i < 26; i++) { x.fillStyle = ['#3d6b30', '#25471f', '#557f38'][i % 3]; x.beginPath(); x.arc(azar() * w, h * (.05 + azar() * .15), w * (.03 + azar() * .04), 0, Math.PI * 2); x.fill(); }
    // Cauce: agua clara entre lajas de roca
    const agua = x.createLinearGradient(0, h * .25, 0, h); agua.addColorStop(0, '#3f8f8a'); agua.addColorStop(1, '#1f5f6e');
    x.fillStyle = agua; x.beginPath(); x.moveTo(0, h * .3); x.bezierCurveTo(w * .3, h * .22, w * .7, h * .38, w, h * .28); x.lineTo(w, h); x.lineTo(0, h); x.fill();
    for (let i = 0; i < 22; i++) { x.fillStyle = ['#6b655a', '#5a554b', '#7d766a'][i % 3]; x.beginPath(); x.ellipse(azar() * w, h * (.35 + azar() * .62), w * (.04 + azar() * .07), h * (.02 + azar() * .03), azar() * .6 - .3, 0, Math.PI * 2); x.fill(); }
    // Macarenia: matas rojas y fucsias, con manchas amarillas y verdes
    const mata = (cx, cy, r, colores) => { for (let k = 0; k < 14; k++) { const a = azar() * Math.PI * 2, d = azar() * r; x.fillStyle = colores[k % colores.length]; x.beginPath(); x.ellipse(cx + Math.cos(a) * d, cy + Math.sin(a) * d * .5, r * .35, r * .14, a, 0, Math.PI * 2); x.fill(); } };
    for (let i = 0; i < 26; i++) mata(azar() * w, h * (.36 + azar() * .6), w * (.04 + azar() * .05), ['#c2185b', '#e53935', '#ad1457', '#ff5252']);
    for (let i = 0; i < 9; i++) mata(azar() * w, h * (.4 + azar() * .55), w * .035, ['#f2c12e', '#e6a817']);
    for (let i = 0; i < 9; i++) mata(azar() * w, h * (.4 + azar() * .55), w * .035, ['#2e9e5b', '#4caf50']);
    // Brillos de la corriente
    x.strokeStyle = 'rgba(255,255,255,.55)'; x.lineWidth = 2.5;
    for (let i = 0; i < 26; i++) { const px = azar() * w, py = h * (.35 + azar() * .6); x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + 12, py - 5, px + 26, py); x.stroke(); }
  },
  morichal(x, w, h) {
    const azar = azarMural(11), hz = h * .62;
    cieloLlanero(x, w, h, hz, ['#3a2363', '#b03a5b', '#f27b35', '#ffd36b']);
    solPoniente(x, w * .62, hz - h * .05, h * .1);
    const agua = x.createLinearGradient(0, hz, 0, h); agua.addColorStop(0, '#f2a15a'); agua.addColorStop(1, '#5b2d4a'); x.fillStyle = agua; x.fillRect(0, hz, w, h - hz);
    const palmas = Array.from({ length: 8 }, (_, i) => [w * (.05 + i * .13 + azar() * .04), h * (.3 + azar() * .25), 100 + i]);
    // Reflejo en el agua (las mismas palmas, invertidas y tenues) y luego las palmas
    x.save(); x.beginPath(); x.rect(0, hz, w, h - hz); x.clip(); x.globalAlpha = .28; x.translate(0, hz * 2 + 6); x.scale(1, -1);
    palmas.forEach(([px, alto, sem]) => moricheSilueta(x, px, hz + 3, alto, '#24131e', azarMural(sem)));
    x.restore();
    palmas.forEach(([px, alto, sem]) => moricheSilueta(x, px, hz + 3, alto, '#24131e', azarMural(sem)));
    x.strokeStyle = 'rgba(255,220,160,.35)'; x.lineWidth = 2; for (let i = 0; i < 12; i++) { const py = hz + 8 + i * (h - hz) / 12; x.beginPath(); x.moveTo(w * .5, py); x.lineTo(w * .75, py); x.stroke(); }
  },
  joropo(x, w, h) {
    const g = x.createRadialGradient(w * .5, h * .4, 10, w * .5, h * .5, w * .7); g.addColorStop(0, '#f6c35c'); g.addColorStop(1, '#a8361f');
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.fillStyle = '#5a2414'; x.fillRect(0, h * .82, w, h * .18);
    // Arpa llanera
    x.strokeStyle = '#3a1a0c'; x.lineWidth = w * .02; x.lineCap = 'round';
    x.beginPath(); x.moveTo(w * .1, h * .84); x.lineTo(w * .13, h * .2); x.quadraticCurveTo(w * .25, h * .15, w * .28, h * .3); x.lineTo(w * .2, h * .84); x.stroke();
    x.lineWidth = 1.5; for (let i = 1; i < 10; i++) { x.beginPath(); x.moveTo(w * (.13 + i * .007), h * (.22 + i * .01)); x.lineTo(w * (.12 + i * .009), h * .82); x.stroke(); }
    // Pareja bailando
    x.fillStyle = '#2b1a12'; x.beginPath(); x.arc(w * .47, h * .3, h * .045, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#f4eee2'; x.beginPath(); x.ellipse(w * .47, h * .26, h * .09, h * .015, 0, 0, Math.PI * 2); x.fill(); x.fillRect(w * .445, h * .21, w * .05, h * .05);
    x.fillStyle = '#f4eee2'; x.fillRect(w * .44, h * .35, w * .06, h * .25);
    x.fillStyle = '#2b1a12'; x.fillRect(w * .445, h * .6, w * .02, h * .22); x.fillRect(w * .475, h * .6, w * .02, h * .2);
    x.fillStyle = '#2b1a12'; x.beginPath(); x.arc(w * .66, h * .3, h * .042, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#c0392b'; x.fillRect(w * .64, h * .35, w * .045, h * .14);
    // Falda de joropo con flores
    x.beginPath(); x.moveTo(w * .64, h * .48); x.bezierCurveTo(w * .5, h * .62, w * .52, h * .82, w * .6, h * .8); x.lineTo(w * .78, h * .8); x.bezierCurveTo(w * .88, h * .76, w * .82, h * .6, w * .69, h * .48); x.closePath();
    const f = x.createLinearGradient(w * .5, 0, w * .85, 0); f.addColorStop(0, '#e74c3c'); f.addColorStop(.5, '#f1c40f'); f.addColorStop(1, '#e67e22'); x.fillStyle = f; x.fill();
    ['#ffffff', '#2e86de', '#27ae60'].forEach((c, i) => { for (let k = 0; k < 6; k++) { x.fillStyle = c; x.beginPath(); x.arc(w * (.56 + k * .045), h * (.6 + ((k + i) % 3) * .06), h * .014, 0, Math.PI * 2); x.fill(); } });
    x.strokeStyle = '#2b1a12'; x.lineWidth = w * .012; x.beginPath(); x.moveTo(w * .5, h * .4); x.lineTo(w * .64, h * .4); x.stroke();
  },
  obelisco(x, w, h) {
    const cielo = x.createLinearGradient(0, 0, 0, h * .7); cielo.addColorStop(0, '#2f7fc1'); cielo.addColorStop(1, '#bfe3f7'); x.fillStyle = cielo; x.fillRect(0, 0, w, h);
    x.fillStyle = '#fff'; [[.2, .2], [.75, .15], [.55, .3]].forEach(([a, b]) => { x.beginPath(); x.ellipse(w * a, h * b, w * .09, h * .035, 0, 0, Math.PI * 2); x.ellipse(w * a + w * .05, h * b - h * .02, w * .06, h * .035, 0, 0, Math.PI * 2); x.fill(); });
    x.fillStyle = '#5f9a3a'; x.beginPath(); x.moveTo(0, h * .78); x.quadraticCurveTo(w * .5, h * .55, w, h * .78); x.lineTo(w, h); x.lineTo(0, h); x.fill();
    x.fillStyle = '#e9e4da'; x.fillRect(w * .38, h * .7, w * .24, h * .05); x.fillRect(w * .42, h * .66, w * .16, h * .05);
    x.beginPath(); x.moveTo(w * .46, h * .66); x.lineTo(w * .48, h * .14); x.lineTo(w * .5, h * .08); x.lineTo(w * .52, h * .14); x.lineTo(w * .54, h * .66); x.fill();
    x.fillStyle = 'rgba(0,0,0,.12)'; x.beginPath(); x.moveTo(w * .5, h * .08); x.lineTo(w * .52, h * .14); x.lineTo(w * .54, h * .66); x.lineTo(w * .5, h * .66); x.fill();
    [.3, .7].forEach(px => {
      x.strokeStyle = '#555'; x.lineWidth = 2; x.beginPath(); x.moveTo(w * px, h * .74); x.lineTo(w * px, h * .46); x.stroke();
      [['#f1c40f', 0, .04], ['#1f4fa3', .04, .02], ['#c0392b', .06, .02]].forEach(([c, y, a]) => { x.fillStyle = c; x.fillRect(w * px, h * (.46 + y), w * .1, h * a); });
    });
  },
  garzas(x, w, h) {
    const azar = azarMural(23);
    const c = x.createLinearGradient(0, 0, 0, h); c.addColorStop(0, '#f7d9a8'); c.addColorStop(.55, '#f3b77a'); c.addColorStop(.56, '#6aa6b5'); c.addColorStop(1, '#2f6e7e'); x.fillStyle = c; x.fillRect(0, 0, w, h);
    x.fillStyle = '#3f6b2e'; for (let i = 0; i < 30; i++) { x.beginPath(); x.ellipse(azar() * w, h * (.56 + azar() * .02), w * .06, h * .02, 0, 0, Math.PI * 2); x.fill(); }
    x.fillStyle = '#2f5a2a'; for (let i = 0; i < 12; i++) { x.beginPath(); x.ellipse(azar() * w, h * (.7 + azar() * .25), w * .04, h * .015, 0, 0, Math.PI * 2); x.fill(); }
    x.fillStyle = '#fffdf6'; x.strokeStyle = '#fffdf6';
    for (let i = 0; i < 9; i++) {
      const px = w * (.1 + azar() * .8), py = h * (.1 + azar() * .35), s = w * (.04 + azar() * .04), al = (azar() - .5) * .6;
      x.beginPath(); x.moveTo(px - s, py - s * .3 + al * s); x.quadraticCurveTo(px - s * .4, py - s * .5, px, py); x.quadraticCurveTo(px + s * .4, py - s * .5, px + s, py - s * .3 - al * s); x.quadraticCurveTo(px + s * .4, py - s * .1, px, py + s * .12); x.quadraticCurveTo(px - s * .4, py - s * .1, px - s, py - s * .3 + al * s); x.fill();
      x.lineWidth = 2; x.beginPath(); x.moveTo(px, py); x.lineTo(px + s * .6, py + s * .1); x.stroke();
    }
    // Garza parada en el agua
    x.beginPath(); x.ellipse(w * .78, h * .66, w * .05, h * .04, -.3, 0, Math.PI * 2); x.fill();
    x.lineWidth = 4; x.beginPath(); x.moveTo(w * .81, h * .64); x.quadraticCurveTo(w * .86, h * .6, w * .83, h * .53); x.stroke();
    x.strokeStyle = '#e2a33a'; x.lineWidth = 3; x.beginPath(); x.moveTo(w * .83, h * .53); x.lineTo(w * .87, h * .54); x.stroke();
    x.strokeStyle = '#2b2b2b'; x.beginPath(); x.moveTo(w * .78, h * .69); x.lineTo(w * .78, h * .78); x.moveTo(w * .76, h * .69); x.lineTo(w * .75, h * .78); x.stroke();
  },
  faena(x, w, h) {
    const azar = azarMural(31), hz = h * .55;
    cieloLlanero(x, w, h, hz, ['#4b8fd0', '#9cc9ea', '#f6dfa6']);
    const s = x.createLinearGradient(0, hz, 0, h); s.addColorStop(0, '#9b9a45'); s.addColorStop(1, '#6b5a26'); x.fillStyle = s; x.fillRect(0, hz, w, h - hz);
    for (let i = 0; i < 6; i++) moricheSilueta(x, azar() * w, hz + 2, h * (.12 + azar() * .1), '#3a4a2a', azar);
    // Ganado cebú
    for (let i = 0; i < 7; i++) {
      const px = w * (.08 + i * .1 + azar() * .03), py = h * (.68 + azar() * .18), sc = h * .075;
      x.fillStyle = '#f2efe6'; x.beginPath(); x.ellipse(px, py, sc * 1.1, sc * .5, 0, 0, Math.PI * 2); x.fill();
      x.beginPath(); x.ellipse(px + sc * .55, py - sc * .45, sc * .3, sc * .25, 0, 0, Math.PI * 2); x.fill();
      x.beginPath(); x.ellipse(px + sc * 1.15, py - sc * .2, sc * .32, sc * .2, .4, 0, Math.PI * 2); x.fill();
      x.strokeStyle = '#f2efe6'; x.lineWidth = sc * .16; [-.7, -.4, .4, .7].forEach(d => { x.beginPath(); x.moveTo(px + d * sc, py + sc * .3); x.lineTo(px + d * sc, py + sc * .9); x.stroke(); });
      x.fillStyle = '#d9d4c7'; x.beginPath(); x.ellipse(px + sc * 1.05, py - sc * .05, sc * .1, sc * .22, .3, 0, Math.PI * 2); x.fill();       // oreja caída
      x.fillStyle = '#c9c3b5'; x.beginPath(); x.ellipse(px + sc * .2, py + sc * .25, sc * .5, sc * .14, 0, 0, Math.PI * 2); x.fill();          // papada y sombra
      x.strokeStyle = '#3a332c'; x.lineWidth = 2.5; x.beginPath(); x.moveTo(px + sc * 1.15, py - sc * .35); x.quadraticCurveTo(px + sc * 1.2, py - sc * .6, px + sc * 1.05, py - sc * .65); x.stroke();
      x.fillStyle = '#2b2b2b'; x.beginPath(); x.arc(px + sc * 1.3, py - sc * .2, sc * .04, 0, Math.PI * 2); x.fill();
    }
    caballo(x, w * .82, h * .66, h * .32, '#7a4a28', '#1b1009', 1);
    jinete(x, w * .82, h * .66, h * .32, { camisa: '#f4eee2', piel: '#c99a6e', pantalon: '#2b3a55', tocado: 'sombrero', sombrero: '#5a4632', ribete: '#1b1009', arma: false });
  }
};

function dibujarMuralLlano(x, W, H) {
  // Fondo de sol radiante en colores del Llano
  const f = x.createRadialGradient(W / 2, H * .55, 20, W / 2, H * .55, W * .7); f.addColorStop(0, '#ffcf6e'); f.addColorStop(.5, '#e9772f'); f.addColorStop(1, '#8e2b1f');
  x.fillStyle = f; x.fillRect(0, 0, W, H);
  x.save(); x.globalAlpha = .14; x.fillStyle = '#fff3c4';
  for (let i = 0; i < 32; i++) { const a = i / 32 * Math.PI * 2, b = a + .07; x.beginPath(); x.moveTo(W / 2, H * .55); x.lineTo(W / 2 + Math.cos(a) * W, H * .55 + Math.sin(a) * W); x.lineTo(W / 2 + Math.cos(b) * W, H * .55 + Math.sin(b) * W); x.fill(); }
  x.restore();
  // Título
  x.textAlign = 'center';
  x.fillStyle = '#fff6e0'; x.font = `600 ${H * .1}px ${MURAL_SERIF}`; x.fillText('Postales del Llano', W / 2, H * .15);
  x.font = `italic 400 ${H * .042}px ${MURAL_SERIF}`; x.fillText('Meta, Colombia · la tierra que pinta el maestro', W / 2, H * .21);
  // Seis postales en dos filas
  const pw = W * .26, ph = H * .3;
  const lista = [
    ['Caño Cristales · La Macarena', VIÑETAS.canoCristales, -.04], ['Atardecer en el morichal', VIÑETAS.morichal, .03], ['El joropo', VIÑETAS.joropo, -.02],
    ['Obelisco · Puerto López, centro de Colombia', VIÑETAS.obelisco, .025], ['Garzas en el estero', VIÑETAS.garzas, -.03], ['La faena llanera', VIÑETAS.faena, .035]
  ];
  lista.forEach(([t, fn, ang], i) => {
    const col = i % 3, fila = Math.floor(i / 3);
    postal(x, W * (.2 + col * .3), H * (.42 + fila * .34), pw, ph, ang, t, fn);
  });
  marcoTejido(x, W, H, H * .035, ['#1f3b2c', '#e2a33a', '#8e2b1f', '#f3e3c3']);
}

/* ---------- Cuadro de la fachada mientras llega la foto ---------- */
function dibujarMarcoFoto(x, W, H, titulo, lugar) {
  const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#5a4535'); g.addColorStop(1, '#241A13');
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  x.strokeStyle = '#b8914f'; x.lineWidth = 6; x.strokeRect(24, 24, W - 48, H - 48);
  x.textAlign = 'center'; x.fillStyle = '#e3c88f'; x.font = `500 ${W * .085}px ${MURAL_SERIF}`;
  const palabras = titulo.split(' '); let linea = '', y = H * .42; const lineas = [];
  palabras.forEach(p => { const prueba = linea ? linea + ' ' + p : p; if (x.measureText(prueba).width > W * .8 && linea) { lineas.push(linea); linea = p; } else linea = prueba; });
  lineas.push(linea); lineas.forEach((l, i) => x.fillText(l, W / 2, y + i * W * .1));
  x.fillStyle = '#b3a58f'; x.font = `italic 400 ${W * .055}px ${MURAL_SERIF}`; x.fillText(lugar, W / 2, y + lineas.length * W * .1 + W * .02);
  x.font = `300 ${W * .045}px ${MURAL_SANS}`; x.fillText('Fotografía próximamente', W / 2, H * .85);
}
