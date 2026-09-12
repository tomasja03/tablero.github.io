# Reunión dinámica

La próxima reunión se calcula automáticamente usando la zona horaria de Ecuador:

`America/Guayaquil`

El horario se configura en `data.json`:

- Jueves — 7:00 p. m.
- Sábado — 6:00 p. m.

No es necesario editar fechas cada semana.

Al llegar a la hora de inicio de una reunión, el tablero cambia automáticamente a la siguiente reunión programada.

Ejemplo:
- Antes de las 6:00 p. m. del sábado → muestra la reunión del sábado.
- Desde las 6:00 p. m. del sábado → muestra la reunión del jueves siguiente.

El navegador vuelve a evaluar el horario cada 60 segundos.
