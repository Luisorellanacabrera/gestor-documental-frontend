# Gestor Documental — Frontend

Escuela Básica G-733 Chorombo Bajo, comuna de María Pinto.
**Evaluación Sumativa Unidad 3 — Desarrollo Frontend.**

> **Completar antes de entregar:** nombre del docente y fecha.
>
> | | |
> |---|---|
> | Estudiante | Luis Orellana Cabrera |
> | Modalidad | Trabajo individual |
> | Docente | _(completar)_ |
> | Fecha de entrega | _(completar)_ |
> | Repositorio | https://github.com/luisorellanacabrera/gestor-documental-frontend |

---

## 1. Problema y solución

La escuela administra de forma manual los documentos de su equipo directivo: memos, oficios,
citaciones de apoderados, acuerdos de apoderados, documentos de reuniones comunales y permisos
administrativos. No existe ninguna plataforma previa y, según indicó la directora, la falta de
recursos económicos obliga a aprovechar al máximo lo disponible: el único equipo del
establecimiento es un notebook de portería (Intel Core i5, 8 GB de RAM, 128 GB de disco).

Esta aplicación es la **capa Frontend** del Gestor Documental. Entrega al equipo directivo una
interfaz web para visualizar, buscar, filtrar, registrar, modificar y eliminar documentos,
consumiendo la API desarrollada en la asignatura **Desarrollo Backend**. Ambas evaluaciones son
dos capas del mismo proyecto.

Esa realidad del cliente marcó las decisiones técnicas: la aplicación no necesita instalación,
no requiere Node ni un proceso de compilación, y Bootstrap se sirve desde una copia local para
que funcione aunque la conexión a internet falle.

---

## 2. Tecnologías

| Tecnología | Uso en el proyecto |
|---|---|
| HTML5 semántico | Estructura de la página y base de la accesibilidad |
| Bootstrap 5.1.1 (copia local) | Sistema de rejilla, tabla, ventanas modales, avisos y diseño adaptable |
| JavaScript ES Modules | Componentes, manejo de estado y eventos, sin compilación |
| Fetch API | Consumo de los endpoints del Backend |

No se usan dependencias externas ni gestores de paquetes: el proyecto se abre y funciona.

---

## 3. Estructura del proyecto

```
gestor-documental-frontend/
├── index.html                     Estructura de la interfaz
├── css/
│   └── estilos.css                Estilos propios (Bootstrap aporta la base)
├── js/
│   ├── app.js                     Punto de entrada: integra los componentes
│   ├── config.js                  Variables de configuración
│   ├── api/
│   │   └── documentosApi.js       Consumo de los endpoints
│   └── componentes/
│       ├── barraFiltros.js        Búsqueda y filtros
│       ├── listaDocumentos.js     Tabla y paginación
│       ├── detalleDocumento.js    Ventana de detalle
│       ├── formularioDocumento.js Formulario de crear y editar
│       ├── confirmarEliminar.js   Confirmación de borrado
│       ├── resumen.js             Tarjetas de resumen por tipo
│       ├── mensajes.js            Estados de carga, vacío, error y avisos
│       └── utilidades.js          Funciones compartidas
├── vendor/bootstrap/              Bootstrap 5 local, sin CDN
├── docs/                          Evidencias de pruebas
└── README.md
```

---

## 4. Componentes

Antes de programar se definió qué componentes tendría la aplicación y de qué se encargaría cada
uno. La regla que se siguió: **un componente hace una sola cosa y no sabe cómo funcionan los
demás**. La comunicación pasa siempre por `app.js`, que es el único que conoce a todos.

