/* Configuración y utilidades compartidas · Premios de Fin de Año */
// Pega aquí la URL de la aplicación web de Apps Script (termina en /exec).
window.PREMIOS_API = window.PREMIOS_API || 'https://script.google.com/macros/s/AKfycbxo17Zr0TslyGA2kr7tfm8z6ddHF-cGAzqxcjSY7xG2fkeq68HsBKYmY_OXXzzu0ZQ-/exec';

const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const fmt = d => d ? `${Number(d.slice(8, 10))} ${MONTHS[Number(d.slice(5, 7)) - 1]}` : '';
const fmtFecha = iso => { try { return new Date(iso).toLocaleString('es-CO', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }); } catch { return ''; } };
const hoy = () => { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`; };
const FASES = [
  { id: 'prep', name: 'Preparación' }, { id: 'nom', name: 'Propuestas' }, { id: 'fin', name: 'Finalistas' },
  { id: 'vot', name: 'Votación' }, { id: 'cer', name: 'Ceremonia' },
];
const faseNombre = f => f === 'cerrado' ? 'Edición cerrada' : (FASES.find(x => x.id === f)?.name || '');

function toast(msg) { const t = $('#toast'); if (!t) return; t.textContent = msg; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 3800); }

async function api(accion, datos = {}) {
  if (!/^https:\/\/script\.google(usercontent)?\.com\//.test(window.PREMIOS_API)) throw new Error('Falta conectar la app con Google Sheets (URL de Apps Script en assets/comun.js).');
  let res;
  try {
    res = await fetch(window.PREMIOS_API, { method: 'POST', body: JSON.stringify({ accion, ...datos }) });
  } catch { throw new Error('No pudimos conectarnos. Revisa tu internet e inténtalo de nuevo.'); }
  let out;
  try { out = await res.json(); } catch { throw new Error('El servidor respondió algo inesperado. Inténtalo de nuevo.'); }
  if (!out.ok) throw new Error(out.error || 'Algo salió mal.');
  return out;
}

const AV_COLORS = ['#de2826', '#2b2d31', '#ad1126', '#4b4f58', '#b4471a', '#8e1424', '#6d3f7d', '#c98a12'];
function initials(n) { const w = String(n).replace(/\(.*?\)/g, '').trim().split(/\s+/); return ((w[0] || '')[0] || '') + ((w[1] || '')[0] || ''); }
const FOTOS_BASE = (() => { try { return new URL('../fotos/', document.currentScript.src).href; } catch { return 'fotos/'; } })();
const PHOTOS = {"Andrea Serna": "andrea-serna.jpg", "Angie Torres": "angie-torres.jpg", "Camila Nuñez": "camila-nunez.jpg", "Carolina Sissa": "carolina-sissa.jpg", "Cristofer Tangarife": "cristofer-tangarife.jpg", "Daniel Muñoz": "daniel-munoz.jpg", "Daniela Romero Daza": "daniela-romero-daza.jpg", "Daniela Vives Franco": "daniela-vives-franco.jpg", "David Castro": "david-castro.jpg", "Dayana Montañez": "dayana-montanez.jpg", "Enrique Isaquita": "enrique-isaquita.jpg", "Gabriela Mendez": "gabriela-mendez.jpg", "Gisella Medina": "gisella-medina.jpg", "Ivon Lorena Lopez": "ivon-lorena-lopez.jpg", "James Quintero": "james-quintero.jpg", "Jairo Fandiño Sierra": "jairo-fandino-sierra.jpg", "Jeimmy Pelaez": "jeimmy-pelaez.jpg", "Juliana Vaca": "juliana-vaca.jpg", "Kevynn Asmeth Hernández": "kevynn-asmeth-hernandez.jpg", "Laura Castro": "laura-castro.jpg", "Lina Romero": "lina-romero.jpg", "Lizet Malagon": "lizet-malagon.jpg", "Luna Salas": "luna-salas.jpg", "Mayra Naranjo": "mayra-naranjo.jpg", "Maria Garcia": "maria-garcia-loymark.jpg", "Natalia Renteria": "natalia-renteria.jpg", "Oscar Parra": "oscar-parra.jpg", "Raul Puerto": "raul-puerto.jpg", "Santiago Camacho": "santiago-camacho.jpg", "Santiago Barrera": "santiago-barrera.jpg", "Santiago Pizza": "santiago-pizza.jpg", "Santiago Valencia Patiño": "santiago-valencia-patino.jpg", "Stefania Vega": "stefania-vega.jpg", "Valentina Nocua": "valentina-nocua.jpg", "Valeria Cobos": "valeria-cobos.jpg", "Vannesa Sanchez": "vannesa-sanchez.jpg", "Viviana Bernal": "viviana-bernal.jpg", "Wendy Hincapie": "wendy-hincapie.jpg", "Erika Viviana Gutierrez Lara": "erika-viviana-gutierrez-lara.jpg", "Daniela Hernandez Hurtado": "daniela-hernandez-hurtado.jpg", "Kennet Zamael Henao Morris": "kennet-zamael-henao-morris.jpg", "Felipe Briceño Berrio": "felipe-briceno-berrio.jpg", "Christian Felipe Forigua Chacon": "christian-felipe-forigua-chacon.jpg", "Natalia Elena Martinez Valencia": "natalia-elena-martinez-valencia.jpg", "Alejandra Garcia Castañeda": "alejandra-garcia-castaneda.jpg", "Laura Katherine Quevedo Carrillo": "laura-katherine-quevedo-carrillo.jpg", "Johana Guzman": "johana-guzman.jpg"};
function avatar(n, size = 48) {
  if (PHOTOS[n]) return `<span class="av photo" style="--s:${size}px;background-image:url('${FOTOS_BASE}${PHOTOS[n]}')" aria-hidden="true"></span>`;
  let h = 0; for (const ch of String(n)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return `<span class="av" style="--s:${size}px;background:${AV_COLORS[h % AV_COLORS.length]}" aria-hidden="true">${esc(initials(n).toUpperCase())}</span>`;
}
const SPARK = (x, y, r, c) => `<path d="M${x} ${y - r}Q${x} ${y} ${x + r} ${y}Q${x} ${y} ${x} ${y + r}Q${x} ${y} ${x - r} ${y}Q${x} ${y} ${x} ${y - r}z" fill="${c}"/>`;
const ICONS = {
  alma: `<path d="M32 4v10" stroke="#2b2d31" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="32" cy="35" r="19" fill="#f2b233"/>
    <path d="M13.5 31h37M13.5 39h37M32 16v38M22 18.5c-3 10-3 22 0 33M42 18.5c3 10 3 22 0 33" stroke="#c98a12" stroke-width="1.6" fill="none"/>
    <path d="M22.5 22.5h6v6.5h-7.2zM35.5 31h6.8v8h-6.8zM26 39h6v8h-5.2zM38 44h4.5l-1.8 4.5H38z" fill="#fff6d8"/>
    <circle cx="25" cy="25" r="3.2" fill="#fff" opacity=".85"/>
    ${SPARK(52, 14, 5, '#de2826')}${SPARK(10, 22, 3.5, '#de2826')}${SPARK(55, 50, 3, '#2b2d31')}`,
  salvavidas: `<path d="M6 54c5-4 9-4 14 0s9 4 14 0 9-4 14 0 7 3 10 1" stroke="#2b2d31" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <circle cx="32" cy="29" r="20" fill="#de2826"/><circle cx="32" cy="29" r="9" fill="#fff6f4"/>
    <path d="M32 9a20 20 0 0 1 9.5 2.4L36.3 21A9 9 0 0 0 32 20zM52 29a20 20 0 0 1-2.4 9.5L41 34.3a9 9 0 0 0 1-5.3zM32 49a20 20 0 0 1-9.5-2.4L27.7 37a9 9 0 0 0 4.3 1zM12 29a20 20 0 0 1 2.4-9.5L23 23.7a9 9 0 0 0-1 5.3z" fill="#fff"/>
    <path d="M20 16c3-3 8-5 12-5" stroke="#ff9b8a" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,
  lider: `<path d="M32 56S10 43 10 28c0-7 5-12 11-12 5 0 9 3 11 7 2-4 6-7 11-7 6 0 11 5 11 12 0 15-22 28-22 28z" fill="#de2826"/>
    <path d="M17 26c0-3 2-5 5-5" stroke="#ff9b8a" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M20 14l3-9 5 5 4-7 4 7 5-5 3 9z" fill="#f2b233"/><rect x="20" y="13" width="24" height="3.5" rx="1.5" fill="#c98a12"/>
    <circle cx="32" cy="5.5" r="2" fill="#f2b233"/>${SPARK(54, 12, 4, '#f2b233')}`,
  silencioso: `<path d="M14 26c8 4 28 4 36 0l6 30c-10 3-38 3-48 0z" fill="#de2826"/><path d="M14 26l-6 30c4 1 8 1.5 12 2z" fill="#ad1126"/>
    <circle cx="32" cy="22" r="13" fill="#ffd9c7"/>
    <path d="M18 20c5-4 10-4 14-1 4-3 9-3 14 1-1 6-6 8-10 6-2-1-3-2-4-2s-2 1-4 2c-4 2-9 0-10-6z" fill="#2b2d31"/>
    <ellipse cx="25" cy="21" rx="2.6" ry="1.8" fill="#fff"/><ellipse cx="39" cy="21" rx="2.6" ry="1.8" fill="#fff"/>
    <path d="M27 30c3 2 7 2 10 0" stroke="#2b2d31" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M32 40l2.4 4.8 5.3.8-3.8 3.7.9 5.2-4.8-2.5-4.8 2.5.9-5.2-3.8-3.7 5.3-.8z" fill="#f2b233"/>`,
  revelacion: `<path d="M20 44l-6 14 7-3 4 6 5-13zM44 44l6 14-7-3-4 6-5-13z" fill="#de2826"/>
    <path d="M32 5l7.6 15.4 17 2.5-12.3 12 2.9 16.9L32 43.8l-15.2 8 2.9-16.9-12.3-12 17-2.5z" fill="#f2b233"/>
    <path d="M32 12l5 10.2 11.3 1.6" stroke="#fff6d8" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <circle cx="27" cy="29" r="2.2" fill="#2b2d31"/><circle cx="37" cy="29" r="2.2" fill="#2b2d31"/>
    <path d="M27.5 35c3 2.5 6 2.5 9 0" stroke="#2b2d31" stroke-width="2" fill="none" stroke-linecap="round"/>
    ${SPARK(9, 10, 4, '#de2826')}${SPARK(56, 6, 3, '#de2826')}`,
  tablero: `<rect x="6" y="10" width="52" height="36" rx="5" fill="#2b2d31"/><rect x="10" y="14" width="44" height="28" rx="2.5" fill="#fff"/>
    <rect x="15" y="31" width="6" height="8" rx="1.5" fill="#f7d27a"/><rect x="24" y="25" width="6" height="14" rx="1.5" fill="#f2b233"/>
    <rect x="33" y="28" width="6" height="11" rx="1.5" fill="#ff7a45"/><rect x="42" y="20" width="6" height="19" rx="1.5" fill="#de2826"/>
    <path d="M15 26l9-6 9 4 13-8" stroke="#2b2d31" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M42 15.5l5 .5-1.5 4.8" stroke="#2b2d31" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M26 46h12l3 8H23z" fill="#4b4f58"/><rect x="18" y="53" width="28" height="4" rx="2" fill="#2b2d31"/>`,
  energia: `<circle cx="32" cy="32" r="24" fill="#ffe9e4"/>
    <path d="M37 4L15 36h14l-5 24 25-34H35z" fill="#f2b233" stroke="#de2826" stroke-width="3" stroke-linejoin="round"/>
    <path d="M34 11l-11 17" stroke="#fff6d8" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M8 22l5 2M6 34h6M54 40l-5-2M58 28h-6" stroke="#de2826" stroke-width="2.5" stroke-linecap="round"/>`,
  calma: `<ellipse cx="30" cy="54" rx="22" ry="5" fill="#2b2d31"/>
    <path d="M12 28h36v10c0 9-7 15-16 15h-4c-9 0-16-6-16-15z" fill="#de2826"/>
    <path d="M48 31h3a7 7 0 0 1 0 14h-5" stroke="#de2826" stroke-width="4" fill="none"/>
    <ellipse cx="30" cy="28" rx="18" ry="4" fill="#7a3b1d"/><ellipse cx="26" cy="27.5" rx="7" ry="1.3" fill="#a3582f"/>
    <path d="M16 34c0 6 3 10 8 12" stroke="#ff9b8a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M22 20c-3-3 3-5 0-9M30 19c-3-3 3-5 0-9M38 20c-3-3 3-5 0-9" stroke="#4b4f58" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M30 40c-2-2-5-1-5 1.5S30 46 30 46s5-2 5-4.5-3-3.5-5-1.5z" fill="#fff"/>`,
  bateria: `<rect x="6" y="17" width="46" height="30" rx="7" fill="#2b2d31"/><rect x="52" y="26" width="6" height="12" rx="2" fill="#2b2d31"/>
    <rect x="11" y="22" width="9" height="20" rx="2.5" fill="#de2826"/><rect x="22" y="22" width="9" height="20" rx="2.5" fill="#ff7a45"/>
    <rect x="33" y="22" width="9" height="20" rx="2.5" fill="#f2b233"/><rect x="44" y="22" width="3" height="20" rx="1.5" fill="#f7d27a"/>
    <path d="M30 13l-6 10h6l-3 9 9-12h-6l3-7z" fill="#fff" stroke="#2b2d31" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M14 52h8M18 48v8M44 54h6" stroke="#f2b233" stroke-width="2.5" stroke-linecap="round"/>`,
  luz: `<circle cx="32" cy="26" r="21" fill="#fff4dc"/>
    <path d="M32 6a17 17 0 0 0-10 30.8c2.4 1.8 3.8 4.2 3.8 7.2h12.4c0-3 1.4-5.4 3.8-7.2A17 17 0 0 0 32 6z" fill="#f2b233"/>
    <path d="M24 16a10 10 0 0 1 8-4" stroke="#fff6d8" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M28 44V33l-3-3M36 44V33l3-3" stroke="#c98a12" stroke-width="2" fill="none" stroke-linecap="round"/>
    <rect x="25" y="44" width="14" height="5" rx="1.5" fill="#4b4f58"/><rect x="26" y="49" width="12" height="4" rx="1.5" fill="#2b2d31"/><path d="M29 53h6l-1.5 4h-3z" fill="#2b2d31"/>
    <path d="M6 24h5M53 24h5M12 8l3.5 3.5M52 8l-3.5 3.5" stroke="#de2826" stroke-width="2.5" stroke-linecap="round"/>`,
  _: `<rect x="8" y="24" width="48" height="32" rx="4" fill="#2b2d31"/><path d="M8 24l5-13 47 6-4 13z" fill="#de2826"/>
    <path d="M18 12.5l7 13M30 14l7 13M42 15.5l7 13" stroke="#fff" stroke-width="3"/>${SPARK(50, 44, 5, '#f2b233')}`,
};
const catIcon = id => `<svg viewBox="0 0 64 64" aria-hidden="true">${ICONS[id] || ICONS._}</svg>`;
