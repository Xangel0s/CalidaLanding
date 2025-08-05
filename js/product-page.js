// Product Page Manager - Handles individual product page functionality
class ProductPageManager {
    constructor() {
        this.productData = null;
        this.currentImageIndex = 0;
        this.quantity = 1;
        this.init();
    }

    async init() {
        // Get product slug from URL
        const slug = this.getProductSlug();
        if (slug) {
            await this.loadProductData(slug);
            this.setupEventListeners();
            this.initializeGallery();
            this.initializeTabs();
        }
    }

    getProductSlug() {
        const path = window.location.pathname;
        // Extract slug from URL pattern: /slug/p
        const match = path.match(/\/(.+)\/p$/);
        return match ? match[1] : null;
    }

    async loadProductData(slug) {
        try {
            // In a real implementation, this would fetch from Netlify CMS or a backend
            // For now, we'll use mock data based on the slug
            this.productData = await this.fetchProductData(slug);
            this.renderProductData();
        } catch (error) {
            console.error('Error loading product data:', error);
            this.showProductNotFound();
        }
    }

    async fetchProductData(slug) {
        // Mock product data - in production this would fetch from CMS
        const products = {
            'televisor-lg-55ut7300psa-uhd-4k-smart-webos': {
                title: "Televisor LG 55UT7300PSA UHD/4K SMART WebOS c/Magic Remote + Audifonos Bluetooth MERTEC",
                brand: "LG",
                price_regular: 2939.00,
                price_online: 1659.00,
                discount: 44,
                monthly_payment: 62.60,
                stock: 15,
                images: [
                    "/images/productos_destacados/tv-lg.jpg",
                    "/images/productos_destacados/tv-lg-2.jpg",
                    "/images/productos_destacados/tv-lg-3.jpg"
                ],
                description: "Televisor LG 55 pulgadas con tecnología UHD/4K, Smart TV con sistema operativo WebOS, incluye Magic Remote y audífonos Bluetooth MERTEC de regalo.",
                specifications: [
                    { name: "Tamaño de pantalla", value: "55 pulgadas" },
                    { name: "Resolución", value: "3840 x 2160 (UHD/4K)" },
                    { name: "Sistema operativo", value: "WebOS" },
                    { name: "Conectividad", value: "Wi-Fi, Bluetooth, HDMI, USB" },
                    { name: "HDR", value: "HDR10, HLG" },
                    { name: "Procesador", value: "α5 Gen6 AI Processor 4K" }
                ],
                benefits: [
                    "Entrega gratuita a nivel nacional",
                    "Garantía oficial de 2 años", 
                    "Instalación técnica gratuita",
                    "Financiamiento hasta 36 cuotas",
                    "Soporte técnico 24/7"
                ],
                detailed_description: "Disfruta de una experiencia visual excepcional con el Televisor LG 55UT7300PSA. Con su pantalla UHD/4K de 55 pulgadas y el sistema operativo WebOS, tendrás acceso a todas tus aplicaciones favoritas de streaming."
            },
            'cocina-mabe-empotrable-6-hornillas': {
                title: "Cocina Mabe Empotrable 6 Hornillas Acero Inoxidable + Campana Extractora",
                brand: "Mabe",
                price_regular: 3200.00,
                price_online: 2590.00,
                discount: 19,
                monthly_payment: 98.00,
                stock: 8,
                images: [
                    "/images/productos_destacados/cocina-mabe.jpg",
                    "/images/productos_destacados/cocina-mabe-2.jpg",
                    "/images/productos_destacados/cocina-mabe-3.jpg"
                ],
                description: "Cocina empotrable Mabe de 6 hornillas en acero inoxidable, ideal para familias grandes. Incluye campana extractora de regalo.",
                specifications: [
                    { name: "Hornillas", value: "6 quemadores a gas" },
                    { name: "Material", value: "Acero inoxidable" },
                    { name: "Dimensiones", value: "90cm x 60cm x 85cm" },
                    { name: "Encendido", value: "Automático con perilla" },
                    { name: "Horno", value: "88 litros con grill" },
                    { name: "Parrillas", value: "Hierro fundido esmaltado" }
                ],
                benefits: [
                    "Instalación gratuita por técnico especializado",
                    "Conexión de gas incluida",
                    "Garantía de 2 años en partes y mano de obra",
                    "Financiamiento hasta 36 cuotas sin interés",
                    "Campana extractora de regalo"
                ],
                detailed_description: "Transforma tu cocina con esta moderna cocina Mabe empotrable de 6 hornillas. Perfecta para preparar múltiples platillos al mismo tiempo con la eficiencia y durabilidad que caracteriza a la marca Mabe."
            }
        };

        return products[slug] || null;
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
        document.getElementById('price-online').textContent = `S/ ${this.productData.price_online.toFixed(2)}`;
        document.getElementById('monthly-payment').textContent = `S/ ${this.productData.monthly_payment.toFixed(2)}`;

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
                <div class="thumbnail ${index === 0 ? 'active' : ''}" onclick="productPageManager.changeMainImage(${index})">
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
        // Gallery navigation would be implemented here
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
