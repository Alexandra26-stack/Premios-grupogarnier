/**
 * Premios de Fin de Año 2026 · Grupo Garnier · Loymark Bogotá
 * Almacén y reglas de la votación (Google Apps Script).
 *
 * Este script crea solo su hoja de cálculo la primera vez que se usa,
 * carga el equipo, los correos y las categorías, y valida todo:
 *  - cada persona entra con su correo corporativo (debe estar en la lista)
 *  - nadie puede proponerse ni votarse a sí mismo
 *  - las propuestas y el voto se envían una sola vez
 *  - solo se vota por los 2 finalistas publicados
 *  - las acciones de administración piden la clave de admin
 *
 * ÚNICO CAMBIO NECESARIO: escribe tu clave de admin en CLAVE_ADMIN.
 */
const CLAVE_ADMIN = 'ESCRIBE-AQUI-TU-CLAVE';

const TZ = 'America/Bogota';
const NOMBRE_HOJA = 'Premios 2026 · Loymark Bogotá (datos)';
const DIAS_SESION = 15;

const EQUIPO_INICIAL = [
  ['andreas@loymark.com', 'Andrea Serna'],
  ['angie.torres@loymark.com', 'Angie Torres'],
  ['camila.nunez@loymark.com', 'Camila Nuñez'],
  ['carolina.sissa@mergeto.co', 'Carolina Sissa'],
  ['cristofer.tangarife@loymark.com', 'Cristofer Tangarife'],
  ['daniel.munoz@loymark.com', 'Daniel Muñoz'],
  ['daniela.romero@loymark.com', 'Daniela Romero Daza'],
  ['dani.vives@loymark.com', 'Daniela Vives Franco'],
  ['david.castro@loymark.com', 'David Castro'],
  ['dayana.montanez@loymark.com', 'Dayana Montañez'],
  ['enrique.isaquita@loymark.com', 'Enrique Isaquita'],
  ['gabriela.mendez@loymark.com', 'Gabriela Mendez'],
  ['gisella.medina@loymark.com', 'Gisella Medina'],
  ['ivon.lopez@mergeto.co', 'Ivon Lorena Lopez'],
  ['james.quintero@mergeto.co', 'James Quintero'],
  ['jairo.fandino@loymark.com', 'Jairo Fandiño Sierra'],
  ['jeimmy.pelaez@loymark.com', 'Jeimmy Pelaez'],
  ['juliana.vaca@loymark.com', 'Juliana Vaca'],
  ['kevynn.hernandez@loymark.com', 'Kevynn Asmeth Hernández'],
  ['laura.castro@loymark.com', 'Laura Castro'],
  ['laura.carvajal@loymark.com', 'Laura Carvajal'],
  ['lina.romero@loymark.com', 'Lina Romero'],
  ['lizet.malagon@loymark.com', 'Lizet Malagon'],
  ['luna.salas@loymark.com', 'Luna Salas'],
  ['mayra.naranjo@loymark.com', 'Mayra Naranjo'],
  ['maria.garcia@mergeto.co', 'Maria Garcia'],
  ['natalia.renteria@loymark.com', 'Natalia Renteria'],
  ['oscarp@loymark.com', 'Oscar Parra'],
  ['raul.puerto@mergeto.co', 'Raul Puerto'],
  ['santiago.camacho@loymark.com', 'Santiago Camacho'],
  ['santiago.barrera@loymark.com', 'Santiago Barrera'],
  ['santiago.cardenas@loymark.com', 'Santiago Pizza'],
  ['santiago.valencia@loymark.com', 'Santiago Valencia Patiño'],
  ['stefania.vega@loymark.com', 'Stefania Vega'],
  ['valentina.nocua@loymark.com', 'Valentina Nocua'],
  ['valeria.cobos@loymark.com', 'Valeria Cobos'],
  ['vannesa.sanchez@loymark.com', 'Vannesa Sanchez'],
  ['viviana.bernal@loymark.com', 'Viviana Bernal'],
  ['wendy.hincapie@loymark.com', 'Wendy Hincapie'],
  ['erika.gutierrez@loymark.com', 'Erika Viviana Gutierrez Lara'],
  ['daniela.hernandez@loymark.com', 'Daniela Hernandez Hurtado'],
  ['kennet.henao@loymark.com', 'Kennet Zamael Henao Morris'],
  ['felipe.briceno@loymark.com', 'Felipe Briceño Berrio'],
  ['christian.forigua@loymark.com', 'Christian Felipe Forigua Chacon'],
  ['natalia.martinez@loymark.com', 'Natalia Elena Martinez Valencia'],
  ['alejandra.garcia@loymark.com', 'Alejandra Garcia Castañeda'],
  ['laura.quevedo@loymark.com', 'Laura Katherine Quevedo Carrillo'],
  ['johana.guzman@loymark.com', 'Johana Guzman'],
];

