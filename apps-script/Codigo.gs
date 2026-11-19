/**
 * Premios de Fin de Año 2026 · Grupo Garnier
 * Almacén y reglas de la votación (Google Apps Script).
 *
 * El script crea solo su hoja de cálculo y valida todo:
 *  - cada persona entra con su correo (cualquier dominio) y la clave del grupo;
 *    si su correo no está en la lista, elige empresa, país y su nombre una sola vez
 *  - cada empresa y país vota por separado: solo se ven y se votan compañeros del mismo grupo
 *  - cada correo queda amarrado al primer dispositivo desde donde se entra
 *  - nadie puede proponerse ni votarse a sí mismo
 *  - las propuestas y el voto se envían una sola vez
 *  - pasan 2 finalistas por categoría en cada grupo
 *  - las acciones de administración piden la clave de admin
 */
const CLAVE_ADMIN = 'ESCRIBE-AQUI-TU-CLAVE';
const CLAVE_GRUPO = 'GG2027*'; // clave que usan todos los participantes para entrar
// Correos de demostración: entran a la vista de participante, pueden probar todo y nada se guarda.
const CORREOS_DEMO = ['agonzalez@grupogarnier.com'];

const TZ = 'America/Bogota';
const NOMBRE_HOJA = 'Premios 2026 · Grupo Garnier (datos)';
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

const EMPRESAS = [
  'Grupo Garnier', 'Garnier Agencia Creativa', 'Servicios Compartidos', 'HouseDentsu', 'Kaiju', 'Shift Latam',
  'PHD', 'OMD', 'TBWA', 'RMS Punto Retail', 'Loymark', 'Astro', 'Bluezone', 'Red Global', 'Joystick',
  'Precision Media', 'Publicidad Garnier S.A.', 'Adcom de Honduras S.A.', 'Optimización de Medios Directos de Honduras',
  'PDH', 'Estrategias y Servicios Especializados', 'Porter Novelli S.A.', 'Optimización de Medios Directos OPMED S.A.',
  'Asesores Ecuador PN S.A.', 'Óptima del Ecuador S.A. OPTIMASA', 'Garnier Advertising GARAD S.A.',
  'Exfiem del Ecuador EXFIEM S.A.', 'House Ecuador HOECU S.A.', 'Garnier.Agency', 'Medios Estratégicos',
  'House Advertising House Latam S.A.', 'Allison',
];
const PAISES = ['Costa Rica', 'Panamá', 'Colombia', 'Brasil', 'México', 'Guatemala', 'Argentina', 'Chile', 'Ecuador', 'Honduras', 'Venezuela', 'Otro'];
// Las personas cargadas antes sin empresa ni país quedan en este grupo.
const EMPRESA_DEFECTO = 'Loymark';
const PAIS_DEFECTO = 'Colombia';

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
  Equipo: ['Correo', 'Nombre', 'Activo', 'Empresa', 'Pais'],
  Categorias: ['Id', 'Nombre', 'Descripcion', 'Activa'],
  Ajustes: ['Clave', 'Valor'],
  Nominaciones: ['Fecha', 'Correo', 'Nombre', 'Categoria', 'Propuesto', 'Mensaje', 'Grupo'],
  Votos: ['Fecha', 'Correo', 'Nombre', 'Categoria', 'Voto', 'Grupo'],
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
  if (props.getProperty('VERSION') === '2') return;
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    if (props.getProperty('VERSION') === '2') return;
    const ss = hoja_();
    const nueva = props.getProperty('LISTO') !== '1';
    Object.keys(PESTANAS).forEach(nombre => {
      let sh = ss.getSheetByName(nombre);
      if (!sh) sh = ss.insertSheet(nombre);
      sh.getRange(1, 1, 1, PESTANAS[nombre].length).setValues([PESTANAS[nombre]]);
      sh.setFrozenRows(1);
    });
    const sobra = ss.getSheetByName('Hoja 1') || ss.getSheetByName('Sheet1') || ss.getSheetByName('Hoja1');
    if (sobra && ss.getSheets().length > 1) ss.deleteSheet(sobra);
    if (nueva) {
      escribirFilas_('Equipo', EQUIPO_INICIAL.map(r => [r[0], r[1], 'si', EMPRESA_DEFECTO, PAIS_DEFECTO]));
      escribirFilas_('Categorias', CATEGORIAS_INICIALES.map(r => [r[0], r[1], r[2], 'si']));
      guardarAjustes_({ fechas: FECHAS_INICIALES, fase: 'auto', finalistas: {}, ganadores: {}, revelado: {} });
      props.setProperty('LISTO', '1');
    } else {
      // Actualiza una hoja de la versión anterior: asigna empresa y país a quienes no lo tienen.
      escribirFilas_('Equipo', filas_('Equipo').filter(r => r[1]).map(r => [r[0], r[1], r[2] || 'si', r[3] || EMPRESA_DEFECTO, r[4] || PAIS_DEFECTO]));
      const g = grupo_(EMPRESA_DEFECTO, PAIS_DEFECTO), a = ajustes_();
      const porGrupo = v => (v && typeof v === 'object' && !Array.isArray(v) && !Object.keys(v).some(k => k.indexOf(' · ') >= 0) && Object.keys(v).length) ? { [g]: v } : (v && typeof v === 'object' ? v : {});
      guardarAjustes_({
        finalistas: porGrupo(a.finalistas),
        ganadores: porGrupo(a.ganadores),
        revelado: a.revelado === true ? { [g]: true } : (a.revelado && typeof a.revelado === 'object' ? a.revelado : {}),
      });
    }
    props.setProperty('VERSION', '2');
  } finally {
    lock.releaseLock();
  }
}

