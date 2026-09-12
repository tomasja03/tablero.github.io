# Rotación automática de Hospitalidad

Se agregó una segunda rotación independiente:

```json
"hospitalityRotation": {
  "groups": 4,
  "anchorSunday": "2026-09-06",
  "anchorGroup": 1
}
```

Esto produce:

- Semana del 6 de septiembre → Grupo 1
- Semana del 13 de septiembre → Grupo 2
- Semana del 20 de septiembre → Grupo 3
- Semana del 27 de septiembre → Grupo 4
- Semana del 4 de octubre → Grupo 1

El anuncio usa:

```json
{
  "type": "hospitality",
  "title": "Hospitalidad",
  "important": true
}
```

El texto se genera automáticamente:

`Recordatorio para el GRUPO X que tiene este privilegio.`

La rotación cambia cada domingo usando la hora de Ecuador.