| Componente | Responsabilidad | Información que recibe | Relación con otros |
|---|---|---|---|
| **Navegación** (`index.html`) | Encabezado con el nombre del sistema, el estado de la conexión y el botón de acción principal | — | Su botón «Nuevo documento» le pide a `app.js` que abra el formulario |
| **`resumen.js`** | Mostrar cuántos documentos hay de cada tipo | Objeto de estadísticas de la API | Al pulsar una tarjeta avisa a `app.js`, que aplica el filtro por ese tipo |
| **`barraFiltros.js`** | Recoger el texto buscado, el tipo y el rango de fechas | Catálogo de tipos y la función a ejecutar al cambiar | Entrega los filtros a `app.js`, que los envía a la API |
| **`listaDocumentos.js`** | Dibujar la tabla y la paginación; avisar qué acción pulsó el usuario | Arreglo de documentos, datos de paginación y funciones de Ver, Editar y Eliminar | Recibe los datos desde `app.js`; sus acciones abren el detalle, el formulario o la confirmación |
| **`detalleDocumento.js`** | Mostrar toda la información de un documento | El objeto documento | Se abre desde el listado y puede encadenar con el formulario |
| **`formularioDocumento.js`** | Capturar y validar los datos, tanto al crear como al editar | Catálogo de tipos y, al editar, el documento | Devuelve los datos a `app.js`, que llama a la API; muestra los errores que ésta responda |
| **`confirmarEliminar.js`** | Pedir confirmación antes de borrar | El documento a eliminar | Confirma a `app.js`, que ejecuta el borrado |
| **`mensajes.js`** | Comunicar el estado: cargando, sin resultados, error, y avisos de éxito | Textos | Lo usan todos los flujos de `app.js` |
| **`utilidades.js`** | Funciones compartidas: escapar HTML, formatear fechas, recortar textos, retrasar la búsqueda | — | Lo usan casi todos los componentes |

### Reutilización

- **Un solo formulario para crear y editar.** `abrirParaCrear()` y `abrirParaEditar()` usan la
  misma estructura, la misma validación y el mismo envío. Se evitó duplicar un formulario casi
  idéntico, que habría obligado a corregir cada error en dos lugares.
- **`mensajes.js` centraliza toda la retroalimentación.** Ningún componente escribe avisos por su
  cuenta, así todos se ven y se comportan igual.
- **`escaparHtml()` se aplica en todos los componentes que pintan datos**, de modo que la
  protección no dependa de recordarlo caso por caso.

---

## 5. Endpoints consumidos

URL base configurada en `js/config.js`: `http://127.0.0.1:8010/api`

| Método | URL | Propósito | Parámetros / cuerpo | Información enviada | Información recibida |
|---|---|---|---|---|---|
| GET | `/documentos` | Listar documentos con filtros y paginación | `buscar`, `tipo`, `desde`, `hasta`, `pagina`, `limite` | Filtros en la URL | `datos`: arreglo de documentos; `paginacion`: página, límite, total y total de páginas |
| GET | `/documentos/{id}` | Obtener un documento para verlo o editarlo | `id` en la ruta | Identificador | `datos`: el documento completo |
| POST | `/documentos` | Crear un documento | Cuerpo JSON | `titulo`, `tipo`, `fecha_documento`, `descripcion`, `archivo_nombre` | `datos`: documento creado, con su `id` |
| PUT | `/documentos/{id}` | Actualizar un documento completo | `id` + cuerpo JSON | Los mismos campos que POST | `datos`: documento actualizado |
| DELETE | `/documentos/{id}` | Eliminar un documento | `id` en la ruta | Identificador | `mensaje` de confirmación e `id` eliminado |
| GET | `/tipos-documento` | Llenar los selectores de tipo | — | — | `datos`: arreglo con `id`, `codigo` y `nombre` de cada tipo |
| GET | `/estadisticas` | Alimentar las tarjetas de resumen | — | — | `total_documentos` y cantidad por tipo |
| GET | `/salud` | Comprobar que el Backend responde antes de pedir datos | — | — | Estado del servicio |

### Manejo de las respuestas

Todo el consumo pasa por `js/api/documentosApi.js`, que normaliza lo que llega:

| Situación | Cómo se maneja |
|---|---|
| **Cargando** | Se muestra un indicador giratorio con texto «Cargando documentos…» y se oculta la tabla |
| **Sin resultados** | Mensaje distinto según haya filtros puestos o el listado esté realmente vacío |
| **Error de validación (400 y 422)** | Los errores se muestran dentro del formulario, campo por campo, más un resumen al inicio |
| **Documento inexistente (404)** | Aviso emergente con el mensaje del servidor |
| **Servidor apagado o sin red** | `fetch` lanza una excepción que se traduce a: «No se pudo conectar con el servidor. Verifique que el Backend esté encendido», con botón de reintentar |
| **Éxito en crear, editar o eliminar** | Aviso verde y recarga del listado y del resumen |

---

## 6. Instalación y ejecución

### Requisitos

- Un navegador moderno (Chrome, Edge o Firefox).
- El Backend del Gestor Documental en ejecución.
- Python 3 o cualquier servidor web estático.

> **Importante:** hay que abrir la aplicación mediante un servidor web, no con doble clic en
> `index.html`. El proyecto usa módulos de JavaScript (`type="module"`) y el navegador los bloquea
> por seguridad cuando la página se abre con el protocolo `file://`.

