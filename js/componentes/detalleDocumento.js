/**
 * COMPONENTE: detalle de un documento (ventana modal).
 *
 * Responsabilidad: mostrar toda la información de un documento.
 * Información que recibe: el objeto documento que entrega la API.
 * Relación: se abre desde el botón "Ver" del listado y ofrece pasar a editar.
 */

import { escaparHtml, formatearFecha } from './utilidades.js';

const modalElemento = document.getElementById('modalDetalle');
const cuerpo = document.getElementById('cuerpoModalDetalle');
const btnEditar = document.getElementById('btnEditarDesdeDetalle');

const modal = new bootstrap.Modal(modalElemento);
let documentoActual = null;

/** Fila de la lista de definiciones. */
function dato(etiqueta, valor) {
  return `
    <dt class="col-sm-4">${etiqueta}</dt>
    <dd class="col-sm-8">${valor}</dd>`;
}

export function abrirDetalle(documento) {
  documentoActual = documento;

  const archivo = documento.archivo?.nombre
    ? `${escaparHtml(documento.archivo.nombre)}
       <span class="d-block text-secondary small">${escaparHtml(documento.archivo.ruta || '')}</span>`
    : '<span class="text-secondary">Sin archivo asociado</span>';

  cuerpo.innerHTML = `
    <h3 class="h5 mb-3">${escaparHtml(documento.titulo)}</h3>
    <dl class="row mb-0">
      ${dato('Tipo', `<span class="badge tipo-${escaparHtml(documento.tipo.codigo)}">${escaparHtml(documento.tipo.nombre)}</span>`)}
      ${dato('Fecha', `<time datetime="${escaparHtml(documento.fecha_documento)}">${formatearFecha(documento.fecha_documento)}</time>`)}
      ${dato('Descripción', documento.descripcion ? escaparHtml(documento.descripcion) : '<span class="text-secondary">Sin descripción</span>')}
      ${dato('Archivo', archivo)}
      ${dato('Registrado', escaparHtml(documento.creado_en))}
      ${dato('Última modificación', escaparHtml(documento.actualizado_en))}
    </dl>`;

  modal.show();
}

export function cerrarDetalle() {
  modal.hide();
}

/**
 * El botón "Editar" del detalle avisa a app.js con el id correspondiente.
 *
 * Las dos ventanas no pueden estar abiertas a la vez: hay que cerrar el detalle
 * y recién entonces abrir el formulario. El orden de estas dos líneas importa.
 *
 * El escuchador se registra ANTES de llamar a hide(). Si se hiciera al revés,
 * en los equipos con "reducir animaciones" activado —una opción de
 * accesibilidad del sistema operativo— Bootstrap cierra la ventana al instante
 * y el evento hidden.bs.modal se dispara antes de que exista el escuchador: el
 * formulario nunca se abriría y el botón parecería no funcionar.
 */
export function conectarBotonEditar(alEditar) {
  btnEditar.addEventListener('click', () => {
    if (!documentoActual) return;

    const id = documentoActual.id;

    modalElemento.addEventListener('hidden.bs.modal', () => alEditar(id), { once: true });
    modal.hide();
  });
}
