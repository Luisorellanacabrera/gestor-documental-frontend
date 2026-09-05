/**
 * COMPONENTE: formulario de creación y edición (ventana modal).
 *
 * Responsabilidad: capturar los datos de un documento, validarlos antes de
 * enviarlos y mostrar los errores que devuelva el Backend.
 * Información que recibe: el catálogo de tipos y, al editar, el documento.
 * Relación: app.js le pasa la función que guarda contra la API.
 *
 * El mismo componente sirve para crear y para editar. Se reutiliza en lugar de
 * escribir dos formularios casi idénticos.
 */

import { CONFIG } from '../config.js';
import { escaparHtml } from './utilidades.js';

const modalElemento = document.getElementById('modalFormulario');
const formulario = document.getElementById('formDocumento');
const titulo = document.getElementById('tituloModalFormulario');
const resumenErrores = document.getElementById('resumenErrores');
const listaErrores = document.getElementById('listaErrores');
const btnGuardar = document.getElementById('btnGuardar');
const spinner = document.getElementById('spinnerGuardar');
const textoBoton = document.getElementById('textoBtnGuardar');
const contadorDescripcion = document.getElementById('contadorDescripcion');

const campos = {
  id: document.getElementById('campoId'),
  titulo: document.getElementById('campoTitulo'),
  tipo: document.getElementById('campoTipoDoc'),
  fecha: document.getElementById('campoFecha'),
  descripcion: document.getElementById('campoDescripcion'),
  archivo: document.getElementById('campoArchivo'),
};

const modal = new bootstrap.Modal(modalElemento);
let alGuardar = null;

/** Llena el selector de tipos del formulario. */
export function cargarTiposEnFormulario(tipos) {
  const opciones = tipos
    .map((tipo) => `<option value="${escaparHtml(tipo.codigo)}">${escaparHtml(tipo.nombre)}</option>`)
    .join('');

  campos.tipo.innerHTML = '<option value="">Seleccione un tipo…</option>' + opciones;
}

/** Deja el formulario limpio, sin marcas de error de una edición anterior. */
function limpiar() {
  formulario.reset();
  campos.id.value = '';
  contadorDescripcion.textContent = '0';
  resumenErrores.classList.add('d-none');
  listaErrores.innerHTML = '';

  Object.values(campos).forEach((campo) => campo.classList.remove('is-invalid'));
}

export function abrirParaCrear() {
  limpiar();
  titulo.textContent = 'Nuevo documento';
  textoBoton.textContent = 'Guardar documento';
  modal.show();

  // Usabilidad: el foco entra directo al primer campo, sin obligar a usar el mouse.
  modalElemento.addEventListener('shown.bs.modal', () => campos.titulo.focus(), { once: true });
}

export function abrirParaEditar(documento) {
  limpiar();
  titulo.textContent = 'Editar documento';
  textoBoton.textContent = 'Guardar cambios';

  campos.id.value = documento.id;
  campos.titulo.value = documento.titulo || '';
  campos.tipo.value = documento.tipo?.codigo || '';
  campos.fecha.value = (documento.fecha_documento || '').slice(0, 10);
  campos.descripcion.value = documento.descripcion || '';
  campos.archivo.value = documento.archivo?.nombre || '';
  contadorDescripcion.textContent = String(campos.descripcion.value.length);

  modal.show();
  modalElemento.addEventListener('shown.bs.modal', () => campos.titulo.focus(), { once: true });
}

export function cerrarFormulario() {
  modal.hide();
}

// ---------------------------------------------------------------- VALIDACIÓN

/**
 * SEGURIDAD Y USABILIDAD — Validación en el navegador.
 *
 * Repite las mismas reglas que aplica el Backend. No lo reemplaza (la
 * validación del servidor es la que manda, porque el navegador se puede
 * manipular), pero le ahorra al usuario un viaje al servidor para enterarse
 * de que le faltó un campo.
 */
