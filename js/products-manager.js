// Gestión de productos y filtros
class ProductsManager {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.perPage = 24;
        this.currentPage = 1;
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
        const page = parseInt(urlParams.get('page') || '1', 10);
        this.currentPage = Number.isNaN(page) || page < 1 ? 1 : page;
        
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

    // Cargar productos desde el catálogo CMS
    async loadProducts() {
        try {
            // Mostrar loading
            this.showLoading();
            
            // Cargar catálogo real
            const catalog = (window.CMSProducts && typeof CMSProducts.loadCatalog === 'function')
                ? await CMSProducts.loadCatalog()
                : [];

            // Normalizar y filtrar productos visibles
            this.products = (catalog || [])
                .filter(it => it && (it.visible !== false))
                .map(it => ({
                    slug: it.slug,
                    title: it.title || it.slug,
                    brand: it.brand || '',
                    image: it.image || '/images/products/placeholder.jpg',
                    description: it.description || '',
                    price_regular: typeof it.price_regular === 'number' ? it.price_regular : null,
                    price_online: typeof it.price_online === 'number' ? it.price_online : null,
                    monthly_payment: typeof it.monthly_payment === 'number' ? it.monthly_payment : null,
                    discount: typeof it.discount === 'number' ? it.discount : null,
                    category: it.categoria || it.category || '',
                    tags: Array.isArray(it.tags) ? it.tags : [],
                    stock: typeof it.stock === 'number' ? it.stock : undefined,
                    date: it.date || it.fecha || '1970-01-01'
                }))
                // Ocultar inactivos/sin stock si se especifica stock numérico
                .filter(p => (typeof p.stock === 'number' ? p.stock > 0 : true));
            
            // Aplicar filtros iniciales
            this.applyFilters();
            
        } catch (error) {
            console.error('Error loading products:', error);
            this.showError();
        }

    // Limpieza genérica: elimina cualquier sufijo "(n)" dentro del sidebar de filtros
    scrubFilterCounts() {
        try {
            const root = document.querySelector('.filters-sidebar') || document;
            // Vaciar spans marcados como conteos
            root.querySelectorAll('.filter-count, .count, .badge').forEach(el => {
                el.textContent = '';
            });
            // Remover "(n)" al final del texto de labels/links
            root.querySelectorAll('label, a, span, div').forEach(el => {
                const txt = el.textContent;
                if (!txt) return;
                const cleaned = txt.replace(/\s*\([^()]*\)\s*$/, '');
                if (cleaned !== txt) el.textContent = cleaned;
            });
        } catch (_) { /* ignore */ }
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
        // Asegurar página válida cuando cambian filtros
        const total = this.filteredProducts.length;
        const maxPage = Math.max(1, Math.ceil(total / this.perPage));
        if (this.currentPage > maxPage) this.currentPage = maxPage;

        this.renderProducts();
        this.updateProductsCount();
        this.updateCategoryCounts();
        this.updateTagCounts();
        this.scrubFilterCounts();
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
        
        // Paginación
        const startIdx = (this.currentPage - 1) * this.perPage;
        const pageItems = this.filteredProducts.slice(startIdx, startIdx + this.perPage);

        // Renderizar productos de la página actual
        container.innerHTML = pageItems.map(product => this.createProductCard(product)).join('');
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
        const totalFiltered = this.filteredProducts.length;
        const totalAll = this.products.length;
        const start = totalFiltered === 0 ? 0 : (this.currentPage - 1) * this.perPage + 1;
        const end = totalFiltered === 0 ? 0 : Math.min(this.currentPage * this.perPage, totalFiltered);
        const el = document.getElementById('productsCount');
        if (el) el.textContent = `Mostrando ${start}-${end} de ${totalFiltered} productos`;
        // Si existe otro elemento para total global, actualizarlo también (opcional)
        const elTotal = document.getElementById('productsTotal');
        if (elTotal) elTotal.textContent = `${totalAll}`;
    }

    // Actualizar conteos por categoría en el selector (si existe)
    updateCategoryCounts() {
        const select = document.getElementById('categoryFilter');
        // En este modo, eliminamos números de los labels.
        
        // 1) Actualizar labels de <option> manteniendo su value
        if (select) {
            Array.from(select.options).forEach(opt => {
                if (!opt.value) return; // opción vacía (todas)
                const c = opt.value;
                const base = this.getCategoryDisplayName(c);
                opt.textContent = base;
            });
        }

        // 2) Actualizar lista de checkboxes si existe (patrones comunes)
        // Admite elementos <li data-category="tecnologia"> ... <span class="count"></span>
        const listItems = document.querySelectorAll('[data-category]');
        listItems.forEach(el => {
            const key = (el.getAttribute('data-category') || '').trim();
            if (!key) return;
            // Buscar un span .count o .badge y limpiarlo
            const countEl = el.querySelector('.count, .badge, .filter-count');
            if (countEl) countEl.textContent = '';
            // Reemplazar sufijo "(n)" en el texto visible
            const lbl = el.querySelector('label, a, span') || el;
            const baseText = (lbl.textContent || '').trim();
            if (baseText) lbl.textContent = baseText.replace(/\s*\([^()]*\)\s*$/, '');
        });

        // 3) Input checkbox con value de categoría y label adyacente
        const catCheckboxes = document.querySelectorAll('input[type="checkbox"][name="category"], input[type="checkbox"][data-category]');
        catCheckboxes.forEach(cb => {
            const key = (cb.getAttribute('data-category') || cb.value || '').trim();
            if (!key) return;
            let lbl = cb.closest('label');
            if (!lbl) {
                const id = cb.id;
                if (id) lbl = document.querySelector(`label[for="${CSS.escape(id)}"]`);
                if (!lbl) lbl = cb.parentElement;
            }
            if (!lbl) return;
            const baseText = (lbl.textContent || '').trim();
            const withoutCount = baseText.replace(/\s*\([^()]*\)\s*$/, '');
            lbl.textContent = withoutCount;
        });
    }

    // Actualizar conteos de filtros por etiqueta/promoción
    updateTagCounts() {
        // Reglas simples basadas en campos del catálogo
        const rules = {
            'ofertas': (p) => typeof p.discount === 'number' && p.discount > 0,
            'combos': (p) => Array.isArray(p.tags) && p.tags.includes('combo'),
            'novedades': (p) => Array.isArray(p.tags) && p.tags.includes('novedad'),
            'reacondicionados': (p) => Array.isArray(p.tags) && p.tags.includes('reacondicionado')
        };

        // 1) Select de tags si existe
        const tagSelect = document.getElementById('tagFilter');
        if (tagSelect) {
            Array.from(tagSelect.options).forEach(opt => {
                if (!opt.value) return;
                const key = opt.value;
                const base = this.getFilterDisplayName(key);
                opt.textContent = base;
            });
        }

        // 2) Lista de checkboxes con data-filter
        const tagItems = document.querySelectorAll('[data-filter]');
        tagItems.forEach(el => {
            const key = (el.getAttribute('data-filter') || '').trim();
            if (!key) return;
            const countEl = el.querySelector('.count, .badge, .filter-count');
            if (countEl) countEl.textContent = '';
            const lbl = el.querySelector('label, a, span') || el;
            const baseText = (lbl.textContent || '').trim();
            if (baseText) lbl.textContent = baseText.replace(/\s*\([^()]*\)\s*$/, '');
        });
    }

    updateURL() {
        const params = new URLSearchParams();
        
        if (this.currentFilters.categoria) params.set('categoria', this.currentFilters.categoria);
        if (this.currentFilters.filtro) params.set('filtro', this.currentFilters.filtro);
        if (this.currentFilters.busqueda) params.set('q', this.currentFilters.busqueda);
        if (this.currentPage && this.currentPage > 1) params.set('page', String(this.currentPage));
        
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

    // Eliminado: datos mock
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
        
        // Reiniciar paginación
        window.productsManager.currentPage = 1;
        
        // Limpiar form controls
        document.getElementById('categoryFilter').value = '';
        document.getElementById('tagFilter').value = '';
        document.getElementById('searchInput').value = '';
        document.getElementById('sortSelect').value = 'relevancia';
        
        window.productsManager.applyFilters();
    }
}

// Alias global para compatibilidad con el HTML (onclick="clearAllFilters()")
function clearAllFilters() {
    clearFilters();
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('productsGrid')) {
        window.productsManager = new ProductsManager();
    }
});
