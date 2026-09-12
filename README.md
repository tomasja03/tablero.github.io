# Tablero Informativo

Este proyecto es un tablero informativo sencillo hecho con HTML, CSS y JavaScript.

## Archivos

- `index.html` — estructura principal
- `styles.css` — diseño y estilos
- `script.js` — contenido editable y fecha automática

## Cómo cambiar el contenido

Abra `script.js` y edite el objeto `boardData`.

Por ejemplo:

```js
nextEvent: {
  title: "Reunión de fin de semana",
  date: "Domingo",
  time: "10:00 a. m.",
  location: "Salón principal"
}
```

También puede cambiar los anuncios y las fechas del calendario en ese mismo archivo.

## Publicar gratis con GitHub Pages

1. Cree una cuenta en GitHub si todavía no tiene una.
2. Cree un repositorio nuevo, por ejemplo: `tablero-informativo`.
3. Suba `index.html`, `styles.css` y `script.js`.
4. Abra **Settings** del repositorio.
5. Seleccione **Pages**.
6. En **Build and deployment**, elija:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/ (root)`
7. Guarde los cambios.
8. GitHub mostrará la dirección pública del sitio.

## Consejo

Para que los botones de Programa, Calendario o Contactos abran documentos reales,
reemplace `href="#"` en `index.html` con el enlace deseado.
