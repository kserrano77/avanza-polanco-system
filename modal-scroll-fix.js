// Solución directa para el modal de estudiantes scrolleable
// Ejecutar este código en la consola del navegador como solución temporal

// Función para hacer el modal scrolleable
function fixStudentModal() {
  // Buscar el modal de estudiantes
  const modal = document.querySelector('[role="dialog"]');
  
  if (modal) {
    // Aplicar estilos directamente
    modal.style.maxHeight = '85vh';
    modal.style.overflowY = 'auto';
    modal.style.display = 'flex';
    modal.style.flexDirection = 'column';
    
    console.log('✅ Modal de estudiantes corregido para scroll');
  } else {
    console.log('❌ Modal no encontrado');
  }
}

// Ejecutar la función
fixStudentModal();

// También crear un observer para aplicar el fix automáticamente
const observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    if (mutation.type === 'childList') {
      const modal = document.querySelector('[role="dialog"]');
      if (modal && !modal.style.maxHeight) {
        fixStudentModal();
      }
    }
  });
});

// Observar cambios en el DOM
observer.observe(document.body, {
  childList: true,
  subtree: true
});

console.log('🚀 Fix automático del modal activado');
