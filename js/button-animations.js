// ===== ANIMACIONES DINÁMICAS PARA BOTONES =====

class ButtonAnimations {
    constructor() {
        this.init();
    }

    init() {
        this.setupClickAnimations();
        this.setupHoverEffects();
        this.setupRippleEffect();
    }

    // Configurar animaciones de click
    setupClickAnimations() {
        const buttons = document.querySelectorAll('button, .btn, .category-card, .quick-link');
        
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.addClickAnimation(e.target);
            });
        });
    }

    // Agregar animación de click
    addClickAnimation(element) {
        // Remover clases existentes
        element.classList.remove('animate-click');
        
        // Forzar reflow
        void element.offsetWidth;
        
        // Agregar clase de animación
        element.classList.add('animate-click');
        
        // Remover después de la animación
        setTimeout(() => {
            element.classList.remove('animate-click');
        }, 200);
    }

    // Configurar efectos hover dinámicos
    setupHoverEffects() {
        const interactiveElements = document.querySelectorAll('.category-card, .product-card, .btn');
        
        interactiveElements.forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                this.enhanceHoverEffect(e.target);
            });
            
            element.addEventListener('mouseleave', (e) => {
                this.resetHoverEffect(e.target);
            });
        });
    }

    // Mejorar efecto hover
    enhanceHoverEffect(element) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Calcular dirección del mouse
        element.addEventListener('mousemove', (e) => {
            const mouseX = e.clientX;
            const mouseY = e.clientY;
            
            const deltaX = (mouseX - centerX) / rect.width * 10;
            const deltaY = (mouseY - centerY) / rect.height * 10;
            
            element.style.transform = `translateY(-4px) rotateX(${deltaY}deg) rotateY(${deltaX}deg)`;
        });
    }

    // Resetear efecto hover
    resetHoverEffect(element) {
        element.style.transform = '';
        element.removeEventListener('mousemove', () => {});
    }

    // Configurar efecto ripple
    setupRippleEffect() {
        const rippleButtons = document.querySelectorAll('.btn, button');
        
        rippleButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.createRipple(e);
            });
        });
    }

    // Crear efecto ripple
    createRipple(event) {
        const button = event.currentTarget;
        const circle = document.createElement('span');
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;

        const rect = button.getBoundingClientRect();
        const x = event.clientX - rect.left - radius;
        const y = event.clientY - rect.top - radius;

        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${x}px`;
        circle.style.top = `${y}px`;
        circle.classList.add('ripple-effect');

        const existingRipple = button.getElementsByClassName('ripple-effect')[0];
        if (existingRipple) {
            existingRipple.remove();
        }

        button.appendChild(circle);

        // Remover el ripple después de la animación
        setTimeout(() => {
            circle.remove();
        }, 600);
    }

    // Agregar animación de pulso a botones importantes
    addPulseToImportantButtons() {
        const importantButtons = document.querySelectorAll('.btn-primary, .btn-whatsapp');
        
        importantButtons.forEach(button => {
            // Agregar pulso cada 3 segundos
            setInterval(() => {
                if (!button.matches(':hover')) {
                    button.classList.add('pulse');
                    setTimeout(() => {
                        button.classList.remove('pulse');
                    }, 2000);
                }
            }, 3000);
        });
    }

    // Animación de entrada para elementos
    animateOnScroll() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-slide-up');
                }
            });
        }, {
            threshold: 0.1
        });

        const animatedElements = document.querySelectorAll('.btn, .category-card, .product-card');
        animatedElements.forEach(el => observer.observe(el));
    }
}

// CSS adicional para las animaciones
const additionalStyles = `
<style>
.animate-click {
    transform: scale(0.95) !important;
    transition: transform 0.1s ease !important;
}

.ripple-effect {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.6);
    transform: scale(0);
    animation: ripple-animation 0.6s linear;
    pointer-events: none;
    z-index: 1;
}

@keyframes ripple-animation {
    to {
        transform: scale(4);
        opacity: 0;
    }
}

.pulse {
    animation: pulse 2s ease-in-out;
}

@keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
}

/* Efecto 3D para hover */
.category-card,
.product-card {
    transform-style: preserve-3d;
    perspective: 1000px;
}
</style>
`;

// Inyectar estilos adicionales
document.head.insertAdjacentHTML('beforeend', additionalStyles);

// Inicializar animaciones cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const buttonAnimations = new ButtonAnimations();
    
    // Agregar animaciones especiales después de 2 segundos
    setTimeout(() => {
        buttonAnimations.addPulseToImportantButtons();
        buttonAnimations.animateOnScroll();
    }, 2000);
});

// Exportar para uso global
window.ButtonAnimations = ButtonAnimations;
