// Gestión de productos y filtros
class ProductsManager {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.currentFilters = {
            categoria: '',
            filtro: '',
            busqueda: '',
            ordenar: 'relevancia'
        };
        
        this.init();
    }

    init() {
        this.loadURLParams();
        this.setupEventListeners();
        this.loadProducts();
    }

    // Cargar parámetros de la URL
    loadURLParams() {
        const urlParams = new URLSearchParams(window.location.search);
        
        // Obtener filtros de la URL
        this.currentFilters.categoria = urlParams.get('categoria') || '';
        this.currentFilters.filtro = urlParams.get('filtro') || '';
        this.currentFilters.busqueda = urlParams.get('q') || '';
        
        // Actualizar UI según parámetros
        this.updateUIFromFilters();
    }

    // Actualizar interfaz según filtros
    updateUIFromFilters() {
        const { categoria, filtro, busqueda } = this.currentFilters;
        
        // Actualizar título y breadcrumb
        if (categoria) {
            this.updatePageTitle(this.getCategoryDisplayName(categoria));
            this.updateBreadcrumb(this.getCategoryDisplayName(categoria));
            document.getElementById('categoryFilter').value = categoria;
        } else if (filtro) {
            this.updatePageTitle(this.getFilterDisplayName(filtro));
            this.updateBreadcrumb(this.getFilterDisplayName(filtro));
            document.getElementById('tagFilter').value = filtro;
        } else if (busqueda) {
            this.updatePageTitle(`Resultados para "${busqueda}"`);
            this.updateBreadcrumb(`Búsqueda: ${busqueda}`);
            document.getElementById('searchInput').value = busqueda;
        }
    }

    // Configurar event listeners
    setupEventListeners() {
        // Filtros
        document.getElementById('categoryFilter')?.addEventListener('change', (e) => {
            this.currentFilters.categoria = e.target.value;
            this.currentFilters.filtro = ''; // Limpiar filtro de etiquetas
            document.getElementById('tagFilter').value = '';
            this.applyFilters();
        });

        document.getElementById('tagFilter')?.addEventListener('change', (e) => {
            this.currentFilters.filtro = e.target.value;
            this.currentFilters.categoria = ''; // Limpiar filtro de categoría
            document.getElementById('categoryFilter').value = '';
            this.applyFilters();
        });

        document.getElementById('sortSelect')?.addEventListener('change', (e) => {
            this.currentFilters.ordenar = e.target.value;
            this.applyFilters();
        });

        // Búsqueda
        document.getElementById('searchForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = document.getElementById('searchInput').value.trim();
            this.currentFilters.busqueda = query;
            this.applyFilters();
        });
    }

    // Cargar productos (simulado - luego será desde Decap CMS)
    async loadProducts() {
        try {
            // Mostrar loading
            this.showLoading();
            
            // Simulación de productos (después será desde archivos MD de Decap CMS)
            this.products = this.getMockProducts();
            
            // Aplicar filtros iniciales
            this.applyFilters();
            
        } catch (error) {
            console.error('Error loading products:', error);
            this.showError();
        }
    }

    // Aplicar filtros y mostrar productos
    applyFilters() {
        let filtered = [...this.products];
        
        // Filtrar por categoría
        if (this.currentFilters.categoria) {
            filtered = filtered.filter(product => 
                product.category === this.currentFilters.categoria
            );
        }
        
        // Filtrar por etiquetas
        if (this.currentFilters.filtro) {
            filtered = filtered.filter(product => 
                product.tags && product.tags.includes(this.currentFilters.filtro)
            );
        }
        
        // Filtrar por búsqueda
        if (this.currentFilters.busqueda) {
            const query = this.currentFilters.busqueda.toLowerCase();
            filtered = filtered.filter(product => 
                product.title.toLowerCase().includes(query) ||
                product.brand.toLowerCase().includes(query) ||
                product.description.toLowerCase().includes(query)
            );
        }
        
        // Ordenar
        filtered = this.sortProducts(filtered, this.currentFilters.ordenar);
        
        this.filteredProducts = filtered;
        this.renderProducts();
        this.updateProductsCount();
        this.updateURL();
    }

    // Ordenar productos
    sortProducts(products, sortBy) {
        switch (sortBy) {
            case 'precio-menor':
                return products.sort((a, b) => a.price_online - b.price_online);
            case 'precio-mayor':
                return products.sort((a, b) => b.price_online - a.price_online);
            case 'nombre':
                return products.sort((a, b) => a.title.localeCompare(b.title));
            case 'nuevos':
                return products.sort((a, b) => new Date(b.date) - new Date(a.date));
            default:
                return products; // relevancia (orden original)
        }
    }

    // Renderizar productos
    renderProducts() {
        const container = document.getElementById('productsGrid');
        const loadingState = document.getElementById('loadingState');
        const emptyState = document.getElementById('emptyState');
        
        if (!container) return;
        
        // Ocultar loading
        if (loadingState) loadingState.style.display = 'none';
        
        if (this.filteredProducts.length === 0) {
            container.style.display = 'none';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }
        
        // Ocultar empty state
        if (emptyState) emptyState.style.display = 'none';
        container.style.display = 'grid';
        
        // Renderizar productos
        container.innerHTML = this.filteredProducts.map(product => 
            this.createProductCard(product)
        ).join('');
    }

    // Crear HTML de producto
    createProductCard(product) {
        const discountBadge = product.discount 
            ? `<span class="discount-badge">-${product.discount}%</span>`
            : '';
        
        const regularPrice = product.price_regular 
            ? `<div class="price-row">
                <span class="price-label">Regular:</span>
                <span class="price-regular">S/ ${product.price_regular.toFixed(2)}</span>
               </div>`
            : '';

        return `
            <div class="product-card" onclick="goToProduct('${product.slug}')">
                <div class="product-badges">
                    ${discountBadge}
                </div>
                <div class="product-actions">
                    <button class="product-action favorite" onclick="event.stopPropagation(); toggleFavorite('${product.slug}')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                    </button>
                    <button class="product-action view" onclick="event.stopPropagation(); quickView('${product.slug}')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </button>
                </div>
                <div class="product-image">
                    <img src="${product.image}" alt="${product.title}" loading="lazy">
                </div>
                <div class="product-info">
                    <div class="product-brand">${product.brand}</div>
                    <h3 class="product-title">${product.title}</h3>
                    <div class="product-pricing">
                        ${regularPrice}
                        <div class="price-row main">
                            <span class="price-label">Online:</span>
                            <span class="price-online">S/ ${product.price_online.toFixed(2)}</span>
                        </div>
                        <div class="price-installments">
                            <span>Desde: <strong>S/ ${product.monthly_payment.toFixed(2)}</strong> al mes</span>
                        </div>
                    </div>
                    <button class="btn btn-primary product-btn" onclick="event.stopPropagation(); goToProduct('${product.slug}')">Ver producto</button>
                </div>
            </div>
        `;
    }

    // Funciones auxiliares
    updatePageTitle(title) {
        document.getElementById('productsTitle').textContent = title;
        document.title = `${title} - Credicálidda`;
    }

    updateBreadcrumb(title) {
        document.getElementById('breadcrumbCurrent').textContent = title;
    }

    updateProductsCount() {
        const count = this.filteredProducts.length;
        const total = this.products.length;
        document.getElementById('productsCount').textContent = 
            `Mostrando ${count} de ${total} productos`;
    }

    updateURL() {
        const params = new URLSearchParams();
        
        if (this.currentFilters.categoria) params.set('categoria', this.currentFilters.categoria);
        if (this.currentFilters.filtro) params.set('filtro', this.currentFilters.filtro);
        if (this.currentFilters.busqueda) params.set('q', this.currentFilters.busqueda);
        
        const newURL = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
        window.history.replaceState({}, '', newURL);
    }

    showLoading() {
        const loadingState = document.getElementById('loadingState');
        if (loadingState) loadingState.style.display = 'block';
    }

    showError() {
        const container = document.getElementById('productsGrid');
        if (container) {
            container.innerHTML = `
                <div class="error-state">
                    <p>Error al cargar los productos. Por favor, intenta de nuevo.</p>
                </div>
            `;
        }
    }

    getCategoryDisplayName(category) {
        const names = {
            'tecnologia': 'Tecnología',
            'electrodomesticos': 'Electrodomésticos',
            'muebles': 'Muebles',
            'motos-scooters': 'Motos y Scooters',
            'construccion': 'Construcción y acabados',
            'gamer': 'Gamer',
            'celulares': 'Celulares',
            'televisores': 'Televisores'
        };
        return names[category] || category;
    }

    getFilterDisplayName(filter) {
        const names = {
            'ofertas': '🔥 Ofertas',
            'combos': '📦 Combos',
            'novedades': '✨ Novedades',
            'reacondicionados': '♻️ Reacondicionados',
            'destacado': 'Destacados',
            'mas-vendido': 'Más Vendidos'
        };
        return names[filter] || filter;
    }

    // Datos mock (después serán reemplazados por Decap CMS)
    getMockProducts() {
        return [
            {
                slug: 'televisor-lg-55ut7300psa',
                title: 'Televisor LG 55UT7300PSA UHD/4K SMART WebOS c/Magic Remote + Audifonos Bluetooth MERTEC',
                brand: 'LG',
                image: 'images/productos_destacados/tv-lg.jpg',
                description: 'Televisor LG 55" 4K UHD Smart TV con WebOS',
                price_regular: 2939.00,
                price_online: 1659.00,
                monthly_payment: 62.60,
                discount: 44,
                category: 'televisores',
                tags: ['destacado', 'oferta'],
                stock: 5,
                date: '2024-01-15'
            },
            {
                slug: 'iphone-14-pro-negro',
                title: 'CELULAR APPLE IPHONE 14 PRO ESIM 2022 6GB 128GB NEGRO (REACONDICIONADO)',
                brand: 'APPLE',
                image: 'images/productos_destacados/iphone-14-pro.jpg',
                description: 'iPhone 14 Pro reacondicionado en excelente estado',
                price_online: 3223.00,
                monthly_payment: 197.17,
                category: 'tecnologia',
                tags: ['reacondicionado', 'destacado'],
                stock: 3,
                date: '2024-01-10'
            },
            {
                slug: 'xiaomi-redmi-note-14',
                title: 'Celular Xiaomi Redmi Note 14 6.67" 8GB 256GB Negro Medianoche',
                brand: 'XIAOMI',
                image: 'images/productos_destacados/xiaomi-redmi-note-14.jpg',
                description: 'Último modelo de Xiaomi con gran rendimiento',
                price_regular: 1729.00,
                price_online: 889.00,
                monthly_payment: 54.38,
                discount: 49,
                category: 'tecnologia',
                tags: ['novedad', 'oferta'],
                stock: 10,
                date: '2024-01-20'
            }
            // Más productos aquí...
        ];
    }
}

// Funciones globales
function goToProduct(slug) {
    window.location.href = `/${slug}/p`;
}

function toggleFavorite(slug) {
    // Implementar lógica de favoritos
    console.log('Toggle favorite:', slug);
}

function quickView(slug) {
    // Implementar vista rápida
    console.log('Quick view:', slug);
}

function clearFilters() {
    if (window.productsManager) {
        window.productsManager.currentFilters = {
            categoria: '',
            filtro: '',
            busqueda: '',
            ordenar: 'relevancia'
        };
        
        // Limpiar form controls
        document.getElementById('categoryFilter').value = '';
        document.getElementById('tagFilter').value = '';
        document.getElementById('searchInput').value = '';
        document.getElementById('sortSelect').value = 'relevancia';
        
        window.productsManager.applyFilters();
    }
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('productsGrid')) {
        window.productsManager = new ProductsManager();
    }
});
