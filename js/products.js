// Products data and management for Credicálidda

// Sample products data
const sampleProducts = [
    {
        id: '1',
        name: 'CELULAR APPLE IPHONE 16 C/ CHIP 2024 8GB 128GB ROSADO',
        description: 'iPhone 16 con el último chip A18, cámara avanzada y diseño premium en color rosado.',
        price: 3299.00,
        originalPrice: 3499.00,
        images: [
            '/images/products/iphone-16-rosado.jpg',
            '/images/products/iphone-16-rosado-2.jpg'
        ],
        category: 'Tecnología',
        subcategory: 'Celulares',
        brand: 'Apple',
        seller: 'APPLE PERU S.A.C.',
        specs: {
            memoria: '128GB',
            ram: '8GB',
            color: 'Rosado',
            sistemaOperativo: 'iOS 18',
            pantalla: '6.1 pulgadas Super Retina XDR',
            camara: '48MP Fusion',
            bateria: 'Hasta 22 horas de video',
            conectividad: '5G'
        },
        installments: {
            months: 24,
            monthlyPayment: 149.99,
            tcea: 28.5
        },
        stock: 25,
        featured: true,
        tags: ['iphone', 'apple', '5g', 'nuevo'],
        rating: 4.8,
        discount: 6
    },
    {
        id: '2',
        name: 'TELEVISOR LG 55UT7300PSA UHD 4K SMART WEBOS C/ MAGIC REMOTE',
        description: 'Televisor LG 55" UHD 4K con WebOS, Magic Remote y calidad de imagen excepcional.',
        price: 1799.00,
        originalPrice: 2199.00,
        images: [
            '/images/products/tv-lg-55.jpg',
            '/images/products/tv-lg-55-2.jpg'
        ],
        category: 'Tecnología',
        subcategory: 'Televisores',
        brand: 'LG',
        seller: 'LG ELECTRONICS PERU S.A.',
        specs: {
            tamano: '55 pulgadas',
            resolucion: '4K UHD (3840x2160)',
            sistemaOperativo: 'webOS 23',
            conectividad: 'WiFi, Bluetooth, 3 HDMI, 2 USB',
            hdr: 'HDR10, HLG',
            sonido: '20W'
        },
        installments: {
            months: 18,
            monthlyPayment: 109.99,
            tcea: 26.8
        },
        stock: 15,
        featured: true,
        tags: ['tv', 'lg', '4k', 'smart tv'],
        rating: 4.6,
        discount: 18
    },
    {
        id: '3',
        name: 'CELULAR APPLE IPHONE 14 PRO MAX ESIM 2022 6GB 128GB NEGRO - REACONDICIONADO',
        description: 'iPhone 14 Pro Max reacondicionado en perfecto estado, con garantía y calidad certificada.',
        price: 2899.00,
        originalPrice: 4299.00,
        images: [
            '/images/products/iphone-14-pro-max.jpg',
            '/images/products/iphone-14-pro-max-2.jpg'
        ],
        category: 'Tecnología',
        subcategory: 'Celulares',
        brand: 'Apple',
        seller: 'REACONDICIONADOS PERU S.A.C.',
        specs: {
            memoria: '128GB',
            ram: '6GB',
            color: 'Negro',
            sistemaOperativo: 'iOS 16',
            pantalla: '6.7 pulgadas Super Retina XDR',
            camara: '48MP Pro',
            bateria: 'Hasta 29 horas de video',
            conectividad: '5G, eSIM'
        },
        installments: {
            months: 18,
            monthlyPayment: 169.99,
            tcea: 30.2
        },
        stock: 8,
        featured: true,
        tags: ['iphone', 'apple', 'reacondicionado', '5g'],
        rating: 4.5,
        discount: 33,
        isRefurbished: true
    },
    {
        id: '4',
        name: 'COMBO: XIAOMI 12 PURPURA + AURICULARES JBL VIBE',
        description: 'Combo especial: Xiaomi 12 en color púrpura más auriculares JBL Vibe de regalo.',
        price: 1599.00,
        originalPrice: 1899.00,
        images: [
            '/images/products/combo-xiaomi-12.jpg',
            '/images/products/xiaomi-12-purpura.jpg',
            '/images/products/jbl-vibe.jpg'
        ],
        category: 'Tecnología',
        subcategory: 'Combos',
        brand: 'Xiaomi',
        seller: 'XIAOMI PERU S.A.C.',
        specs: {
            memoria: '256GB',
            ram: '8GB',
            color: 'Púrpura',
            sistemaOperativo: 'MIUI 13 (Android 12)',
            pantalla: '6.28 pulgadas AMOLED',
            camara: '50MP Triple',
            bateria: '4500 mAh',
            conectividad: '5G',
            incluye: 'Auriculares JBL Vibe'
        },
        installments: {
            months: 12,
            monthlyPayment: 139.99,
            tcea: 25.5
        },
        stock: 20,
        featured: true,
        tags: ['xiaomi', 'combo', 'auriculares', '5g'],
        rating: 4.4,
        discount: 16,
        isCombo: true
    },
    {
        id: '5',
        name: 'LAPTOP HP PAVILION 15.6" INTEL CORE I5 8GB 512GB SSD',
        description: 'Laptop HP Pavilion con procesador Intel Core i5, 8GB RAM y 512GB SSD para máximo rendimiento.',
        price: 2299.00,
        originalPrice: 2599.00,
        images: [
            '/images/products/laptop-hp-pavilion.jpg',
            '/images/products/laptop-hp-pavilion-2.jpg'
        ],
        category: 'Tecnología',
        subcategory: 'Laptops',
        brand: 'HP',
        seller: 'HP PERU S.A.C.',
        specs: {
            procesador: 'Intel Core i5-12th Gen',
            ram: '8GB DDR4',
            almacenamiento: '512GB SSD',
            pantalla: '15.6 pulgadas Full HD',
            graficos: 'Intel Iris Xe',
            sistemaOperativo: 'Windows 11',
            peso: '1.75 kg',
            conectividad: 'WiFi 6, Bluetooth 5.2'
        },
        installments: {
            months: 24,
            monthlyPayment: 105.99,
            tcea: 29.1
        },
        stock: 12,
        featured: true,
        tags: ['laptop', 'hp', 'intel i5', 'ssd'],
        rating: 4.7,
        discount: 12
    },
    {
        id: '6',
        name: 'SAMSUNG GALAXY A54 5G 128GB 8GB RAM VIOLETA',
        description: 'Samsung Galaxy A54 5G con cámara triple de 50MP, pantalla Super AMOLED y conectividad 5G.',
        price: 1299.00,
        originalPrice: 1499.00,
        images: [
            '/images/products/samsung-a54.jpg',
            '/images/products/samsung-a54-2.jpg'
        ],
        category: 'Tecnología',
        subcategory: 'Celulares',
        brand: 'Samsung',
        seller: 'SAMSUNG ELECTRONICS PERU S.A.',
        specs: {
            memoria: '128GB',
            ram: '8GB',
            color: 'Violeta',
            sistemaOperativo: 'Android 13',
            pantalla: '6.4 pulgadas Super AMOLED',
            camara: '50MP Triple',
            bateria: '5000 mAh',
            conectividad: '5G'
        },
        installments: {
            months: 18,
            monthlyPayment: 79.99,
            tcea: 31.2
        },
        stock: 18,
        featured: true,
        tags: ['samsung', 'android', '5g', 'galaxy'],
        rating: 4.3,
        discount: 13
    }
];

