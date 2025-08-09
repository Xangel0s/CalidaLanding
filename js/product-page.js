// Product Page Manager - Handles individual product page functionality
class ProductPageManager {
    constructor() {
        this.productData = null;
        this.currentImageIndex = 0;
        this.quantity = 1;
        this.init();
    }

    async init() {
        // Get product slug from URL (?slug=...)
        const slug = this.getProductSlug();
        if (slug) {
            await this.loadProductData(slug);
            this.setupEventListeners();
            this.initializeGallery();
            this.initializeTabs();
        }
    }

    getProductSlug() {
        // Prefer query param ?slug=...
        const url = new URL(window.location.href);
        const qp = url.searchParams.get('slug');
        if (qp) return qp;
        // fallback: /<slug>/p pattern
        const path = window.location.pathname;
        const match = path.match(/\/(.+)\/p$/);
        return match ? match[1] : null;
    }

    async loadProductData(slug) {
        try {
            // Load from CMS (cms-products.js must be included)
            if (!window.CMSProducts || !CMSProducts.loadProductBySlug) {
                throw new Error('CMSProducts loader no disponible');
            }
            const p = await CMSProducts.loadProductBySlug(slug);
            // Normalize to legacy format expected by renderer
            this.productData = this.normalizeProduct(p);
            this.renderProductData();
        } catch (error) {
            console.error('Error loading product data:', error);
            this.showProductNotFound();
        }
    }

    normalizeProduct(p) {
        const images = [];
        if (p.image) images.push(p.image);
        if (Array.isArray(p.gallery)) {
            p.gallery.forEach(g => { if (g && typeof g === 'string') images.push(g); });
        }
        const specs = Array.isArray(p.specs) ? p.specs.map(s => {
            if (typeof s === 'string') {
                const idx = s.indexOf(':');
                return idx > -1 ? { name: s.slice(0, idx).trim(), value: s.slice(idx + 1).trim() } : { name: s, value: '' };
            }
            const key = Object.keys(s || {})[0];
            return key ? { name: key, value: String(s[key]) } : { name: '', value: '' };
        }) : [];
        return {
            title: p.title || p.slug,
            brand: p.brand || '',
            price_regular: typeof p.price_regular === 'number' ? p.price_regular : null,
            price_online: typeof p.price_online === 'number' ? p.price_online : null,
            discount: typeof p.discount === 'number' ? p.discount : null,
            monthly_payment: typeof p.monthly_payment === 'number' ? p.monthly_payment : null,
            stock: typeof p.stock === 'number' ? p.stock : 10,
            images,
            description: p.description || '',
            specifications: specs,
            benefits: p.benefits || [],
            detailed_description: p.body || p.description || '',
            payment_methods: Array.isArray(p.payment_methods) ? p.payment_methods : [],
            shipping: p.shipping || ''
        };
    }

    renderProductData() {
        if (!this.productData) return;

        // Update page title and meta
        document.title = `${this.productData.title} - Credicálidda`;
        
        // Update breadcrumb
        document.getElementById('breadcrumb-product').textContent = this.productData.title;

        // Update product info
        document.getElementById('product-brand').textContent = this.productData.brand;
        document.getElementById('product-title').textContent = this.productData.title;
        document.getElementById('product-description').textContent = this.productData.description;

        // Update pricing
        if (this.productData.price_regular) {
            document.getElementById('price-regular').textContent = `S/ ${this.productData.price_regular.toFixed(2)}`;
            document.getElementById('price-regular-row').style.display = 'flex';
        }
        if (typeof this.productData.price_online === 'number') {
            document.getElementById('price-online').textContent = `S/ ${this.productData.price_online.toFixed(2)}`;
        }
        if (typeof this.productData.monthly_payment === 'number') {
            document.getElementById('monthly-payment').textContent = `S/ ${this.productData.monthly_payment.toFixed(2)}`;
        }

        // Update discount badge
        if (this.productData.discount) {
            document.getElementById('discount-badge').textContent = `-${this.productData.discount}%`;
            document.getElementById('discount-badge').style.display = 'block';
        }

        // Update stock status
        this.updateStockStatus();

        // Update images
        this.updateProductImages();

        // Update specifications
        this.updateSpecifications();

        // Update benefits
        this.updateBenefits();

        // Update detailed description
        document.getElementById('detailed-description').innerHTML = this.productData.detailed_description;

        // Update payments and shipping
        this.updatePayments();
        this.updateShipping();
    }

