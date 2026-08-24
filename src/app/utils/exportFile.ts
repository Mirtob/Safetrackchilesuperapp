/**
 * Descarga de archivos generados en el navegador — SafeTrack Chile
 *
 * Centraliza el CSV y el texto plano para que cada botón de "Exportar" no tenga
 * que rearmar el mismo blob. El CSV usa punto y coma porque Excel en español
 * espera ese separador: con coma, el archivo se abre entero en una columna.
 */

/** Fuerza la descarga de un contenido generado en memoria. */
export const downloadBlob = (content: BlobPart, filename: string, mime: string): void => {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

/** Escapa un valor para CSV: comillas dobladas y campos entrecomillados. */
const escapeCell = (value: unknown): string => {
  const text = String(value ?? '');
  return /[";\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

/** Marca de orden de bytes: sin ella Excel muestra las tildes rotas. */
const BOM = String.fromCharCode(0xFEFF);

export interface CsvColumn<T> {
  header: string;
  value: (row: T) => unknown;
}

/** Genera y descarga un CSV a partir de filas y una definición de columnas. */
export const downloadCsv = <T>(
  rows: T[],
  columns: CsvColumn<T>[],
  filename: string
): void => {
  const header = columns.map(c => escapeCell(c.header)).join(';');
  const body = rows.map(row => columns.map(c => escapeCell(c.value(row))).join(';'));
  const csv = BOM + [header, ...body].join('\r\n');

  downloadBlob(csv, filename, 'text/csv;charset=utf-8');
};

/** Nombre de archivo con la fecha del día, para no sobrescribir descargas. */
export const datedFilename = (base: string, extension: string): string =>
  `${base}-${new Date().toISOString().split('T')[0]}.${extension}`;

/**
 * Comparte usando el diálogo nativo del sistema y, si no existe, copia el
 * texto. En un teléfono abre WhatsApp o correo directamente; en escritorio,
 * donde la Web Share API casi nunca está, el portapapeles es el equivalente útil.
 */
export const shareOrCopy = async (
  data: { title: string; text: string; url?: string }
): Promise<'shared' | 'copied' | 'failed'> => {
  try {
    if (navigator.share) {
      await navigator.share(data);
      return 'shared';
    }
  } catch (err) {
    // El usuario canceló el diálogo: no es un fallo que haya que reportar.
    if ((err as Error)?.name === 'AbortError') return 'shared';
  }

  try {
    await navigator.clipboard.writeText(`${data.text}${data.url ? `\n${data.url}` : ''}`);
    return 'copied';
  } catch {
    return 'failed';
  }
};