// Product management class
class ProductManager {
    constructor() {
        this.products = [...sampleProducts];
        this.cart = Utils.storage.get('cart') || [];
        this.wishlist = Utils.storage.get('wishlist') || [];
        this.init();
    }
    
    init() {
        this.loadProducts();
        this.updateCartUI();
    }
    
    // Load products into the DOM
    loadProducts() {
        const productsTrack = Utils.$('#productsTrack');
        if (!productsTrack) return;
        
        productsTrack.innerHTML = '';
        
        const featuredProducts = this.products.filter(product => product.featured).slice(0, 8);
        
        featuredProducts.forEach(product => {
            const productCard = this.createProductCard(product);
            productsTrack.appendChild(productCard);
        });
    }
    
    // Create product card HTML
    createProductCard(product) {
        const card = Utils.createElement('div', 'product-card');
        
        const discountBadge = product.discount ? 
            `<div class="product-badge">-${product.discount}%</div>` : '';
            
        const originalPrice = product.originalPrice ? 
            `<div class="price-original">${Utils.formatPrice(product.originalPrice)}</div>` : '';
            
        const refurbishedBadge = product.isRefurbished ? 
            `<div class="product-badge" style="background-color: var(--purple-500);">Reacondicionado</div>` : '';
            
        const comboBadge = product.isCombo ? 
            `<div class="product-badge" style="background-color: var(--blue-500);">Combo</div>` : '';
        
        card.innerHTML = `
            <div class="product-image">
                <img src="${product.images[0]}" alt="${product.name}" 
                     onerror="this.src='/images/products/placeholder.jpg'">
                ${discountBadge}
                ${refurbishedBadge}
                ${comboBadge}
            </div>
            <div class="product-content">
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">
                    ${originalPrice}
                    <div class="price-current">${Utils.formatPrice(product.price)}</div>
                    <div class="price-installment">
                        ${product.installments.months} cuotas de ${Utils.formatPrice(product.installments.monthlyPayment)}
                    </div>
                </div>
                <div class="product-actions">
                    <button class="btn-add-cart" onclick="ProductManager.instance.addToCart('${product.id}')">
                        Agregar al carrito
                    </button>
                    <button class="btn-whatsapp" onclick="ProductManager.instance.buyNowWhatsApp('${product.id}')">
                        Comprar ahora
                    </button>
                </div>
            </div>
        `;
        
        return card;
    }
    
