// ===== MANAGER DE ANIMACIONES =====
class AnimationsManager {
    constructor() {
        this.init();
    }

    init() {
        // Solo configurar animaciones que no interfieran con main.js
        this.setupScrollAnimations();
        this.setupHoverEffects();
        this.enhanceExistingAccordion();
    }

    // ===== MEJORAR ACORDEÓN EXISTENTE =====
    enhanceExistingAccordion() {
        const categoriesMenu = document.getElementById('categoriesMenu');
        
        if (!categoriesMenu) {
            console.warn('Elemento categoriesMenu no encontrado');
            return;
        }

        // Escuchar cuando se abra/cierre el acordeón desde main.js
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const hasActive = categoriesMenu.classList.contains('active');
                    if (hasActive) {
                        this.animateAccordionItems(categoriesMenu);
                    }
                }
            });
        });

        observer.observe(categoriesMenu, {
            attributes: true,
            attributeFilter: ['class']
        });
    }

    animateAccordionItems(menu) {
        const items = menu.querySelectorAll('.category-item');
        items.forEach((item, index) => {
            // Resetear la animación
            item.style.opacity = '0';
            item.style.transform = 'translateX(-20px)';
            
            // Aplicar animación con delay
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            }, index * 50);
        });
    }

    // ===== ANIMACIONES AL SCROLL =====
    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'fadeIn 0.6s ease-out forwards';
                }
            });
        }, observerOptions);

        // Observar elementos que deben animarse al entrar en vista
        const animatedElements = document.querySelectorAll('.product-card, .filter-section, .catalog-toolbar');
        animatedElements.forEach(el => {
            el.style.opacity = '0';
            observer.observe(el);
        });
    }

    // ===== EFECTOS HOVER MEJORADOS =====
    setupHoverEffects() {
        // Botones principales
        const buttons = document.querySelectorAll('.btn, .header-action-link');
        buttons.forEach(btn => {
            btn.addEventListener('mouseenter', () => this.addHoverEffect(btn));
            btn.addEventListener('mouseleave', () => this.removeHoverEffect(btn));
        });

        // Tarjetas de productos
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach(card => {
            card.addEventListener('mouseenter', () => this.addCardHoverEffect(card));
            card.addEventListener('mouseleave', () => this.removeCardHoverEffect(card));
        });

        // Quick links
        const quickLinks = document.querySelectorAll('.quick-link');
        quickLinks.forEach(link => {
            link.addEventListener('mouseenter', () => this.addQuickLinkHover(link));
            link.addEventListener('mouseleave', () => this.removeQuickLinkHover(link));
        });
    }

    addHoverEffect(element) {
        element.style.transform = 'translateY(-2px)';
        element.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    }

    removeHoverEffect(element) {
        element.style.transform = 'translateY(0)';
        element.style.boxShadow = '';
    }

    addCardHoverEffect(card) {
        card.style.transform = 'translateY(-5px)';
        card.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.15)';
        
        const image = card.querySelector('img');
        if (image) {
            image.style.transform = 'scale(1.05)';
        }
    }

    removeCardHoverEffect(card) {
        card.style.transform = 'translateY(0)';
        card.style.boxShadow = '';
        
        const image = card.querySelector('img');
        if (image) {
            image.style.transform = 'scale(1)';
        }
    }

    addQuickLinkHover(link) {
        link.style.transform = 'translateY(-2px) scale(1.02)';
    }

    removeQuickLinkHover(link) {
        link.style.transform = 'translateY(0) scale(1)';
    }
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
    // Esperar un poco para que main.js se inicialice primero
    setTimeout(() => {
        window.animationsManager = new AnimationsManager();
        console.log('✅ Sistema de animaciones inicializado');
    }, 100);
});
