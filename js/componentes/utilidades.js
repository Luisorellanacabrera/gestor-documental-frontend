/**
 * Funciones de apoyo reutilizadas por varios componentes.
 */

/**
 * SEGURIDAD — Escapa el texto antes de insertarlo en el HTML.
 *
 * Los datos vienen de la API y fueron escritos por una persona. Si alguien
 * guardara un título como <img src=x onerror=alert(1)>, al pintarlo con
 * innerHTML el navegador ejecutaría ese código (ataque XSS). Convirtiendo los
 * caracteres especiales en entidades, el texto se muestra tal cual y nunca se
 * ejecuta.
 */
export function escaparHtml(valor) {
  if (valor === null || valor === undefined) {
    return '';
  }

  return String(valor)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/** Convierte 2025-04-02 en "02-04-2025", que es como se lee en Chile. */
export function formatearFecha(fechaIso) {
  if (!fechaIso) return '—';

  const partes = String(fechaIso).slice(0, 10).split('-');
  if (partes.length !== 3) return escaparHtml(fechaIso);

  const [anio, mes, dia] = partes;
  return `${dia}-${mes}-${anio}`;
}

/** Recorta un texto largo para que la tabla no se deforme. */
export function recortar(texto, largo = 90) {
  if (!texto) return '';
  const limpio = String(texto).trim();

  return limpio.length <= largo ? limpio : limpio.slice(0, largo - 1) + '…';
}

/**
 * OPTIMIZACIÓN — Retrasa la ejecución hasta que el usuario deja de escribir.
 *
 * Sin esto, escribir "kermés" dispara 6 peticiones al servidor (una por tecla).
 * Con debounce se dispara una sola, cuando la persona hace una pausa.
 */
export function retrasar(funcion, milisegundos) {
  let temporizador;

  return function (...argumentos) {
    clearTimeout(temporizador);
    temporizador = setTimeout(() => funcion.apply(this, argumentos), milisegundos);
  };
}

/** Muestra u oculta un elemento usando la clase de Bootstrap. */
export function mostrar(elemento, visible) {
  if (elemento) {
    elemento.classList.toggle('d-none', !visible);
  }
}
