# Premios de Fin de Año 2026 · Loymark Bogotá

- **Participantes:** `https://alexandra26-stack.github.io/Premios-grupogarnier/`
  Entran con su correo (cualquier dominio) y la clave del grupo. Cada empresa y país vota por separado.
- **Talento Humano:** `https://alexandra26-stack.github.io/Premios-grupogarnier/admin/`
  Pide la clave de admin. Desde ahí se ve la participación, se publican los finalistas, se revelan los ganadores y se ajustan equipo, categorías y fechas.

Los datos se guardan solos en una hoja de Google Sheets que crea el script. No hace falta abrirla ni editarla.

## Reglas que valida el servidor

- Solo pueden entrar los correos de la lista del equipo.
- Nadie puede proponerse ni votarse a sí mismo.
- Las propuestas y el voto se envían una sola vez y no se pueden cambiar.
- Pasan 2 finalistas por categoría; solo se puede votar por ellos.
- Cada persona gana un solo premio.
- Las acciones de administración piden la clave.

## Conexión con Google (una sola vez)

1. Entra a <https://script.google.com> y crea un **Nuevo proyecto**.
2. Borra lo que trae y pega todo el contenido de `apps-script/Codigo.gs`.
3. En la línea `const CLAVE_ADMIN = 'ESCRIBE-AQUI-TU-CLAVE';` escribe tu clave de admin. Guarda.
4. Arriba, elige la función `instalar` y toca **Ejecutar**. Acepta los permisos (si Google dice que la app no está verificada: *Configuración avanzada → Ir al proyecto*).
5. Toca **Implementar → Nueva implementación → Aplicación web**.
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier persona**
6. Copia la URL que termina en `/exec` y pégala en `assets/comun.js`, en la línea `window.PREMIOS_API = ...`.

Si cambias el script después, usa **Implementar → Gestionar implementaciones → Editar → Nueva versión** para que la URL siga siendo la misma.

## Archivos

| Archivo | Qué es |
| --- | --- |
| `index.html` | Página de participantes |
| `admin/index.html` | Zona de administración |
| `assets/` | Estilos, íconos y conexión compartidos |
| `apps-script/Codigo.gs` | Código del servidor (se pega en Apps Script; no contiene la clave real) |
