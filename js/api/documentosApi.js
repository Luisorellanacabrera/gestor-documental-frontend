/**
 * Capa de consumo de la API del Gestor Documental.
 *
 * Todas las llamadas al Backend pasan por este archivo. Así, si mañana cambia
 * una URL o el formato de la respuesta, se corrige en un solo lugar y no en
 * cada componente.
 */

import { CONFIG } from '../config.js';

/**
 * Error propio de la aplicación.
 * Guarda el código HTTP y los errores de validación que devuelve el Backend,
 * para que los componentes decidan cómo mostrarlos.
 */
export class ErrorApi extends Error {
  constructor(mensaje, codigo = 0, errores = []) {
    super(mensaje);
    this.name = 'ErrorApi';
    this.codigo = codigo;
    this.errores = errores;
  }
}

/**
 * Realiza la petición y normaliza la respuesta.
 * Es privada del módulo: los componentes usan las funciones de más abajo.
 */
async function pedir(ruta, opciones = {}) {
  let respuesta;

  try {
    respuesta = await fetch(CONFIG.URL_API + ruta, {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      ...opciones,
    });
  } catch (error) {
    // Si fetch falla es porque el servidor no responde (apagado, sin red o CORS).
    // Al usuario se le explica en lenguaje simple, sin detalle técnico.
    throw new ErrorApi(
      'No se pudo conectar con el servidor. Verifique que el Backend esté encendido.',
      0
    );
  }

  // 204 No Content no trae cuerpo que interpretar.
  if (respuesta.status === 204) {
    return { exito: true, datos: null };
  }

  let cuerpo;
  try {
    cuerpo = await respuesta.json();
  } catch {
    throw new ErrorApi('El servidor respondió en un formato inesperado.', respuesta.status);
  }

  if (!respuesta.ok || cuerpo.exito === false) {
    throw new ErrorApi(
      cuerpo.mensaje || 'Ocurrió un error al procesar la solicitud.',
      respuesta.status,
      cuerpo.errores || []
    );
  }

  return cuerpo;
}

// ------------------------------------------------------------------ LEER

/**
 * Lista los documentos aplicando los filtros indicados.
 * Solo se envían los filtros con valor, para no ensuciar la URL.
 */
export async function listarDocumentos(filtros = {}) {
  const parametros = new URLSearchParams();

  if (filtros.buscar) parametros.set('buscar', filtros.buscar);
  if (filtros.tipo) parametros.set('tipo', filtros.tipo);
  if (filtros.desde) parametros.set('desde', filtros.desde);
  if (filtros.hasta) parametros.set('hasta', filtros.hasta);

  parametros.set('pagina', filtros.pagina || 1);
  parametros.set('limite', CONFIG.DOCUMENTOS_POR_PAGINA);

  const cuerpo = await pedir('/documentos?' + parametros.toString());

  return {
    documentos: cuerpo.datos || [],
    paginacion: cuerpo.paginacion || { pagina: 1, total: 0, total_paginas: 0 },
  };
}

export async function obtenerDocumento(id) {
  const cuerpo = await pedir('/documentos/' + id);
  return cuerpo.datos;
}

/**
 * Tipos de documento.
 *
 * Optimización: el catálogo casi nunca cambia, así que se guarda en memoria la
 * primera vez y las siguientes llamadas no vuelven a pedirlo al servidor.
 */
let cacheTipos = null;

export async function obtenerTiposDocumento() {
  if (cacheTipos) {
    return cacheTipos;
  }

  const cuerpo = await pedir('/tipos-documento');
  cacheTipos = cuerpo.datos || [];

  return cacheTipos;
}

export async function obtenerEstadisticas() {
  const cuerpo = await pedir('/estadisticas');
  return cuerpo.datos;
}

export async function verificarEstadoApi() {
  const cuerpo = await pedir('/salud');
  return cuerpo.exito === true;
}

// --------------------------------------------------- CREAR / ACTUALIZAR / ELIMINAR

export async function crearDocumento(documento) {
  const cuerpo = await pedir('/documentos', {
    method: 'POST',
    body: JSON.stringify(documento),
  });

  return cuerpo.datos;
}

export async function actualizarDocumento(id, documento) {
  const cuerpo = await pedir('/documentos/' + id, {
    method: 'PUT',
    body: JSON.stringify(documento),
  });

  return cuerpo.datos;
}

export async function eliminarDocumento(id) {
  await pedir('/documentos/' + id, { method: 'DELETE' });
  return true;
}