const CATEGORIAS_INICIALES = [
  ['alma', 'Alma de la Fiesta', 'Quien más participa en las actividades de Talento Humano'],
  ['salvavidas', 'Salvavidas', 'Quien siempre ayuda, aunque no le toque'],
  ['lider', 'Corazón de Líder', 'Quien inspira y guía con su ejemplo'],
  ['silencioso', 'Superhéroe Silencioso', 'Quien hace mucho sin que se note'],
  ['revelacion', 'Revelación del Año', 'Quien llegó este año y dejó huella'],
  ['tablero', 'Héroe del Tablero', 'Quien convierte los datos en ayuda para todo el equipo'],
  ['energia', 'Energía Imparable', 'Quien contagia ganas y levanta el ánimo del equipo'],
  ['calma', 'Calma en el Cierre', 'Quien mantiene la buena actitud hasta en fin de mes'],
  ['bateria', 'Batería Infinita', 'Quien nunca se apaga, ni un viernes a las 6'],
  ['luz', 'Último en Apagar la Luz', 'Quien se queda hasta el final para que todo salga bien'],
];

const FECHAS_INICIALES = {
  prep: ['2026-11-17', '2026-11-17'],
  nom: ['2026-11-18', '2026-11-27'],
  fin: ['2026-11-30', '2026-12-01'],
  vot: ['2026-12-02', '2026-12-04'],
  cer: ['2026-12-11', '2026-12-11'],
};
const FASES = ['prep', 'nom', 'fin', 'vot', 'cer'];

/* ---------------- Entrada ---------------- */

function doGet(e) {
  const q = e && e.parameter && e.parameter.q;
  return responder_(q ? JSON.parse(q) : { accion: 'publico' });
}

function doPost(e) {
  const body = e && e.postData && e.postData.contents;
  return responder_(body ? JSON.parse(body) : {});
}

function responder_(req) {
  let out;
  try {
    preparar_();
    const fn = ACCIONES[req.accion];
    if (!fn) throw new Error('Acción no reconocida');
    out = Object.assign({ ok: true }, fn(req) || {});
  } catch (err) {
    out = { ok: false, error: String((err && err.message) || err) };
  }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}

/** Ejecuta esto una vez desde el editor para crear la hoja y dar los permisos. */
function instalar() {
  preparar_();
  Logger.log('Listo. Hoja de datos: ' + hoja_().getUrl());
}

/* ---------------- Hoja de datos ---------------- */

const PESTANAS = {
  Equipo: ['Correo', 'Nombre', 'Activo'],
  Categorias: ['Id', 'Nombre', 'Descripcion', 'Activa'],
  Ajustes: ['Clave', 'Valor'],
  Nominaciones: ['Fecha', 'Correo', 'Nombre', 'Categoria', 'Propuesto', 'Mensaje'],
  Votos: ['Fecha', 'Correo', 'Nombre', 'Categoria', 'Voto'],
};

