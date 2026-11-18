// Cifra la app con AES-256-GCM y una clave derivada con PBKDF2-SHA256 (600.000 iteraciones).
// Uso: node herramientas/cifrar.mjs <app-sin-cifrar.html> <contraseña> > index.html
// La versión sin cifrar NUNCA se sube al repositorio.
import { readFileSync } from 'node:fs';
import { webcrypto as crypto } from 'node:crypto';

const [, , input, password] = process.argv;
if (!input || !password) {
  console.error('Uso: node herramientas/cifrar.mjs <app-sin-cifrar.html> <contraseña> > index.html');
  process.exit(1);
}
const ITER = 600000;
const plain = new TextEncoder().encode(readFileSync(input, 'utf8'));
const salt = crypto.getRandomValues(new Uint8Array(16));
const iv = crypto.getRandomValues(new Uint8Array(12));
const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: ITER, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plain));
const b64 = u => Buffer.from(u).toString('base64');
const payload = JSON.stringify({ v: 1, iter: ITER, salt: b64(salt), iv: b64(iv), data: b64(ct) });
const template = readFileSync(new URL('./plantilla.html', import.meta.url), 'utf8');
process.stdout.write(template.replace('__PAYLOAD__', payload));
