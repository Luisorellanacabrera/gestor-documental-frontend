/**
 * COMPONENTE: mensajes de estado.
 *
 * Responsabilidad: mostrar al usuario en qué situación está la aplicación
 * (cargando, sin resultados, con error) y avisar cuando una acción termina.
 * No recibe datos del dominio, solo textos.
 *
 * Los contenedores viven dentro de un div con aria-live="polite", de modo que
 * un lector de pantalla anuncie los cambios sin interrumpir al usuario.
 */

import { mostrar, escaparHtml } from './utilidades.js';

const cargando = document.getElementById('estadoCargando');
const vacio = document.getElementById('estadoVacio');
const textoVacio = document.getElementById('textoVacio');
const error = document.getElementById('estadoError');
const textoError = document.getElementById('textoError');
const listado = document.getElementById('seccionListado');
const contenedorAvisos = document.getElementById('contenedorAvisos');

/** Oculta todos los estados antes de mostrar el que corresponde. */
function limpiar() {
  mostrar(cargando, false);
  mostrar(vacio, false);
  mostrar(error, false);
}

export function mostrarCargando() {
  limpiar();
  mostrar(listado, false);
  mostrar(cargando, true);
}

export function mostrarListado() {
  limpiar();
  mostrar(listado, true);
}

export function mostrarVacio(mensaje) {
  limpiar();
  mostrar(listado, false);
  textoVacio.textContent = mensaje;
  mostrar(vacio, true);
}

export function mostrarError(mensaje) {
  limpiar();
  mostrar(listado, false);
  textoError.textContent = mensaje;
  mostrar(error, true);
}

/**
 * Aviso emergente (toast) de Bootstrap.
 * @param {string} mensaje texto a mostrar
 * @param {'exito'|'error'} tipo define el color del aviso
 */
export function avisar(mensaje, tipo = 'exito') {
  const color = tipo === 'error' ? 'text-bg-danger' : 'text-bg-success';
  const icono = tipo === 'error' ? '⚠️' : '✅';

  // role="alert" hace que el lector de pantalla lo anuncie de inmediato.
  const aviso = document.createElement('div');
  aviso.className = `toast align-items-center ${color} border-0`;
  aviso.setAttribute('role', 'alert');
  aviso.setAttribute('aria-live', 'assertive');
  aviso.setAttribute('aria-atomic', 'true');
  aviso.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        <span aria-hidden="true">${icono}</span> ${escaparHtml(mensaje)}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto"
              data-bs-dismiss="toast" aria-label="Cerrar aviso"></button>
    </div>`;

  contenedorAvisos.appendChild(aviso);

  const instancia = new bootstrap.Toast(aviso, { delay: 4000 });
  instancia.show();

  // Se elimina del DOM al ocultarse para no acumular nodos invisibles.
  aviso.addEventListener('hidden.bs.toast', () => aviso.remove());
}

/** Indicador de conexión con la API en la barra superior. */
export function actualizarEstadoApi(conectada) {
  const punto = document.getElementById('puntoEstado');
  const texto = document.getElementById('textoEstadoApi');

  punto.classList.toggle('conectado', conectada);
  punto.classList.toggle('desconectado', !conectada);
  texto.textContent = conectada ? 'API conectada' : 'API sin conexión';
}
