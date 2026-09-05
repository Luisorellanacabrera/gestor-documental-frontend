/**
 * Punto de entrada del Gestor Documental — Escuela Básica G-733 Chorombo Bajo.
 *
 * Este archivo integra los componentes: recibe los datos desde documentosApi.js
 * y se los entrega a cada componente para que los dibuje. Aquí no se escribe
 * HTML ni se llama a fetch directamente.
 */

import {
  listarDocumentos, obtenerDocumento, obtenerTiposDocumento, obtenerEstadisticas,
  crearDocumento, actualizarDocumento, eliminarDocumento, verificarEstadoApi, ErrorApi,
} from './api/documentosApi.js';

import { cargarTiposEnFiltro, obtenerFiltros, conectarFiltros, hayFiltrosActivos } from './componentes/barraFiltros.js';
import { renderizarLista, renderizarPaginacion, renderizarContador, conectarAcciones } from './componentes/listaDocumentos.js';
import { abrirDetalle, conectarBotonEditar } from './componentes/detalleDocumento.js';
import { cargarTiposEnFormulario, abrirParaCrear, abrirParaEditar, cerrarFormulario,
         conectarFormulario, mostrarErroresDelServidor } from './componentes/formularioDocumento.js';
import { abrirConfirmacion, cerrarConfirmacion, conectarConfirmacion } from './componentes/confirmarEliminar.js';
import { renderizarResumen } from './componentes/resumen.js';
import { mostrarCargando, mostrarListado, mostrarVacio, mostrarError,
         avisar, actualizarEstadoApi } from './componentes/mensajes.js';

/**
 * Estado de la aplicación.
 * Un único objeto guarda en qué página estamos, de modo que los componentes no
 * tengan que preguntarse entre ellos.
 */
const estado = {
  pagina: 1,
};

// --------------------------------------------------------------- CARGAR DATOS

/** Pide los documentos a la API y actualiza el listado. */
async function cargarDocumentos() {
  mostrarCargando();

  try {
    const filtros = { ...obtenerFiltros(), pagina: estado.pagina };
    const { documentos, paginacion } = await listarDocumentos(filtros);

    renderizarContador(paginacion);

    if (documentos.length === 0) {
      // El mensaje cambia según si el listado está vacío o los filtros no dieron resultado.
      mostrarVacio(hayFiltrosActivos()
        ? 'Ningún documento coincide con la búsqueda. Pruebe con otros filtros.'
        : 'Aún no hay documentos registrados. Use el botón «Nuevo documento» para agregar el primero.');
      renderizarPaginacion({ total_paginas: 0 }, irAPagina);
      return;
    }

    renderizarLista(documentos);
    renderizarPaginacion(paginacion, irAPagina);
    mostrarListado();
  } catch (error) {
    mostrarError(error.message);
    actualizarEstadoApi(false);
  }
}

/** Refresca las tarjetas de resumen. Si falla, no interrumpe el listado. */
async function cargarResumen() {
  try {
    const estadisticas = await obtenerEstadisticas();
    renderizarResumen(estadisticas, filtrarPorTipo);
  } catch {
    renderizarResumen(null);
  }
}

/** Vuelve a cargar listado y resumen después de crear, editar o eliminar. */
async function refrescar() {
  await Promise.all([cargarDocumentos(), cargarResumen()]);
}

function irAPagina(pagina) {
  estado.pagina = pagina;
  cargarDocumentos();
  document.getElementById('contenido-principal').scrollIntoView({ behavior: 'smooth' });
}

function filtrarPorTipo(codigoTipo) {
  document.getElementById('campoTipo').value = codigoTipo;
  estado.pagina = 1;
  cargarDocumentos();
}

// -------------------------------------------------------------------- ACCIONES

async function verDocumento(id) {
  try {
    const documento = await obtenerDocumento(id);
    abrirDetalle(documento);
  } catch (error) {
    avisar(error.message, 'error');
  }
}

async function editarDocumento(id) {
  try {
    const documento = await obtenerDocumento(id);
    abrirParaEditar(documento);
  } catch (error) {
    avisar(error.message, 'error');
  }
}

async function pedirEliminar(id) {
  try {
    const documento = await obtenerDocumento(id);
    abrirConfirmacion(documento);
  } catch (error) {
    avisar(error.message, 'error');
  }
}

/** Guarda el documento: crea si no hay id, actualiza si lo hay. */
async function guardarDocumento(id, documento) {
  try {
    if (id) {
      await actualizarDocumento(id, documento);
      avisar('Documento actualizado correctamente.');
    } else {
      await crearDocumento(documento);
      avisar('Documento creado correctamente.');
      estado.pagina = 1; // el nuevo documento aparece primero
    }

    cerrarFormulario();
    await refrescar();
  } catch (error) {
    if (error instanceof ErrorApi && (error.codigo === 422 || error.codigo === 400)) {
      // Errores de validación: se muestran dentro del formulario, campo por campo.
      mostrarErroresDelServidor(error.errores, error.message);
    } else {
      avisar(error.message, 'error');
    }
  }
}

async function confirmarEliminacion(id) {
  try {
    await eliminarDocumento(id);
    cerrarConfirmacion();
    avisar('Documento eliminado correctamente.');
    await refrescar();
  } catch (error) {
    cerrarConfirmacion();
    avisar(error.message, 'error');
  }
}

// ----------------------------------------------------------------- ARRANQUE

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Conectar los eventos de cada componente.
  conectarFiltros(() => {
    estado.pagina = 1; // al filtrar se vuelve siempre a la primera página
    cargarDocumentos();
  });

  conectarAcciones({
    alVer: verDocumento,
    alEditar: editarDocumento,
    alEliminar: pedirEliminar,
  });

  conectarFormulario(guardarDocumento);
  conectarConfirmacion(confirmarEliminacion);
  conectarBotonEditar(editarDocumento);

  document.getElementById('btnNuevoDocumento').addEventListener('click', abrirParaCrear);
  document.getElementById('btnReintentar').addEventListener('click', refrescar);

  // 2. Verificar que la API responda antes de pedir datos.
  try {
    await verificarEstadoApi();
    actualizarEstadoApi(true);
  } catch {
    actualizarEstadoApi(false);
    mostrarError('No se pudo conectar con el servidor. Verifique que el Backend esté encendido en ' +
                 'http://127.0.0.1:8010 y vuelva a intentar.');
    return;
  }

  // 3. Cargar el catálogo de tipos una sola vez y compartirlo entre componentes.
  try {
    const tipos = await obtenerTiposDocumento();
    cargarTiposEnFiltro(tipos);
    cargarTiposEnFormulario(tipos);
  } catch (error) {
    avisar('No se pudieron cargar los tipos de documento.', 'error');
  }

  // 4. Primera carga de datos.
  await refrescar();
});