function escribirFilas_(nombre, filas) {
  const sh = pestana_(nombre);
  if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, Math.max(sh.getLastColumn(), PESTANAS[nombre].length)).clearContent();
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

/* ---------------- Equipo y grupos ---------------- */

function grupo_(empresa, pais) { return String(empresa || EMPRESA_DEFECTO).trim() + ' · ' + String(pais || PAIS_DEFECTO).trim(); }

function filaPersona_(r) {
  return { correo: normal_(r[0]), nombre: String(r[1]).trim(), activo: String(r[2]).toLowerCase() !== 'no', empresa: String(r[3] || EMPRESA_DEFECTO).trim(), pais: String(r[4] || PAIS_DEFECTO).trim(), grupo: grupo_(r[3], r[4]) };
}

function todos_() { return filas_('Equipo').filter(r => r[1]).map(filaPersona_); }
function equipo_(grupo) { return todos_().filter(p => p.activo && (!grupo || p.grupo === grupo)); }

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
  for (let i = FASES.length - 1; i >= 0; i--) { const r = f[FASES[i]]; if (t >= r[0] && t <= r[1]) return FASES[i]; }
  if (t < f.prep[0]) return 'prep';
  if (t > f.cer[1]) return 'cerrado';
  for (let i = 0; i < FASES.length; i++) if (t < f[FASES[i]][0]) return FASES[Math.max(0, i - 1)];
  return 'cerrado';
}

function votacionAbierta_(fase) { return fase === 'vot' || fase === 'cer' || fase === 'cerrado'; }

/* ---------------- Sesión ---------------- */

function normal_(c) { return String(c || '').trim().toLowerCase(); }
const CORREO_OK = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function persona_(correo) { const c = normal_(correo); return c ? equipo_().find(p => p.correo === c) || null : null; }

function esDemo_(correo) { return CORREOS_DEMO.map(normal_).indexOf(normal_(correo)) >= 0; }
function personaDemo_(correo) {
  return { correo: normal_(correo), nombre: 'Persona de prueba', empresa: EMPRESA_DEFECTO, pais: PAIS_DEFECTO, grupo: grupo_(EMPRESA_DEFECTO, PAIS_DEFECTO), activo: true, demo: true };
}

