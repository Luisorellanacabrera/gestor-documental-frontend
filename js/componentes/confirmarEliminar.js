/**
 * COMPONENTE: confirmación de eliminación (ventana modal).
 *
 * Responsabilidad: pedir confirmación antes de borrar, mostrando el título del
 * documento para que el usuario verifique que es el correcto.
 * Información que recibe: el documento y la función que elimina en la API.
 */

import { escaparHtml } from './utilidades.js';

const modalElemento = document.getElementById('modalEliminar');
const tituloDocumento = document.getElementById('tituloDocumentoEliminar');
const btnConfirmar = document.getElementById('btnConfirmarEliminar');
const spinner = document.getElementById('spinnerEliminar');

const modal = new bootstrap.Modal(modalElemento);
let documentoAEliminar = null;
let alConfirmar = null;

export function abrirConfirmacion(documento) {
  documentoAEliminar = documento;
  tituloDocumento.innerHTML = `«${escaparHtml(documento.titulo)}»`;
  modal.show();

  // El foco parte en Cancelar, que es la opción segura ante una acción destructiva.
  modalElemento.addEventListener('shown.bs.modal', () => {
    modalElemento.querySelector('[data-bs-dismiss="modal"].btn-secondary').focus();
  }, { once: true });
}

export function cerrarConfirmacion() {
  modal.hide();
}

export function conectarConfirmacion(funcionEliminar) {
  alConfirmar = funcionEliminar;

  btnConfirmar.addEventListener('click', async () => {
    if (!documentoAEliminar) return;

    btnConfirmar.disabled = true;
    spinner.classList.remove('d-none');

    try {
      await alConfirmar(documentoAEliminar.id);
    } finally {
      btnConfirmar.disabled = false;
      spinner.classList.add('d-none');
    }
  });
}