    // Add product to cart
    addToCart(productId, quantity = 1) {
        const product = this.getProductById(productId);
        if (!product) return;
        
        const existingItem = this.cart.find(item => item.productId === productId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                productId,
                quantity,
                addedAt: new Date().toISOString()
            });
        }
        
        this.saveCart();
        this.updateCartUI();
        this.showNotification(`${product.name} agregado al carrito`, 'success');
    }
    
    // Remove product from cart
    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.productId !== productId);
        this.saveCart();
        this.updateCartUI();
    }
    
    // Update cart quantity
    updateCartQuantity(productId, quantity) {
        const item = this.cart.find(item => item.productId === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                item.quantity = quantity;
                this.saveCart();
                this.updateCartUI();
            }
        }
    }
    
    // Get cart total
    getCartTotal() {
        return this.cart.reduce((total, item) => {
            const product = this.getProductById(item.productId);
            return total + (product ? product.price * item.quantity : 0);
        }, 0);
    }
    
    // Get cart item count
    getCartItemCount() {
        return this.cart.reduce((count, item) => count + item.quantity, 0);
    }
    
    // Buy now via WhatsApp
    buyNowWhatsApp(productId) {
        const product = this.getProductById(productId);
        if (!product) return;
        
        // Open contact modal first to get user info
        this.openContactModal([product]);
    }
    
    // Add to wishlist
    addToWishlist(productId) {
        const product = this.getProductById(productId);
        if (!product) return;
        
        if (!this.wishlist.includes(productId)) {
            this.wishlist.push(productId);
            this.saveWishlist();
            this.showNotification(`${product.name} agregado a favoritos`, 'success');
        }
    }
    
    // Remove from wishlist
    removeFromWishlist(productId) {
        this.wishlist = this.wishlist.filter(id => id !== productId);
        this.saveWishlist();
    }
    
    // Open contact modal
    openContactModal(products) {
        const modal = Utils.$('#contactModal');
        if (!modal) return;
        
        // Store products for later use
        this.currentProducts = products;
        
        modal.classList.add('active');
        
        // Update modal content based on products
        const modalHeader = modal.querySelector('.modal-header h3');
        if (modalHeader) {
            modalHeader.textContent = products.length === 1 ? 
                'Contactar para este producto' : 
                `Contactar para ${products.length} productos`;
        }
    }
    
    // Generate WhatsApp message
    generateWhatsAppMessage(userData, products) {
        const baseUrl = 'https://wa.me/51999999999';
        
        let message = `¡Hola! Me interesa obtener información sobre:\n\n`;
        
        products.forEach((product, index) => {
            message += `${index + 1}. ${product.name}\n`;
            message += `   Precio: ${Utils.formatPrice(product.price)}\n`;
            if (product.installments) {
                message += `   Cuotas: ${product.installments.months} de ${Utils.formatPrice(product.installments.monthlyPayment)}\n`;
            }
            message += `\n`;
        });
        
        message += `Mis datos de contacto:\n`;
        message += `Nombres: ${userData.firstName} ${userData.lastName}\n`;
        message += `DNI: ${userData.dni}\n`;
        message += `Email: ${userData.email}\n`;
        if (userData.phone) {
            message += `Teléfono: ${userData.phone}\n`;
        }
        
        message += `\n¡Espero su respuesta! Gracias.`;
        
        const encodedMessage = encodeURIComponent(message);
        return `${baseUrl}?text=${encodedMessage}`;
    }
    
    // Get product by ID
    getProductById(id) {
        return this.products.find(product => product.id === id);
    }
    
    // Search products
    searchProducts(query) {
        const searchTerm = query.toLowerCase();
        return this.products.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.brand.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm) ||
            product.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
    }
    
    // Filter products by category
    filterByCategory(category) {
        return this.products.filter(product => 
            product.category.toLowerCase() === category.toLowerCase()
        );
    }
    
    // Save cart to localStorage
    saveCart() {
        Utils.storage.set('cart', this.cart);
    }
    
    // Save wishlist to localStorage
    saveWishlist() {
        Utils.storage.set('wishlist', this.wishlist);
    }
    
    // Update cart UI
    updateCartUI() {
        const cartCount = Utils.$('#cartCount');
        if (cartCount) {
            const count = this.getCartItemCount();
            cartCount.textContent = count;
            cartCount.style.display = count > 0 ? 'flex' : 'none';
        }
    }
    
    // Show notification
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = Utils.createElement('div', `notification notification-${type}`);
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('hide');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
}

// Initialize product manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    ProductManager.instance = new ProductManager();
});

// Export for global access
window.ProductManager = ProductManager;
