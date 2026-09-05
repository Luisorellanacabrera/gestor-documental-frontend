# Evidencia — Integración y consumo de endpoints

Gestor Documental, Escuela Básica G-733 Chorombo Bajo — Evaluación Unidad 3, Desarrollo Frontend.

## Entorno de la prueba

| | |
|---|---|
| Backend | `php -S 127.0.0.1:8010 -t public public/router.php` |
| Frontend | `python3 -m http.server 5500` |
| Navegador | Navegador de escritorio con el panel de red abierto |

## Ciclo completo verificado

Se ejecutó el ciclo CRUD completo desde la interfaz, comprobando en el panel de red que cada
acción disparara la petición correcta y que la respuesta se reflejara en pantalla.

| # | Acción en la interfaz | Petición observada | Respuesta | Efecto en pantalla |
|---|---|---|---|---|
| 1 | Carga inicial de la página | `GET /api/salud` | 200 | El indicador de la barra pasa a «API conectada» |
| 2 | Carga inicial | `GET /api/tipos-documento` | 200 | Se llenan los dos selectores de tipo |
| 3 | Carga inicial | `GET /api/documentos?pagina=1&limite=10` | 200 | Se dibuja la tabla con 8 documentos |
| 4 | Carga inicial | `GET /api/estadisticas` | 200 | Se dibujan las tarjetas de resumen por tipo |
| 5 | Guardar el formulario vacío | *(ninguna)* | — | La validación del navegador detiene el envío y muestra los tres errores |
| 6 | Crear «Memo N.º 21 protocolo de recreos» | `POST /api/documentos` | **201 Created** | Aviso verde, total sube de 8 a 9 y la fila aparece en el listado |
| 7 | Escribir «apoderados» en la búsqueda | `GET /api/documentos?buscar=apoderados&pagina=1&limite=10` | 200 | El contador muestra «3 documentos encontrados» |
| 8 | Pulsar «Ver» en una fila | `GET /api/documentos/{id}` | 200 | Se abre la ventana de detalle con todos los campos |
| 9 | Pulsar «Editar» dentro del detalle | `GET /api/documentos/{id}` | 200 | Se cierra el detalle y se abre el formulario con los datos cargados |
| 10 | Guardar cambios en la descripción | `PUT /api/documentos/{id}` | 200 | Aviso verde y la descripción actualizada visible en la tabla |
| 11 | Pulsar «Eliminar» | `GET /api/documentos/{id}` | 200 | Se abre la confirmación mostrando el título del documento |
| 12 | Confirmar la eliminación | `DELETE /api/documentos/{id}` | 200 | Aviso verde, total baja de 9 a 8 y la fila desaparece |
| 13 | Pulsar «Limpiar filtros» | `GET /api/documentos?pagina=1&limite=10` | 200 | Vuelve el listado completo |

**Resultado: los seis endpoints mínimos exigidos por la evaluación quedaron consumidos y
verificados**, más los dos de apoyo (`/estadisticas` y `/salud`).

## Manejo de estados verificado

| Estado | Cómo se provocó | Comportamiento observado |
|---|---|---|
| **Cargando** | Cada petición del listado | Indicador giratorio con el texto «Cargando documentos…» y la tabla oculta |
| **Sin resultados con filtros** | Buscar un texto que no existe | «Ningún documento coincide con la búsqueda. Pruebe con otros filtros.» |
| **Error de validación** | Enviar el formulario vacío | Resumen de errores al inicio del formulario, que recibe el foco, más el mensaje bajo cada campo |
| **Servidor apagado** | Detener el Backend y recargar | «No se pudo conectar con el servidor. Verifique que el Backend esté encendido», con botón de reintentar |

## Preflight CORS

El Frontend y el Backend corren en puertos distintos (5500 y 8010), por lo que el navegador envía
una petición `OPTIONS` previa en cada llamada que lleva cabecera `Content-Type`. Se verificó en el
panel de red que el Backend responde **200** a esos `OPTIONS`, permitiendo que la petición real se
ejecute:

```
OPTIONS http://127.0.0.1:8010/api/documentos → 200 OK
POST    http://127.0.0.1:8010/api/documentos → 201 Created
```

## Nota

Se recomienda adjuntar en `docs/capturas/` las capturas de pantalla del panel de red y de la
aplicación en cada uno de los pasos de la tabla anterior, numeradas según APA.
