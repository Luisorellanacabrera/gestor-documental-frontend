/**
 * Configuración de la aplicación.
 *
 * Seguridad: este archivo solo contiene la dirección pública de la API.
 * No se guardan aquí usuarios, contraseñas ni tokens: todo lo que está en el
 * Frontend viaja al navegador del usuario y cualquiera puede leerlo.
 */

export const CONFIG = {
  // Dirección del Backend desarrollado en la asignatura Desarrollo Backend.
  // Para cambiar de equipo o de servidor basta con modificar esta línea.
  URL_API: 'http://127.0.0.1:8010/api',

  // Cantidad de documentos por página en el listado.
  DOCUMENTOS_POR_PAGINA: 10,

  // Milisegundos de espera antes de buscar mientras el usuario escribe.
  ESPERA_BUSQUEDA: 400,

  // Extensiones que la escuela acepta para los archivos adjuntos.
  // Debe coincidir con la validación del Backend.
  EXTENSIONES_PERMITIDAS: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'odt', 'jpg', 'jpeg', 'png'],
};
