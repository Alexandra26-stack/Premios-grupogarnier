# Premios de Fin de Año Grupo Garnier 2026

Versión de consulta de la app de premios de Talento Humano, publicada en GitHub Pages.

## Seguridad

- `index.html` está **cifrado con AES-256-GCM**. La clave se deriva de la contraseña con PBKDF2-SHA256 (600.000 iteraciones).
- Sin la contraseña, ni la página ni el código fuente del repositorio muestran el contenido: solo un bloque cifrado.
- La versión sin cifrar **no está en el repositorio** y nunca debe subirse (ver `.gitignore`).
- La página pide a los buscadores que no la indexen (`noindex`).
- La contraseña se comparte por un canal interno (Teams o correo), nunca en este repositorio.

## Votación

Esta página es una vitrina. Nominaciones y votos se hacen en la app oficial en Claude; lo que se haga aquí queda solo en el navegador de cada persona.

## Cambiar la contraseña o actualizar la app

Requiere Node.js 18 o superior.

```bash
node herramientas/cifrar.mjs ruta/a/app-sin-cifrar.html "NUEVA-CONTRASEÑA" > index.html
```

Luego se sube solo el nuevo `index.html`.
