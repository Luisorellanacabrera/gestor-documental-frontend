/**
 * COMPONENTE: tarjetas de resumen por tipo documental.
 *
 * Responsabilidad: mostrar de un vistazo cuántos documentos hay de cada tipo.
 * Información que recibe: el objeto de estadísticas de la API.
 * Relación: es informativo; al pulsar una tarjeta se puede filtrar por ese tipo.
 */

import { escaparHtml } from './utilidades.js';

const contenedor = document.getElementById('contenedorResumen');

export function renderizarResumen(estadisticas, alFiltrarPorTipo) {
  if (!estadisticas) {
    contenedor.innerHTML = '';
    return;
  }

  const total = `
    <div class="col-6 col-md-4 col-lg-3">
      <div class="card tarjeta-resumen tarjeta-total h-100">
        <div class="card-body py-3">
          <p class="numero mb-0">${estadisticas.total_documentos}</p>
          <p class="etiqueta mb-0">Documentos en total</p>
        </div>
      </div>
    </div>`;

  const porTipo = (estadisticas.por_tipo || [])
    .filter((tipo) => tipo.cantidad > 0)
    .map((tipo) => `
      <div class="col-6 col-md-4 col-lg-3">
        <button type="button" class="card tarjeta-resumen h-100 w-100 text-start"
                data-tipo="${escaparHtml(tipo.codigo)}">
          <div class="card-body py-3">
            <p class="numero mb-0">${tipo.cantidad}</p>
            <p class="etiqueta mb-0">${escaparHtml(tipo.nombre)}</p>
          </div>
        </button>
      </div>`)
    .join('');

  contenedor.innerHTML = total + porTipo;

  // Delegación de eventos: un solo escuchador para todas las tarjetas.
  contenedor.querySelectorAll('button[data-tipo]').forEach((boton) => {
    boton.addEventListener('click', () => alFiltrarPorTipo(boton.dataset.tipo));
  });
}
