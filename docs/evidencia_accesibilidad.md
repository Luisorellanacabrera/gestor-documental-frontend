# Evidencia — Prueba de accesibilidad

Gestor Documental, Escuela Básica G-733 Chorombo Bajo — Evaluación Unidad 3, Desarrollo Frontend.

## Método

Se ejecutó un guion en la consola del navegador, sobre la aplicación en funcionamiento, que:

1. Calcula la relación de contraste de cada texto con la fórmula de luminancia relativa de
   WCAG 2.1 (criterio 1.4.3), comparando el color del texto con el fondo real heredado.
2. Verifica que todo control de formulario tenga etiqueta asociada (`<label for>`, `aria-label`
   o `aria-labelledby`).
3. Verifica que todo botón tenga nombre accesible.
4. Revisa la jerarquía de encabezados y el idioma declarado.
5. Comprueba la existencia de regiones `aria-live` para los mensajes dinámicos.

## Resultado de la revisión estructural

| Criterio WCAG | Verificación | Resultado |
|---|---|---|
| 3.3.2 Etiquetas o instrucciones | Controles de formulario sin etiqueta | 0 |
| 1.1.1 Contenido no textual | Imágenes sin atributo `alt` | 0 |
| 4.1.2 Nombre, función, valor | Botones sin nombre accesible | 0 |
| 1.3.1 Información y relaciones | Encabezados `<h1>` / saltos de nivel | 1 h1, 0 saltos |
| 3.1.1 Idioma de la página | Atributo `lang` | `es` |
| 1.3.1 Tabla de datos | Celdas `<th scope>` y `<caption>` | 13 con scope, con caption |
| 4.1.3 Mensajes de estado | Regiones `aria-live` | Presente |

## Resultado de la medición de contraste — ANTES

| Elemento | Contraste | Mínimo exigido | ¿Cumple? |
|---|---|---|---|
| Título principal | 11.77:1 | 4.5:1 | Sí |
| **Texto descriptivo** | **4.37:1** | **4.5:1** | **NO** |
| Etiqueta de formulario | 12.63:1 | 4.5:1 | Sí |
| Texto de ayuda | 4.69:1 | 4.5:1 | Sí |
| Encabezado de tabla | 11.63:1 | 4.5:1 | Sí |
| Celda de descripción | 5.95:1 | 4.5:1 | Sí |
| Etiqueta de tarjeta de resumen | 11.63:1 | 4.5:1 | Sí |
| Distintivos de tipo documental | 9.98:1 (todos iguales) | 4.5:1 | Sí, pero indistinguibles |
| Estado de la API en la barra | 11.63:1 | 4.5:1 | Sí |

## Problemas identificados

### Problema 1 — Contraste insuficiente en el texto descriptivo (WCAG 1.4.3)

El párrafo de introducción usaba la clase `text-secondary` de Bootstrap, cuyo color `#6c757d`
sobre el fondo `#f5f7fa` de la aplicación alcanza **4.37:1**, por debajo del mínimo de 4.5:1.
Afecta a personas con baja visión y a cualquiera que use el sistema con mucha luz ambiente.

**Mejora implementada** en `css/estilos.css`:

```css
.text-secondary {
  color: #5a6570 !important;
}
```

### Problema 2 — El color no distinguía los tipos documentales (WCAG 1.4.1)

Al medir los distintivos se detectó que **todos** entregaban el mismo valor de contraste, señal de
que compartían color. La causa era de especificidad de CSS: la regla `.badge[class*='tipo-']`
(especificidad 0,2,0) tenía más peso que `.tipo-memo` (0,1,0), de modo que su color y fondo grises
pisaban los colores definidos para cada tipo.

**Mejora implementada:** los colores se movieron a reglas con la misma especificidad
(`.badge.tipo-memo`, `.badge.tipo-oficio`, etc.) y la regla general quedó solo con la tipografía.

## Resultado de la medición — DESPUÉS

| Elemento | Contraste | ¿Cumple? |
|---|---|---|
| Texto descriptivo | **5.54:1** | Sí |
| Distintivo «Memo» | 8.64:1 | Sí |
| Distintivo «Oficio» | 8.22:1 | Sí |
| Distintivo «Citación de apoderados» | 7.05:1 | Sí |
| Distintivo «Acuerdo de apoderados» | 8.91:1 | Sí |
| Distintivo «Reunión comunal» | 8.08:1 | Sí |
| Distintivo «Permiso administrativo» | 8.54:1 | Sí |

Cada tipo documental quedó con su propio color, todos por sobre el mínimo exigido.

## Prueba de navegación por teclado (WCAG 2.1.1 y 2.4.3)

Se recorrió el orden de tabulación de la página:

| Orden | Elemento |
|---|---|
| 1 | Saltar al contenido principal |
| 2 | Nuevo documento |
| 3 a 8 | Tarjetas de resumen por tipo |
| 9 | Campo de búsqueda |
| 10 | Selector de tipo |
| 11 y 12 | Fechas desde y hasta |
| 13 | Limpiar filtros |
| 14 en adelante | Acciones de cada fila de la tabla |

El orden de tabulación coincide con el orden visual. El enlace para saltar al contenido es el
primer elemento, como corresponde. El foco es visible en todos los elementos gracias al contorno
amarillo de 3 px definido en `css/estilos.css`.
