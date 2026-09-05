# Evidencia — Optimizaciones implementadas

Gestor Documental, Escuela Básica G-733 Chorombo Bajo — Evaluación Unidad 3, Desarrollo Frontend.

## Optimización 1 — Búsqueda con pausa (debounce)

**Situación inicial.** El listado se recargaba en cada pulsación de tecla del campo de búsqueda.

**Medición.** Se escribió la palabra «apoderados» (10 caracteres) y se observó el panel de red del
navegador. Peticiones registradas al Backend:

```
GET http://127.0.0.1:8010/api/documentos?buscar=apoderados&pagina=1&limite=10 → 200 OK
```

**Una sola petición para 10 pulsaciones.** Sin la optimización habrían sido 10, de las cuales 9
quedaban obsoletas antes de llegar a la pantalla.

**Optimización aplicada.** La función `retrasar()` en `js/componentes/utilidades.js`, conectada al
evento `input` en `js/componentes/barraFiltros.js`, espera 400 ms sin escritura antes de consultar.

**Beneficio.** Reducción del 90 % de peticiones en ese caso. Menos carga para el notebook de la
escuela y una lista que ya no parpadea mientras se escribe.

---

## Optimización 2 — Catálogo de tipos en memoria

**Situación inicial.** El catálogo de tipos documentales se necesita en el filtro y en el
formulario. Pedirlo cada vez que se abre el formulario significaba una petición por apertura, para
datos que en la práctica cambian una vez al año.

**Optimización aplicada.** En `js/api/documentosApi.js`:

```js
let cacheTipos = null;

export async function obtenerTiposDocumento() {
  if (cacheTipos) {
    return cacheTipos;          // no se toca la red
  }
  const cuerpo = await pedir('/tipos-documento');
  cacheTipos = cuerpo.datos || [];
  return cacheTipos;
}
```

**Medición.** En el panel de red, `/api/tipos-documento` aparece **una sola vez** por sesión, pese
a que el catálogo se usa tanto en la barra de filtros como en el formulario.

**Beneficio.** Abrir el formulario es inmediato, sin espera de red.

---

## Optimización 3 — Delegación de eventos

**Situación inicial.** Cada fila de la tabla tiene tres botones (Ver, Editar, Eliminar). Con diez
filas por página, registrar un escuchador por botón implicaba **30 escuchadores**, que además
había que volver a crear cada vez que el listado se redibuja (en cada búsqueda, filtro o cambio de
página).

**Optimización aplicada.** Un único escuchador en el `<tbody>` que identifica el botón pulsado con
`closest('button[data-accion]')`, en `js/componentes/listaDocumentos.js`. El mismo patrón se usa en
las tarjetas de resumen.

**Beneficio.** De 30 escuchadores a 1, y no se recrean al redibujar la tabla.

---

## Optimización 4 — Un solo redibujado de la tabla

**Situación inicial.** Insertar las filas una por una obliga al navegador a recalcular el diseño de
la página en cada vuelta del ciclo.

**Optimización aplicada.** `renderizarLista()` arma todo el HTML con `map().join('')` y lo asigna
una única vez a `innerHTML`.

**Beneficio.** Un recálculo de diseño en lugar de diez.