### Paso 1 — Levantar el Backend

```bash
cd ruta/al/proyecto/gestor-documental-api
php -S 127.0.0.1:8010 -t public public/router.php
```

### Paso 2 — Levantar el Frontend

```bash
cd gestor-documental-frontend
python3 -m http.server 5500
```

Abrir <http://127.0.0.1:5500> en el navegador.

### Variables de configuración

Están todas en `js/config.js`:

| Variable | Valor por defecto | Para qué sirve |
|---|---|---|
| `URL_API` | `http://127.0.0.1:8010/api` | Dirección del Backend. Es lo único que hay que cambiar para apuntar a otro servidor |
| `DOCUMENTOS_POR_PAGINA` | `10` | Cuántos documentos trae cada página |
| `ESPERA_BUSQUEDA` | `400` | Milisegundos de pausa antes de buscar mientras se escribe |
| `EXTENSIONES_PERMITIDAS` | pdf, doc, docx, xls, xlsx, odt, jpg, jpeg, png | Extensiones aceptadas; debe coincidir con el Backend |

### Despliegue

La aplicación son archivos estáticos, así que se publica copiando la carpeta a cualquier servidor
web (Apache, Nginx, GitHub Pages o Netlify). No hay que compilar nada. El único ajuste es cambiar
`URL_API` en `js/config.js` por la dirección pública del Backend.

**Comprobación de la integración realizada:** con ambos servidores levantados se ejecutó el ciclo
completo (crear → listar → ver → editar → eliminar) verificando en las herramientas del navegador
que cada acción disparara la petición correcta y que la respuesta se reflejara en pantalla. La
evidencia está en `docs/evidencia_integracion.md`.

---

## 7. Buenas prácticas aplicadas al proyecto

### 1. Nomenclatura descriptiva y en español

- **Propósito:** que cualquier persona que retome el proyecto entienda el código sin tener que
  ejecutarlo.
- **Aplicación:** funciones que son acciones empiezan por verbo (`renderizarLista`,
  `abrirParaEditar`, `escaparHtml`); los archivos de componente se llaman como lo que dibujan.
  Los nombres coinciden con los del Backend (`fecha_documento`, `archivo_nombre`).
- **Ubicación:** todo el proyecto. Ejemplo: `js/componentes/confirmarEliminar.js`.

### 2. Separación de responsabilidades por capas

- **Propósito:** poder cambiar una parte sin romper las demás.
- **Aplicación:** `documentosApi.js` es el único que llama a `fetch`; los componentes solo dibujan
  y avisan; `app.js` coordina. Ningún componente sabe qué URL tiene la API.
- **Ubicación:** carpetas `js/api/` y `js/componentes/`.

### 3. Estructura de carpetas por tipo de archivo

- **Propósito:** encontrar rápido lo que se busca.
- **Aplicación:** `css/` para estilos, `js/componentes/` para componentes, `js/api/` para el
  consumo, `vendor/` para librerías de terceros y `docs/` para evidencias.
- **Ubicación:** raíz del proyecto.

### 4. Reutilización de componentes

- **Propósito:** no escribir dos veces lo mismo.
- **Aplicación:** el mismo formulario crea y edita; `mensajes.js` centraliza todos los avisos;
  `escaparHtml()`, `formatearFecha()` y `retrasar()` viven en `utilidades.js` y las usan varios
  componentes.
- **Ubicación:** `js/componentes/formularioDocumento.js` y `js/componentes/utilidades.js`.

### 5. Manejo de estado en un solo lugar

- **Propósito:** evitar que dos partes de la aplicación tengan datos distintos.
- **Aplicación:** `app.js` mantiene un único objeto `estado` con la página actual. Los filtros los
  guarda el propio formulario y se leen con `obtenerFiltros()`. No hay variables globales sueltas.
- **Ubicación:** `js/app.js`.

### 6. Validación antes de enviar

- **Propósito:** avisar al usuario de inmediato y no gastar una petición en datos que van a ser
  rechazados.
- **Aplicación:** el formulario valida largo del título, tipo obligatorio, fecha válida, largo de
  la descripción y extensión del archivo, con las mismas reglas del Backend. Igualmente se
  procesan los errores que el servidor devuelva, porque la validación del servidor es la que manda.
- **Ubicación:** función `validar()` en `js/componentes/formularioDocumento.js`.

