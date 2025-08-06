// Novedades Page JavaScript - Cálidda Clone Functionality

class NovedadesManager {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.currentPage = 1;
        this.itemsPerPage = 24;
        this.totalPages = 1;
        this.activeFilters = {
            categoria: [],
            precio: [],
            descuento: [],
            marca: [],
            promocion: []
        };
        this.sortBy = 'relevancia';
        this.viewMode = 'grid';
        
        this.init();
    }
    
    init() {
        this.loadProducts();
        this.bindEvents();
        this.loadFiltersFromURL();
    }
    
    loadProducts() {
        // Sample products data - in real app this would come from API
        this.products = [
            {
                id: 1,
                title: "Televisor Samsung 55\" 4K Smart TV",
                price: 2499,
                originalPrice: 2999,
                discount: 17,
                image: "images/productos/tv-samsung.jpg",
                category: "tecnologia",
                brand: "samsung",
                rating: 4.5,
                reviews: 125,
                badge: "oferta",
                featured: true
            },
            {
                id: 2,
                title: "Refrigeradora LG 420L No Frost",
                price: 1899,
                originalPrice: 2299,
                discount: 17,
                image: "images/productos/refrigeradora-lg.jpg",
                category: "electrodomesticos",
                brand: "lg",
                rating: 4.7,
                reviews: 89,
                badge: "nuevo",
                featured: true
            },
            {
                id: 3,
                title: "Laptop Gaming Samsung Galaxy Book2 Pro 16GB RAM",
                price: 3999,
                originalPrice: 4499,
                discount: 11,
                image: "images/productos/laptop-samsung.jpg",
                category: "tecnologia",
                brand: "samsung",
                rating: 4.8,
                reviews: 67,
                badge: "gamer",
                featured: true
            },
            {
                id: 4,
                title: "Lavadora Whirlpool 16kg Automática",
                price: 1599,
                originalPrice: 1899,
                discount: 16,
                image: "images/productos/lavadora-whirlpool.jpg",
                category: "electrodomesticos",
                brand: "whirlpool",
                rating: 4.3,
                reviews: 156,
                badge: "oferta"
            },
            {
                id: 5,
                title: "iPhone 15 Pro Max 256GB",
                price: 5499,
                originalPrice: 5999,
                discount: 8,
                image: "images/productos/iphone-15.jpg",
                category: "tecnologia",
                brand: "apple",
                rating: 4.9,
                reviews: 234,
                badge: "nuevo"
            },
            {
                id: 6,
                title: "Sofá Modular 3 Cuerpos Gris",
                price: 1299,
                originalPrice: 1599,
                discount: 19,
                image: "images/productos/sofa-modular.jpg",
                category: "muebles",
                brand: "home",
                rating: 4.4,
                reviews: 78,
                badge: "oferta"
            },
            // Tablets
            {
                id: 7,
                title: "iPad Air 10.9\" 64GB WiFi",
                price: 2299,
                originalPrice: 2699,
                discount: 15,
                image: "images/productos/ipad-air.jpg",
                category: "tablets",
                brand: "apple",
                rating: 4.7,
                reviews: 156,
                badge: "oferta"
            },
            {
                id: 8,
                title: "Samsung Galaxy Tab S8 128GB",
                price: 1899,
                originalPrice: 2299,
                discount: 17,
                image: "images/productos/galaxy-tab-s8.jpg",
                category: "tablets",
                brand: "samsung",
                rating: 4.5,
                reviews: 89,
                badge: "nuevo"
            },
            {
                id: 9,
                title: "Xiaomi Pad 5 11\" 128GB",
                price: 1199,
                originalPrice: 1499,
                discount: 20,
                image: "images/productos/xiaomi-pad5.jpg",
                category: "tablets",
                brand: "xiaomi",
                rating: 4.3,
                reviews: 67,
                badge: "oferta"
            },
            // Celulares
            {
                id: 10,
                title: "iPhone 14 Pro 128GB Morado",
                price: 4299,
                originalPrice: 4899,
                discount: 12,
                image: "images/productos/iphone-14-pro.jpg",
                category: "celulares",
                brand: "apple",
                rating: 4.8,
                reviews: 234,
                badge: "nuevo"
            },
            {
                id: 11,
                title: "Samsung Galaxy S23 256GB",
                price: 3199,
                originalPrice: 3699,
                discount: 14,
                image: "images/productos/galaxy-s23.jpg",
                category: "celulares",
                brand: "samsung",
                rating: 4.6,
                reviews: 178,
                badge: "oferta"
            },
            {
                id: 12,
                title: "Xiaomi Redmi Note 12 Pro 128GB",
                price: 899,
                originalPrice: 1199,
                discount: 25,
                image: "images/productos/redmi-note-12.jpg",
                category: "celulares",
                brand: "xiaomi",
                rating: 4.4,
                reviews: 145,
                badge: "oferta"
            },
            // Televisores
            {
                id: 13,
                title: "LG OLED 55\" 4K Smart TV WebOS",
                price: 3999,
                originalPrice: 4799,
                discount: 17,
                image: "images/productos/lg-oled-55.jpg",
                category: "televisores",
                brand: "lg",
                rating: 4.7,
                reviews: 201,
                badge: "nuevo"
            },
            {
                id: 14,
                title: "LG NanoCell 65\" 4K Smart TV",
                price: 2899,
                originalPrice: 3499,
                discount: 17,
                image: "images/productos/lg-nanocell-65.jpg",
                category: "televisores",
                brand: "lg",
                rating: 4.6,
                reviews: 167,
                badge: "oferta"
            },
            {
                id: 15,
                title: "Samsung Crystal UHD 50\" 4K Smart TV",
                price: 1299,
                originalPrice: 1599,
                discount: 19,
                image: "images/productos/samsung-crystal-50.jpg",
                category: "televisores",
                brand: "samsung",
                rating: 4.2,
                reviews: 89,
                badge: "oferta"
            },
            // Gaming
            {
                id: 16,
                title: "PlayStation 5 Digital Edition",
                price: 2299,
                originalPrice: 2599,
                discount: 12,
                image: "images/productos/ps5-digital.jpg",
                category: "gamer",
                brand: "apple",
                rating: 4.9,
                reviews: 312,
                badge: "nuevo"
            },
            {
                id: 17,
                title: "Xbox Series X 1TB",
                price: 2199,
                originalPrice: 2499,
                discount: 12,
                image: "images/productos/xbox-series-x.jpg",
                category: "gamer",
                brand: "microsoft",
                rating: 4.8,
                reviews: 278,
                badge: "nuevo"
            },
            {
                id: 18,
                title: "Galaxy S24 Ultra 256GB",
                price: 3999,
                originalPrice: 4699,
                discount: 15,
                image: "images/productos/samsung-s24-ultra.jpg",
                category: "celulares",
                brand: "samsung",
                rating: 4.8,
                reviews: 245,
                badge: "oferta"
            },
            // Construcción
            {
                id: 19,
                title: "Taladro Percutor Dewalt 20V",
                price: 599,
                originalPrice: 799,
                discount: 25,
                image: "images/productos/taladro-dewalt.jpg",
                category: "construccion",
                brand: "dewalt",
                rating: 4.6,
                reviews: 156,
                badge: "oferta"
            },
            {
                id: 20,
                title: "Soldadora Inverter 200A",
                price: 899,
                originalPrice: 1199,
                discount: 25,
                image: "images/productos/soldadora-inverter.jpg",
                category: "construccion",
                brand: "lincoln",
                rating: 4.5,
                reviews: 89,
                badge: "oferta"
            },
            {
                id: 21,
                title: "Amoladora Angular 4.5\" Bosch",
                price: 299,
                originalPrice: 399,
                discount: 25,
                image: "images/productos/amoladora-bosch.jpg",
                category: "construccion",
                brand: "bosch",
                rating: 4.4,
                reviews: 123,
                badge: "oferta"
            },
            // Motos y Scooters
            {
                id: 22,
                title: "Scooter Eléctrico Xiaomi Pro 2",
                price: 1899,
                originalPrice: 2299,
                discount: 17,
                image: "images/productos/scooter-xiaomi-pro2.jpg",
                category: "motos-scooters",
                brand: "xiaomi",
                rating: 4.5,
                reviews: 167,
                badge: "nuevo"
            },
            {
                id: 23,
                title: "Motocicleta Honda CG 150 Titan",
                price: 8999,
                originalPrice: 9999,
                discount: 10,
                image: "images/productos/honda-cg-150.jpg",
                category: "motos-scooters",
                brand: "honda",
                rating: 4.7,
                reviews: 234,
                badge: "oferta"
            },
            // Productos adicionales por marca
            {
                id: 24,
                title: "MacBook Air M2 13\" 256GB",
                price: 4299,
                originalPrice: 4899,
                discount: 12,
                image: "images/productos/macbook-air-m2.jpg",
                category: "tecnologia",
                brand: "apple",
                rating: 4.8,
                reviews: 189,
                badge: "nuevo"
            },
            {
                id: 25,
                title: "Samsung Galaxy Watch 6 Classic",
                price: 999,
                originalPrice: 1299,
                discount: 23,
                image: "images/productos/galaxy-watch-6.jpg",
                category: "tecnologia",
                brand: "samsung",
                rating: 4.6,
                reviews: 156,
                badge: "oferta"
            },
            {
                id: 26,
                title: "LG Refrigeradora InstaView 570L",
                price: 2799,
                originalPrice: 3299,
                discount: 15,
                image: "images/productos/lg-instaview.jpg",
                category: "electrodomesticos",
                brand: "lg",
                rating: 4.7,
                reviews: 98,
                badge: "nuevo"
            },
            {
                id: 27,
                title: "Xiaomi Redmi Buds 4 Pro",
                price: 299,
                originalPrice: 399,
                discount: 25,
                image: "images/productos/redmi-buds-4.jpg",
                category: "tecnologia",
                brand: "xiaomi",
                rating: 4.4,
                reviews: 234,
                badge: "oferta"
            },
            {
                id: 28,
                title: "LG OLED 65\" C3 4K Smart TV",
                price: 3499,
                originalPrice: 4299,
                discount: 19,
                image: "images/productos/lg-oled-c3.jpg",
                category: "televisores",
                brand: "lg",
                rating: 4.8,
                reviews: 156,
                badge: "oferta"
            },
            {
                id: 29,
                title: "Xiaomi Redmi Note 13 Pro 256GB",
                price: 899,
                originalPrice: 1099,
                discount: 18,
                image: "images/productos/xiaomi-note13-pro.jpg",
                category: "celulares",
                brand: "xiaomi",
                rating: 4.6,
                reviews: 189,
                badge: "oferta"
            },
            {
                id: 30,
                title: "Apple AirPods Pro 2da Gen",
                price: 999,
                originalPrice: 1199,
                discount: 17,
                image: "images/productos/airpods-pro-2.jpg",
                category: "tecnologia",
                brand: "apple",
                rating: 4.9,
                reviews: 312,
                badge: "nuevo"
            },
            {
                id: 31,
                title: "Samsung The Frame 55\" Art TV",
                price: 3499,
                originalPrice: 3999,
                discount: 13,
                image: "images/productos/samsung-frame-55.jpg",
                category: "televisores",
                brand: "samsung",
                rating: 4.6,
                reviews: 76,
                badge: "nuevo"
            }
        ];
        
        // Generate more sample products
        this.generateMoreProducts();
        this.filteredProducts = [...this.products];
        this.updateDisplay();
    }
    
    generateMoreProducts() {
        const categories = ["tecnologia", "electrodomesticos", "muebles", "construccion", "gamer", "celulares", "televisores", "tablets", "motos-scooters"];
        const brands = ["samsung", "lg", "xiaomi", "apple", "whirlpool", "bosch", "dewalt", "honda", "yamaha", "microsoft", "lincoln"];
        const productNames = [
            "Smart TV 65\"", "Microondas Digital", "Aspiradora Robot", "Mesa de Centro",
            "Taladro Inalámbrico", "Scooter Eléctrico", "Auriculares Gaming", "Tablet 10\"",
            "Air Fryer 5L", "Escritorio Ergonómico", "Parlante Bluetooth", "Plancha Vapor",
            "Silla Gaming", "Ventilador Torre", "Licuadora Pro", "Lámpara LED",
            "Cafetera Espresso", "Monitor 27\"", "Teclado Mecánico", "Mouse Gaming",
            "Smartphone 128GB", "Televisor 43\"", "iPad Pro", "Moto 150cc",
            "PC Gamer", "Consola Gaming", "Soldadora", "Amoladora"
        ];
        
        for (let i = 24; i <= 99; i++) {
            const category = categories[Math.floor(Math.random() * categories.length)];
            const brand = brands[Math.floor(Math.random() * brands.length)];
            const name = productNames[Math.floor(Math.random() * productNames.length)];
            const originalPrice = Math.floor(Math.random() * 4000) + 500;
            const discount = Math.floor(Math.random() * 50) + 5;
            const price = Math.floor(originalPrice * (1 - discount / 100));
            
            this.products.push({
                id: i,
                title: `${brand.charAt(0).toUpperCase() + brand.slice(1)} ${name}`,
                price: price,
                originalPrice: originalPrice,
                discount: discount,
                image: `images/productos/producto-${i}.jpg`,
                category: category,
                brand: brand,
                rating: 3.5 + Math.random() * 1.5,
                reviews: Math.floor(Math.random() * 200) + 10,
                badge: Math.random() > 0.7 ? (Math.random() > 0.5 ? "oferta" : "nuevo") : null,
                featured: Math.random() > 0.8
            });
        }
    }
    
    bindEvents() {
        // Filter checkboxes - Only select checkboxes within filter sections
        const filterCheckboxes = document.querySelectorAll('.filter-section input[type="checkbox"]');
        console.log('🔗 Binding events to', filterCheckboxes.length, 'filter checkboxes');
        
        filterCheckboxes.forEach((checkbox, index) => {
            console.log(`🔗 Binding event to checkbox ${index + 1}: ${checkbox.name} = ${checkbox.value}`);
            checkbox.addEventListener('change', () => this.handleFilterChange());
        });
        
        // Sort dropdown
        const sortSelect = document.getElementById('sortBy');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortBy = e.target.value;
                this.sortProducts();
                this.updateDisplay();
            });
        }
        
        // View toggle
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                e.target.closest('.view-btn').classList.add('active');
                this.viewMode = e.target.closest('.view-btn').dataset.view;
                this.updateProductsDisplay();
            });
        });
        
        // Clear filters
        const clearBtn = document.querySelector('.clear-filters-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearAllFilters());
        }
        
        // Pagination
        this.bindPaginationEvents();
        
        // Mobile filter toggle
        this.setupMobileFilters();
    }
    
    handleFilterChange() {
        console.log('🔧 handleFilterChange called');
        
        // Reset active filters
        this.activeFilters = {
            categoria: [],
            precio: [],
            descuento: [],
            marca: [],
            promocion: []
        };
        
        // Collect active filters - Only from filter sections
        const checkedBoxes = document.querySelectorAll('.filter-section input[type="checkbox"]:checked');
        console.log('📋 Found checked boxes:', checkedBoxes.length);
        
        checkedBoxes.forEach(checkbox => {
            const filterType = checkbox.name;
            const filterValue = checkbox.value;
            
            console.log(`🔍 Processing checkbox: ${filterType} = ${filterValue}`);
            
            if (filterValue !== 'todos' && this.activeFilters[filterType]) {
                this.activeFilters[filterType].push(filterValue);
                console.log(`✅ Added to activeFilters: ${filterType} = ${filterValue}`);
            }
        });
        
        console.log('📊 Final activeFilters:', this.activeFilters);
        
        this.applyFilters();
        this.currentPage = 1;
        this.updateDisplay();
        this.updateURL();
    }
    
    applyFilters() {
        this.filteredProducts = this.products.filter(product => {
            // Category filter
            if (this.activeFilters.categoria.length > 0) {
                if (!this.activeFilters.categoria.includes(product.category)) {
                    return false;
                }
            }
            
            // Price filter
            if (this.activeFilters.precio.length > 0) {
                const inPriceRange = this.activeFilters.precio.some(range => {
                    switch (range) {
                        case '0-500': return product.price <= 500;
                        case '500-1000': return product.price > 500 && product.price <= 1000;
                        case '1000-2000': return product.price > 1000 && product.price <= 2000;
                        case '2000-5000': return product.price > 2000 && product.price <= 5000;
                        case '5000+': return product.price > 5000;
                        default: return true;
                    }
                });
                if (!inPriceRange) return false;
            }
            
            // Discount filter
            if (this.activeFilters.descuento.length > 0) {
                const hasMinDiscount = this.activeFilters.descuento.some(minDiscount => {
                    return product.discount >= parseInt(minDiscount);
                });
                if (!hasMinDiscount) return false;
            }
            
            // Brand filter
            if (this.activeFilters.marca.length > 0) {
                if (!this.activeFilters.marca.includes(product.brand)) {
                    return false;
                }
            }
            
            // Promocion filter
            if (this.activeFilters.promocion.length > 0) {
                const hasPromotion = this.activeFilters.promocion.some(promo => {
                    switch (promo) {
                        case 'ofertas': return product.badge === 'oferta' || product.discount > 0;
                        case 'combos': return product.badge === 'combo';
                        case 'novedades': return product.badge === 'nuevo';
                        case 'reacondicionados': return product.badge === 'reacondicionado';
                        default: return false;
                    }
                });
                if (!hasPromotion) return false;
            }
            
            return true;
        });
        
        this.sortProducts();
    }
    
    sortProducts() {
        switch (this.sortBy) {
            case 'precio-asc':
                this.filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'precio-desc':
                this.filteredProducts.sort((a, b) => b.price - a.price);
                break;
            case 'nombre':
                this.filteredProducts.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'fecha':
                this.filteredProducts.sort((a, b) => b.id - a.id);
                break;
            case 'descuento':
                this.filteredProducts.sort((a, b) => b.discount - a.discount);
                break;
            default: // relevancia
                this.filteredProducts.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
                break;
        }
    }
    
    updateDisplay() {
        this.calculatePagination();
        this.updateProductsDisplay();
        this.updateResultsCount();
        this.updatePagination();
    }
    
    calculatePagination() {
        this.totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
        if (this.currentPage > this.totalPages) {
            this.currentPage = 1;
        }
    }
    
    updateProductsDisplay() {
        const grid = document.getElementById('productsGrid');
        if (!grid) return;
        
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const productsToShow = this.filteredProducts.slice(startIndex, endIndex);
        
        if (this.viewMode === 'grid') {
            grid.className = 'products-grid';
        } else {
            grid.className = 'products-list';
        }
        
        grid.innerHTML = productsToShow.map(product => this.createProductCard(product)).join('');
        
        // Add click events to product cards
        grid.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.btn-add-cart, .btn-favorite')) {
                    const productId = card.dataset.productId;
                    this.openProductPage(productId);
                }
            });
        });
    }
    
    createProductCard(product) {
        const discountBadge = product.badge ? `<div class="product-badge ${product.badge}">${this.getBadgeText(product.badge)}</div>` : '';
        const discountPrice = product.discount > 0 ? `
            <span class="price-original">S/ ${product.originalPrice.toLocaleString()}</span>
            <span class="price-discount">-${product.discount}%</span>
        ` : '';
        
        const stars = this.generateStars(product.rating);
        
        return `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.title}" loading="lazy" onerror="this.src='images/placeholder-product.jpg'">
                    ${discountBadge}
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.title}</h3>
                    <div class="product-price">
                        <span class="price-current">S/ ${product.price.toLocaleString()}</span>
                        ${discountPrice}
                    </div>
                    <div class="product-rating">
                        <div class="rating-stars">${stars}</div>
                        <span class="rating-text">(${product.reviews})</span>
                    </div>
                    <div class="product-actions">
                        <button class="btn-add-cart" onclick="addToCart(${product.id})" data-product-id="${product.id}">
                            Agregar al carrito
                        </button>
                        <button class="btn-favorite" onclick="toggleFavorite(${product.id})" data-product-id="${product.id}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        let stars = '';
        
        // Full stars
        for (let i = 0; i < fullStars; i++) {
            stars += '<svg class="star" viewBox="0 0 24 24" fill="currentColor"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon></svg>';
        }
        
        // Half star
        if (hasHalfStar) {
            stars += '<svg class="star" viewBox="0 0 24 24" fill="currentColor"><defs><linearGradient id="half"><stop offset="50%" stop-color="currentColor"/><stop offset="50%" stop-color="transparent"/></linearGradient></defs><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="url(#half)"></polygon></svg>';
        }
        
        // Empty stars
        for (let i = 0; i < emptyStars; i++) {
            stars += '<svg class="star" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon></svg>';
        }
        
        return stars;
    }
    
    getBadgeText(badge) {
        switch (badge) {
            case 'nuevo': return 'NUEVO';
            case 'oferta': return 'OFERTA';
            case 'gamer': return 'GAMING';
            default: return badge.toUpperCase();
        }
    }
    
    updateResultsCount() {
        const totalElement = document.getElementById('totalProducts');
        const countElement = document.querySelector('.results-count');
        
        if (totalElement) {
            totalElement.textContent = this.filteredProducts.length;
        }
        
        if (countElement) {
            const start = (this.currentPage - 1) * this.itemsPerPage + 1;
            const end = Math.min(this.currentPage * this.itemsPerPage, this.filteredProducts.length);
            countElement.textContent = `Mostrando ${start}-${end} de ${this.filteredProducts.length} productos`;
        }
    }
    
    updatePagination() {
        const pagination = document.querySelector('.pagination');
        if (!pagination) return;
        
        const prevBtn = pagination.querySelector('.prev');
        const nextBtn = pagination.querySelector('.next');
        const pagesContainer = pagination.querySelector('.pagination-pages');
        
        // Update prev/next buttons
        if (prevBtn) {
            prevBtn.disabled = this.currentPage === 1;
        }
        if (nextBtn) {
            nextBtn.disabled = this.currentPage === this.totalPages;
        }
        
        // Update page numbers
        if (pagesContainer) {
            pagesContainer.innerHTML = this.generatePageNumbers();
        }
    }
    
    generatePageNumbers() {
        let pages = '';
        const maxVisiblePages = 5;
        
        if (this.totalPages <= maxVisiblePages) {
            for (let i = 1; i <= this.totalPages; i++) {
                pages += `<button class="pagination-page ${i === this.currentPage ? 'active' : ''}" onclick="novedadesManager.goToPage(${i})">${i}</button>`;
            }
        } else {
            // Complex pagination logic
            if (this.currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages += `<button class="pagination-page ${i === this.currentPage ? 'active' : ''}" onclick="novedadesManager.goToPage(${i})">${i}</button>`;
                }
                pages += '<span class="pagination-dots">...</span>';
                pages += `<button class="pagination-page" onclick="novedadesManager.goToPage(${this.totalPages})">${this.totalPages}</button>`;
            } else if (this.currentPage >= this.totalPages - 2) {
                pages += `<button class="pagination-page" onclick="novedadesManager.goToPage(1)">1</button>`;
                pages += '<span class="pagination-dots">...</span>';
                for (let i = this.totalPages - 3; i <= this.totalPages; i++) {
                    pages += `<button class="pagination-page ${i === this.currentPage ? 'active' : ''}" onclick="novedadesManager.goToPage(${i})">${i}</button>`;
                }
            } else {
                pages += `<button class="pagination-page" onclick="novedadesManager.goToPage(1)">1</button>`;
                pages += '<span class="pagination-dots">...</span>';
                for (let i = this.currentPage - 1; i <= this.currentPage + 1; i++) {
                    pages += `<button class="pagination-page ${i === this.currentPage ? 'active' : ''}" onclick="novedadesManager.goToPage(${i})">${i}</button>`;
                }
                pages += '<span class="pagination-dots">...</span>';
                pages += `<button class="pagination-page" onclick="novedadesManager.goToPage(${this.totalPages})">${this.totalPages}</button>`;
            }
        }
        
        return pages;
    }
    
    bindPaginationEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('prev')) {
                this.goToPage(this.currentPage - 1);
            } else if (e.target.classList.contains('next')) {
                this.goToPage(this.currentPage + 1);
            }
        });
    }
    
    goToPage(page) {
        if (page < 1 || page > this.totalPages) return;
        
        this.currentPage = page;
        this.updateDisplay();
        this.updateURL();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    clearAllFilters() {
        // Uncheck all checkboxes except "todos"
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            if (checkbox.value === 'todos') {
                checkbox.checked = true;
            } else {
                checkbox.checked = false;
            }
        });
        
        // Reset filters
        this.activeFilters = {
            categoria: [],
            precio: [],
            descuento: [],
            marca: [],
            promocion: []
        };
        
        this.filteredProducts = [...this.products];
        this.currentPage = 1;
        this.sortProducts();
        this.updateDisplay();
        this.updateURL();
    }
    
    setupMobileFilters() {
        // Create mobile filter toggle button if not exists
        if (!document.querySelector('.filter-toggle-btn')) {
            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'filter-toggle-btn';
            toggleBtn.innerHTML = `
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                </svg>
            `;
            document.body.appendChild(toggleBtn);
            
            // Create overlay
            const overlay = document.createElement('div');
            overlay.className = 'filter-overlay';
            document.body.appendChild(overlay);
            
            // Add event listeners
            toggleBtn.addEventListener('click', () => this.toggleMobileFilters());
            overlay.addEventListener('click', () => this.closeMobileFilters());
        }
    }
    
    toggleMobileFilters() {
        const sidebar = document.querySelector('.filters-sidebar');
        const overlay = document.querySelector('.filter-overlay');
        
        if (sidebar && overlay) {
            sidebar.classList.toggle('open');
            overlay.classList.toggle('open');
        }
    }
    
    closeMobileFilters() {
        const sidebar = document.querySelector('.filters-sidebar');
        const overlay = document.querySelector('.filter-overlay');
        
        if (sidebar && overlay) {
            sidebar.classList.remove('open');
            overlay.classList.remove('open');
        }
    }
    
    openProductPage(productId) {
        // Navigate to individual product page
        window.location.href = `producto.html?id=${productId}`;
    }
    
    updateURL() {
        const params = new URLSearchParams();
        
        if (this.currentPage > 1) {
            params.set('page', this.currentPage);
        }
        
        if (this.sortBy !== 'relevancia') {
            params.set('sort', this.sortBy);
        }
        
        Object.keys(this.activeFilters).forEach(filterType => {
            if (this.activeFilters[filterType].length > 0) {
                params.set(filterType, this.activeFilters[filterType].join(','));
            }
        });
        
        const newURL = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
        window.history.replaceState({}, '', newURL);
    }
    
    loadFiltersFromURL() {
        const params = new URLSearchParams(window.location.search);
        
        console.log('🔍 Loading filters from URL:', window.location.search);
        console.log('🔍 Parsed params:', Object.fromEntries(params));
        
        // Reset all checkboxes first
        document.querySelectorAll('.filter-section input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        console.log('🔄 All checkboxes reset');
        
        // Check for search query parameter
        const searchQuery = params.get('busqueda');
        if (searchQuery) {
            console.log('🔍 Búsqueda detectada:', searchQuery);
            this.handleSearchQuery(searchQuery);
        }
        
        // Load page
        const page = parseInt(params.get('page')) || 1;
        this.currentPage = page;
        
        // Load sort
        const sort = params.get('sort') || 'relevancia';
        this.sortBy = sort;
        const sortSelect = document.getElementById('sortBy');
        if (sortSelect) {
            sortSelect.value = sort;
        }
        
        // Load filters
        Object.keys(this.activeFilters).forEach(filterType => {
            const filterValue = params.get(filterType);
            if (filterValue) {
                this.activeFilters[filterType] = filterValue.split(',');
                
                console.log(`📋 Aplicando filtro ${filterType}:`, this.activeFilters[filterType]);
                
                // Check corresponding checkboxes - Only within filter sections
                this.activeFilters[filterType].forEach(value => {
                    const checkbox = document.querySelector(`.filter-section input[name="${filterType}"][value="${value}"]`);
                    if (checkbox) {
                        checkbox.checked = true;
                        console.log(`✅ Checkbox activado: ${filterType} = ${value}`);
                    }
                });
            }
        });
        
        // Apply filters and update display
        this.applyFilters();
        this.updateActiveFiltersDisplay();
    }
    
    handleSearchQuery(query) {
        // Define category mappings for search terms
        const categoryMappings = {
            'celular': 'celulares',
            'celulares': 'celulares',
            'movil': 'celulares',
            'móvil': 'celulares',
            'smartphone': 'celulares',
            'telefono': 'celulares',
            'teléfono': 'celulares',
            'iphone': 'celulares',
            'android': 'celulares',
            
            'tv': 'televisores',
            'televisor': 'televisores',
            'televisores': 'televisores',
            'smart tv': 'televisores',
            'pantalla': 'televisores',
            
            'electrodomestico': 'electrodomesticos',
            'electrodoméstico': 'electrodomesticos',
            'electrodomesticos': 'electrodomesticos',
            'electrodomésticos': 'electrodomesticos',
            'lavadora': 'electrodomesticos',
            'refrigeradora': 'electrodomesticos',
            'cocina': 'electrodomesticos',
            'horno': 'electrodomesticos',
            'microondas': 'electrodomesticos',
            'licuadora': 'electrodomesticos',
            
            'laptop': 'tecnologia',
            'computadora': 'tecnologia',
            'tablet': 'tecnologia',
            'auriculares': 'tecnologia',
            'camara': 'tecnologia',
            'cámara': 'tecnologia',
            'tecnologia': 'tecnologia',
            'tecnología': 'tecnologia',
            
            'mueble': 'muebles',
            'muebles': 'muebles',
            'sala': 'muebles',
            'cama': 'muebles',
            'mesa': 'muebles',
            'silla': 'muebles',
            'sofa': 'muebles',
            'sofá': 'muebles',
            'closet': 'muebles',
            
            'moto': 'motos-scooters',
            'scooter': 'motos-scooters',
            'motocicleta': 'motos-scooters',
            'bicicleta': 'motos-scooters',
            
            'gaming': 'gamer',
            'gamer': 'gamer',
            'videojuego': 'gamer',
            'consola': 'gamer',
            'playstation': 'gamer',
            'xbox': 'gamer',
            'nintendo': 'gamer',
            
            'construccion': 'construccion',
            'construcción': 'construccion',
            'herramienta': 'construccion',
            'cemento': 'construccion',
            'ladrillo': 'construccion',
            'pintura': 'construccion'
        };
        
        const lowerQuery = query.toLowerCase();
        
        // Try to find exact match
        if (categoryMappings[lowerQuery]) {
            this.activeFilters.categoria = [categoryMappings[lowerQuery]];
            console.log(`🎯 Búsqueda mapeada a categoría: ${categoryMappings[lowerQuery]}`);
            return;
        }
        
        // Try to find partial matches
        for (const [keyword, category] of Object.entries(categoryMappings)) {
            if (lowerQuery.includes(keyword) || keyword.includes(lowerQuery)) {
                this.activeFilters.categoria = [category];
                console.log(`🎯 Búsqueda parcial mapeada a categoría: ${category}`);
                return;
            }
        }
        
        // If no category match found, search in tecnologia as fallback
        console.log(`🔍 Sin coincidencia exacta, mostrando todos los productos para: ${query}`);
        // Don't apply any category filter, show all products
    }
}

// Global functions for product interactions
function addToCart(productId) {
    console.log('Adding product to cart:', productId);
    // Add cart functionality here
    showNotification('Producto agregado al carrito', 'success');
}

function toggleFavorite(productId) {
    console.log('Toggling favorite for product:', productId);
    // Add favorite functionality here
    showNotification('Producto agregado a favoritos', 'info');
}

function showNotification(message, type = 'info') {
    // Simple notification system
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        background: ${type === 'success' ? '#10b981' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        transform: translateX(100%);
        transition: transform 0.3s;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Animate out and remove
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function clearAllFilters() {
    if (window.novedadesManager) {
        window.novedadesManager.clearAllFilters();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.novedadesManager = new NovedadesManager();
});

// Handle browser back/forward
window.addEventListener('popstate', () => {
    if (window.novedadesManager) {
        window.novedadesManager.loadFiltersFromURL();
        window.novedadesManager.updateDisplay();
    }
});
