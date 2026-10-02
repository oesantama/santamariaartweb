/* =====================================================================
   CASA-MUSEO 3D · Edgar Santamaría Caleño
   ---------------------------------------------------------------------
   Exterior: casa llanera de dos pisos al atardecer, con un atril en la
   entrada (información del autor y catálogos).
   Piso 1: sala del pintor, con las obras de js/datos.js (OBRAS).
   Piso 2: taller del ebanista, con muebles modelados (piezas ilustrativas
   mientras llegan fotos de trabajos reales).

   Navegación: arrastrar para mirar, clic en el piso para caminar,
   W A S D o flechas, rueda del mouse, clic en una obra para verla,
   y recorrido guiado con las flechas de abajo o el plano.

   Usa Three.js r149 (js/vendor/three.min.js). Todas las medidas en metros.
   ===================================================================== */
(async () => {
  'use strict';
  const $ = id => document.getElementById(id);
  const T = THREE;
  const tactil = matchMedia('(pointer: coarse)').matches;
  const reducirMov = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SERIF = '"Cormorant Garamond", Georgia, serif';
  const SANS = 'Jost, "Segoe UI", system-ui, sans-serif';

  /* ---------- 0. Comprobaciones ---------- */
  function aviso(texto) {
    $('carga').hidden = true; $('avisoTexto').textContent = texto; $('aviso').hidden = false;
  }
  if (location.protocol === 'file:') {
    aviso('Por seguridad, el navegador no deja cargar las fotos de las obras cuando la página se abre como archivo. Ábrala desde Netlify o con la extensión Live Server de Visual Studio Code.');
    return;
  }
  let renderer;
  let modoClima = 'soleado';
  let nubes3D = null;
  let sistemaLluvia = null;
  let geoLluvia = null;
  let numGotas = 1600;

  function cambiarClima(modo) {
    modoClima = modo;
    if (nubes3D) nubes3D.visible = (modo === 'nublado' || modo === 'lluvia');
    if (sistemaLluvia) sistemaLluvia.visible = (modo === 'lluvia');
    document.querySelectorAll('.btn-clima').forEach(b => {
      if (b.id) b.classList.toggle('activo', b.id.toLowerCase().includes(modo));
    });
  }
  const canvasElem = $('escena');
  const opcionesWebGL = [
    { canvas: canvasElem, antialias: true, powerPreference: 'high-performance' },
    { canvas: canvasElem, antialias: true, powerPreference: 'default' },
    { canvas: canvasElem, antialias: false, powerPreference: 'default', failIfMajorPerformanceCaveat: false }
  ];
  for (const opt of opcionesWebGL) {
    try {
      const testRenderer = new T.WebGLRenderer(opt);
      if (testRenderer && testRenderer.getContext()) {
        renderer = testRenderer;
        break;
      }
    } catch (e) {}
  }
  if (!renderer) {
    aviso('Este navegador o dispositivo no tiene activada la aceleración 3D (WebGL). Puede ver toda la información en la versión clásica.');
    return;
  }

  aplicarEnlacesComunes();
  await cargarDatos(() => {});
  // Espera las tipografías para dibujar los letreros (máximo 2,5 s)
  await Promise.race([
    Promise.all([document.fonts.load(`500 40px ${SERIF}`), document.fonts.load(`italic 400 40px ${SERIF}`), document.fonts.load(`300 20px ${SANS}`), document.fonts.load(`400 20px ${SANS}`)]).catch(() => {}),
    new Promise(r => setTimeout(r, 2500))
  ]);

  /* ---------- 1. Motor ---------- */
  renderer.setPixelRatio(Math.min(devicePixelRatio, tactil ? 1.5 : 2));
  renderer.outputEncoding = T.sRGBEncoding;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const escena = new T.Scene();
  escena.fog = new T.Fog(0xbde0fe, 80, 320);
  const camara = new T.PerspectiveCamera(tactil ? 70 : 62, 1, 0.05, 500);
  camara.rotation.order = 'YXZ';
  const ANISO = Math.min(8, renderer.capabilities.getMaxAnisotropy());

  const gestor = new T.LoadingManager();
  gestor.onProgress = (_, hechos, total) => { $('cargaProgreso').style.width = `${Math.round(hechos / total * 100)}%`; };
  const cargadorTex = new T.TextureLoader(gestor);
  cargadorTex.setCrossOrigin('anonymous');
  const cargarTextura = url => new Promise(res => cargadorTex.load(url, t => { t.encoding = T.sRGBEncoding; t.anisotropy = ANISO; res(t); }, undefined, () => res(null)));
  const cargarImagen = url => new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = url; });

  /* ---------- 2. Ayudas de construcción ---------- */
  // Textura dibujada en un canvas 2D
  function lienzo(w, h, dibujar) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    dibujar(c.getContext('2d'), w, h);
    const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.anisotropy = ANISO;
    return t;
  }
  const repetir = (t, x, y, rot = 0) => {
    const r = t.clone(); r.needsUpdate = true; r.wrapS = r.wrapT = T.RepeatWrapping; r.repeat.set(x, y);
    if (rot) { r.center.set(.5, .5); r.rotation = rot; }
    return r;
  };
  // Veta de madera (horizontal); "tablas" agrega juntas de tablones
  function texMadera(base, oscuro, { tablas = 0, lineas = 150 } = {}) {
    return lienzo(512, 512, (x, w, h) => {
      x.fillStyle = base; x.fillRect(0, 0, w, h);
      for (let i = 0; i < lineas; i++) {
        const y0 = Math.random() * h;
        x.strokeStyle = oscuro; x.globalAlpha = .04 + Math.random() * .16; x.lineWidth = .5 + Math.random() * 2.2;
        x.beginPath(); x.moveTo(-10, y0);
        for (let xx = 0; xx <= w + 20; xx += 24) x.lineTo(xx, y0 + Math.sin(xx / 70 + i) * 3 + Math.sin(xx / 23 + i * 2) * 1.2);
        x.stroke();
      }
      if (tablas) {
        const alto = h / tablas;
        x.globalAlpha = .6; x.strokeStyle = '#140c07'; x.lineWidth = 2;
        for (let k = 0; k < tablas; k++) {
          const y = k * alto;
          x.beginPath(); x.moveTo(0, y); x.lineTo(w, y); x.stroke();
          const off = (k % 3) * w / 3;
          x.beginPath(); x.moveTo(off, y); x.lineTo(off, y + alto); x.stroke();
        }
      }
      x.globalAlpha = 1;
    });
  }
  // Forro de tablas verticales (para los muros del taller)
  function texTablas(base, oscuro, tablas = 6) {
    return lienzo(512, 512, (x, w, h) => {
      x.fillStyle = base; x.fillRect(0, 0, w, h);
      const ancho = w / tablas;
      for (let k = 0; k < tablas; k++) {
        x.fillStyle = k % 2 ? 'rgba(0,0,0,.06)' : 'rgba(255,230,190,.05)'; x.fillRect(k * ancho, 0, ancho, h);
        for (let i = 0; i < 18; i++) {
          const x0 = k * ancho + Math.random() * ancho;
          x.strokeStyle = oscuro; x.globalAlpha = .05 + Math.random() * .14; x.lineWidth = .5 + Math.random() * 1.8;
          x.beginPath(); x.moveTo(x0, 0);
          for (let y = 0; y <= h; y += 24) x.lineTo(x0 + Math.sin(y / 60 + i) * 2.5, y);
          x.stroke();
        }
        x.globalAlpha = .55; x.fillStyle = '#1a0f08'; x.fillRect(k * ancho, 0, 2, h);
      }
      x.globalAlpha = 1;
    });
  }
  function texRuido(base, variacion, puntos = 9000) {
    return lienzo(256, 256, (x, w, h) => {
      x.fillStyle = base; x.fillRect(0, 0, w, h);
      for (let i = 0; i < puntos; i++) {
        x.fillStyle = variacion[i % variacion.length]; x.globalAlpha = .25 + Math.random() * .35;
        x.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 1 + Math.random() * 3);
      }
    });
  }
  // Ajusta un texto a un ancho máximo en varias líneas
  function parrafo(x, texto, cx, y, ancho, alto) {
    const palabras = String(texto).split(' '); let linea = '';
    for (const p of palabras) {
      const prueba = linea ? linea + ' ' + p : p;
      if (x.measureText(prueba).width > ancho && linea) { x.fillText(linea, cx, y); y += alto; linea = p; } else linea = prueba;
    }
    if (linea) x.fillText(linea, cx, y);
    return y + alto;
  }

  const std = (color, extra = {}) => new T.MeshStandardMaterial({ color, roughness: .85, metalness: 0, ...extra });
  const basico = (opts) => new T.MeshBasicMaterial({ toneMapped: false, ...opts });
  const GEO_CAJA = new T.BoxGeometry(1, 1, 1);
  // Caja desde límites mínimos y máximos
  function bloque(x0, x1, y0, y1, z0, z1, mat, padre = escena) {
    const m = new T.Mesh(GEO_CAJA, mat);
    m.scale.set(Math.abs(x1 - x0), Math.abs(y1 - y0), Math.abs(z1 - z0));
    m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    padre.add(m); return m;
  }
  function plano(w, h, mat, padre = escena) { const m = new T.Mesh(new T.PlaneGeometry(w, h), mat); padre.add(m); return m; }
  // Orienta un objeto para que mire hacia la dirección (nx, nz)
  const mirarHacia = (obj, nx, nz) => { obj.rotation.y = Math.atan2(nx, nz); return obj; };

  /* ---------- 3. Materiales ---------- */
  const M = {
    pared: std(0xe2d7c3, { roughness: .95 }),
    estuco: std(0xf1e8d8, { roughness: .95 }),
    zocalo: std(0x8e4f32, { roughness: .9 }),
    techo: std(0xf3ece0, { roughness: 1 }),
    nogal: std(0xffffff, { map: repetir(texMadera('#5a3a24', '#1e120a'), 1, 1) }),
    nogalV: std(0xffffff, { map: repetir(texMadera('#5a3a24', '#1e120a'), 1, 1, Math.PI / 2) }),
    cedro: std(0xffffff, { map: repetir(texMadera('#8a5a34', '#3b2414'), 1, 1) }),
    cedroV: std(0xffffff, { map: repetir(texMadera('#8a5a34', '#3b2414'), 1, 1, Math.PI / 2) }),
    roble: std(0xffffff, { map: repetir(texMadera('#b98c5c', '#6e4a2a'), 1, 1, Math.PI / 2) }),
    pino: std(0xffffff, { map: repetir(texMadera('#d6b787', '#9a7a4e', { lineas: 90 }), 1, 1) }),
    oro: std(0xb8914f, { metalness: .65, roughness: .35 }),
    metal: std(0x2b2b2b, { metalness: .7, roughness: .35 }),
    acero: std(0xbfc3c6, { metalness: .8, roughness: .25 }),
    meson: std(0xd9d3c9, { roughness: .35 }),
    negro: std(0x1a1714, { roughness: .6 }),
    lino: std(0xe8dfcc, { roughness: 1 }),
    luzVentana: basico({ color: 0xffc77a }),
    lampara: basico({ color: 0xfff1d6 }),
    hoja: std(0x3d5a26, { side: T.DoubleSide, roughness: .9 }),
    hojaSeca: std(0x6e5530, { side: T.DoubleSide, roughness: 1 }),
    tronco: std(0x4f4337, { roughness: 1 }),
    sombra: new T.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: .22, depthWrite: false })
  };
  // Textura de empedrado / adoquines artesanales
  function texEmpedrado() {
    return lienzo(512, 512, (x, w, h) => {
      x.fillStyle = '#483c30'; x.fillRect(0, 0, w, h);
      const filas = 16, cols = 8;
      const altoFila = h / filas, anchoCol = w / cols;
      const tonosPiedra = ['#a1907b', '#b9ab96', '#877864', '#c4b7a4', '#948371', '#7b6c59', '#a99884', '#8f806e'];
      for (let f = 0; f < filas; f++) {
        const desfasar = (f % 2) * (anchoCol / 2);
        for (let c = -1; c <= cols; c++) {
          const px = c * anchoCol + desfasar + (Math.sin(f + c * 2) * 2.5);
          const py = f * altoFila + (Math.cos(f * 2 + c) * 2.5);
          const pw = anchoCol - 5 + (Math.sin(f * 3 + c) * 3);
          const ph = altoFila - 5 + (Math.cos(c * 3 + f) * 3);
          const colorPiedra = tonosPiedra[(f * 7 + c * 3 + 12) % tonosPiedra.length];

          x.fillStyle = colorPiedra;
          x.beginPath();
          if (x.roundRect) x.roundRect(px + 2, py + 2, pw, ph, 7); else x.rect(px + 2, py + 2, pw, ph);
          x.fill();

          x.strokeStyle = 'rgba(255, 255, 255, 0.28)'; x.lineWidth = 1.5;
          x.beginPath(); x.moveTo(px + 4, py + ph - 4); x.lineTo(px + 4, py + 4); x.lineTo(px + pw - 4, py + 4); x.stroke();

          x.strokeStyle = 'rgba(0, 0, 0, 0.38)'; x.lineWidth = 1.5;
          x.beginPath(); x.moveTo(px + pw - 4, py + 4); x.lineTo(px + pw - 4, py + ph - 4); x.lineTo(px + 4, py + ph - 4); x.stroke();
        }
      }
    });
  }

  M.piso1 = std(0xffffff, { map: repetir(texMadera('#8b5e3b', '#3f2716', { tablas: 8 }), 6, 4, Math.PI / 2), roughness: .6 });
  M.piso2 = std(0xffffff, { map: repetir(texMadera('#6b4429', '#26170c', { tablas: 8 }), 6, 4, Math.PI / 2), roughness: .65 });
  M.panelado = std(0xffffff, { map: repetir(texTablas('#7a5234', '#2e1c0f'), 9, 1), roughness: .8 });
  M.hierba = std(0xffffff, { map: repetir(texRuido('#566b33', ['#3f5226', '#6f8442', '#7b8a48', '#4a5f2c']), 70, 70) });
  M.piedra = std(0xffffff, { map: repetir(texEmpedrado(), 2, 18), roughness: .82 });
  M.patio = std(0xffffff, { map: repetir(texRuido('#a58e72', ['#8d775d', '#c0a98b', '#7b6853'], 6000), 14, 3) });
  M.teja = std(0xffffff, {
    map: repetir(lienzo(256, 256, (x, w, h) => {
      x.fillStyle = '#9b4f2e'; x.fillRect(0, 0, w, h);
      for (let f = 0; f < 8; f++) for (let c = 0; c < 8; c++) {
        const cx = c * 32 + (f % 2) * 16, cy = f * 32;
        const g = x.createLinearGradient(cx, 0, cx + 32, 0);
        g.addColorStop(0, '#7e3c22'); g.addColorStop(.5, '#b8653d'); g.addColorStop(1, '#6e331d');
        x.fillStyle = g; x.fillRect(cx, cy, 32, 30);
        x.fillStyle = 'rgba(40,15,5,.45)'; x.fillRect(cx, cy + 28, 32, 4);
      }
    }), 10, 6)
  });

  /* ---------- 4. EXTERIOR Y SISTEMA DINÁMICO 24H ---------- */
  // 1. Cielo con Shader Dinámico
  const matCielo = new T.ShaderMaterial({
    side: T.BackSide, depthWrite: false, fog: false,
    uniforms: {
      arriba: { value: new T.Color('#2c6eb8') },
      medio: { value: new T.Color('#61b0f5') },
      horizonte: { value: new T.Color('#c4e5ff') }
    },
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'uniform vec3 arriba; uniform vec3 medio; uniform vec3 horizonte; varying vec3 vP; void main(){ float h = vP.y; vec3 c = h > .15 ? mix(medio, arriba, smoothstep(.15, .68, h)) : mix(horizonte, medio, smoothstep(-.02, .15, h)); gl_FragColor = vec4(c, 1.0); }'
  });
  const cielo = new T.Mesh(new T.SphereGeometry(320, 32, 16), matCielo);
  escena.add(cielo);

  // 2. Campo de Estrellas Nocturnas (Mundo Llanero)
  const numEstrellas = 1200;
  const geoEstrellas = new T.BufferGeometry();
  const posEstrellas = new Float32Array(numEstrellas * 3);
  for (let i = 0; i < numEstrellas; i++) {
    const r = 310;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 0.95);
    posEstrellas[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    posEstrellas[i * 3 + 1] = r * Math.cos(phi);
    posEstrellas[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  geoEstrellas.setAttribute('position', new T.BufferAttribute(posEstrellas, 3));
  const matEstrellas = new T.PointsMaterial({ color: 0xffffff, size: 2.2, transparent: true, opacity: 0, fog: false });
  const estrellas = new T.Points(geoEstrellas, matEstrellas);
  escena.add(estrellas);

  // 3. Sol (Limpio sin halo exterior)
  const sol = new T.Mesh(new T.CircleGeometry(11, 32), basico({ color: 0xfffbe6, fog: false }));
  escena.add(sol);
  const halo = new T.Mesh(new T.CircleGeometry(35, 32), basico({ color: 0xe0f2ff, transparent: true, opacity: 0, fog: false, depthWrite: false }));
  halo.visible = false; escena.add(halo);

  // 4. Luna Llena Nocturna (Limpia sin halo exterior)
  const texLuna = lienzo(256, 256, (x, w, h) => {
    const rad = w / 2 - 8;
    const g = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, rad);
    g.addColorStop(0, '#ffffff'); g.addColorStop(0.65, '#e8f0fe'); g.addColorStop(1, '#bcd2ee');
    x.fillStyle = g; x.beginPath(); x.arc(w / 2, h / 2, rad, 0, Math.PI * 2); x.fill();
    x.fillStyle = 'rgba(120, 140, 175, 0.22)';
    [[100, 90, 22], [160, 130, 28], [85, 148, 16], [145, 75, 14], [165, 168, 18]].forEach(([cx, cy, cr]) => {
      x.beginPath(); x.arc(cx, cy, cr, 0, Math.PI * 2); x.fill();
    });
  });
  const luna = new T.Mesh(new T.CircleGeometry(12, 32), basico({ map: texLuna, transparent: true, fog: false }));
  escena.add(luna);
  const haloLuna = new T.Mesh(new T.CircleGeometry(42, 32), basico({ color: 0x94baff, transparent: true, opacity: 0, fog: false, depthWrite: false }));
  haloLuna.visible = false; escena.add(haloLuna);

  // 5. Luces de escena
  const hemi = new T.HemisphereLight(0xdbf0ff, 0x556e3b, .75); escena.add(hemi);
  const luzSol = new T.DirectionalLight(0xfff5e6, 1.35); escena.add(luzSol);
  const luzRelleno = new T.DirectionalLight(0xbde3ff, .35); luzRelleno.position.set(50, 40, -30); escena.add(luzRelleno);

  // 6. Claves atmosféricas de 0:00 a 24:00 horas
  const CLAVES_TIEMPO = [
    { h: 0.0,  arriba: '#030816', medio: '#081126', horiz: '#111d38', fog: 0x091224, solCol: 0xffffff, luzCol: 0x789edd, luzInt: 0.45, hemiSky: 0x152238, hemiGnd: 0x091220, noche: 1 },
    { h: 5.0,  arriba: '#030816', medio: '#081126', horiz: '#111d38', fog: 0x091224, solCol: 0xffffff, luzCol: 0x789edd, luzInt: 0.45, hemiSky: 0x152238, hemiGnd: 0x091220, noche: 1 },
    { h: 5.8,  arriba: '#171c3b', medio: '#994c50', horiz: '#f29857', fog: 0xd48763, solCol: 0xffaa66, luzCol: 0xffa873, luzInt: 0.70, hemiSky: 0x9e5f54, hemiGnd: 0x48352b, noche: 0.4 },
    { h: 7.0,  arriba: '#1e52a8', medio: '#4d9ae6', horiz: '#b5dfff', fog: 0xbce2ff, solCol: 0xfff0cb, luzCol: 0xffeabf, luzInt: 1.25, hemiSky: 0xd9e4f5, hemiGnd: 0x485832, noche: 0 },
    { h: 12.0, arriba: '#0d4bb3', medio: '#398be8', horiz: '#a3d5ff', fog: 0xace0ff, solCol: 0xfffbe6, luzCol: 0xffffff, luzInt: 1.40, hemiSky: 0xdbf0ff, hemiGnd: 0x556e3b, noche: 0 },
    { h: 17.5, arriba: '#241438', medio: '#c94924', horiz: '#ffa238', fog: 0xd47d4e, solCol: 0xff7733, luzCol: 0xff8c42, luzInt: 1.20, hemiSky: 0xb55a4c, hemiGnd: 0x3d2b24, noche: 0 },
    { h: 19.0, arriba: '#0a1128', medio: '#3b1c47', horiz: '#73333f', fog: 0x1b192e, solCol: 0xff8866, luzCol: 0x5d6296, luzInt: 0.50, hemiSky: 0x272440, hemiGnd: 0x141324, noche: 0.7 },
    { h: 24.0, arriba: '#030816', medio: '#081126', horiz: '#111d38', fog: 0x091224, solCol: 0xffffff, luzCol: 0x789edd, luzInt: 0.45, hemiSky: 0x152238, hemiGnd: 0x091220, noche: 1 }
  ];

  let horaManual = null;

  function actualizarCicloDiaNoche() {
    const d = new Date();
    const hora = horaManual !== null ? horaManual : (d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600);

    let k0 = CLAVES_TIEMPO[0], k1 = CLAVES_TIEMPO[CLAVES_TIEMPO.length - 1];
    for (let i = 0; i < CLAVES_TIEMPO.length - 1; i++) {
      if (hora >= CLAVES_TIEMPO[i].h && hora <= CLAVES_TIEMPO[i + 1].h) {
        k0 = CLAVES_TIEMPO[i]; k1 = CLAVES_TIEMPO[i + 1]; break;
      }
    }
    const t = (hora - k0.h) / (k1.h - k0.h);
    const lerpC = (cA, cB) => new T.Color(cA).lerp(new T.Color(cB), t);
    const lerpVal = (vA, vB) => vA + (vB - vA) * t;

    matCielo.uniforms.arriba.value.copy(lerpC(k0.arriba, k1.arriba));
    matCielo.uniforms.medio.value.copy(lerpC(k0.medio, k1.medio));
    matCielo.uniforms.horizonte.value.copy(lerpC(k0.horiz, k1.horiz));
    escena.fog.color.copy(lerpC(k0.fog, k1.fog));

    const nocheVal = lerpVal(k0.noche, k1.noche);
    matEstrellas.opacity = nocheVal;

    const esDia = hora >= 6 && hora < 18;
    if (esDia) {
      const progSol = (hora - 6) / 12;
      const angSol = progSol * Math.PI;
      const posX = -Math.cos(angSol) * 210;
      const posY = Math.sin(angSol) * 160 + 10;
      sol.position.set(posX, posY, -180); sol.lookAt(0, 0, 0);
      sol.visible = true; halo.visible = false;
      luna.visible = false; haloLuna.visible = false;
      luzSol.position.set(posX * 0.4, Math.max(20, posY * 0.6), 50);
    } else {
      const hNoche = hora >= 18 ? hora - 18 : hora + 6;
      const progLuna = hNoche / 12;
      const angLuna = progLuna * Math.PI;
      const posX = -Math.cos(angLuna) * 210;
      const posY = Math.sin(angLuna) * 160 + 10;
      luna.position.set(posX, posY, -180); luna.lookAt(0, 0, 0);
      sol.visible = false; halo.visible = false;
      luna.visible = true; haloLuna.visible = false;
      luzSol.position.set(posX * 0.4, Math.max(20, posY * 0.6), 50);
    }

    luzSol.color.copy(lerpC(k0.luzCol, k1.luzCol));
    const intSol = lerpVal(k0.luzInt, k1.luzInt);
    const fuera = camara.position.z > 0.5;
    luzSol.intensity = intSol * (fuera ? 1.0 : 0.15);
    hemi.color.copy(lerpC(k0.hemiSky, k1.hemiSky));
    hemi.groundColor.copy(lerpC(k0.hemiGnd, k1.hemiGnd));

    // Actualizar luces solares del camino
    const intSolar = Math.max(0, (nocheVal - 0.12) / 0.88);
    lucesSolaresCamino.forEach(({ luz, cristal }) => {
      luz.intensity = intSolar * 1.35;
      cristal.material.opacity = 0.25 + intSolar * 0.7;
    });
  }

  const suelo = new T.Mesh(new T.PlaneGeometry(500, 500), M.hierba);
  suelo.rotation.x = -Math.PI / 2; suelo.position.y = -0.02; escena.add(suelo);
  const camino = new T.Mesh(new T.PlaneGeometry(3.2, 30), M.piedra);
  camino.rotation.x = -Math.PI / 2; camino.position.set(0, .005, 19); escena.add(camino);
  const patio = new T.Mesh(new T.PlaneGeometry(28, 4.2), M.patio);
  patio.rotation.x = -Math.PI / 2; patio.position.set(0, .01, 2.1); escena.add(patio);

  // Estacas / Luces solares de jardín a las orillas del camino
  const lucesSolaresCamino = [];
  const matEstacaMetal = std(0x22262b, { roughness: 0.4, metalness: 0.6 });

  function crearEstacaSolar(x, z) {
    const g = new T.Group(); g.position.set(x, 0, z);
    bloque(-.025, .025, 0, .42, -.025, .025, matEstacaMetal, g);
    bloque(-.04, .04, .42, .45, -.04, .04, matEstacaMetal, g);
    const matCristal = basico({ color: 0xffeaad, transparent: true, opacity: 0.3 });
    const cristal = bloque(-.045, .045, .45, .56, -.045, .045, matCristal, g);
    bloque(-.06, .06, .56, .59, -.06, .06, matEstacaMetal, g);
    const luzSolar = new T.PointLight(0xffca75, 0, 4.0, 1.6);
    luzSolar.position.set(0, .50, 0); g.add(luzSolar);

    const s = new T.Mesh(new T.CircleGeometry(.12, 12), M.sombra);
    s.rotation.x = -Math.PI / 2; s.position.y = .01; g.add(s);
    escena.add(g);
    lucesSolaresCamino.push({ luz: luzSolar, cristal });
  }

  for (let z = 4.5; z <= 29; z += 3.8) {
    crearEstacaSolar(-1.75, z);
    crearEstacaSolar(1.75, z);
  }

  // SISTEMA DE CLIMA LLANERO (Soleado, Nublado, Lluvia)
  nubes3D = new T.Group(); escena.add(nubes3D);
  const matNube = std(0xffffff, { roughness: 1, transparent: true, opacity: 0.85 });
  for (let i = 0; i < 16; i++) {
    const nube = new T.Group();
    const nx = (Math.random() - 0.5) * 320, ny = 38 + Math.random() * 24, nz = (Math.random() - 0.5) * 320;
    nube.position.set(nx, ny, nz);
    for (let p = 0; p < 7; p++) {
      const copo = new T.Mesh(new T.SphereGeometry(7 + Math.random() * 11, 12, 8), matNube);
      copo.position.set((Math.random() - 0.5) * 24, (Math.random() - 0.5) * 7, (Math.random() - 0.5) * 24);
      nube.add(copo);
    }
    nubes3D.add(nube);
  }
  nubes3D.visible = false;

  geoLluvia = new T.BufferGeometry();
  const posGotas = new Float32Array(numGotas * 3);
  for (let i = 0; i < numGotas; i++) {
    posGotas[i * 3] = (Math.random() - 0.5) * 160;
    posGotas[i * 3 + 1] = Math.random() * 45;
    posGotas[i * 3 + 2] = (Math.random() - 0.5) * 160;
  }
  geoLluvia.setAttribute('position', new T.BufferAttribute(posGotas, 3));
  const matLluvia = new T.PointsMaterial({ color: 0x9ec7ff, size: 0.35, transparent: true, opacity: 0.75, fog: false });
  sistemaLluvia = new T.Points(geoLluvia, matLluvia);
  sistemaLluvia.visible = false; escena.add(sistemaLluvia);

  // 1. CHOZAS / CANEYES LLANEROS DE PAJA (COMEDOR DE JORNALEROS AL LADO DE LA CASA)
  const texPaja = lienzo(256, 256, (x, w, h) => {
    x.fillStyle = '#b8944d'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 450; i++) {
      x.strokeStyle = i % 2 ? '#8f6e30' : '#d6b46b';
      x.lineWidth = 1 + Math.random() * 2.2;
      x.beginPath(); x.moveTo(Math.random() * w, Math.random() * h);
      x.lineTo(Math.random() * w, Math.random() * h); x.stroke();
    }
  });
  const matPaja = std(0xffffff, { map: repetir(texPaja, 4, 4), roughness: 0.95 });

  function crearChozaPaja(x, z, rotY = 0) {
    const g = new T.Group(); g.position.set(x, 0, z); g.rotation.y = rotY;
    const posPostes = [[-2.2, -1.5], [0, -1.5], [2.2, -1.5], [-2.2, 1.5], [0, 1.5], [2.2, 1.5]];
    posPostes.forEach(([px, pz]) => {
      const h = new T.Mesh(new T.CylinderGeometry(.13, .15, 2.8, 10), M.nogal);
      h.position.set(px, 1.4, pz); g.add(h);
    });
    bloque(-2.4, 2.4, 2.7, 2.85, -1.6, -1.4, M.nogal, g);
    bloque(-2.4, 2.4, 2.7, 2.85, 1.4, 1.6, M.nogal, g);
    bloque(-2.3, -2.1, 2.7, 2.85, -1.5, 1.5, M.nogal, g);
    bloque(2.1, 2.3, 2.7, 2.85, -1.5, 1.5, M.nogal, g);

    const techo = new T.Mesh(new T.ConeGeometry(3.7, 2.3, 4), matPaja);
    techo.position.set(0, 3.85, 0); techo.rotation.y = Math.PI / 4; g.add(techo);

    // Comedor de jornaleros adentro
    bloque(-1.4, 1.4, .75, .82, -.45, .45, M.cedro, g);
    [[-1.2, -.35], [1.2, -.35], [-1.2, .35], [1.2, .35]].forEach(([mx, mz]) => {
      bloque(mx - .06, mx + .06, 0, .75, mz - .06, mz + .06, M.nogal, g);
    });
    [-.75, .75].forEach(bz => {
      bloque(-1.4, 1.4, .42, .48, bz - .16, bz + .16, M.cedro, g);
      [-1.2, 1.2].forEach(bx => bloque(bx - .05, bx + .05, 0, .42, bz - .14, bz + .14, M.nogal, g));
    });

    const farol = new T.Mesh(new T.SphereGeometry(.1, 8, 8), basico({ color: 0xffcb6e }));
    farol.position.set(0, 2.4, 0); g.add(farol);
    const luzCaney = new T.PointLight(0xffb84d, 0.8, 6, 1.5);
    luzCaney.position.set(0, 2.3, 0); g.add(luzCaney);

    const s = new T.Mesh(new T.PlaneGeometry(5.2, 3.8), M.sombra);
    s.rotation.x = -Math.PI / 2; s.position.y = .01; g.add(s);
    escena.add(g);
  }
  // Chozas / Caneyes colocados al lado de la casa (visibles desde la fachada)
  crearChozaPaja(-17.5, 3.5, 0.25);
  crearChozaPaja(17.5, 3.5, -0.25);

  // 2. LAGUNA LLANERA CON AGUA REFLECTANTE Detrás de la Casa
  const texAgua = lienzo(256, 256, (x, w, h) => {
    x.fillStyle = '#1c6282'; x.fillRect(0, 0, w, h);
    x.strokeStyle = 'rgba(130, 215, 245, 0.45)'; x.lineWidth = 2;
    for (let i = 0; i < 40; i++) {
      const rx = Math.random() * w, ry = Math.random() * h, rw = 20 + Math.random() * 40;
      x.beginPath(); x.ellipse(rx, ry, rw, rw * 0.3, 0, 0, Math.PI * 2); x.stroke();
    }
  });
  const matAgua = std(0xffffff, { map: repetir(texAgua, 6, 3), roughness: 0.2, metalness: 0.1 });
  const laguna = new T.Mesh(new T.PlaneGeometry(100, 48), matAgua);
  laguna.rotation.x = -Math.PI / 2; laguna.position.set(0, 0.015, -45); escena.add(laguna);

  // Lirios de agua en la laguna
  const matLirios = std(0x2d6832, { roughness: 0.8 });
  for (let l = 0; l < 18; l++) {
    const lirio = new T.Mesh(new T.CircleGeometry(0.8 + Math.random() * 0.6, 10), matLirios);
    lirio.rotation.x = -Math.PI / 2;
    lirio.position.set((Math.random() - 0.5) * 80, 0.02, -45 + (Math.random() - 0.5) * 35);
    escena.add(lirio);
  }

  // 3. GANADO LLANERO (VACAS CEBÚ BLANCAS COMO LA FOTO)
  function crearVacaCebu(x, z, rotY = 0) {
    const g = new T.Group(); g.position.set(x, 0, z); g.rotation.y = rotY;
    const matPiel = std(0xf2f0e6, { roughness: 0.8 });
    const matCuerno = std(0x3a332c, { roughness: 0.7 });
    
    bloque(-.38, .38, .45, 1.05, -.75, .75, matPiel, g);
    const giba = new T.Mesh(new T.SphereGeometry(.28, 10, 10), matPiel);
    giba.scale.set(1, 1.2, 1.3); giba.position.set(0, 1.15, .25); g.add(giba);
    bloque(-.18, .18, .85, 1.25, .75, 1.15, matPiel, g);
    [-.18, .18].forEach(cx => {
      const c = new T.Mesh(new T.CylinderGeometry(.02, .035, .32, 8), matCuerno);
      c.position.set(cx, 1.35, .88); c.rotation.z = cx > 0 ? -.35 : .35; c.rotation.x = -.2; g.add(c);
    });
    [[-.28, -.5], [.28, -.5], [-.28, .5], [.28, .5]].forEach(([px, pz]) => {
      bloque(px - .08, px + .08, 0, .5, pz - .08, pz + .08, matPiel, g);
    });

    const s = new T.Mesh(new T.CircleGeometry(1.0, 16), M.sombra);
    s.rotation.x = -Math.PI / 2; s.position.y = .01; g.add(s);
    escena.add(g);
  }
  // Grupo de ganado cebú cerca de la laguna y el morichal
  [[-14, -38, 0.4], [-8, -48, -0.6], [12, -42, 2.2], [18, -46, -1.8], [-22, -46, 0.8]].forEach(p => crearVacaCebu(...p));

  // 4. PALMAS DE MORICHE REALISTAS (MORICHAL LLANERO COMO LA FOTO)
  const geoHoja = new T.CircleGeometry(2.8, 10, -0.42, .84); geoHoja.rotateX(-Math.PI / 2);
  function moricheRealista(x, z, alto = 14) {
    const g = new T.Group(); g.position.set(x, 0, z);
    const tronco = new T.Mesh(new T.CylinderGeometry(.22, .35, alto, 12), M.tronco);
    tronco.position.y = alto / 2; g.add(tronco);
    for (let y = 1; y < alto; y += .8) {
      const an = new T.Mesh(new T.TorusGeometry(.24 + (1 - y / alto) * .08, .012, 6, 12), M.tronco);
      an.rotation.x = Math.PI / 2; an.position.y = y; g.add(an);
    }

    const copa = new T.Group(); copa.position.y = alto; g.add(copa);
    for (let s = 0; s < 10; s++) {
      const p = new T.Group(); p.rotation.y = s / 10 * Math.PI * 2;
      const hs = new T.Mesh(geoHoja, M.hojaSeca);
      hs.rotation.z = -1.35; hs.position.x = .1; p.add(hs); copa.add(p);
    }
    for (let i = 0; i < 22; i++) {
      const p = new T.Group(); p.rotation.y = i / 22 * Math.PI * 2 + (Math.random() * .2);
      const h = new T.Mesh(geoHoja, M.hoja);
      h.rotation.z = (i % 2 ? 0.15 : -0.25) - Math.random() * 0.4;
      h.position.x = .15; p.add(h); copa.add(p);
    }
    const s = new T.Mesh(new T.CircleGeometry(3.2, 20), M.sombra);
    s.rotation.x = -Math.PI / 2; s.position.y = .02; g.add(s);
    escena.add(g);
  }
  [
    [-22, 6, 14], [-26, 2, 16], [-19, -12, 15], [-24, -20, 17],
    [23, 4, 14], [28, -6, 16], [20, -18, 15], [26, -26, 17],
    [-38, 20, 16], [38, 22, 17], [-12, -44, 15], [16, -48, 16],
    [-35, -42, 18], [35, -40, 18], [0, -58, 16]
  ].forEach(p => moricheRealista(...p));

  /* ---------- 5. LA CASA ---------- */
  // Límites de la casa: x -12.5..12.5, z -15.5..0 (fachada en z = 0). Piso 1: y 0..5, piso 2: y 5..10.
  const ANCHO = 12.5, FONDO = -15.5, ALTO = 10, P2 = 5;
  const PUERTA = { x: 1.3, alto: 3.6 };
  // Muros (cajas delgadas: se ven por dentro y por fuera)
  bloque(-ANCHO, -PUERTA.x, 0, ALTO, -0.3, 0, M.estuco);                 // fachada izquierda
  bloque(PUERTA.x, ANCHO, 0, ALTO, -0.3, 0, M.estuco);                   // fachada derecha
  bloque(-PUERTA.x, PUERTA.x, PUERTA.alto, ALTO, -0.3, 0, M.estuco);     // dintel
  bloque(-ANCHO, ANCHO, 0, ALTO, FONDO, FONDO + 0.3, M.pared);          // muro del fondo
  bloque(-ANCHO, -ANCHO + 0.3, 0, ALTO, FONDO, 0, M.pared);             // muro izquierdo
  bloque(ANCHO - 0.3, ANCHO, 0, ALTO, FONDO, 0, M.pared);               // muro derecho
  // Zócalo exterior
  bloque(-ANCHO - .03, -PUERTA.x, 0, .55, 0, .04, M.zocalo); bloque(PUERTA.x, ANCHO + .03, 0, .55, 0, .04, M.zocalo);
  bloque(-ANCHO - .04, -ANCHO, 0, .55, FONDO, 0, M.zocalo); bloque(ANCHO, ANCHO + .04, 0, .55, FONDO, 0, M.zocalo);
  // Entrepiso con hueco de escalera (x 9.2..12.2, z -13.6..-5)
  bloque(-12.2, 9.2, P2 - .2, P2, -15.2, -0.3, M.piso2);
  bloque(9.2, 12.2, P2 - .2, P2, -5, -0.3, M.piso2);
  bloque(9.2, 12.2, P2 - .2, P2, -15.2, -13.6, M.piso2);
  bloque(-12.2, 12.2, P2 - .21, P2 - .2, -15.2, -0.3, M.techo).position.y = P2 - .205; // cielo raso piso 1
  // Pisos y techo interior
  const piso1 = bloque(-12.2, 12.2, -.1, 0, -15.2, -0.3, M.piso1);
  bloque(-12.2, 12.2, ALTO - .2, ALTO, -15.2, -0.3, M.techo);
  // Cubierta a cuatro aguas con teja
  const geoCubierta = new T.ConeGeometry(Math.SQRT1_2, 1, 4, 1); geoCubierta.rotateY(Math.PI / 4);
  const cubierta = new T.Mesh(geoCubierta, M.teja);
  cubierta.scale.set(29.2, 4.4, 18.6); cubierta.position.set(0, ALTO + 2.2, -7.75);
  escena.add(cubierta);
  bloque(-13.9, 13.9, ALTO - .15, ALTO + .05, -16.9, 1.4, M.nogal); // alero

  // Corredor: pilares de madera, balcón del segundo piso con balaustrada
  [-12.4, -8, -4, 4, 8, 12.4].forEach(x => {
    bloque(x - .14, x + .14, 0, P2, 1.31, 1.59, M.nogalV);
    bloque(x - .22, x + .22, 0, .3, 1.23, 1.67, std(0x9c8b73));
  });
  bloque(-12.8, 12.8, P2 - .05, P2 + .12, 0, 1.75, M.nogal);           // piso del balcón
  bloque(-12.8, 12.8, P2 + 1.02, P2 + 1.1, 1.6, 1.72, M.nogal);        // pasamanos
  bloque(-12.8, 12.8, P2 + .14, P2 + .2, 1.6, 1.72, M.nogal);
  const balaustres = new T.InstancedMesh(new T.BoxGeometry(.06, .82, .06), M.nogal, 104);
  const mtx = new T.Matrix4();
  for (let i = 0; i < 104; i++) { mtx.makeTranslation(-12.7 + i * (25.4 / 103), P2 + .61, 1.66); balaustres.setMatrixAt(i, mtx); }
  escena.add(balaustres);
  bloque(-12.8, 12.8, P2 + 3.6, P2 + 3.7, .9, 1.7, M.nogal);             // viga del alero del balcón

  // Ventanas iluminadas (por fuera y por dentro) con postigos
  function ventana(x, y0, alto = 2, ancho = 1.4, postigos = true) {
    const y1 = y0 + alto;
    // Exterior
    plano(ancho, alto, M.luzVentana).position.set(x, (y0 + y1) / 2, .02);
    bloque(x - ancho / 2 - .1, x + ancho / 2 + .1, y0 - .12, y0, 0, .12, M.nogal);
    bloque(x - ancho / 2 - .1, x + ancho / 2 + .1, y1, y1 + .12, 0, .1, M.nogal);
    bloque(x - ancho / 2 - .1, x - ancho / 2, y0, y1, 0, .08, M.nogal);
    bloque(x + ancho / 2, x + ancho / 2 + .1, y0, y1, 0, .08, M.nogal);
    bloque(x - .03, x + .03, y0, y1, .02, .06, M.nogal);
    bloque(x - ancho / 2, x + ancho / 2, (y0 + y1) / 2 - .03, (y0 + y1) / 2 + .03, .02, .06, M.nogal);
    if (postigos) {
      [-1, 1].forEach(l => {
        const p = new T.Group(); p.position.set(x + l * (ancho / 2 + .1), y0, .06);
        const hoja = bloque(0, l * ancho / 2, 0, alto, 0, .05, M.cedroV, p);
        p.rotation.y = -l * .35; escena.add(p);
      });
    }
    // Interior (la luz del atardecer entrando)
    const dentro = plano(ancho, alto, basico({ color: 0xffd9a0 }));
    dentro.position.set(x, (y0 + y1) / 2, -0.31); dentro.rotation.y = Math.PI;
  }
  [-10, -6.5, 6.5, 10].forEach(x => ventana(x, 1.1));
  [-10, -6.5, -3, 3, 6.5, 10].forEach(x => ventana(x, P2 + 1.2, 2.1));
  ventana(0, P2 + .2, 3, 1.6, false); // puerta-ventana del balcón

  // Puerta principal de dos hojas, abierta hacia adentro
  const texPuerta = lienzo(256, 512, (x, w, h) => {
    x.fillStyle = '#4a2e1b'; x.fillRect(0, 0, w, h);
    const tablero = (y, alto) => {
      x.fillStyle = '#5c3a22'; x.fillRect(28, y, w - 56, alto);
      x.strokeStyle = 'rgba(0,0,0,.45)'; x.lineWidth = 6; x.strokeRect(28, y, w - 56, alto);
      x.strokeStyle = 'rgba(255,220,170,.18)'; x.lineWidth = 3; x.strokeRect(40, y + 12, w - 80, alto - 24);
      x.beginPath(); x.moveTo(w / 2, y + 30); x.lineTo(w - 60, y + alto / 2); x.lineTo(w / 2, y + alto - 30); x.lineTo(60, y + alto / 2); x.closePath(); x.stroke();
    };
    tablero(30, 200); tablero(260, 220);
  });
  const matPuerta = std(0xffffff, { map: texPuerta });
  const hojasPuerta = [];
  [-1, 1].forEach(l => {
    const bisagra = new T.Group(); bisagra.position.set(l * PUERTA.x, 0, -0.15);
    const hoja = bloque(0, -l * PUERTA.x, 0, PUERTA.alto, -.04, .04, [matPuerta], bisagra);
    hoja.material = [M.nogal, M.nogal, M.nogal, M.nogal, matPuerta, matPuerta];
    bisagra.rotation.y = -l * 1.25; escena.add(bisagra); hojasPuerta.push(hoja);
  });
  bloque(-PUERTA.x - .18, -PUERTA.x, 0, PUERTA.alto + .18, -.32, .1, M.nogal);
  bloque(PUERTA.x, PUERTA.x + .18, 0, PUERTA.alto + .18, -.32, .1, M.nogal);
  bloque(-PUERTA.x - .18, PUERTA.x + .18, PUERTA.alto, PUERTA.alto + .18, -.32, .1, M.nogal);
  // Faroles a los lados de la puerta
  [-1, 1].forEach(l => {
    bloque(l * 2.1 - .12, l * 2.1 + .12, 2.6, 3.0, .02, .26, M.metal);
    plano(.16, .3, M.lampara).position.set(l * 2.1, 2.8, .27);
    const p = new T.PointLight(0xffb866, .9, 9, 1.6); p.position.set(l * 2.1, 2.8, .8); escena.add(p);
  });
  // Letrero sobre la puerta
  const letrero = plano(3.6, .62, basico({
    map: lienzo(1024, 176, (x, w, h) => {
      x.fillStyle = '#2a1c12'; x.fillRect(0, 0, w, h);
      x.strokeStyle = '#b8914f'; x.lineWidth = 4; x.strokeRect(10, 10, w - 20, h - 20);
      x.fillStyle = '#e3c88f'; x.textAlign = 'center'; x.font = `500 70px ${SERIF}`;
      x.fillText('Casa-Museo Edgar Santamaría', w / 2, 112);
    })
  }));
  letrero.position.set(0, 4.25, .03);

  /* ---------- 6. EL ATRIL DE LA ENTRADA ---------- */
  const imgFirma = await cargarImagen('img/marca/firma-oscura.png');
  const texAtril = lienzo(900, 1160, (x, w, h) => {
    x.fillStyle = '#f3ede1'; x.fillRect(0, 0, w, h);
    x.strokeStyle = '#b8914f'; x.lineWidth = 3; x.strokeRect(34, 34, w - 68, h - 68);
    x.textAlign = 'center'; x.fillStyle = '#b8914f'; x.font = `italic 400 46px ${SERIF}`;
    x.fillText('Bienvenido a la casa-museo', w / 2, 140);
    if (imgFirma) { const a = 560, b = a * imgFirma.height / imgFirma.width; x.drawImage(imgFirma, (w - a) / 2, 180, a, b); }
    x.fillStyle = '#2e2621'; x.font = `500 70px ${SERIF}`; x.fillText('Edgar Santamaría Caleño', w / 2, 520);
    x.fillStyle = '#6f6258'; x.font = `300 34px ${SANS}`; x.fillText('Pintor y ebanista · San Martín de los Llanos', w / 2, 580);
    x.fillStyle = '#b8914f'; x.fillRect(w / 2 - 60, 630, 120, 3);
    x.fillStyle = '#2e2621'; x.font = `italic 400 48px ${SERIF}`;
    x.fillText('Piso 1 · El pintor', w / 2, 730); x.fillText('Piso 2 · El ebanista', w / 2, 800);
    x.fillStyle = '#8e4f32'; x.font = `400 32px ${SANS}`;
    parrafo(x, 'Toque el atril para ver los catálogos, las hojas de vida y la historia del autor', w / 2, 930, 640, 46);
  });
  const atril = new T.Group(); atril.position.set(2.7, 0, 4.4); mirarHacia(atril, -.38, 1); escena.add(atril);

  // Estructura inclinada del atril de ebanista
  const marcoAtril = new T.Group();
  marcoAtril.position.set(0, 0, 0);
  atril.add(marcoAtril);

  // 1. Mástil central posterior (soporte detrás del tablero)
  bloque(-.035, .035, 0, 2.25, -.06, -.01, M.cedro, marcoAtril);

  // 2. Patas de apoyo (quedan DETRÁS y DEBAJO del tablero sin tapar la cartelera)
  const pataIzq = bloque(-.03, .03, 0, 2.2, -.05, 0, M.nogal, marcoAtril);
  pataIzq.position.set(-.46, 1.05, 0); pataIzq.rotation.z = -.16; pataIzq.rotation.x = -.15;

  const pataDer = bloque(-.03, .03, 0, 2.2, -.05, 0, M.nogal, marcoAtril);
  pataDer.position.set(.46, 1.05, 0); pataDer.rotation.z = .16; pataDer.rotation.x = -.15;

  const pataAtras = bloque(-.03, .03, 0, 2.0, -.05, 0, M.nogal, marcoAtril);
  pataAtras.position.set(0, .95, -.45); pataAtras.rotation.x = .35;

  // Travesaño horizontal inferior de refuerzo
  bloque(-.52, .52, .25, .32, -.08, -.03, M.nogal, marcoAtril);

  // 3. Repisa de ebanistería (soporta la cartelera)
  const repisa = bloque(-.62, .62, .82, .89, -.05, .09, M.cedro, marcoAtril);
  repisa.rotation.x = -.18;
  bloque(-.48, -.42, .76, .82, -.03, .07, M.nogal, marcoAtril);
  bloque(.42, .48, .76, .82, -.03, .07, M.nogal, marcoAtril);

  // 4. Tablero / Cartelera con marco fino de madera
  const grupoTablero = new T.Group();
  grupoTablero.position.set(0, 1.58, .02);
  grupoTablero.rotation.x = -.18;
  marcoAtril.add(grupoTablero);

  // Marco exterior de ebanistería
  bloque(-.58, .58, -.74, .74, -.02, .02, M.cedro, grupoTablero);

  // Lienzo impreso principal
  const tablero = bloque(-.55, .55, -.71, .71, .001, .021, M.nogal, grupoTablero);
  tablero.material = [M.nogal, M.nogal, M.nogal, M.nogal, basico({ map: texAtril }), M.nogal];

  // Sujetador superior del atril (cabezal de madera)
  bloque(-.08, .08, .72, .78, -.04, .04, M.cedro, grupoTablero);

  const sombraAtril = new T.Mesh(new T.CircleGeometry(.85, 20), M.sombra);
  sombraAtril.rotation.x = -Math.PI / 2; sombraAtril.position.y = .02; atril.add(sombraAtril);
  const luzAtril = new T.PointLight(0xffd29a, .65, 5, 1.5); luzAtril.position.set(0, 2.6, 1.2); atril.add(luzAtril);

  /* ---------- 7. PISO 1 · SALA DEL PINTOR ---------- */
  // Rodapiés de madera
  bloque(-12.2, 12.2, 0, .14, -15.2, -15.15, M.nogal); bloque(-12.2, -12.15, 0, .14, -15.2, -0.3, M.nogal); bloque(12.15, 12.2, 0, .14, -15.2, -0.3, M.nogal);
  // Muro central para colgar obras por ambas caras
  bloque(-4.6, 4.6, 0, 3.8, -8.17, -7.83, M.pared);
  bloque(-4.65, 4.65, 3.8, 3.88, -8.22, -7.78, M.nogal);
  [[-7, -4], [-7, -12], [4, -4], [4, -12]].forEach(([x, z]) => { const l = new T.PointLight(0xffe2bd, .4, 15, 1.3); l.position.set(x, 4.3, z); escena.add(l); });
  // Bancas de museo
  function banca(x, z, rot = 0) {
    const g = new T.Group(); g.position.set(x, 0, z); g.rotation.y = rot;
    bloque(-1, 1, .42, .48, -.22, .22, M.cedro, g);
    [-.85, .85].forEach(px => bloque(px - .05, px + .05, 0, .42, -.2, .2, M.metal, g));
    escena.add(g);
  }
  banca(-6.5, -11.2); banca(0, -11.8);

  // Textura de "luz de museo" sobre el muro detrás de cada obra
  const texHalo = lienzo(256, 256, (x, w, h) => {
    const g = x.createRadialGradient(w / 2, h * .42, 4, w / 2, h * .5, w / 2);
    g.addColorStop(0, 'rgba(255,236,200,.95)'); g.addColorStop(.5, 'rgba(255,226,180,.35)'); g.addColorStop(1, 'rgba(255,220,170,0)');
    x.fillStyle = g; x.fillRect(0, 0, w, h);
  });
  const matHalo = basico({ map: texHalo, transparent: true, blending: T.AdditiveBlending, depthWrite: false, opacity: .16 });
  const matMarco = std(0xffffff, { map: repetir(texMadera('#6b4426', '#24150a'), 1, 1), roughness: .5 });

  const INTERACTIVOS = [];  // objetos que responden al clic
  const PARADAS = [];       // paradas del recorrido guiado

  // Cuelga una obra: devuelve el centro y la normal para crear su parada
  function colgarObra(tex, x, z, nx, nz, maxAncho, maxAlto, y = 1.75) {
    const img = tex.image; const asp = img.width / img.height;
    let w = maxAncho, h = w / asp; if (h > maxAlto) { h = maxAlto; w = h * asp; }
    const g = new T.Group(); g.position.set(x + nx * .02, y, z + nz * .02); mirarHacia(g, nx, nz); escena.add(g);
    const halo = plano(w + 2.2, h + 1.8, matHalo, g); halo.position.set(0, .15, .001);
    const lienzoObra = plano(w, h, basico({ map: tex }), g); lienzoObra.position.z = .07;
    // Marco: cuatro listones y un filete dorado
    const m = .1;
    bloque(-w / 2 - m, w / 2 + m, h / 2, h / 2 + m, 0, .09, matMarco, g);
    bloque(-w / 2 - m, w / 2 + m, -h / 2 - m, -h / 2, 0, .09, matMarco, g);
    bloque(-w / 2 - m, -w / 2, -h / 2, h / 2, 0, .09, matMarco, g);
    bloque(w / 2, w / 2 + m, -h / 2, h / 2, 0, .09, matMarco, g);
    bloque(-w / 2 - .012, w / 2 + .012, -h / 2 - .012, h / 2 + .012, 0, .068, M.oro, g);
    // Lámpara de riel
    const lamp = new T.Mesh(new T.CylinderGeometry(.05, .07, .22, 10), M.metal);
    lamp.position.set(0, Math.min(4.55 - y, h / 2 + 1.3), .9); lamp.rotation.x = .9; g.add(lamp);
    return { g, w, h, objetos: [lienzoObra, ...g.children.filter(c => c !== halo)] };
  }

  // Ficha pequeña al lado de la obra
  function cartela(obra, g, w, h) {
    const tex = lienzo(512, 256, (x, W, H) => {
      x.fillStyle = '#f7f2e8'; x.fillRect(0, 0, W, H);
      x.fillStyle = '#2e2621'; x.font = `500 46px ${SERIF}`; x.fillText(obra.titulo, 28, 76, W - 56);
      x.fillStyle = '#6f6258'; x.font = `300 24px ${SANS}`;
      x.fillText([obra.tecnica, obra.anio].filter(Boolean).join(' · '), 28, 124, W - 56);
      x.fillStyle = '#8e4f32'; x.font = `400 22px ${SANS}`; x.fillText('Toque la obra para ver su ficha', 28, 200);
    });
    const c = plano(.42, .21, basico({ map: tex }), g); c.position.set(w / 2 + .5, -h / 2 + .15, .02);
    return c;
  }

  // Lugares para colgar en el piso 1: [x, z, normal x, normal z, ancho máx, alto máx]
  const MUROS = [
    [-2.25, -7.83, 0, 1, 1.75, 1.55], [2.25, -7.83, 0, 1, 1.75, 1.55],                           // muro central, cara de entrada
    [-12.15, -3.0, 1, 0, 2.0, 1.6], [-12.15, -6.6, 1, 0, 2.0, 1.6], [-12.15, -10.2, 1, 0, 2.0, 1.6], [-12.15, -13.4, 1, 0, 1.8, 1.6], // muro izquierdo
    [-8.6, -15.15, 0, 1, 2.2, 1.7], [-4.1, -15.15, 0, 1, 2.2, 1.7], [.4, -15.15, 0, 1, 2.2, 1.7], [4.9, -15.15, 0, 1, 2.2, 1.7], // fondo
    [2.25, -8.17, 0, -1, 1.75, 1.55], [-2.25, -8.17, 0, -1, 1.75, 1.55]                          // muro central, cara de atrás
  ];
  const PISO1 = 'Piso 1 · El pintor', PISO2 = 'Piso 2 · El ebanista', AFUERA = 'La entrada';

  // Rótulo de sala (vinilo sobre el muro)
  function rotulo(texto, sub, x, y, z, nx, nz, ancho = 2, oscuro = true) {
    const tex = lienzo(1024, 420, (c, w, h) => {
      c.clearRect(0, 0, w, h); c.textAlign = 'center';
      c.fillStyle = oscuro ? '#2e2621' : '#efe3c9'; c.font = `500 120px ${SERIF}`; c.fillText(texto, w / 2, 170);
      c.fillStyle = oscuro ? '#8e4f32' : '#d9bd86'; c.font = `italic 400 56px ${SERIF}`; parrafo(c, sub, w / 2, 270, 900, 66);
    });
    const p = plano(ancho, ancho * 420 / 1024, basico({ map: tex, transparent: true }));
    p.position.set(x + nx * .02, y, z + nz * .02); mirarHacia(p, nx, nz);
    return p;
  }
  rotulo('Sala del pintor', 'Retrato, paisaje y folclor llanero', 0, 2.35, -7.83, 0, 1, 2.1);

  /* ---------- 8. ESCALERA ---------- */
  const ESC = { x0: 9.4, x1: 12.1, zIni: -5.0, zFin: -13.6, pasos: 16 };
  const escalones = [];
  for (let i = 0; i < ESC.pasos; i++) {
    const huella = (ESC.zIni - ESC.zFin) / ESC.pasos, contra = P2 / ESC.pasos;
    const z0 = ESC.zIni - i * huella;
    escalones.push(bloque(ESC.x0, ESC.x1, 0, (i + 1) * contra, z0 - huella, z0, i % 2 ? M.cedro : M.nogal));
  }
  // Baranda inclinada
  const largoEsc = Math.hypot(ESC.zIni - ESC.zFin, P2);
  const baranda = bloque(-.04, .04, -.04, .04, -largoEsc / 2, largoEsc / 2, M.nogal);
  baranda.position.set(ESC.x0 - .05, P2 / 2 + 1, (ESC.zIni + ESC.zFin) / 2); baranda.rotation.x = Math.atan2(P2, ESC.zIni - ESC.zFin);
  for (let i = 0; i <= 8; i++) {
    const t = i / 8, z = ESC.zIni + (ESC.zFin - ESC.zIni) * t, y = P2 * t;
    bloque(ESC.x0 - .08, ESC.x0 - .02, y, y + 1, z - .03, z + .03, M.nogal);
  }
  // Baranda del piso 2 alrededor del hueco
  bloque(9.15, 9.23, P2 + .98, P2 + 1.06, -13.6, -5, M.nogal); bloque(9.2, 12.2, P2 + .98, P2 + 1.06, -5.04, -4.96, M.nogal);
  for (let z = -13.6; z <= -5; z += .6) bloque(9.16, 9.22, P2, P2 + 1, z - .02, z + .02, M.nogal);
  for (let x = 9.2; x <= 12.2; x += .6) bloque(x - .02, x + .02, P2, P2 + 1, -5.03, -4.97, M.nogal);
  rotulo('Al taller del ebanista', 'Piso 2 · Suba por la escalera', 12.15, 2.75, -3.75, -1, 0, 1.4);

  /* ---------- 9. PISO 2 · TALLER DEL EBANISTA ---------- */
  // Muros forrados en madera
  bloque(-12.16, 12.16, P2, ALTO - .2, -15.17, -15.13, M.panelado);
  bloque(-12.17, -12.13, P2, ALTO - .2, -15.2, -0.3, M.panelado);
  bloque(12.13, 12.17, P2, ALTO - .2, -15.2, -0.3, M.panelado);
  bloque(-12.16, 12.16, P2, ALTO - .2, -0.37, -0.33, M.panelado);
  // Ventanas por dentro del piso 2 (sobre el forro)
  [-10, -6.5, -3, 3, 6.5, 10].forEach(x => { const v = plano(1.4, 2.1, basico({ color: 0xffd9a0 })); v.position.set(x, P2 + 2.25, -.38); v.rotation.y = Math.PI; });
  { const v = plano(1.6, 3, basico({ color: 0xffd9a0 })); v.position.set(0, P2 + 1.7, -.38); v.rotation.y = Math.PI; }
  // Vigas del techo
  for (let z = -13.5; z > -1; z += 3) bloque(-12.1, 12.1, ALTO - .5, ALTO - .2, z - .14, z + .14, M.nogal);
  [[-6, -11], [-6, -4], [4, -11], [4, -4]].forEach(([x, z]) => { const l = new T.PointLight(0xffdcb0, .8, 15, 1.3); l.position.set(x, ALTO - .9, z); escena.add(l); });
  rotulo('Taller del ebanista', 'Muebles, puertas y marcos a la medida', -1.2, P2 + 3.45, -15.12, 0, 1, 2.6, false);

  const MADERA = []; // piezas del taller: { nombre, grupo, parada }
  function pieza(nombre, grupo) { escena.add(grupo); MADERA.push({ nombre, grupo }); return grupo; }

  // 9.1 Cocina integral (contra el muro del fondo, a la izquierda)
  {
    const g = new T.Group(); g.position.y = P2;
    const x0 = -12.05, x1 = -3.9, zF = -15.12;
    bloque(x0, x1, 0, .1, zF, zF + .56, M.negro, g);                       // zócalo
    bloque(x0, x1, .1, .88, zF, zF + .6, M.roble, g);                     // muebles bajos
    for (let x = x0; x < x1 - .01; x += .6) {
      bloque(x + .01, Math.min(x + .59, x1 - .01), .12, .86, zF + .6, zF + .62, M.roble, g);
      bloque(x + .25, Math.min(x + .35, x1), .74, .76, zF + .62, zF + .65, M.acero, g);
    }
    bloque(x0, x1, .88, .92, zF, zF + .66, M.meson, g);                   // mesón
    bloque(-9.2, -8.4, .9, .925, zF + .12, zF + .52, M.acero, g);         // lavaplatos
    const grifo = new T.Mesh(new T.CylinderGeometry(.02, .02, .35, 8), M.acero); grifo.position.set(-8.8, 1.1, zF + .08); g.add(grifo);
    bloque(-6.3, -5.5, .92, .93, zF + .1, zF + .55, M.negro, g);           // estufa
    [[-6.1, .2], [-5.7, .2], [-6.1, .43], [-5.7, .43]].forEach(([x, z]) => {
      const q = new T.Mesh(new T.TorusGeometry(.08, .012, 6, 20), M.metal); q.rotation.x = Math.PI / 2; q.position.set(x, .935, zF + z); g.add(q);
    });
    // Salpicadero de baldosa
    const texBaldosa = repetir(lienzo(128, 128, (x, w, h) => {
      x.fillStyle = '#e9e4da'; x.fillRect(0, 0, w, h); x.strokeStyle = '#bdb4a5'; x.lineWidth = 3;
      for (let i = 0; i <= 4; i++) { x.beginPath(); x.moveTo(0, i * 32); x.lineTo(w, i * 32); x.stroke(); x.beginPath(); x.moveTo(i * 32, 0); x.lineTo(i * 32, h); x.stroke(); }
    }), 20, 2);
    bloque(x0, x1, .92, 1.55, zF, zF + .01, std(0xffffff, { map: texBaldosa, roughness: .4 }), g);
    // Muebles altos
    bloque(x0, x1, 1.55, 2.35, zF, zF + .36, M.roble, g);
    for (let x = x0; x < x1 - .01; x += .6) bloque(x + .01, Math.min(x + .59, x1 - .01), 1.57, 2.33, zF + .36, zF + .38, M.roble, g);
    // Campana
    bloque(-6.4, -5.4, 1.4, 1.55, zF, zF + .5, M.acero, g);
    // Alacena alta en la esquina
    bloque(x0, x0 + .6, .1, 2.35, zF + .6, zF + 1.2, M.roble, g);
    pieza('Cocina integral', g);
  }
  // 9.2 Closet (muro izquierdo)
  {
    const g = new T.Group(); g.position.y = P2;
    const xP = -12.12, z0 = -13.7, z1 = -8.5;
    bloque(xP, xP + .62, 0, 2.5, z0, z1, M.cedro, g);
    for (let i = 0; i < 4; i++) {
      const a = z0 + i * (z1 - z0) / 4, b = a + (z1 - z0) / 4;
      bloque(xP + .62, xP + .645, .06, 2.42, a + .015, b - .015, M.cedroV, g);
      bloque(xP + .645, xP + .66, .3, 2.15, a + .17, b - .17, M.nogalV, g);                 // tablero en relieve
      bloque(xP + .66, xP + .69, .95, 1.55, (i % 2 ? a + .08 : b - .08) - .015, (i % 2 ? a + .08 : b - .08) + .015, M.oro, g); // manija
    }
    bloque(xP, xP + .72, 2.5, 2.62, z0 - .05, z1 + .05, M.nogal, g);                         // cornisa
    pieza('Closet a la medida', g);
  }
  // 9.3 Puerta tallada (muro izquierdo, adelante)
  {
    const g = new T.Group(); g.position.set(-12.1, P2, -3.4); mirarHacia(g, 1, 0);
    const hoja = bloque(-.6, .6, 0, 2.4, 0, .07, M.nogal, g);
    hoja.material = [M.nogal, M.nogal, M.nogal, M.nogal, matPuerta, matPuerta];
    bloque(-.78, -.6, 0, 2.6, -.02, .12, M.cedro, g); bloque(.6, .78, 0, 2.6, -.02, .12, M.cedro, g);
    bloque(-.9, .9, 2.6, 2.8, -.02, .16, M.cedro, g); bloque(-.95, .95, 2.8, 2.86, -.03, .2, M.nogal, g); // dintel con cornisa
    const pomo = new T.Mesh(new T.SphereGeometry(.05, 12, 8), M.oro); pomo.position.set(.45, 1.1, .12); g.add(pomo);
    pieza('Puerta tallada', g);
  }
  // 9.4 Comedor de ebanistería con seis sillas Windsor de barrotes torneados (exactas a la imagen)
  {
    const g = new T.Group(); g.position.set(-1.2, P2, -9.8);
    // Mesa principal con patas torneadas
    bloque(-1.25, 1.25, .74, .81, -.58, .58, M.nogal, g);
    const geoPataMesa = new T.CylinderGeometry(.05, .035, .74, 12);
    [[-1.1, -.44], [1.1, -.44], [-1.1, .44], [1.1, .44]].forEach(([px, pz]) => {
      const pm = new T.Mesh(geoPataMesa, M.nogal); pm.position.set(px, .37, pz); g.add(pm);
      const an = new T.Mesh(new T.TorusGeometry(.058, .01, 8, 16), M.nogal);
      an.rotation.x = Math.PI / 2; an.position.set(px, .55, pz); g.add(an);
    });

    // Silla torneada de ebanista
    function sillaTorneada(x, z, rot) {
      const s = new T.Group(); s.position.set(x, 0, z); s.rotation.y = rot; g.add(s);
      
      const asiento = bloque(-.25, .25, .44, .49, -.23, .23, M.nogal, s);
      asiento.rotation.x = -.03;

      const geoPataSilla = new T.CylinderGeometry(.028, .018, .44, 12);
      [[-.20, -.18], [.20, -.18], [-.20, .18], [.20, .18]].forEach(([px, pz]) => {
        const pata = new T.Mesh(geoPataSilla, M.nogal);
        pata.position.set(px, .22, pz);
        pata.rotation.z = (px > 0 ? -.06 : .06);
        pata.rotation.x = (pz > 0 ? -.05 : .05);
        s.add(pata);

        const anillop = new T.Mesh(new T.TorusGeometry(.032, .008, 8, 16), M.nogal);
        anillop.rotation.x = Math.PI / 2; anillop.position.set(px, .32, pz); s.add(anillop);
      });

      bloque(-.20, .20, .18, .21, -.015, .015, M.nogal, s);
      bloque(-.015, .015, .18, .21, -.18, .18, M.nogal, s);

      const geoMontante = new T.CylinderGeometry(.022, .024, .62, 10);
      [-.22, .22].forEach(px => {
        const m = new T.Mesh(geoMontante, M.nogal);
        m.position.set(px, .78, .19); m.rotation.x = -.08; s.add(m);
        const a = new T.Mesh(new T.TorusGeometry(.028, .007, 8, 12), M.nogal);
        a.rotation.x = Math.PI / 2; a.position.set(px, .76, .19); s.add(a);
      });

      const copete = bloque(-.26, .26, 1.04, 1.13, .16, .21, M.nogal, s);
      copete.rotation.x = -.08;

      const geoBarrote = new T.CylinderGeometry(.012, .012, .54, 8);
      for (let i = -2; i <= 2; i++) {
        const bx = i * 0.088;
        const b = new T.Mesh(geoBarrote, M.nogal);
        b.position.set(bx, .76, .19); b.rotation.x = -.08; s.add(b);
        
        const bulbo = new T.Mesh(new T.SphereGeometry(.019, 8, 8), M.nogal);
        bulbo.scale.set(1, 1.4, 1); bulbo.position.set(bx, .76, .19); s.add(bulbo);
      }
    }

    [-.75, 0, .75].forEach(x => { sillaTorneada(x, -.88, Math.PI); sillaTorneada(x, .88, 0); });
    pieza('Comedor de ebanistería con sillas torneadas', g);
  }
  // 9.5 Biblioteca (muro del fondo, centro)
  {
    const g = new T.Group(); g.position.y = P2;
    const x0 = -3.3, x1 = .9, zF = -15.12, prof = .38;
    bloque(x0, x0 + .05, 0, 2.6, zF, zF + prof, M.nogal, g); bloque(x1 - .05, x1, 0, 2.6, zF, zF + prof, M.nogal, g);
    [x0 + 1.4, x0 + 2.8].forEach(x => bloque(x - .025, x + .025, 0, 2.6, zF, zF + prof, M.nogal, g));
    bloque(x0, x1, 0, .02, zF, zF + prof, M.nogal, g).position.y = .01;
    const repisas = [.08, .62, 1.16, 1.7, 2.24, 2.58];
    repisas.forEach(y => bloque(x0, x1, y - .02, y + .02, zF, zF + prof, M.nogal, g));
    const colores = [0x7a2e22, 0x2f4a3a, 0x8a6a3a, 0x24344a, 0x6b3b2a, 0xb08a52, 0x3e3a33, 0x5a2a3a];
    const libros = new T.InstancedMesh(GEO_CAJA, std(0xffffff, { roughness: .8 }), 260);
    let n = 0; const col = new T.Color();
    for (let r = 0; r < 4; r++) {
      let x = x0 + .07;
      while (x < x1 - .1 && n < 260) {
        const ancho = .03 + Math.random() * .04, alto = .32 + Math.random() * .14;
        if ([x0 + 1.4, x0 + 2.8].some(s => Math.abs(x + ancho / 2 - s) < .05)) { x += .07; continue; }
        if (Math.random() < .06) { x += .12; continue; }
        mtx.makeScale(ancho, alto, .24); mtx.setPosition(x + ancho / 2, repisas[r] + .02 + alto / 2, zF + .2);
        libros.setMatrixAt(n, mtx); libros.setColorAt(n, col.setHex(colores[Math.floor(Math.random() * colores.length)])); n++;
        x += ancho + .004;
      }
    }
    libros.count = n; g.add(libros);
    pieza('Biblioteca', g);
  }
  // 9.6 Marcos y bastidores (muro del fondo, derecha)
  let marcoConObra = null;
  {
    const g = new T.Group(); g.position.y = P2;
    const zF = -15.1;
    const marcoTallado = (cx, cy, w, h, ancho, mat, filete = true) => {
      bloque(cx - w / 2 - ancho, cx + w / 2 + ancho, cy + h / 2, cy + h / 2 + ancho, zF, zF + .1, mat, g);
      bloque(cx - w / 2 - ancho, cx + w / 2 + ancho, cy - h / 2 - ancho, cy - h / 2, zF, zF + .1, mat, g);
      bloque(cx - w / 2 - ancho, cx - w / 2, cy - h / 2, cy + h / 2, zF, zF + .1, mat, g);
      bloque(cx + w / 2, cx + w / 2 + ancho, cy - h / 2, cy + h / 2, zF, zF + .1, mat, g);
      if (filete) bloque(cx - w / 2 - .02, cx + w / 2 + .02, cy - h / 2 - .02, cy + h / 2 + .02, zF, zF + .07, M.oro, g);
    };
    // Marco dorado con una obra del maestro
    marcoTallado(2.9, 1.75, 1.3, .95, .16, M.oro, false);
    bloque(2.9 - .76, 2.9 + .76, 1.75 - .6, 1.75 + .6, zF, zF + .06, M.nogal, g);
    marcoConObra = plano(1.3, .95, basico({ color: 0xe8dfcc }), g); marcoConObra.position.set(2.9, 1.75, zF + .09);
    // Marco de nogal vacío con paspartú
    marcoTallado(5.05, 1.65, .8, 1.05, .12, matMarco);
    plano(.8, 1.05, M.lino, g).position.set(5.05, 1.65, zF + .02);
    // Bastidor estructural visto por detrás: listones, cruceta y cuñas
    const bx = 7.1, by = 1.6, bw = 1.15, bh = 1.45, t = .07;
    bloque(bx - bw / 2, bx + bw / 2, by + bh / 2 - t, by + bh / 2, zF, zF + .05, M.pino, g);
    bloque(bx - bw / 2, bx + bw / 2, by - bh / 2, by - bh / 2 + t, zF, zF + .05, M.pino, g);
    bloque(bx - bw / 2, bx - bw / 2 + t, by - bh / 2, by + bh / 2, zF, zF + .05, M.pino, g);
    bloque(bx + bw / 2 - t, bx + bw / 2, by - bh / 2, by + bh / 2, zF, zF + .05, M.pino, g);
    bloque(bx - .03, bx + .03, by - bh / 2, by + bh / 2, zF, zF + .045, M.pino, g);
    bloque(bx - bw / 2, bx + bw / 2, by - .03, by + .03, zF, zF + .045, M.pino, g);
    [[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(([sx, sy]) => {
      const c = bloque(-.05, .05, -.025, .025, 0, .03, M.cedro, g);
      c.position.set(bx + sx * (bw / 2 - .12), by + sy * (bh / 2 - .12), zF + .065); c.rotation.z = Math.PI / 4;
    });
    // Muestras de molduras en una repisa
    bloque(1.9, 8, .95, 1.0, zF, zF + .25, M.nogal, g);
    [[2.2, M.oro], [2.6, matMarco], [3.0, M.cedro], [3.4, M.nogal], [3.8, M.pino]].forEach(([x, mat]) => bloque(x - .14, x + .14, 1.0, 1.06, zF + .03, zF + .2, mat, g));
    pieza('Marcos y bastidores', g);
  }
  // 9.7 Banco de trabajo con herramientas
  {
    const g = new T.Group(); g.position.set(4.6, P2, -6.4);
    bloque(-1.15, 1.15, .82, .9, -.4, .4, M.roble, g);
    [[-1.05, -.32], [1.05, -.32], [-1.05, .32], [1.05, .32]].forEach(([x, z]) => bloque(x - .06, x + .06, 0, .82, z - .06, z + .06, M.roble, g));
    bloque(-1.05, 1.05, .2, .25, -.35, .35, M.roble, g);                    // repisa baja
    for (let i = 0; i < 4; i++) bloque(-.9, .9, .25 + i * .05, .29 + i * .05, -.25 + i * .02, -.05 + i * .02, M.pino, g);
    bloque(.9, 1.2, .7, .92, .3, .5, M.metal, g);                          // prensa
    bloque(-.6, .5, .9, .94, -.2, .1, M.pino, g);                          // tabla en proceso
    bloque(-.2, .12, .94, 1.02, -.12, -.02, M.cedro, g);                   // cepillo
    bloque(-.12, .05, 1.02, 1.08, -.09, -.05, M.nogal, g);
    [[.55, .1], [.65, .12], [.75, .14]].forEach(([x, z]) => bloque(x - .012, x + .012, .9, .915, z - .14, z + .14, M.acero, g)); // formones
    const mazo = new T.Mesh(new T.CylinderGeometry(.06, .06, .18, 12), M.roble); mazo.rotation.z = Math.PI / 2; mazo.position.set(-.85, .97, .22); g.add(mazo);
    bloque(-.87, -.83, .9, .93, .22, .5, M.roble, g);
    pieza('Banco de trabajo', g);
  }
  // Tablones apilados
  for (let i = 0; i < 6; i++) bloque(6.9, 8.8, P2 + i * .07, P2 + i * .07 + .06, -2.1 + i * .015, -1.85 + i * .015, i % 2 ? M.cedro : M.pino);
  for (let i = 0; i < 5; i++) { const t = bloque(-.04, .04, 0, 2.3, -.12, .12, M.pino); t.position.set(11.7, P2 + 1.15, -1.4 - i * .3); t.rotation.z = .12; }

  /* ---------- 10. OBRAS Y PARADAS ---------- */
  const obras = obrasDe('arte').filter(o => o.imagen).slice(0, MUROS.length);
  const texturas = await Promise.all(obras.map(o => cargarTextura(fotoObra(o))));
  // La obra del marco dorado del taller (Primavera en Forest Park o la primera disponible)
  const iMarco = Math.max(0, obras.findIndex(o => /forest/i.test(o.titulo)));
  if (texturas[iMarco]) { marcoConObra.material = basico({ map: texturas[iMarco] }); }

  const V = (x, y, z) => new T.Vector3(x, y, z);
  const OJO = { afuera: 1.7, p1: 1.65, p2: P2 + 1.65 };

  // Exterior
  PARADAS.push({
    id: 'fachada', piso: AFUERA, nombre: 'La casa', zona: 'afuera', pos: V(0, OJO.afuera, 23), mira: V(0, 4.6, 0),
    ficha: {
      sup: 'Bienvenido', titulo: 'Casa-Museo Edgar Santamaría',
      detalle: 'Pintor y ebanista de San Martín de los Llanos, Meta',
      texto: 'En el primer piso, su pintura. En el segundo, su taller de ebanistería. Empiece por el atril de la entrada.',
      acciones: [{ txt: 'Ir al atril', parada: 'atril', clase: 'boton-oscuro' }, { txt: 'Entrar al museo', parada: 'entrada', clase: 'boton-borde' }]
    }
  });
  const nA = new T.Vector3(0, 0, 1).applyQuaternion(atril.quaternion);
  PARADAS.push({
    id: 'atril', piso: AFUERA, nombre: 'El atril del autor', zona: 'afuera',
    pos: V(atril.position.x + nA.x * 2.4, OJO.afuera, atril.position.z + nA.z * 2.4), mira: V(atril.position.x, 1.5, atril.position.z),
    ficha: {
      sup: 'El autor', titulo: 'Edgar Santamaría Caleño', detalle: 'Catálogos, hojas de vida e historia',
      texto: 'Toque el atril o el botón para conocer al autor y descargar sus catálogos.',
      acciones: [{ txt: 'Conocer al autor', fn: () => abrirAutor(), clase: 'boton-oscuro' }, { txt: 'Entrar al museo', parada: 'entrada', clase: 'boton-borde' }]
    }
  });
  tablero.userData.accion = 'autor'; INTERACTIVOS.push(tablero);
  hojasPuerta.forEach(h => { h.userData.accion = 'entrar'; INTERACTIVOS.push(h); });

  // Piso 1
  PARADAS.push({
    id: 'entrada', piso: PISO1, nombre: 'Sala del pintor', zona: 'p1', pos: V(0, OJO.p1, -2.4), mira: V(0, 2.1, -7.83),
    ficha: {
      sup: PISO1, titulo: 'Sala del pintor', detalle: `${obras.length} obras · Retrato, paisaje y folclor llanero`,
      texto: PERFIL.arte.empirico,
      acciones: [{ txt: 'Catálogo de arte', href: 'catalogo-arte.html', clase: 'boton-borde' }]
    }
  });
  obras.forEach((o, i) => {
    const t = texturas[i]; if (!t) return;
    const [x, z, nx, nz, mw, mh] = MUROS[i];
    const { g, w, h, objetos } = colgarObra(t, x, z, nx, nz, mw, mh);
    cartela(o, g, w, h);
    const dist = Math.max(2.5, h * 1.9, w * 1.35);
    const indice = PARADAS.length;
    objetos.forEach(ob => { ob.userData.parada = indice; INTERACTIVOS.push(ob); });
    const vendida = /^(no|vendida)/i.test(o.disponible || '');
    PARADAS.push({
      id: 'obra-' + i, piso: PISO1, nombre: o.titulo, zona: 'p1',
      pos: V(x + nx * dist, OJO.p1, z + nz * dist), mira: V(x, 1.75, z), encuadre: { w: w + .5, h: h + .5, nx, nz },
      ficha: {
        sup: PISO1, titulo: o.titulo, detalle: [o.tecnica, o.medidas, o.anio].filter(Boolean).join(' · '), texto: o.concepto,
        acciones: [
          { txt: 'Ver en grande', fn: () => abrirVisor([{ src: fotoObra(o), titulo: o.titulo }]), clase: 'boton-oscuro' },
          vendida
            ? { txt: 'Encargar una similar', href: enlaceWA(`Hola Maestro Santamaría, vi la obra "${o.titulo}" en su casa-museo virtual y me gustaría encargar una pieza similar.`), clase: 'boton-borde', externo: true }
            : { txt: 'Consultar por WhatsApp', href: enlaceWA(`Hola Maestro Santamaría, vi la obra "${o.titulo}" en su casa-museo virtual. ¿Podría darme información sobre disponibilidad y precio?`), clase: 'boton-borde', externo: true }
        ]
      }
    });
  });
  // Muro de reconocimientos
  {
    const premios = deArea('arte').filter(t => t.tipo === 'reconocimiento').sort((a, b) => porAnio(a, b));
    const nExpo = deArea('arte').filter(t => t.tipo === 'exposicion').length;
    const tex = lienzo(800, 1100, (x, w, h) => {
      x.fillStyle = '#2a1c12'; x.fillRect(0, 0, w, h);
      x.strokeStyle = '#b8914f'; x.lineWidth = 3; x.strokeRect(24, 24, w - 48, h - 48);
      x.fillStyle = '#d9bd86'; x.textAlign = 'center'; x.font = `500 64px ${SERIF}`; x.fillText('Reconocimientos', w / 2, 120);
      x.font = `italic 400 34px ${SERIF}`; x.fillText(`${premios.length} premios y ${nExpo} exposiciones · 2018 – 2021`, w / 2, 172);
      x.textAlign = 'left'; let y = 250;
      premios.forEach(p => {
        x.fillStyle = '#efe3c9'; x.font = `500 32px ${SERIF}`; y = parrafo(x, p.titulo + (p.anio ? ` · ${p.anio}` : ''), 70, y, 660, 36);
        x.fillStyle = '#b3a58f'; x.font = `300 21px ${SANS}`; y = parrafo(x, p.detalle, 70, y - 6, 660, 26) + 16;
      });
      x.textAlign = 'center'; x.fillStyle = '#d9bd86'; x.font = `400 24px ${SANS}`; x.fillText('Toque para ver los certificados', w / 2, h - 60);
    });
    const panel = plano(1.5, 2.06, basico({ map: tex }));
    panel.position.set(12.13, 2.0, -1.85); mirarHacia(panel, -1, 0);
    const h2 = plano(3.2, 3, matHalo); h2.position.set(12.14, 2.1, -1.85); mirarHacia(h2, -1, 0);
    panel.userData.accion = 'certificados'; INTERACTIVOS.push(panel);
    PARADAS.push({
      id: 'reconocimientos', piso: PISO1, nombre: 'Reconocimientos', zona: 'p1', pos: V(9.2, OJO.p1, -2.0), mira: V(12.1, 1.9, -2.0),
      ficha: {
        sup: PISO1, titulo: 'Premios y reconocimientos', detalle: `${premios.length} reconocimientos y ${nExpo} exposiciones colectivas en Nueva York y Nueva Jersey`,
        texto: 'Respaldados por certificados originales de consulados, la Asamblea Nacional del Ecuador y organizaciones culturales latinas.',
        acciones: [{ txt: 'Ver los certificados', fn: () => verCertificados(), clase: 'boton-oscuro' }, { txt: 'Hoja de vida artística', href: 'hoja-de-vida-artista.html', clase: 'boton-borde' }]
      }
    });
  }
  escalones.forEach(e => { e.userData.accion = 'subir'; INTERACTIVOS.push(e); });

  // Piso 2
  PARADAS.push({
    id: 'taller', piso: PISO2, nombre: 'Taller del ebanista', zona: 'p2', pos: V(10.6, OJO.p2, -14.4), mira: V(0, P2 + 1.6, -9),
    ficha: {
      sup: PISO2, titulo: 'Taller del ebanista', detalle: '13 años al frente de su propia fábrica de muebles en el Meta',
      texto: PERFIL.madera.empirico,
      acciones: [{ txt: 'Catálogo de ebanistería', href: 'catalogo-ebanisteria.html', clase: 'boton-borde' }]
    }
  });
  const TEXTOS_MADERA = {
    'Cocina integral': 'Cocinas a la medida: muebles bajos y altos, alacenas, mesones y acabados pensados para el uso diario.',
    'Closet a la medida': 'Closets y vestieres con puertas batientes, cajoneras y maleteros, diseñados para el espacio de cada habitación.',
    'Puerta tallada': SERVICIOS.maderaHogar.find(s => /puerta/i.test(s[0]))?.[1],
    'Comedor de ebanistería con sillas torneadas': SERVICIOS.maderaHogar.find(s => /mueble/i.test(s[0]))?.[1] || 'Comedores y sillas de ebanistería con torneados tradicionales en madera maciza.',
    'Biblioteca': 'Bibliotecas, estanterías y muebles de estudio que aprovechan cada centímetro del muro.',
    'Marcos y bastidores': `${SERVICIOS.maderaArte[0][1]} ${SERVICIOS.maderaArte[2][1]}`,
    'Banco de trabajo': 'Aquí nace cada pieza: selección y secado de la madera, ensambles tradicionales y acabados a mano.'
  };
  // Dónde se para la cámara frente a cada pieza: [posición, punto que mira]
  const VISTAS = {
    'Cocina integral': [V(-7.9, OJO.p2, -10.9), V(-7.9, P2 + 1.1, -15)],
    'Closet a la medida': [V(-7.6, OJO.p2, -11.1), V(-12, P2 + 1.25, -11.1)],
    'Puerta tallada': [V(-8.4, OJO.p2 - .1, -3.4), V(-12, P2 + 1.3, -3.4)],
    'Comedor de ebanistería con sillas torneadas': [V(-1.2, P2 + 2.3, -5.6), V(-1.2, P2 + .6, -9.8)],
    'Biblioteca': [V(-1.2, OJO.p2, -11.9), V(-1.2, P2 + 1.3, -15)],
    'Marcos y bastidores': [V(5.1, OJO.p2, -11.4), V(5.1, P2 + 1.55, -15)],
    'Banco de trabajo': [V(4.6, P2 + 1.95, -2.9), V(4.6, P2 + .85, -6.4)]
  };
  MADERA.forEach(p => {
    const indice = PARADAS.length;
    p.grupo.traverse(o => { if (o.isMesh || o.isInstancedMesh) { o.userData.parada = indice; INTERACTIVOS.push(o); } });
    const [pos, mira] = VISTAS[p.nombre] || [V(-1.2, P2 + 2.3, -5.6), V(-1.2, P2 + .6, -9.8)];
    PARADAS.push({
      id: 'madera-' + indice, piso: PISO2, nombre: p.nombre, zona: 'p2', pos, mira,
      ficha: {
        sup: PISO2, titulo: p.nombre, detalle: p.nombre === 'Banco de trabajo' ? 'El corazón del taller' : 'Pieza a la medida · Representación ilustrativa',
        texto: TEXTOS_MADERA[p.nombre] || 'Pieza de ebanistería artesanal en madera maciza.',
        acciones: [
          { txt: 'Cotizar por WhatsApp', href: enlaceWA(`Hola Maestro Santamaría, vi su taller en la casa-museo virtual y quisiera cotizar: ${p.nombre.toLowerCase()}.`), clase: 'boton-oscuro', externo: true },
          { txt: 'Catálogo de ebanistería', href: 'catalogo-ebanisteria.html', clase: 'boton-borde' }
        ]
      }
    });
  });
  PARADAS.push({
    id: 'despedida', piso: AFUERA, nombre: 'Gracias por su visita', zona: 'afuera', pos: V(-6, OJO.afuera, 15), mira: V(0, 4.5, -2),
    ficha: {
      sup: 'Gracias por su visita', titulo: 'Conversemos sobre su próxima obra', detalle: 'santamaria.art1@gmail.com · +57 320 829 6045',
      texto: 'Obra original, retratos por encargo, muebles, puertas, cocinas, marcos y bastidores a la medida.',
      acciones: [
        { txt: 'Escribir por WhatsApp', href: enlaceWA('Hola Maestro Santamaría, visité su casa-museo virtual y quisiera más información.'), clase: 'boton-oscuro', externo: true },
        { txt: 'Ver la versión clásica', href: 'sitio.html', clase: 'boton-borde' }
      ]
    }
  });
  const indiceDe = id => PARADAS.findIndex(p => p.id === id);
  // Ubicación inicial de un hito de escalera o puerta (para no tener que buscarlas en el arreglo)
  const PUNTOS = {
    puertaFuera: V(0, OJO.afuera, 3.0), puertaDentro: V(0, OJO.p1, -1.4),
    pieEscalera: V(10.75, OJO.p1, -3.9), inicioEsc: V(10.75, OJO.p1, -4.7), finEsc: V(10.75, OJO.p2, -13.7), descanso: V(10.6, OJO.p2, -14.4)
  };

  /* ---------- 11. ZONAS, LÍMITES Y OBSTÁCULOS ---------- */
  const ZONAS = {
    afuera: { y: OJO.afuera, x: [-45, 45], z: [2.2, 48], obst: [[2.1, 3.3, 3.9, 4.9]], suelo: [suelo, camino, patio] },
    p1: { y: OJO.p1, x: [-11.7, 11.7], z: [-14.7, -.9], obst: [[-5.0, 5.0, -8.6, -7.4], [8.9, 12.3, -15.3, -4.6], [-7.6, -5.4, -11.6, -10.8], [-1.1, 1.1, -12.2, -11.4]], suelo: [piso1] },
    p2: {
      y: OJO.p2, x: [-11.6, 11.6], z: [-14.7, -.9],
      obst: [[-12.2, -3.6, -15.3, -14.0], [-12.3, -11.0, -14.0, -8.3], [-3.5, 1.1, -15.3, -14.5], [-2.9, .5, -11.0, -8.6], [3.2, 6.0, -7.0, -5.8], [6.7, 9.0, -2.4, -.6], [8.95, 12.3, -13.5, -4.6]],
      suelo: []
    }
  };
  escena.children.forEach(o => { if (o.isMesh && o.material === M.piso2 && o.position.y > 4) ZONAS.p2.suelo.push(o); });
  const MARGEN = .35;
  const dentroObst = (x, z, zona) => ZONAS[zona].obst.some(([a, b, c, d]) => x > a - MARGEN && x < b + MARGEN && z > c - MARGEN && z < d + MARGEN);
  function ajustar(p, zona) {
    const Z = ZONAS[zona];
    p.x = Math.min(Z.x[1], Math.max(Z.x[0], p.x)); p.z = Math.min(Z.z[1], Math.max(Z.z[0], p.z)); p.y = Z.y;
    return p;
  }
  // ¿El segmento a-b cruza el obstáculo?
  function cruza(a, b, [x0, x1, z0, z1]) {
    x0 -= MARGEN; x1 += MARGEN; z0 -= MARGEN; z1 += MARGEN;
    for (let i = 1; i < 30; i++) {
      const t = i / 30, x = a.x + (b.x - a.x) * t, z = a.z + (b.z - a.z) * t;
      if (x > x0 && x < x1 && z > z0 && z < z1) return true;
    }
    return false;
  }
  // Ruta dentro de una zona, rodeando obstáculos por la esquina más corta
  function rutaEnZona(a, b, zona, profundidad = 0) {
    const ob = ZONAS[zona].obst.find(o => cruza(a, b, o));
    if (!ob || profundidad > 3) return [b];
    const [x0, x1, z0, z1] = ob, m = MARGEN + .45;
    const esquinas = [V(x0 - m, a.y, z0 - m), V(x1 + m, a.y, z0 - m), V(x0 - m, a.y, z1 + m), V(x1 + m, a.y, z1 + m)]
      .filter(e => !dentroObst(e.x, e.z, zona))
      .map(e => ajustar(e, zona));
    let mejor = null, costo = Infinity;
    for (const e of esquinas) {
      if (cruza(a, e, ob)) continue;
      const c = a.distanceTo(e) + e.distanceTo(b);
      if (c < costo) { costo = c; mejor = e; }
    }
    if (!mejor) return [b];
    return [...rutaEnZona(a, mejor, zona, profundidad + 1), ...rutaEnZona(mejor, b, zona, profundidad + 1)];
  }
  // Ruta completa entre zonas (por la puerta y la escalera)
  function ruta(desde, zonaA, hasta, zonaB) {
    const P = PUNTOS;
    if (zonaA === zonaB) return rutaEnZona(desde, hasta, zonaA);
    if (zonaA === 'afuera' && zonaB === 'p1') return [...rutaEnZona(desde, P.puertaFuera, 'afuera'), P.puertaDentro, ...rutaEnZona(P.puertaDentro, hasta, 'p1')];
    if (zonaA === 'p1' && zonaB === 'afuera') return [...rutaEnZona(desde, P.puertaDentro, 'p1'), P.puertaFuera, ...rutaEnZona(P.puertaFuera, hasta, 'afuera')];
    if (zonaA === 'p1' && zonaB === 'p2') return [...rutaEnZona(desde, P.pieEscalera, 'p1'), P.inicioEsc, P.finEsc, P.descanso, ...rutaEnZona(P.descanso, hasta, 'p2')];
    if (zonaA === 'p2' && zonaB === 'p1') return [...rutaEnZona(desde, P.descanso, 'p2'), P.finEsc, P.inicioEsc, P.pieEscalera, ...rutaEnZona(P.pieEscalera, hasta, 'p1')];
    if (zonaA === 'afuera' && zonaB === 'p2') return [...ruta(desde, 'afuera', P.pieEscalera, 'p1'), ...ruta(P.pieEscalera, 'p1', hasta, 'p2')];
    if (zonaA === 'p2' && zonaB === 'afuera') return [...ruta(desde, 'p2', P.pieEscalera, 'p1'), ...ruta(P.pieEscalera, 'p1', hasta, 'afuera')];
    return [hasta];
  }

  /* ---------- 12. CÁMARA Y ANIMACIÓN ---------- */
  const estado = { zona: 'afuera', yaw: 0, pitch: 0, parada: -1, anim: null };
  const orientar = (pos, mira) => {
    const d = mira.clone().sub(pos);
    return { yaw: Math.atan2(-d.x, -d.z), pitch: Math.atan2(d.y, Math.hypot(d.x, d.z)) };
  };
  const angDif = (a, b) => { let d = b - a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; };
  const suave = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  // Mueve la cámara por una lista de puntos y termina mirando "mira"
  function viajar(puntos, mira, zonaFinal, alTerminar, velocidad = 3.2) {
    const camino = [camara.position.clone(), ...puntos];
    const largos = []; let total = 0;
    for (let i = 1; i < camino.length; i++) { const l = camino[i].distanceTo(camino[i - 1]); largos.push(l); total += l; }
    const fin = mira ? orientar(camino[camino.length - 1], mira) : { yaw: estado.yaw, pitch: estado.pitch };
    const dur = reducirMov ? .01 : Math.min(10, Math.max(.9, total / velocidad + .3));
    estado.anim = {
      camino, largos, total, dur, t0: performance.now(),
      yaw0: estado.yaw, pitch0: estado.pitch, dYaw: angDif(estado.yaw, fin.yaw), pitch1: fin.pitch,
      zonaFinal, alTerminar
    };
    ocultarFicha();
  }
  function avanzarAnim(ahora) {
    const A = estado.anim; if (!A) return;
    const k = Math.min(1, (ahora - A.t0) / 1000 / A.dur), e = suave(k);
    let d = e * A.total, i = 0;
    while (i < A.largos.length - 1 && d > A.largos[i]) { d -= A.largos[i]; i++; }
    const t = A.largos[i] ? Math.min(1, d / A.largos[i]) : 1;
    camara.position.lerpVectors(A.camino[i], A.camino[i + 1] || A.camino[i], t);
    // La mirada gira en la primera mitad del trayecto largo, para no marear
    const kGiro = suave(Math.min(1, k * (A.total > 6 ? 1.25 : 1)));
    estado.yaw = A.yaw0 + A.dYaw * kGiro; estado.pitch = A.pitch0 + (A.pitch1 - A.pitch0) * kGiro;
    if (k >= 1) {
      estado.anim = null;
      if (A.zonaFinal) estado.zona = A.zonaFinal;
      if (A.alTerminar) A.alTerminar();
    }
  }
  // Zona en la que queda un punto (según su altura y si está fuera de la casa)
  const zonaDe = p => p.y > P2 ? 'p2' : (p.z > 0 ? 'afuera' : 'p1');

  // Punto de vista de una parada, ajustado al tamaño de la pantalla
  function vistaDe(P) {
    const vert = T.MathUtils.degToRad(camara.fov) / 2, hor = Math.atan(Math.tan(vert) * camara.aspect);
    const vertical = camara.aspect < 1;
    let pos = P.pos.clone(), mira = P.mira.clone();
    if (P.encuadre) {
      // Que la obra quepa completa a lo ancho y a lo alto (en celular deja espacio para la ficha)
      const { w, h, nx, nz } = P.encuadre;
      const d = Math.min(9, Math.max(2.2, (h / 2) / Math.tan(vert) * (vertical ? 1.5 : 1.15), (w / 2) / Math.tan(hor)));
      pos.set(mira.x + nx * d, P.pos.y, mira.z + nz * d);
    } else if (vertical) {
      // Retrocede un poco para ver más en pantallas verticales, sin salir de la zona ni chocar
      const atras = pos.clone().sub(mira).setY(0).multiplyScalar(P.zona === 'afuera' ? .45 : .3);
      const nueva = ajustar(pos.clone().add(atras), P.zona);
      if (!dentroObst(nueva.x, nueva.z, P.zona)) pos = nueva;
    }
    return { pos: ajustar(pos, P.zona), mira };
  }

  function irA(i) {
    i = Math.max(0, Math.min(PARADAS.length - 1, i));
    const P = PARADAS[i], v = vistaDe(P);
    estado.parada = i; actualizarGuia();
    const puntos = ruta(camara.position.clone(), estado.zona, v.pos, P.zona);
    viajar(puntos, v.mira, P.zona, () => { if (P.ficha) mostrarFicha(P.ficha); });
  }

  /* ---------- 13. INTERFAZ ---------- */
  function mostrarFicha(f) {
    $('fichaSup').textContent = f.sup || ''; $('fichaTitulo').textContent = f.titulo || '';
    $('fichaDetalle').textContent = f.detalle || ''; $('fichaTexto').textContent = f.texto || '';
    const acc = $('fichaAcciones'); acc.innerHTML = '';
    (f.acciones || []).forEach(a => {
      const el = document.createElement(a.href ? 'a' : 'button');
      el.className = 'boton ' + (a.clase || 'boton-borde'); el.textContent = a.txt;
      if (a.href) { el.href = a.href; if (a.externo) { el.target = '_blank'; el.rel = 'noopener'; } }
      else el.addEventListener('click', () => a.parada ? irA(indiceDe(a.parada)) : a.fn());
      acc.appendChild(el);
    });
    $('ficha').hidden = false;
  }
  function ocultarFicha() { $('ficha').hidden = true; }
  function actualizarGuia() {
    const P = PARADAS[estado.parada] || PARADAS[0];
    $('guiaPiso').textContent = `${P.piso} · ${estado.parada + 1} de ${PARADAS.length}`;
    $('guiaNombre').textContent = P.nombre;
    $('btnAnterior').disabled = estado.parada <= 0;
    $('btnSiguiente').disabled = estado.parada >= PARADAS.length - 1;
    document.querySelectorAll('#planoLista button').forEach(b => b.setAttribute('aria-current', +b.dataset.i === estado.parada));
  }
  function abrirAutor() {
    $('autorArte').textContent = PERFIL.arte.resumen;
    $('autorMadera').textContent = PERFIL.madera.resumen;
    $('autor').hidden = false; $('btnEntrar').focus();
  }
  function verCertificados() {
    const fotos = deArea('arte').sort((a, b) => porAnio(a, b)).flatMap(t => certificadosDe(t).map(src => ({ src, titulo: [t.titulo, t.anio].filter(Boolean).join(' · ') })));
    abrirVisor(fotos, 0);
  }
  // Plano agrupado por piso
  const grupos = {};
  PARADAS.forEach((p, i) => (grupos[p.piso] = grupos[p.piso] || []).push(i));
  $('planoLista').innerHTML = Object.entries(grupos).map(([piso, idx]) => `
    <h3>${esc(piso)}</h3><ul>${idx.map(i => `<li><button data-i="${i}">${esc(PARADAS[i].nombre)}</button></li>`).join('')}</ul>`).join('');
  $('planoLista').addEventListener('click', e => {
    const b = e.target.closest('button[data-i]'); if (!b) return;
    $('plano').hidden = true; $('btnPlano').setAttribute('aria-expanded', 'false'); irA(+b.dataset.i);
  });
  $('btnPlano').addEventListener('click', () => { const v = $('plano').hidden; $('plano').hidden = !v; $('btnPlano').setAttribute('aria-expanded', String(v)); });
  $('btnAutor').addEventListener('click', abrirAutor);
  $('btnEntrar').addEventListener('click', () => { $('autor').hidden = true; irA(indiceDe('entrada')); });
  $('btnAnterior').addEventListener('click', () => irA(estado.parada - 1));
  $('btnSiguiente').addEventListener('click', () => irA(estado.parada + 1));
  document.querySelectorAll('[data-cerrar]').forEach(b => b.addEventListener('click', () => { $(b.dataset.cerrar).hidden = true; }));
  $('autor').addEventListener('click', e => { if (e.target === $('autor')) $('autor').hidden = true; });

  // Mensaje de ayuda según el dispositivo
  $('ayuda').textContent = tactil
    ? 'Deslice para mirar · Toque el piso para caminar · Toque una obra para verla'
    : 'Arrastre para mirar · Clic en el piso para caminar · W A S D o flechas para moverse · Clic en una obra para verla';
  let ayudaVista = false;
  setTimeout(() => $('ayuda').classList.add('oculta'), 14000);
  const esconderAyuda = () => { if (ayudaVista) return; ayudaVista = true; setTimeout(() => $('ayuda').classList.add('oculta'), 6000); };

  /* ---------- 14. MOUSE, TÁCTIL Y TECLADO ---------- */
  const lienzo3D = $('escena');
  const raton = new T.Vector2(), rayo = new T.Raycaster();
  let presion = null;
  function impactos(ev, lista, recursivo = false) {
    const r = lienzo3D.getBoundingClientRect();
    raton.set((ev.clientX - r.left) / r.width * 2 - 1, -(ev.clientY - r.top) / r.height * 2 + 1);
    rayo.setFromCamera(raton, camara); rayo.far = 60;
    return rayo.intersectObjects(lista, recursivo);
  }
  let ultimoHover = 0;
  lienzo3D.addEventListener('pointerdown', ev => {
    presion = { x: ev.clientX, y: ev.clientY, yaw: estado.yaw, pitch: estado.pitch, movido: false, id: ev.pointerId };
    lienzo3D.setPointerCapture(ev.pointerId);
  });
  lienzo3D.addEventListener('pointermove', ev => {
    if (presion && presion.id === ev.pointerId) {
      const dx = ev.clientX - presion.x, dy = ev.clientY - presion.y;
      if (Math.hypot(dx, dy) > 6) { presion.movido = true; lienzo3D.classList.add('arrastrando'); esconderAyuda(); }
      if (presion.movido && !estado.anim) {
        const f = tactil ? .006 : .0045;
        estado.yaw = presion.yaw + dx * f; estado.pitch = Math.max(-1.1, Math.min(1.1, presion.pitch + dy * f));
      }
      return;
    }
    if (tactil || performance.now() - ultimoHover < 90) return;
    ultimoHover = performance.now();
    const g = impactos(ev, [escena], true).find(h => !h.object.userData.ignorar);
    lienzo3D.classList.toggle('sobre-objeto', !!g && (g.object.userData.parada !== undefined || !!g.object.userData.accion));
  });
  lienzo3D.addEventListener('pointerup', ev => {
    lienzo3D.classList.remove('arrastrando');
    const p = presion; presion = null;
    if (!p || p.movido || estado.anim) return;
    esconderAyuda();
    // Lo primero que toca el rayo (los muros tapan lo que está detrás)
    const golpe = impactos(ev, [escena], true).find(h => !h.object.userData.ignorar);
    if (!golpe) return;
    const u = golpe.object.userData;
    // 1) ¿Tocó una obra, una pieza o un objeto activo?
    if (u.parada !== undefined || u.accion) {
      if (u.parada !== undefined) return irA(u.parada);
      if (u.accion === 'autor') return abrirAutor();
      if (u.accion === 'entrar') return irA(estado.zona === 'afuera' ? indiceDe('entrada') : indiceDe('fachada'));
      if (u.accion === 'subir') return irA(estado.zona === 'p2' ? indiceDe('reconocimientos') : indiceDe('taller'));
      if (u.accion === 'certificados') return verCertificados();
    }
    // 2) ¿Tocó el piso? Camina hasta ahí
    if (ZONAS[estado.zona].suelo.includes(golpe.object)) {
      const destino = ajustar(golpe.point.clone(), estado.zona);
      if (dentroObst(destino.x, destino.z, estado.zona)) return;
      viajar(rutaEnZona(camara.position.clone(), destino, estado.zona), null, estado.zona, null, 3.6);
    }
  });
  lienzo3D.addEventListener('wheel', ev => { ev.preventDefault(); if (!estado.anim) mover(ev.deltaY < 0 ? .7 : -.7, 0); }, { passive: false });

  const teclas = new Set();
  addEventListener('keydown', ev => {
    if (ev.key === 'Escape') { ['ficha', 'plano', 'autor'].forEach(id => $(id).hidden = true); return; }
    if (ev.target.closest && ev.target.closest('input, textarea, select')) return;
    const k = ev.key.toLowerCase();
    if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) { teclas.add(k); esconderAyuda(); ev.preventDefault(); }
  });
  addEventListener('keyup', ev => teclas.delete(ev.key.toLowerCase()));
  addEventListener('blur', () => teclas.clear());

  // Paso libre con colisiones simples
  function mover(adelante, lado) {
    const s = Math.sin(estado.yaw), c = Math.cos(estado.yaw);
    const dx = -s * adelante + c * lado, dz = -c * adelante - s * lado;
    const p = camara.position, zona = estado.zona, Z = ZONAS[zona];
    // Atajos naturales: cruzar la puerta o tomar la escalera caminando
    if (zona === 'afuera' && Math.abs(p.x) < 1.6 && p.z + dz < Z.z[0] + .05 && dz < 0) return irA(indiceDe('entrada'));
    if (zona === 'p1' && Math.abs(p.x) < 1.2 && p.z + dz > Z.z[1] - .05 && dz > 0) return irA(indiceDe('fachada'));
    if (zona === 'p1' && p.x > 8.4 && p.z + dz < -4.0 && dz < 0) return irA(indiceDe('taller'));
    if (zona === 'p2' && p.x > 8.4 && p.z < -13.2 && p.z + dz > -13.6 && dz > 0) return irA(indiceDe('reconocimientos'));
    const nx = Math.min(Z.x[1], Math.max(Z.x[0], p.x + dx)), nz = Math.min(Z.z[1], Math.max(Z.z[0], p.z + dz));
    if (!dentroObst(nx, nz, zona)) { p.x = nx; p.z = nz; }
    else if (!dentroObst(nx, p.z, zona)) p.x = nx;
    else if (!dentroObst(p.x, nz, zona)) p.z = nz;
    if (adelante || lado) ocultarFicha();
  }

  escena.traverse(o => { if (o === cielo || o === sol || o === halo || o.material === matHalo || o.material === M.sombra) o.userData.ignorar = true; });

  /* ---------- 15. TAMAÑO Y BUCLE ---------- */
  function redimensionar() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false); camara.aspect = w / h;
    camara.fov = w < h ? 74 : (tactil ? 68 : 62);
    if (w < h) camara.setViewOffset(w, h, 0, h * .2, w, h); else camara.clearViewOffset();
    camara.updateProjectionMatrix();
  }
  addEventListener('resize', redimensionar); redimensionar();

  let antes = performance.now();
  function cuadro(ahora) {
    const dt = Math.min(.05, (ahora - antes) / 1000); antes = ahora;
    avanzarAnim(ahora);
    if (!estado.anim && teclas.size) {
      const v = 2.6 * dt;
      const a = (teclas.has('w') || teclas.has('arrowup') ? 1 : 0) - (teclas.has('s') || teclas.has('arrowdown') ? 1 : 0);
      const l = (teclas.has('d') ? 1 : 0) - (teclas.has('a') ? 1 : 0);
      const giro = (teclas.has('arrowleft') ? 1 : 0) - (teclas.has('arrowright') ? 1 : 0);
      estado.yaw += giro * 1.6 * dt;
      mover(a * v, l * v);
    }
    // Ciclo dinámico según hora real o manual
    actualizarCicloDiaNoche();
    animarEscena(dt);
    camara.rotation.set(estado.pitch, estado.yaw, 0);
    renderer.render(escena, camara);
    requestAnimationFrame(cuadro);
  }

  /* ---------- 16. ARRANQUE ---------- */
  // Toma inicial: desde lejos, sobre el camino, y se acerca a la casa
  camara.position.set(0, 3.4, 42);
  Object.assign(estado, orientar(camara.position, V(0, 4.8, 0)));
  requestAnimationFrame(cuadro);
  setTimeout(() => {
    $('carga').classList.add('oculta');
    setTimeout(() => { $('carga').hidden = true; }, 900);
    estado.parada = 0; actualizarGuia();
    const v = vistaDe(PARADAS[0]);
    viajar([v.pos], v.mira, 'afuera', () => mostrarFicha(PARADAS[0].ficha), 6);
  }, 250);

  // Animación del clima y de la escena
  function animarEscena(dt) {
    if (modoClima === 'lluvia') {
      const pos = geoLluvia.attributes.position.array;
      for (let i = 0; i < numGotas; i++) {
        pos[i * 3 + 1] -= 52 * dt;
        if (pos[i * 3 + 1] < 0) pos[i * 3 + 1] = 42;
      }
      geoLluvia.attributes.position.needsUpdate = true;
    }
    if (nubes3D && nubes3D.visible) {
      nubes3D.children.forEach(n => {
        n.position.x += 2.0 * dt;
        if (n.position.x > 160) n.position.x = -160;
      });
    }
  }

  // Exposición de controles en consola y ventana
  window.museo = {
    irA: idx => irAParada(idx),
    PARADAS,
    estado,
    camara,
    setHora: (h) => { horaManual = Math.max(0, Math.min(24, h)); actualizarCicloDiaNoche(); console.log(`Hora fijada manualmente a las ${h}:00 hs`); },
    fijarHoraReal: () => { horaManual = null; actualizarCicloDiaNoche(); console.log('Modo hora real activado.'); },
    cambiarClima: modo => cambiarClima(modo)
  };
})();