### 7. Tratamiento de errores sin exponer detalles técnicos

- **Propósito:** que el usuario entienda qué pasó y qué puede hacer.
- **Aplicación:** la clase `ErrorApi` guarda el código y los errores; los mensajes que ve el
  usuario están en lenguaje común. Nunca se muestra una traza ni una URL interna.
- **Ubicación:** `js/api/documentosApi.js` y `js/componentes/mensajes.js`.

### 8. Comentarios que explican el porqué, no el qué

- **Propósito:** que quien retome el proyecto entienda las decisiones.
- **Aplicación:** los comentarios explican por qué se escapa el HTML, por qué se registra el
  escuchador antes de cerrar la ventana o por qué el archivo se guarda por referencia.
- **Ubicación:** todos los archivos de `js/`.

### 9. Configuración centralizada, sin valores dispersos

- **Propósito:** poder cambiar de servidor o ajustar el comportamiento sin buscar valores repartidos
  por el código.
- **Aplicación:** `config.js` reúne la URL de la API, los documentos por página, la espera de la
  búsqueda y las extensiones permitidas. Ningún otro archivo escribe una URL o un número fijo.
- **Medible:** 0 URLs escritas fuera de `config.js`; mover la aplicación a otro servidor exige
  cambiar **1 sola línea**.
- **Ubicación:** `js/config.js`.

### 10. HTML semántico como base de la accesibilidad

- **Propósito:** que la estructura sea comprensible para lectores de pantalla sin necesidad de
  parches con `aria-*`.
- **Aplicación:** se usan `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`, `<table>` con
  `<caption>` y `<th scope>`, `<fieldset>` con `<legend>` y `<time datetime>` en las fechas. Los
  atributos ARIA se agregan solo donde el HTML no alcanza, como en las regiones `aria-live`.
- **Medible:** 1 solo `<h1>`, 0 saltos en la jerarquía de encabezados, 13 celdas con `scope`,
  0 controles sin etiqueta (verificado, ver `docs/evidencia_accesibilidad.md`).
- **Ubicación:** `index.html`.

### 11. Dependencias de terceros versionadas en el repositorio

- **Propósito:** que la aplicación funcione siempre igual, sin depender de una conexión a internet
  ni de que un servicio externo siga disponible.
- **Aplicación:** Bootstrap 5.1.1 se sirve desde `vendor/bootstrap/`, con la versión fija dentro del
  repositorio, en lugar de enlazarlo desde un CDN.
- **Medible:** 0 peticiones a dominios externos al cargar la página; la aplicación funciona con el
  computador desconectado de internet, siempre que el Backend esté en la misma red.
- **Ubicación:** `vendor/bootstrap/` y las etiquetas `<link>` y `<script>` de `index.html`.

---

## 8. Accesibilidad y usabilidad

### Criterios WCAG 2.1 aplicados

| Criterio | Cómo se aplicó |
|---|---|
| **1.1.1** Contenido no textual | Los íconos decorativos llevan `aria-hidden="true"`; ninguna información depende solo de un ícono |
| **1.3.1** Información y relaciones | HTML semántico (`header`, `main`, `nav`, `footer`, `section`), tabla con `<th scope>` y `<caption>`, y `<fieldset>` con `<legend>` en el formulario |
| **1.4.1** Uso del color | El estado de la conexión no se comunica solo con el punto de color: siempre hay texto («API conectada» / «API sin conexión») |
| **1.4.3** Contraste mínimo | Todos los textos superan la relación 4.5:1. Se midió y corrigió (ver prueba más abajo) |
| **2.1.1** Teclado | Toda la aplicación se opera con teclado; no hay acciones que dependan del mouse |
| **2.4.1** Evitar bloques | Enlace «Saltar al contenido principal» como primer elemento tabulable |
| **2.4.3** Orden del foco | El orden de tabulación sigue el orden visual; al abrir una ventana el foco entra al primer campo y al cerrarla vuelve al botón de origen |
| **2.4.7** Foco visible | Contorno amarillo de 3 px en todos los elementos enfocables. En ninguna parte se anula el contorno sin reemplazarlo |
| **2.3.3** Animación | Se respeta `prefers-reduced-motion` para quien tenga desactivadas las animaciones |
| **3.1.1** Idioma | `<html lang="es">` |
| **3.3.1 / 3.3.2 / 3.3.3** Errores y etiquetas | Cada campo tiene su `<label>` asociado; los campos obligatorios se indican; los errores describen qué corregir y aparecen junto al campo y en un resumen que recibe el foco |
| **4.1.3** Mensajes de estado | Las zonas de carga, vacío y error están dentro de `aria-live="polite"`; los avisos usan `role="alert"` |