function validar() {
  const errores = [];

  Object.values(campos).forEach((campo) => campo.classList.remove('is-invalid'));

  const tituloValor = campos.titulo.value.trim();
  if (tituloValor.length < 3 || tituloValor.length > 150) {
    errores.push({ campo: campos.titulo, id: 'errorTitulo',
                   mensaje: 'El título debe tener entre 3 y 150 caracteres.' });
  }

  if (!campos.tipo.value) {
    errores.push({ campo: campos.tipo, id: 'errorTipo',
                   mensaje: 'Debe seleccionar el tipo de documento.' });
  }

  if (!campos.fecha.value) {
    errores.push({ campo: campos.fecha, id: 'errorFecha',
                   mensaje: 'Debe indicar la fecha del documento.' });
  } else {
    const anio = Number(campos.fecha.value.slice(0, 4));
    if (anio < 2000) {
      errores.push({ campo: campos.fecha, id: 'errorFecha',
                     mensaje: 'La fecha debe ser posterior al año 2000.' });
    }
  }

  if (campos.descripcion.value.length > 1000) {
    errores.push({ campo: campos.descripcion, id: 'errorDescripcion',
                   mensaje: 'La descripción no puede superar los 1000 caracteres.' });
  }

  const archivo = campos.archivo.value.trim();
  if (archivo) {
    const extension = archivo.split('.').pop().toLowerCase();
    if (!CONFIG.EXTENSIONES_PERMITIDAS.includes(extension)) {
      errores.push({ campo: campos.archivo, id: 'errorArchivo',
                     mensaje: 'La extensión debe ser: ' + CONFIG.EXTENSIONES_PERMITIDAS.join(', ') + '.' });
    }
  }

  return errores;
}

/**
 * Muestra los errores en dos lugares: junto a cada campo y en un resumen al
 * inicio del formulario, que recibe el foco. Así el usuario que navega con
 * lector de pantalla se entera de todo lo que debe corregir (WCAG 3.3.1).
 */
function mostrarErrores(errores) {
  listaErrores.innerHTML = errores
    .map((error) => `<li>${escaparHtml(error.mensaje)}</li>`)
    .join('');

  errores.forEach((error) => {
    if (error.campo) {
      error.campo.classList.add('is-invalid');
      const contenedor = document.getElementById(error.id);
      if (contenedor) contenedor.textContent = error.mensaje;
    }
  });

  resumenErrores.classList.remove('d-none');
  resumenErrores.focus();
}

/** Errores que devuelve el Backend, con el formato {campo, mensaje}. */
export function mostrarErroresDelServidor(erroresApi, mensajeGeneral) {
  const mapa = {
    titulo: { campo: campos.titulo, id: 'errorTitulo' },
    tipo: { campo: campos.tipo, id: 'errorTipo' },
    fecha_documento: { campo: campos.fecha, id: 'errorFecha' },
    descripcion: { campo: campos.descripcion, id: 'errorDescripcion' },
    archivo_nombre: { campo: campos.archivo, id: 'errorArchivo' },
  };

  const errores = (erroresApi || []).map((error) => ({
    ...(mapa[error.campo] || {}),
    mensaje: error.mensaje,
  }));

  mostrarErrores(errores.length ? errores : [{ mensaje: mensajeGeneral }]);
}

/**
 * Bloquea el botón mientras se guarda, para evitar envíos duplicados.
 *
 * Se guarda la etiqueta original antes de reemplazarla por "Guardando…". Sin
 * esto, si el servidor rechaza los datos el botón quedaba con ese texto de
 * forma permanente y el usuario no sabía si podía volver a intentar.
 */
let etiquetaOriginalBoton = 'Guardar documento';

function bloquearGuardado(bloqueado) {
  if (bloqueado) {
    etiquetaOriginalBoton = textoBoton.textContent;
    textoBoton.textContent = 'Guardando…';
  } else {
    textoBoton.textContent = etiquetaOriginalBoton;
  }

  btnGuardar.disabled = bloqueado;
  spinner.classList.toggle('d-none', !bloqueado);
}

// -------------------------------------------------------------------- EVENTOS

export function conectarFormulario(funcionGuardar) {
  alGuardar = funcionGuardar;

  // Contador de caracteres: retroalimentación inmediata al escribir.
  campos.descripcion.addEventListener('input', () => {
    contadorDescripcion.textContent = String(campos.descripcion.value.length);
  });

  formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const errores = validar();
    if (errores.length > 0) {
      mostrarErrores(errores);
      return;
    }

    resumenErrores.classList.add('d-none');

    // Se envía el nombre del archivo; el Backend deriva la ruta si no se indica.
    const documento = {
      titulo: campos.titulo.value.trim(),
      tipo: campos.tipo.value,
      fecha_documento: campos.fecha.value,
      descripcion: campos.descripcion.value.trim() || null,
      archivo_nombre: campos.archivo.value.trim() || null,
    };

    bloquearGuardado(true);
    try {
      await alGuardar(campos.id.value || null, documento);
    } finally {
      bloquearGuardado(false);
    }
  });
}
