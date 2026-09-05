/**
 * COMPONENTE: listado de documentos (tabla) y su paginación.
 *
 * Responsabilidad: dibujar la tabla a partir de un arreglo de documentos y
 * avisar cuando el usuario pulsa Ver, Editar o Eliminar.
 * Información que recibe: el arreglo de documentos, los datos de paginación y
 * las funciones a ejecutar en cada acción.
 * Relación: app.js le entrega los datos que trae documentosApi.js.
 */

import { escaparHtml, formatearFecha, recortar } from './utilidades.js';

const cuerpoTabla = document.getElementById('cuerpoTabla');
const listaPaginacion = document.getElementById('listaPaginacion');
const navPaginacion = document.getElementById('navPaginacion');
const contador = document.getElementById('contadorResultados');

/** Devuelve el HTML de una fila. Cada dato pasa por escaparHtml. */
function filaDocumento(documento) {
  const titulo = escaparHtml(documento.titulo);
  const descripcion = documento.descripcion
    ? escaparHtml(recortar(documento.descripcion))
    : '<span class="text-secondary">Sin descripción</span>';

  const archivo = documento.archivo?.nombre
    ? `<span class="badge rounded-pill text-bg-light ms-2" title="Archivo asociado">
         <span aria-hidden="true">📎</span> ${escaparHtml(documento.archivo.nombre)}
       </span>`
    : '';

  return `
    <tr>
      <th scope="row" class="fw-semibold">${titulo}${archivo}</th>
      <td><span class="badge tipo-${escaparHtml(documento.tipo.codigo)}">${escaparHtml(documento.tipo.nombre)}</span></td>
      <td><time datetime="${escaparHtml(documento.fecha_documento)}">${formatearFecha(documento.fecha_documento)}</time></td>
      <td class="celda-descripcion">${descripcion}</td>
      <td class="text-end text-nowrap">
        <div class="btn-group btn-group-sm" role="group" aria-label="Acciones para ${titulo}">
          <button type="button" class="btn btn-outline-secondary" data-accion="ver" data-id="${documento.id}">
            Ver<span class="visually-hidden"> el documento ${titulo}</span>
          </button>
          <button type="button" class="btn btn-outline-primary" data-accion="editar" data-id="${documento.id}">
            Editar<span class="visually-hidden"> el documento ${titulo}</span>
          </button>
          <button type="button" class="btn btn-outline-danger" data-accion="eliminar" data-id="${documento.id}">
            Eliminar<span class="visually-hidden"> el documento ${titulo}</span>
          </button>
        </div>
      </td>
    </tr>`;
}

/**
 * Dibuja la tabla completa.
 *
 * OPTIMIZACIÓN: se arma todo el HTML en una sola cadena y se asigna una única
 * vez a innerHTML. Si se agregara fila por fila, el navegador recalcularía el
 * diseño de la página en cada vuelta del ciclo.
 */
export function renderizarLista(documentos) {
  cuerpoTabla.innerHTML = documentos.map(filaDocumento).join('');
}

/** Muestra cuántos resultados hay, para orientar al usuario. */
export function renderizarContador(paginacion) {
  const total = paginacion.total || 0;

  if (total === 0) {
    contador.textContent = '';
    return;
  }

  contador.textContent = total === 1
    ? '1 documento encontrado'
    : `${total} documentos encontrados`;
}

/**
 * Dibuja la paginación.
 * @param {object} paginacion datos que entrega el Backend
 * @param {(pagina:number) => void} alCambiarPagina
 */
export function renderizarPaginacion(paginacion, alCambiarPagina) {
  const totalPaginas = paginacion.total_paginas || 0;
  const actual = paginacion.pagina || 1;

  // Con una sola página la paginación no aporta nada, así que se oculta.
  if (totalPaginas <= 1) {
    navPaginacion.classList.add('d-none');
    listaPaginacion.innerHTML = '';
    return;
  }

  navPaginacion.classList.remove('d-none');

  const boton = (etiqueta, pagina, deshabilitado, activo, textoAccesible) => `
    <li class="page-item ${deshabilitado ? 'disabled' : ''} ${activo ? 'active' : ''}">
      <button type="button" class="page-link" data-pagina="${pagina}"
              ${deshabilitado ? 'disabled' : ''} ${activo ? 'aria-current="page"' : ''}>
        ${etiqueta}<span class="visually-hidden"> ${textoAccesible}</span>
      </button>
    </li>`;

  let html = boton('«', actual - 1, actual === 1, false, 'Página anterior');

  for (let i = 1; i <= totalPaginas; i++) {
    html += boton(i, i, false, i === actual, `Ir a la página ${i}`);
  }

  html += boton('»', actual + 1, actual === totalPaginas, false, 'Página siguiente');

  listaPaginacion.innerHTML = html;

  listaPaginacion.querySelectorAll('button[data-pagina]').forEach((btn) => {
    btn.addEventListener('click', () => alCambiarPagina(Number(btn.dataset.pagina)));
  });
}

/**
 * Escucha las acciones de la tabla.
 *
 * OPTIMIZACIÓN: se registra UN solo escuchador en el <tbody> en lugar de tres
 * por cada fila (delegación de eventos). Con 10 filas serían 30 escuchadores
 * que además habría que volver a crear en cada búsqueda.
 */
export function conectarAcciones({ alVer, alEditar, alEliminar }) {
  cuerpoTabla.addEventListener('click', (evento) => {
    const boton = evento.target.closest('button[data-accion]');
    if (!boton) return;

    const id = Number(boton.dataset.id);

    if (boton.dataset.accion === 'ver') alVer(id);
    if (boton.dataset.accion === 'editar') alEditar(id);
    if (boton.dataset.accion === 'eliminar') alEliminar(id);
  });
}