### Prueba de accesibilidad realizada

Se revisó la aplicación con un guion que calcula la relación de contraste de cada texto según la
fórmula de WCAG 2.1 y verifica etiquetas, encabezados, nombres accesibles y regiones dinámicas.

| Criterio evaluado | Problema identificado | Mejora implementada | Resultado |
|---|---|---|---|
| **1.4.3 Contraste mínimo** | El texto descriptivo usaba la clase `text-secondary` de Bootstrap (`#6c757d`), que sobre nuestro fondo `#f5f7fa` alcanza **4.37:1**, bajo el mínimo de 4.5:1 | Se redefinió `.text-secondary` a `#5a6570` en `css/estilos.css`, sin alterar el aspecto general | **5.54:1** — cumple |
| **1.4.1 Uso del color** | Todos los distintivos de tipo documental se veían del mismo gris, porque la regla `.badge[class*='tipo-']` tenía más especificidad que `.tipo-memo` y pisaba sus colores | Los colores se movieron a reglas `.badge.tipo-xxx`, de igual especificidad | Cada tipo se distingue, con contrastes entre **7.05:1 y 8.91:1** |

El resto de la revisión no arrojó incumplimientos: 0 controles sin etiqueta, 0 botones sin nombre
accesible, 0 saltos en la jerarquía de encabezados y el idioma correctamente declarado.

Detalle completo en `docs/evidencia_accesibilidad.md`.

### Revisión de usabilidad

Durante el desarrollo se revisó la aplicación emulando una pantalla de celular (375 x 812 px) y
midiendo el tamaño real de los elementos en el navegador. De ahí salieron dos oportunidades de
mejora, ambas ya implementadas:

| # | Oportunidad detectada | Cómo se detectó | Mejora implementada |
|---|---|---|---|
| 1 | En pantallas de celular el botón «Nuevo documento» quedaba dentro del menú desplegable, de modo que la acción principal del sistema exigía abrir el menú hamburguesa antes de poder usarla | Revisión de la interfaz en viewport de 375 px | El botón se sacó del menú y ahora está **siempre visible** en la barra superior. En pantallas angostas se abrevia a «+ Nuevo» para que no desborde |
| 2 | En pantallas bajas el formulario medía 737 px de alto contra 720 px de área visible, dejando los botones Guardar y Cancelar fuera de la vista | Medición de `getBoundingClientRect()` contra `window.innerHeight` | Se aplicó `modal-dialog-scrollable`: el contenido se desplaza dentro de la ventana y los botones quedan siempre alcanzables |

> ### ⚠ PENDIENTE OBLIGATORIO PARA EL EQUIPO
>
> La evaluación exige, además, **una revisión con al menos un usuario de prueba o persona
> externa al desarrollo** (instrucción 7). Las dos mejoras anteriores salieron de la revisión
> técnica propia, **no de una prueba con un usuario real**, y así se declara para no atribuir
> a una persona una observación que no hizo.
>
> **Guion sugerido para realizarla** (toma 10 minutos):
>
> 1. Pídale a alguien ajeno al desarrollo —idealmente alguien del equipo directivo de la escuela,
>    o en su defecto un familiar o compañero de otra asignatura— que use la aplicación **sin
>    explicarle nada**.
> 2. Dele tres tareas y observe en silencio: (a) «registre un memo con fecha de hoy»,
>    (b) «encuentre los documentos de apoderados», (c) «corrija la descripción de ese documento».
> 3. Anote **dónde duda, dónde se equivoca y qué pregunta**. Eso es el hallazgo.
> 4. Registre en esta tabla: quién participó, qué tarea falló, qué observó y qué mejora
>    implementó a partir de eso.
>
> | Participante | Tarea | Dificultad observada | Mejora implementada |
> |---|---|---|---|
> | _(completar)_ | _(completar)_ | _(completar)_ | _(completar)_ |

---

## 9. Optimizaciones implementadas

### Optimización 1 — Búsqueda con pausa (debounce)