let HOJA_CACHE = null;
function hoja_() {
  if (HOJA_CACHE) return HOJA_CACHE;
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('HOJA_ID');
  if (id) { HOJA_CACHE = SpreadsheetApp.openById(id); return HOJA_CACHE; }
  const ss = SpreadsheetApp.create(NOMBRE_HOJA);
  props.setProperty('HOJA_ID', ss.getId());
  HOJA_CACHE = ss;
  return ss;
}

function pestana_(nombre) { return hoja_().getSheetByName(nombre); }

function preparar_() {
  const props = PropertiesService.getScriptProperties();
  if (props.getProperty('LISTO') === '1') return;
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    if (props.getProperty('LISTO') === '1') return;
    const ss = hoja_();
    Object.keys(PESTANAS).forEach(nombre => {
      let sh = ss.getSheetByName(nombre);
      if (!sh) sh = ss.insertSheet(nombre);
      if (sh.getLastRow() === 0) { sh.appendRow(PESTANAS[nombre]); sh.setFrozenRows(1); }
    });
    const sobra = ss.getSheetByName('Hoja 1') || ss.getSheetByName('Sheet1') || ss.getSheetByName('Hoja1');
    if (sobra && ss.getSheets().length > 1) ss.deleteSheet(sobra);
    escribirFilas_('Equipo', EQUIPO_INICIAL.map(r => [r[0], r[1], 'si']));
    escribirFilas_('Categorias', CATEGORIAS_INICIALES.map(r => [r[0], r[1], r[2], 'si']));
    guardarAjustes_({ fechas: FECHAS_INICIALES, fase: 'auto', finalistas: null, ganadores: null, revelado: false });
    props.setProperty('LISTO', '1');
  } finally {
    lock.releaseLock();
  }
}

function escribirFilas_(nombre, filas) {
  const sh = pestana_(nombre);
  if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).clearContent();
  if (filas.length) sh.getRange(2, 1, filas.length, filas[0].length).setValues(filas);
}

function filas_(nombre) {
  const sh = pestana_(nombre);
  const n = sh.getLastRow();
  if (n < 2) return [];
  return sh.getRange(2, 1, n - 1, PESTANAS[nombre].length).getValues();
}

function ajustes_() {
  const out = {};
  filas_('Ajustes').forEach(r => { if (r[0]) { try { out[r[0]] = JSON.parse(r[1]); } catch (e) { out[r[0]] = r[1]; } } });
  return out;
}

function guardarAjustes_(cambios) {
  const a = Object.assign(ajustes_(), cambios);
  escribirFilas_('Ajustes', Object.keys(a).map(k => [k, JSON.stringify(a[k])]));
  return a;
}

function equipo_() {
  return filas_('Equipo')
    .filter(r => r[0] && String(r[2]).toLowerCase() !== 'no')
    .map(r => ({ correo: String(r[0]).trim().toLowerCase(), nombre: String(r[1]).trim() }));
}

function categorias_(todas) {
  return filas_('Categorias')
    .filter(r => r[0])
    .map(r => ({ id: String(r[0]), nombre: String(r[1]), desc: String(r[2]), activa: String(r[3]).toLowerCase() !== 'no' }))
    .filter(c => todas || c.activa);
}

/* ---------------- Fases ---------------- */

