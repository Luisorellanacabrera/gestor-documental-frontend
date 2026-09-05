/**
 * COMPONENTE: barra de búsqueda y filtros.
 *
 * Responsabilidad: recoger lo que el usuario quiere buscar y avisar a app.js.
 * Información que recibe: el catálogo de tipos (para llenar el <select>) y la
 * función a ejecutar cuando cambian los filtros.
 */

import { CONFIG } from '../config.js';
import { retrasar, escaparHtml } from './utilidades.js';

const formulario = document.getElementById('formFiltros');
const campoBuscar = document.getElementById('campoBuscar');
const campoTipo = document.getElementById('campoTipo');
const campoDesde = document.getElementById('campoDesde');
const campoHasta = document.getElementById('campoHasta');
const btnLimpiar = document.getElementById('btnLimpiarFiltros');

/** Llena el selector de tipos con el catálogo que entrega la API. */
export function cargarTiposEnFiltro(tipos) {
  const opciones = tipos
    .map((tipo) => `<option value="${escaparHtml(tipo.codigo)}">${escaparHtml(tipo.nombre)}</option>`)
    .join('');

  campoTipo.innerHTML = '<option value="">Todos los tipos</option>' + opciones;
}

/** Devuelve los filtros actuales, listos para enviar a la API. */
export function obtenerFiltros() {
  return {
    buscar: campoBuscar.value.trim(),
    tipo: campoTipo.value,
    desde: campoDesde.value,
    hasta: campoHasta.value,
  };
}

/**
 * Conecta los eventos de la barra.
 * La búsqueda usa retrasar() para no consultar la API en cada tecla.
 */
export function conectarFiltros(alCambiar) {
  const buscarConRetraso = retrasar(alCambiar, CONFIG.ESPERA_BUSQUEDA);

  campoBuscar.addEventListener('input', buscarConRetraso);
  campoTipo.addEventListener('change', alCambiar);
  campoDesde.addEventListener('change', alCambiar);
  campoHasta.addEventListener('change', alCambiar);

  // Enter no debe recargar la página: el listado ya se actualiza solo.
  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    alCambiar();
  });

  btnLimpiar.addEventListener('click', () => {
    formulario.reset();
    alCambiar();
    campoBuscar.focus(); // el foco vuelve al inicio del formulario
  });
}

/** Indica si hay algún filtro puesto, para redactar mejor el mensaje de "sin resultados". */
export function hayFiltrosActivos() {
  const f = obtenerFiltros();
  return Boolean(f.buscar || f.tipo || f.desde || f.hasta);
}