| | |
|---|---|
| **Situación inicial** | El listado se recargaba en cada pulsación de tecla. Escribir «apoderados» (10 letras) generaba **10 peticiones** al servidor, de las cuales 9 quedaban obsoletas de inmediato |
| **Optimización aplicada** | La función `retrasar()` de `utilidades.js` espera 400 ms sin escritura antes de consultar. Se aplica en `barraFiltros.js` |
| **Beneficio medido** | Escribir «apoderados» genera **1 sola petición**. Una reducción del **90 %** en ese caso, verificada en el panel de red del navegador. Menos carga para el notebook de la escuela y una lista que ya no parpadea mientras se escribe |

### Optimización 2 — Catálogo de tipos en memoria

| | |
|---|---|
| **Situación inicial** | El catálogo de tipos se necesita en el filtro y en el formulario. Pedirlo cada vez que se abre el formulario significaba una petición por cada apertura, para datos que cambian una vez al año |
| **Optimización aplicada** | `obtenerTiposDocumento()` guarda el resultado en la variable `cacheTipos` la primera vez. Las llamadas siguientes lo devuelven sin tocar la red |
| **Beneficio** | El catálogo se pide **una sola vez por sesión**. Abrir el formulario es inmediato, sin espera de red |

### Optimización 3 — Un escuchador en lugar de treinta

| | |
|---|---|
| **Situación inicial** | Con tres botones por fila y diez filas, registrar un evento por botón implicaba **30 escuchadores**, que además había que volver a crear en cada búsqueda porque las filas se redibujan |
| **Optimización aplicada** | Delegación de eventos: un único escuchador en el `<tbody>` identifica el botón pulsado con `closest()`. También se usa en las tarjetas de resumen |
| **Beneficio** | De 30 escuchadores a **1**, y no se recrean al redibujar. Menos memoria y un redibujado más liviano |

### Optimización 4 — Un solo redibujado de la tabla

| | |
|---|---|
| **Situación inicial** | Agregar las filas una por una obliga al navegador a recalcular el diseño de la página en cada vuelta del ciclo |
| **Optimización aplicada** | `renderizarLista()` arma todo el HTML en una cadena con `map().join('')` y lo asigna una única vez a `innerHTML` |
| **Beneficio** | Un recálculo de diseño en lugar de diez |

---

## 10. Seguridad

| Medida implementada | Riesgo que reduce | Dónde está |
|---|---|---|
| **Escape de HTML en todo dato mostrado** | **XSS almacenado.** Si alguien guardara como título `<img src=x onerror=alert(1)>`, al pintarlo con `innerHTML` el navegador ejecutaría ese código. `escaparHtml()` convierte los caracteres especiales en entidades y el texto se muestra literal | `utilidades.js`, usado por todos los componentes que pintan datos |
| **Validación de los datos ingresados** | Envío de datos mal formados y errores evitables. Se valida largo, formato de fecha y extensión del archivo antes de enviar | `formularioDocumento.js` |
| **Validación de la extensión del archivo** | Registro de archivos ejecutables (`.exe`, `.bat`). Solo se aceptan las extensiones ofimáticas y de imagen definidas en `config.js` | `config.js` y `formularioDocumento.js` |
| **Mensajes de error sin detalle técnico** | Divulgación de información útil para un atacante. Nunca se muestran trazas, rutas internas ni consultas; solo mensajes en lenguaje común | `documentosApi.js` |
| **Sin credenciales en el código fuente** | Filtración de secretos. `config.js` solo contiene la dirección pública de la API. Todo lo que está en el Frontend viaja al navegador y cualquiera puede leerlo, así que ahí no va nada sensible | `config.js` |
| **Bootstrap servido localmente** | Dependencia de terceros y ataques a la cadena de suministro. Al no usar CDN, un CDN comprometido o caído no afecta a la escuela | `vendor/bootstrap/` |
| **Confirmación en acciones destructivas** | Borrado accidental. Eliminar exige confirmación mostrando el título, y el foco parte en «Cancelar» | `confirmarEliminar.js` |
| **Bloqueo del botón mientras se guarda** | Registros duplicados por doble clic o por una conexión lenta | `formularioDocumento.js` |

> **Nota honesta sobre el alcance.** La aplicación todavía no tiene autenticación: quien abra la
> dirección puede ver y modificar los documentos. La escuela indicó que aún no cuenta con
> protocolos de seguridad definidos, por lo que se documenta como la primera prioridad de la
> retrospectiva. Un Frontend no puede resolver esto solo: requiere que el Backend implemente
> autenticación.

---

## 11. Problema técnico resuelto

### Problema

