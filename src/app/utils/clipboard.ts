/**
 * Copia texto al portapapeles con fallback para navegadores que bloquean Clipboard API
 * @param text - Texto a copiar
 * @returns Promise que resuelve true si tuvo éxito
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // Método 1: Intentar con Clipboard API moderna (solo si está disponible)
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      console.log('✅ Copiado exitosamente usando Clipboard API');
      return true;
    } catch (err) {
      // Silenciosamente usar fallback - esto es esperado en algunos navegadores
      // console.warn('Clipboard API no disponible, usando método alternativo');
    }
  }

  // Método 2: Fallback usando textarea temporal (funciona en todos los navegadores)
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // Hacer el textarea invisible pero accesible
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    textArea.style.opacity = '0';
    textArea.style.pointerEvents = 'none';
    textArea.setAttribute('readonly', '');
    textArea.contentEditable = 'true';
    textArea.readOnly = false;
    
    document.body.appendChild(textArea);
    
    // Para iOS Safari
    if (navigator.userAgent.match(/ipad|ipod|iphone/i)) {
      const range = document.createRange();
      range.selectNodeContents(textArea);
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
      textArea.setSelectionRange(0, text.length);
    } else {
      // Para otros navegadores
      textArea.focus();
      textArea.select();
      textArea.setSelectionRange(0, text.length);
    }
    
    // Copiar usando el comando execCommand (deprecated pero funciona como fallback)
    const successful = document.execCommand('copy');
    
    // Limpiar
    document.body.removeChild(textArea);
    
    if (successful) {
      console.log('✅ Copiado exitosamente usando método alternativo');
      return true;
    } else {
      console.error('❌ Método alternativo de copia falló');
      return false;
    }
  } catch (err) {
    console.error('❌ Error al copiar al portapapeles:', err);
    return false;
  }
}