    updateProductImages() {
        const mainImage = document.getElementById('main-product-image');
        const thumbnailsContainer = document.getElementById('product-thumbnails');
        
        if (this.productData.images && this.productData.images.length > 0) {
            // Set main image
            mainImage.src = this.productData.images[0];
            mainImage.alt = this.productData.title;

            // Create thumbnails
            thumbnailsContainer.innerHTML = this.productData.images.map((image, index) => `
                <div class="thumbnail ${index === 0 ? 'active' : ''}"
                     onclick="productPageManager.changeMainImage(${index})"
                     onmouseenter="productPageManager.changeMainImage(${index})">
                    <img src="${image}" alt="${this.productData.title}" loading="lazy">
                </div>
            `).join('');
        }
    }

    updateSpecifications() {
        const specsContainer = document.getElementById('specifications-list');
        if (this.productData.specifications) {
            specsContainer.innerHTML = this.productData.specifications.map(spec => `
                <tr>
                    <td class="spec-name">${spec.name}</td>
                    <td class="spec-value">${spec.value}</td>
                </tr>
            `).join('');
        }
    }

    updateBenefits() {
        const benefitsContainer = document.getElementById('benefits-list');
        if (this.productData.benefits) {
            benefitsContainer.innerHTML = this.productData.benefits.map(benefit => `
                <div class="benefit-item">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <polyline points="20,6 9,17 4,12"></polyline>
                    </svg>
                    ${benefit}
                </div>
            `).join('');
        }
    }

    updateStockStatus() {
        const stockElement = document.getElementById('stock-status');
        if (this.productData.stock > 0) {
            stockElement.textContent = `${this.productData.stock} unidades disponibles`;
            stockElement.className = 'stock-available';
        } else {
            stockElement.textContent = 'Agotado';
            stockElement.className = 'stock-unavailable';
        }
    }

    setupEventListeners() {
        // Quantity controls
        document.getElementById('qty-minus').addEventListener('click', () => this.changeQuantity(-1));
        document.getElementById('qty-plus').addEventListener('click', () => this.changeQuantity(1));
        document.getElementById('quantity-input').addEventListener('change', (e) => {
            this.quantity = Math.max(1, parseInt(e.target.value) || 1);
            this.updateQuantityDisplay();
        });

        // WhatsApp button
        document.getElementById('whatsapp-btn').addEventListener('click', () => this.contactWhatsApp());

        // Calculate financing button
        document.getElementById('calculate-financing').addEventListener('click', () => this.calculateFinancing());
    }

    initializeGallery() {
        // Change main image on hover over main image cycling through available images
        const mainImage = document.getElementById('main-product-image');
        if (!mainImage) return;
        let hoverTimer = null;
        const cycle = () => {
            if (!this.productData || !this.productData.images || this.productData.images.length <= 1) return;
            const next = (this.currentImageIndex + 1) % this.productData.images.length;
            this.changeMainImage(next);
        };
        mainImage.addEventListener('mouseenter', () => {
            if (hoverTimer) clearInterval(hoverTimer);
            hoverTimer = setInterval(cycle, 1200);
        });
        mainImage.addEventListener('mouseleave', () => {
            if (hoverTimer) { clearInterval(hoverTimer); hoverTimer = null; }
        });
    }

    initializeTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabPanels = document.querySelectorAll('.tab-panel');

        tabButtons.forEach((button, index) => {
            button.addEventListener('click', () => {
                // Remove active class from all tabs and panels
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabPanels.forEach(panel => panel.classList.remove('active'));

                // Add active class to clicked tab and corresponding panel
                button.classList.add('active');
                tabPanels[index].classList.add('active');
            });
        });
    }

    changeMainImage(index) {
        if (this.productData.images && this.productData.images[index]) {
            document.getElementById('main-product-image').src = this.productData.images[index];
            
            // Update active thumbnail
            document.querySelectorAll('.thumbnail').forEach((thumb, i) => {
                thumb.classList.toggle('active', i === index);
            });
            
            this.currentImageIndex = index;
        }
    }

    changeQuantity(delta) {
        this.quantity = Math.max(1, Math.min(this.productData.stock, this.quantity + delta));
        this.updateQuantityDisplay();
    }

    updateQuantityDisplay() {
        document.getElementById('quantity-input').value = this.quantity;
    }

    contactWhatsApp() {
        const message = `Hola, estoy interesado en: ${this.productData.title}. ¿Podrían darme más información?`;
        const whatsappUrl = `https://wa.me/51999999999?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    }

    calculateFinancing() {
        // Open financing calculator modal
        alert('Calculadora de financiamiento - Función por implementar');
    }

    showProductNotFound() {
        document.body.innerHTML = `
            <div class="error-container">
                <h1>Producto no encontrado</h1>
                <p>El producto que buscas no existe o ha sido descontinuado.</p>
                <a href="/productos.html" class="btn btn-primary">Ver todos los productos</a>
            </div>
        `;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.productPageManager = new ProductPageManager();
});

// Global function for external calls
function goToProduct(slug) {
    window.location.href = `/${slug}/p`;
}