Desde la ventana de detalle, el botón «Editar» debía cerrar esa ventana y abrir la del
formulario. Al probarlo, en algunas ejecuciones el formulario **no se abría**: la ventana de
detalle quedaba abierta y el botón parecía no responder.

### Causa detectada

Dos ventanas modales de Bootstrap no pueden estar abiertas a la vez: cada una crea su propia capa
de fondo (`.modal-backdrop`). La primera versión del código hacía esto:

```js
modal.hide();
modalElemento.addEventListener('hidden.bs.modal', () => alEditar(id), { once: true });
```

Es decir, **cerraba la ventana y después registraba el escuchador**. Bootstrap normalmente demora
unos 300 ms en la animación de cierre, así que el escuchador alcanzaba a registrarse a tiempo y
todo parecía funcionar. Pero cuando el cierre ocurre **al instante** —que es lo que pasa cuando el
usuario tiene activada la opción «reducir animaciones» del sistema operativo— el evento
`hidden.bs.modal` se dispara *antes* de que exista el escuchador, se pierde, y el formulario no se
abre nunca.

Se reprodujo el fallo quitando la clase `fade` de las ventanas, que es exactamente el efecto que
produce esa opción de accesibilidad.

Además se midió qué ocurre si simplemente se abre la segunda ventana sin esperar a la primera:

| Escenario | Capas de fondo en pantalla | Al cerrar todo |
|---|---|---|
| Cerrar y abrir sin esperar | **2 capas superpuestas** | Queda **1 capa pegada** y el scroll bloqueado: la página se ve con un velo gris y hay que recargar |

### Alternativas consideradas

1. **Esperar con `setTimeout(300)`.** Descartada: fija a mano un tiempo que depende de la
   animación de Bootstrap y del equipo. Si el navegador va lento, vuelve a fallar.
2. **Usar una sola ventana que cambie de contenido.** Habría evitado el problema, pero obliga a
   mezclar detalle y formulario en un mismo componente, perdiendo la separación de
   responsabilidades.
3. **Registrar el escuchador antes de cerrar.** Elegida.

### Solución implementada

```js
// El escuchador se registra ANTES de llamar a hide().
modalElemento.addEventListener('hidden.bs.modal', () => alEditar(id), { once: true });
modal.hide();
```

Invertir las dos líneas garantiza que el escuchador exista pase lo que pase, sin importar cuánto
demore el cierre. `{ once: true }` evita que se acumulen escuchadores al usar el botón varias veces.

### Resultado obtenido

Verificado con las animaciones desactivadas, que era el caso que fallaba:

| Comprobación | Resultado |
|---|---|
| El detalle se cierra | Sí |
| El formulario se abre | Sí |
| Capas de fondo en pantalla | 1 (la correcta) |
| Título de la ventana | «Editar documento», con los datos cargados |

### Aprendizaje generado

El orden de dos líneas puede ser la diferencia entre que algo funcione y que no, y **un error que
solo aparece con una opción de accesibilidad activada es especialmente peligroso**: en un
computador de desarrollo nunca se ve, y la persona afectada no puede usar la aplicación. La
lección práctica es registrar siempre el escuchador antes de disparar la acción que emite el
evento, y probar con las animaciones desactivadas.

Sobre la mantenibilidad: la solución mantiene la separación entre componentes. `detalleDocumento.js`
sigue sin saber qué es un formulario; solo avisa «el usuario quiere editar este id» y `app.js`
decide qué hacer.

---

## 12. Control de versiones

El proyecto se desarrolló de forma **individual**, versionado con Git y publicado en GitHub:
<https://github.com/luisorellanacabrera/gestor-documental-frontend>

- **Commits descriptivos** que explican qué cambió y por qué, no «cambios» o «avance». El
  historial permite seguir el orden en que se construyó la aplicación: primero la estructura y la
  capa de datos, después los componentes, y al final las correcciones surgidas de las pruebas.
- **Organización coherente**: cada commit agrupa un cambio con sentido propio y deja la
  aplicación en un estado que funciona.
- **Historial lineal sobre `main`.** La evaluación pide usar ramas «cuando sean pertinentes». En
  un desarrollo individual y secuencial, sin trabajo paralelo ni integraciones que resolver, una
  rama por funcionalidad habría sido una formalidad sin función: no hay conflictos que prevenir ni
  revisiones de otra persona que esperar. Se optó por un historial lineal con commits acotados,
  que es más legible para quien deba retomar el proyecto.