function sesion_(token) {
  if (!token) throw new Error('Tu sesión terminó. Vuelve a ingresar con tu correo.');
  const raw = PropertiesService.getScriptProperties().getProperty('t:' + token);
  const s = raw ? JSON.parse(raw) : null;
  const correo = s && s.exp > Date.now() ? s.correo : null;
  if (!correo) throw new Error('Tu sesión terminó. Vuelve a ingresar con tu correo.');
  if (esDemo_(correo)) return personaDemo_(correo);
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

function nuevaSesion_(correo) {
  const token = Utilities.getUuid();
  PropertiesService.getScriptProperties().setProperty('t:' + token, JSON.stringify({ correo: correo, exp: Date.now() + DIAS_SESION * 864e5 }));
  return token;
}

/* ---------------- Cálculos (siempre dentro de un grupo) ---------------- */

const DEF_GRUPO = () => grupo_(EMPRESA_DEFECTO, PAIS_DEFECTO);
function filasGrupo_(nombre, grupo) {
  const col = PESTANAS[nombre].indexOf('Grupo');
  return filas_(nombre).filter(r => (String(r[col] || '') || DEF_GRUPO()) === grupo);
}

function conteo_(nombre, col, grupo) {
  const res = {};
  filasGrupo_(nombre, grupo).forEach(r => {
    const cat = r[3], p = r[col];
    if (!cat || !p) return;
    res[cat] = res[cat] || {};
    res[cat][p] = (res[cat][p] || 0) + 1;
  });
  return res;
}

function quienes_(nombre, grupo) {
  const m = {};
  (grupo ? filasGrupo_(nombre, grupo) : filas_(nombre)).forEach(r => { const c = normal_(r[1]); if (c && !m[c]) m[c] = r[0] instanceof Date ? r[0].toISOString() : String(r[0]); });
  return m;
}

function calcularFinalistas_(grupo) {
  const noms = conteo_('Nominaciones', 4, grupo), out = {};
  categorias_().forEach(c => {
    out[c.id] = Object.keys(noms[c.id] || {})
      .sort((a, b) => noms[c.id][b] - noms[c.id][a] || a.localeCompare(b, 'es'))
      .slice(0, 2);
  });
  return out;
}

// Un premio por persona: se asigna primero la categoría cuyo líder tiene más votos.
function calcularGanadores_(finalistas, grupo) {
  const votos = conteo_('Votos', 4, grupo), noms = conteo_('Nominaciones', 4, grupo), ranking = {};
  categorias_().forEach(c => {
    ranking[c.id] = ((finalistas || {})[c.id] || []).map(p => ({ p: p, v: (votos[c.id] || {})[p] || 0, n: (noms[c.id] || {})[p] || 0 }))
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

// Agrega o actualiza una persona dentro de un grupo. El correo es opcional.
function agregarPersona_(filas, correo, nombre, empresa, pais) {
  if (!nombre) throw new Error('Falta el nombre de una persona.');
  if (correo && !CORREO_OK.test(correo)) throw new Error('Revisa este correo: ' + correo);
  const g = grupo_(empresa, pais);
  let i = correo ? filas.findIndex(r => normal_(r[0]) === correo) : -1;
  if (i < 0) i = filas.findIndex(r => String(r[1]).trim() === nombre && grupo_(r[3], r[4]) === g);
  const fila = [correo || (i >= 0 ? filas[i][0] : ''), nombre, 'si', empresa, pais];
  if (i >= 0) filas[i] = fila; else filas.push(fila);
}

function grupoValido_(empresa, pais) {
  if (EMPRESAS.indexOf(empresa) < 0) throw new Error('Elige una empresa de la lista.');
  if (PAISES.indexOf(pais) < 0) throw new Error('Elige un país de la lista.');
}

/* ---------------- Acciones ---------------- */

const ACCIONES = {
  publico: function () {
    const a = ajustes_();
    return { fase: faseActual_(a), fechas: a.fechas, categorias: categorias_(), empresas: EMPRESAS, paises: PAISES };
  },

  entrar: function (req) {
    const cache = CacheService.getScriptCache();
    const correo = normal_(req.correo);
    const k = 'grupoFallos:' + correo;
    const fallos = Number(cache.get(k) || 0);
    if (fallos >= 8) throw new Error('Demasiados intentos. Espera 15 minutos.');
    if (String(req.clave || '') !== CLAVE_GRUPO) { cache.put(k, String(fallos + 1), 900); throw new Error('La clave del grupo no es correcta.'); }
    if (!CORREO_OK.test(correo)) throw new Error('Escribe un correo válido.');
    if (esDemo_(correo)) return { token: nuevaSesion_(correo), nombre: 'Persona de prueba', demo: true };
    const dispositivo = String(req.dispositivo || '').slice(0, 80);
    if (!dispositivo) throw new Error('Actualiza la página e inténtalo de nuevo.');
    const props = PropertiesService.getScriptProperties();
    const ligado = props.getProperty('d:' + correo);
    if (ligado && ligado !== dispositivo) throw new Error('Este correo ya se usó desde otro celular o computador. Entra desde ese mismo dispositivo y navegador, o escribe a Talento Humano para habilitarte.');
    let p = persona_(correo);
    if (!p) {
      const empresa = String(req.empresa || ''), pais = String(req.pais || '');
      if (!empresa || !pais) return { elegirGrupo: true, empresas: EMPRESAS, paises: PAISES };
      grupoValido_(empresa, pais);
      const g = grupo_(empresa, pais);
      const libres = todos_().filter(x => x.activo && x.grupo === g && !x.correo).map(x => x.nombre).sort((a, b) => a.localeCompare(b, 'es'));
      const nombre = String(req.nombre || '').trim();
      if (!nombre) {
        if (!libres.length) throw new Error('Aún no hay personas cargadas para ' + empresa + ' en ' + pais + ', o todas ya se registraron. Escribe a Talento Humano.');
        return { elegirNombre: true, libres: libres };
      }
      const lock = LockService.getScriptLock();
      lock.waitLock(20000);
      try {
        const actual = filas_('Equipo');
        const i = actual.findIndex(r => String(r[1]).trim() === nombre && grupo_(r[3], r[4]) === g && String(r[2]).toLowerCase() !== 'no');
        if (i < 0) throw new Error('Ese nombre no está en la lista de tu empresa y país.');
        if (normal_(actual[i][0])) throw new Error('Ese nombre ya está registrado con otro correo. Si eres tú, escribe a Talento Humano.');
        pestana_('Equipo').getRange(i + 2, 1).setValue(correo);
      } finally {
        lock.releaseLock();
      }
      p = persona_(correo);
    }
    if (!ligado) props.setProperty('d:' + correo, dispositivo);
    return { token: nuevaSesion_(correo), nombre: p.nombre };
  },

  yo: function (req) {
    const p = sesion_(req.token);
    const a = ajustes_(), fase = faseActual_(a);
    if (p.demo) {
      const equipo = equipo_(p.grupo).map(x => x.nombre).sort((a2, b) => a2.localeCompare(b, 'es'));
      const real = (a.finalistas || {})[p.grupo];
      const muestra = {};
      categorias_().forEach((c, i) => { muestra[c.id] = equipo.length > 1 ? [equipo[(i * 2) % equipo.length], equipo[(i * 2 + 1) % equipo.length]] : []; });
      const fin = real || muestra, gan = {};
      Object.keys(fin).forEach(k => { if (fin[k] && fin[k][0]) gan[k] = fin[k][0]; });
      return { demo: true, nombre: p.nombre, correo: p.correo, empresa: p.empresa, pais: p.pais, equipo: equipo, propuestas: {}, propuestasEn: null, votos: {}, votoEn: null, finalistas: fin, ganadores: gan };
    }
    const mias = filas_('Nominaciones').filter(r => normal_(r[1]) === p.correo);
    const misVotos = filas_('Votos').filter(r => normal_(r[1]) === p.correo);
    const propuestas = {}, votos = {};
    mias.forEach(r => { propuestas[r[3]] = { p: r[4], m: r[5] }; });
    misVotos.forEach(r => { votos[r[3]] = r[4]; });
    const fecha = rows => rows.length ? (rows[0][0] instanceof Date ? rows[0][0].toISOString() : String(rows[0][0])) : null;
    const fin = (a.finalistas || {})[p.grupo];
    return {
      nombre: p.nombre,
      correo: p.correo,
      empresa: p.empresa,
      pais: p.pais,
      equipo: equipo_(p.grupo).map(x => x.nombre).sort((a2, b) => a2.localeCompare(b, 'es')),
      propuestas: propuestas,
      propuestasEn: fecha(mias),
      votos: votos,
      votoEn: fecha(misVotos),
      finalistas: votacionAbierta_(fase) && fin ? fin : null,
      ganadores: (a.revelado || {})[p.grupo] ? (a.ganadores || {})[p.grupo] || null : null,
    };
  },

  nominar: function (req) {
    const p = sesion_(req.token);
    if (p.demo) return { guardado: false, demo: true };
    const a = ajustes_();
    if (faseActual_(a) !== 'nom') throw new Error('Las propuestas no están abiertas en este momento.');
    const nombres = {};
    equipo_(p.grupo).forEach(x => { nombres[x.nombre] = true; });
    const cats = {};
    categorias_().forEach(c => { cats[c.id] = true; });
    const filas = [];
    const ahora = new Date();
    Object.keys(req.picks || {}).forEach(cid => {
      const v = req.picks[cid] || {};
      if (!cats[cid] || !v.p) return;
      if (!nombres[v.p]) throw new Error('Una de las personas propuestas no está en tu equipo.');
      if (v.p === p.nombre) throw new Error('No puedes proponerte a ti mismo.');
      filas.push([ahora, p.correo, p.nombre, cid, v.p, String(v.m || '').slice(0, 200), p.grupo]);
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
    if (p.demo) return { guardado: false, demo: true };
    const a = ajustes_();
    if (faseActual_(a) !== 'vot') throw new Error('La votación no está abierta en este momento.');
    const fin = (a.finalistas || {})[p.grupo];
    if (!fin) throw new Error('Aún no hay finalistas publicados para tu equipo.');
    const filas = [];
    const ahora = new Date();
    categorias_().forEach(c => {
      const elegido = (req.picks || {})[c.id];
      if (!elegido) return;
      if ((fin[c.id] || []).indexOf(elegido) < 0) throw new Error('Solo puedes votar por los finalistas.');
      if (elegido === p.nombre) throw new Error('No puedes votar por ti mismo.');
      filas.push([ahora, p.correo, p.nombre, c.id, elegido, p.grupo]);
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
    const todos = todos_();
    const nominaron = quienes_('Nominaciones'), votaron = quienes_('Votos');
    const grupos = {};
    todos.forEach(p => {
      const g = grupos[p.grupo] = grupos[p.grupo] || { grupo: p.grupo, empresa: p.empresa, pais: p.pais, personas: 0, propusieron: 0, votaron: 0 };
      if (!p.activo) return;
      g.personas++;
      if (p.correo && nominaron[p.correo]) g.propusieron++;
      if (p.correo && votaron[p.correo]) g.votaron++;
    });
    const g = req.empresa && req.pais ? grupo_(req.empresa, req.pais) : null;
    const out = {
      fase: faseActual_(a),
      ajustes: { fechas: a.fechas, fase: a.fase },
      empresas: EMPRESAS,
      paises: PAISES,
      grupos: Object.keys(grupos).sort().map(k => grupos[k]),
      categorias: categorias_(true),
      urlHoja: hoja_().getUrl(),
    };
    if (g) {
      const fin = (a.finalistas || {})[g] || null;
      const props = PropertiesService.getScriptProperties();
      Object.assign(out, {
        grupo: g,
        equipo: todos.filter(p => p.grupo === g).map(p => Object.assign(p, { dispositivo: !!(p.correo && props.getProperty('d:' + p.correo)) })),
        nominaciones: conteo_('Nominaciones', 4, g),
        nominaron: quienes_('Nominaciones', g),
        votaron: quienes_('Votos', g),
        finalistas: fin,
        revelado: !!(a.revelado || {})[g],
        calculo: calcularGanadores_(fin, g),
      });
    }
    return out;
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
    grupoValido_(req.empresa, req.pais);
    const g = grupo_(req.empresa, req.pais), a = ajustes_();
    const fin = calcularFinalistas_(g);
    const finalistas = a.finalistas || {}, ganadores = a.ganadores || {}, revelado = a.revelado || {};
    finalistas[g] = fin; delete ganadores[g]; delete revelado[g];
    guardarAjustes_({ finalistas: finalistas, ganadores: ganadores, revelado: revelado });
    return { finalistas: fin };
  },

  adminRevelar: function (req) {
    exigirAdmin_(req);
    grupoValido_(req.empresa, req.pais);
    const g = grupo_(req.empresa, req.pais), a = ajustes_();
    const ganadores = a.ganadores || {}, revelado = a.revelado || {};
    if (!req.revelar) { delete revelado[g]; guardarAjustes_({ revelado: revelado }); return {}; }
    const fin = (a.finalistas || {})[g];
    if (!fin) throw new Error('Primero publica los finalistas de este grupo.');
    ganadores[g] = calcularGanadores_(fin, g).ganadores;
    revelado[g] = true;
    guardarAjustes_({ ganadores: ganadores, revelado: revelado });
    return { ganadores: ganadores[g] };
  },

  adminPersona: function (req) {
    exigirAdmin_(req);
    const nombre = String(req.nombre || '').trim(), g = grupo_(req.empresa, req.pais);
    const filas = filas_('Equipo').filter(r => r[1]);
    if (req.op === 'agregar') {
      grupoValido_(req.empresa, req.pais);
      agregarPersona_(filas, normal_(req.correo), nombre, req.empresa, req.pais);
    } else {
      const i = filas.findIndex(r => String(r[1]).trim() === nombre && grupo_(r[3], r[4]) === g);
      if (i < 0) throw new Error('No encontramos a esa persona.');
      const c = normal_(filas[i][0]);
      if (c) PropertiesService.getScriptProperties().deleteProperty('d:' + c);
      if (req.op === 'quitar') filas.splice(i, 1);
      else if (req.op === 'liberar') filas[i][0] = '';
      else if (req.op === 'dispositivo') { /* solo libera el dispositivo */ }
      else throw new Error('Operación no válida.');
    }
    escribirFilas_('Equipo', filas.map(r => [r[0], r[1], r[2] || 'si', r[3] || EMPRESA_DEFECTO, r[4] || PAIS_DEFECTO]));
    return {};
  },

  adminPersonas: function (req) {
    exigirAdmin_(req);
    grupoValido_(req.empresa, req.pais);
    const filas = filas_('Equipo').filter(r => r[1]);
    const lista = req.personas || [];
    lista.forEach(x => agregarPersona_(filas, normal_(x.correo), String(x.nombre || '').trim(), req.empresa, req.pais));
    escribirFilas_('Equipo', filas.map(r => [r[0], r[1], r[2] || 'si', r[3] || EMPRESA_DEFECTO, r[4] || PAIS_DEFECTO]));
    return { cargadas: lista.length };
  },

  adminCategoria: function (req) {
    exigirAdmin_(req);
    const filas = filas_('Categorias').filter(r => r[0]);
    if (req.op === 'agregar') {
      const nombre = String(req.nombre || '').trim(), desc = String(req.desc || '').trim();
      if (!nombre || !desc) throw new Error('Escribe el nombre y la descripción del premio.');
      filas.push(['c' + Date.now().toString(36), nombre, desc, 'si']);
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
      escribirFilas_(nombre, filas_(nombre).filter(r => normal_(r[1]) !== correo));
    } finally {
      lock.releaseLock();
    }
    return {};
  },
};