function hoy_() { return Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd'); }

function faseActual_(a) {
  if (a.fase && a.fase !== 'auto') return a.fase;
  const f = a.fechas, t = hoy_();
  for (let i = 0; i < FASES.length; i++) { const r = f[FASES[i]]; if (t >= r[0] && t <= r[1]) return FASES[i]; }
  if (t < f.prep[0]) return 'prep';
  if (t > f.cer[1]) return 'cerrado';
  for (let i = 0; i < FASES.length; i++) if (t < f[FASES[i]][0]) return FASES[Math.max(0, i - 1)];
  return 'cerrado';
}

function votacionAbierta_(fase) { return fase === 'vot' || fase === 'cer' || fase === 'cerrado'; }

/* ---------------- Sesión por correo ---------------- */

function normal_(c) { return String(c || '').trim().toLowerCase(); }

function persona_(correo) { return equipo_().find(p => p.correo === normal_(correo)) || null; }

function sesion_(token) {
  if (!token) throw new Error('Tu sesión terminó. Vuelve a ingresar con tu correo.');
  const raw = PropertiesService.getScriptProperties().getProperty('t:' + token);
  const s = raw ? JSON.parse(raw) : null;
  const correo = s && s.exp > Date.now() ? s.correo : null;
  if (!correo) throw new Error('Tu sesión terminó. Vuelve a ingresar con tu correo.');
  const p = persona_(correo);
  if (!p) throw new Error('Tu correo ya no está en la lista de participantes.');
  return p;
}

function exigirAdmin_(req) {
  const cache = CacheService.getScriptCache();
  const fallos = Number(cache.get('adminFallos') || 0);
  if (fallos >= 8) throw new Error('Demasiados intentos. Espera 15 minutos.');
  if (!CLAVE_ADMIN || CLAVE_ADMIN === 'ESCRIBE-AQUI-TU-CLAVE') throw new Error('Falta configurar la clave de admin en el script.');
  if (String(req.clave || '') !== CLAVE_ADMIN) {
    cache.put('adminFallos', String(fallos + 1), 900);
    throw new Error('Clave incorrecta.');
  }
}

/* ---------------- Cálculos ---------------- */

function conteo_(nombre, col) {
  const res = {};
  filas_(nombre).forEach(r => {
    const cat = r[3], p = r[col];
    if (!cat || !p) return;
    res[cat] = res[cat] || {};
    res[cat][p] = (res[cat][p] || 0) + 1;
  });
  return res;
}

function quienes_(nombre) {
  const m = {};
  filas_(nombre).forEach(r => { const c = normal_(r[1]); if (c && !m[c]) m[c] = r[0] instanceof Date ? r[0].toISOString() : String(r[0]); });
  return m;
}

function calcularFinalistas_() {
  const noms = conteo_('Nominaciones', 4), out = {};
  categorias_().forEach(c => {
    out[c.id] = Object.keys(noms[c.id] || {})
      .sort((a, b) => noms[c.id][b] - noms[c.id][a] || a.localeCompare(b, 'es'))
      .slice(0, 2);
  });
  return out;
}

// Un premio por persona: se asigna primero la categoría cuyo líder tiene más votos.
function calcularGanadores_(finalistas) {
  const votos = conteo_('Votos', 4), noms = conteo_('Nominaciones', 4), ranking = {};
  categorias_().forEach(c => {
    ranking[c.id] = (finalistas[c.id] || []).map(p => ({ p: p, v: (votos[c.id] || {})[p] || 0, n: (noms[c.id] || {})[p] || 0 }))
      .sort((a, b) => b.v - a.v || b.n - a.n);
  });
  const orden = Object.keys(ranking).sort((a, b) => ((ranking[b][0] || {}).v || 0) - ((ranking[a][0] || {}).v || 0));
  const usados = {}, ganadores = {};
  orden.forEach(cid => {
    const g = ranking[cid].find(x => !usados[x.p] && x.v > 0);
    if (!g) return;
    ganadores[cid] = g.p;
    usados[g.p] = true;
  });
  return { ranking: ranking, ganadores: ganadores };
}

/* ---------------- Acciones ---------------- */

const ACCIONES = {
  publico: function () {
    const a = ajustes_(), fase = faseActual_(a);
    return {
      fase: fase,
      fechas: a.fechas,
      categorias: categorias_(),
      finalistas: votacionAbierta_(fase) && a.finalistas ? a.finalistas : null,
      ganadores: a.revelado && a.ganadores ? a.ganadores : null,
    };
  },

  entrar: function (req) {
    const correo = normal_(req.correo);
    const p = persona_(correo);
    if (!p) throw new Error('Ese correo no está en la lista de participantes. Si crees que es un error, escribe a Talento Humano.');
    const token = Utilities.getUuid();
    PropertiesService.getScriptProperties().setProperty('t:' + token, JSON.stringify({ correo: correo, exp: Date.now() + DIAS_SESION * 864e5 }));
    return { token: token, nombre: p.nombre };
  },

  yo: function (req) {
    const p = sesion_(req.token);
    const mias = filas_('Nominaciones').filter(r => normal_(r[1]) === p.correo);
    const misVotos = filas_('Votos').filter(r => normal_(r[1]) === p.correo);
    const propuestas = {}, votos = {};
    mias.forEach(r => { propuestas[r[3]] = { p: r[4], m: r[5] }; });
    misVotos.forEach(r => { votos[r[3]] = r[4]; });
    const fecha = rows => rows.length ? (rows[0][0] instanceof Date ? rows[0][0].toISOString() : String(rows[0][0])) : null;
    return {
      nombre: p.nombre,
      correo: p.correo,
      equipo: equipo_().map(x => x.nombre).sort((a, b) => a.localeCompare(b, 'es')),
      propuestas: propuestas,
      propuestasEn: fecha(mias),
      votos: votos,
      votoEn: fecha(misVotos),
    };
  },

  nominar: function (req) {
    const p = sesion_(req.token);
    const a = ajustes_();
    if (faseActual_(a) !== 'nom') throw new Error('Las propuestas no están abiertas en este momento.');
    const nombres = {};
    equipo_().forEach(x => { nombres[x.nombre] = true; });
    const cats = {};
    categorias_().forEach(c => { cats[c.id] = true; });
    const filas = [];
    const ahora = new Date();
    Object.keys(req.picks || {}).forEach(cid => {
      const v = req.picks[cid] || {};
      if (!cats[cid] || !v.p) return;
      if (!nombres[v.p]) throw new Error('Una de las personas propuestas no está en la lista.');
      if (v.p === p.nombre) throw new Error('No puedes proponerte a ti mismo.');
      filas.push([ahora, p.correo, p.nombre, cid, v.p, String(v.m || '').slice(0, 200)]);
    });
    if (!filas.length) throw new Error('Propón al menos en una categoría.');
    const lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      if (quienes_('Nominaciones')[p.correo]) throw new Error('Ya enviaste tus propuestas y no se pueden cambiar.');
      const sh = pestana_('Nominaciones');
      sh.getRange(sh.getLastRow() + 1, 1, filas.length, filas[0].length).setValues(filas);
    } finally {
      lock.releaseLock();
    }
    return { guardado: true, en: ahora.toISOString() };
  },

  votar: function (req) {
    const p = sesion_(req.token);
    const a = ajustes_();
    if (faseActual_(a) !== 'vot') throw new Error('La votación no está abierta en este momento.');
    if (!a.finalistas) throw new Error('Aún no hay finalistas publicados.');
    const filas = [];
    const ahora = new Date();
    categorias_().forEach(c => {
      const elegido = (req.picks || {})[c.id];
      if (!elegido) return;
      if ((a.finalistas[c.id] || []).indexOf(elegido) < 0) throw new Error('Solo puedes votar por los finalistas.');
      if (elegido === p.nombre) throw new Error('No puedes votar por ti mismo.');
      filas.push([ahora, p.correo, p.nombre, c.id, elegido]);
    });
    if (!filas.length) throw new Error('Elige al menos un finalista.');
    const lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      if (quienes_('Votos')[p.correo]) throw new Error('Ya enviaste tu voto y no se puede cambiar.');
      const sh = pestana_('Votos');
      sh.getRange(sh.getLastRow() + 1, 1, filas.length, filas[0].length).setValues(filas);
    } finally {
      lock.releaseLock();
    }
    return { guardado: true, en: ahora.toISOString() };
  },

  /* ----- Administración (todas piden la clave) ----- */

  adminDatos: function (req) {
    exigirAdmin_(req);
    const a = ajustes_();
    const fin = a.finalistas || {};
    return {
      fase: faseActual_(a),
      ajustes: a,
      equipo: filas_('Equipo').filter(r => r[0]).map(r => ({ correo: normal_(r[0]), nombre: String(r[1]), activo: String(r[2]).toLowerCase() !== 'no' })),
      categorias: categorias_(true),
      nominaciones: conteo_('Nominaciones', 4),
      votos: conteo_('Votos', 4),
      nominaron: quienes_('Nominaciones'),
      votaron: quienes_('Votos'),
      calculo: calcularGanadores_(fin),
      urlHoja: hoja_().getUrl(),
    };
  },

  adminFechas: function (req) {
    exigirAdmin_(req);
    const f = req.fechas || {};
    FASES.forEach(k => {
      if (!f[k] || !/^\d{4}-\d{2}-\d{2}$/.test(f[k][0]) || !/^\d{4}-\d{2}-\d{2}$/.test(f[k][1]) || f[k][0] > f[k][1]) throw new Error('Revisa las fechas: cada fase necesita inicio y fin válidos.');
    });
    const fase = ['auto', 'prep', 'nom', 'fin', 'vot', 'cer', 'cerrado'].indexOf(req.fase) >= 0 ? req.fase : 'auto';
    guardarAjustes_({ fechas: f, fase: fase });
    return {};
  },

  adminPublicarFinalistas: function (req) {
    exigirAdmin_(req);
    const fin = calcularFinalistas_();
    guardarAjustes_({ finalistas: fin, ganadores: null, revelado: false });
    return { finalistas: fin };
  },

  adminRevelar: function (req) {
    exigirAdmin_(req);
    if (!req.revelar) { guardarAjustes_({ revelado: false }); return {}; }
    const a = ajustes_();
    if (!a.finalistas) throw new Error('Primero publica los finalistas.');
    const g = calcularGanadores_(a.finalistas).ganadores;
    guardarAjustes_({ ganadores: g, revelado: true });
    return { ganadores: g };
  },

  adminPersona: function (req) {
    exigirAdmin_(req);
    const correo = normal_(req.correo), nombre = String(req.nombre || '').trim();
    const filas = filas_('Equipo').filter(r => r[0]);
    const i = filas.findIndex(r => normal_(r[0]) === correo);
    if (req.op === 'agregar') {
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo) || !nombre) throw new Error('Escribe un correo y un nombre válidos.');
      if (i >= 0) { filas[i] = [correo, nombre, 'si']; } else filas.push([correo, nombre, 'si']);
    } else if (req.op === 'quitar') {
      if (i < 0) throw new Error('No encontramos ese correo.');
      filas.splice(i, 1);
    } else throw new Error('Operación no válida.');
    escribirFilas_('Equipo', filas.map(r => [r[0], r[1], r[2] || 'si']));
    return {};
  },

  adminCategoria: function (req) {
    exigirAdmin_(req);
    const filas = filas_('Categorias').filter(r => r[0]);
    if (req.op === 'agregar') {
      const nombre = String(req.nombre || '').trim(), desc = String(req.desc || '').trim();
      if (!nombre || !desc) throw new Error('Escribe el nombre y la descripción del premio.');
      const id = 'c' + Date.now().toString(36);
      filas.push([id, nombre, desc, 'si']);
    } else {
      const i = filas.findIndex(r => String(r[0]) === String(req.id));
      if (i < 0) throw new Error('No encontramos esa categoría.');
      if (req.op === 'activar') filas[i][3] = req.activa ? 'si' : 'no';
      else if (req.op === 'quitar') filas.splice(i, 1);
      else throw new Error('Operación no válida.');
    }
    escribirFilas_('Categorias', filas);
    return {};
  },

  // Permite que alguien vuelva a enviar si Talento Humano lo autoriza.
  adminBorrarRespuesta: function (req) {
    exigirAdmin_(req);
    const nombre = req.tipo === 'votos' ? 'Votos' : 'Nominaciones';
    const correo = normal_(req.correo);
    const lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      const resto = filas_(nombre).filter(r => normal_(r[1]) !== correo);
      escribirFilas_(nombre, resto);
    } finally {
      lock.releaseLock();
    }
    return {};
  },
};