Al ser un trabajo individual, la evidencia de este indicador es la **trazabilidad del historial**:
mensajes que explican qué cambió y por qué, commits de alcance acotado y un orden que refleja
cómo se construyó realmente la aplicación.

---

## 13. Retrospectiva y mejora continua

### Cómo se tomó la decisión

El proyecto se desarrolló de forma individual, por lo que la priorización no requirió acuerdo
entre integrantes, sino un criterio explícito y aplicable de forma consistente. El criterio
utilizado fue cruzar **impacto para el equipo directivo de la escuela** con **esfuerzo de
implementación**, sobre las oportunidades detectadas durante el desarrollo y las pruebas.

Con ese criterio se ordenaron las cinco oportunidades de la tabla siguiente y se implementó de
inmediato la de mayor impacto y menor esfuerzo (N.º 5). Las de prioridad Alta que quedaron
pendientes —autenticación y carga de archivos— no dependen solo del Frontend: requieren que el
Backend las exponga primero, y por eso se registran como trabajo de la siguiente iteración y no
como omisiones de esta entrega.

| # | Situación o problema | Mejora propuesta | Prioridad | Responsable | Acción a realizar |
|---|---|---|---|---|---|
| 1 | Cualquiera que abra la dirección puede ver y modificar documentos con datos de apoderados y del personal | Autenticación con inicio de sesión y control de acceso | **Alta** | Luis Orellana | Coordinar con el equipo de Backend la creación de usuarios y proteger las rutas del Frontend |
| 2 | Solo se registra el nombre del archivo; el documento físico sigue fuera del sistema | Carga real del archivo con `multipart/form-data` y descarga desde el detalle | **Alta** | Luis Orellana | Agregar un campo de tipo archivo y consumir el endpoint de carga cuando el Backend lo exponga |
| 3 | En celular la tabla oculta la columna de descripción y las acciones quedan apretadas | Vista en tarjetas para pantallas pequeñas, en lugar de tabla | **Media** | Luis Orellana | Crear una variante de `listaDocumentos.js` que dibuje tarjetas bajo los 768 px |
| 4 | Si se elimina un documento por error no hay forma de recuperarlo | Papelera con eliminación lógica y opción de restaurar | **Media** | Luis Orellana | Requiere un campo de estado en el Backend; en el Frontend, una vista de papelera |
| 5 | El botón principal estaba escondido en el menú en celulares | Dejarlo siempre visible en la barra superior | **Alta** | Luis Orellana | **Implementada en esta entrega** |

### Mejora implementada dentro del alcance de la evaluación

Se implementó la **mejora N.º 5**, surgida de la prueba de usabilidad: era la de mayor impacto
inmediato para el usuario real y la de menor esfuerzo técnico. El botón «Nuevo documento» salió
del menú desplegable y ahora está siempre visible, abreviado a «+ Nuevo» en pantallas angostas.

También se implementaron, dentro del alcance, las dos correcciones de accesibilidad de la
sección 8 y el ajuste `modal-dialog-scrollable` del formulario.

---

## 14. Dificultades y cómo se resolvieron

| Dificultad | Cómo se resolvió |
|---|---|
| Las ventanas modales encadenadas dejaban la pantalla con un velo gris | Registrar el escuchador antes de cerrar (sección 11) |
| Todos los distintivos de tipo se veían del mismo gris | Se descubrió que era un problema de especificidad de CSS: la regla general pisaba a las específicas. Se igualó la especificidad con `.badge.tipo-xxx` |
| El botón de guardar quedaba con el texto «Guardando…» de forma permanente cuando el servidor rechazaba los datos | Se guarda la etiqueta original antes de reemplazarla y se restaura al terminar |
| Abrir `index.html` con doble clic no cargaba nada | Los módulos de JavaScript no funcionan con `file://`. Se documentó que hay que usar un servidor web |
| El formulario no cabía en pantallas bajas y los botones quedaban fuera | `modal-dialog-scrollable` |

---

## 15. Evidencias

| Evidencia | Archivo |
|---|---|
| Informe formal de la evaluación | `docs/Informe_Eva3_Frontend_G733.docx` y `.pdf` |
| Integración y consumo de endpoints | `docs/evidencia_integracion.md` |
| Prueba de accesibilidad | `docs/evidencia_accesibilidad.md` |
| Optimizaciones medidas | `docs/evidencia_optimizacion.md` |
| Capturas de la aplicación | `docs/capturas/` _(completar)_ |
