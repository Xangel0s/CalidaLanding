// Script de debug para acordeón - Pegar en consola del navegador

console.log('=== DEBUG ACORDEÓN ===');

// 1. Verificar si los elementos existen
const categoriesBtn = document.getElementById('categoriesBtn');
const categoriesMenu = document.getElementById('categoriesMenu');

console.log('1. Elementos encontrados:');
console.log('   categoriesBtn:', !!categoriesBtn, categoriesBtn);
console.log('   categoriesMenu:', !!categoriesMenu, categoriesMenu);

// 2. Verificar si Utils está disponible
console.log('2. Utils disponible:', typeof Utils !== 'undefined', window.Utils);

// 3. Verificar event listeners
if (categoriesBtn) {
    console.log('3. Event listeners en categoriesBtn:');
    const listeners = getEventListeners(categoriesBtn);
    console.log('   Listeners:', listeners);
}

// 4. Verificar CSS del menú
if (categoriesMenu) {
    console.log('4. CSS del menú:');
    const styles = window.getComputedStyle(categoriesMenu);
    console.log('   opacity:', styles.opacity);
    console.log('   visibility:', styles.visibility);
    console.log('   transform:', styles.transform);
    console.log('   z-index:', styles.zIndex);
    console.log('   position:', styles.position);
}

// 5. Test manual de toggle
function testToggle() {
    console.log('5. Test manual de toggle:');
    if (categoriesMenu) {
        const wasActive = categoriesMenu.classList.contains('active');
        console.log('   Estado antes:', wasActive ? 'activo' : 'inactivo');
        
        categoriesMenu.classList.toggle('active');
        
        const isActive = categoriesMenu.classList.contains('active');
        console.log('   Estado después:', isActive ? 'activo' : 'inactivo');
        
        const newStyles = window.getComputedStyle(categoriesMenu);
        console.log('   Nueva opacity:', newStyles.opacity);
        console.log('   Nueva visibility:', newStyles.visibility);
    }
}

// 6. Agregar event listener manual para test
if (categoriesBtn && !categoriesBtn.dataset.debugListener) {
    categoriesBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('6. Click detectado en categoriesBtn');
        testToggle();
    });
    categoriesBtn.dataset.debugListener = 'true';
    console.log('6. Event listener de debug agregado');
}

// 7. Verificar si main.js se cargó
console.log('7. Scripts cargados:');
const scripts = Array.from(document.scripts);
scripts.forEach(script => {
    if (script.src.includes('main.js') || script.src.includes('utils.js')) {
        console.log('   Script:', script.src);
    }
});

console.log('=== FIN DEBUG ===');
console.log('Para hacer test manual, ejecuta: testToggle()');

// Hacer disponible la función testToggle globalmente
window.testToggle = testToggle;
