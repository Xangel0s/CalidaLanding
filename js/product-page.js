// Product Page Manager - Handles individual product page functionality
class ProductPageManager {
    constructor() {
        this.productData = null;
        this.currentImageIndex = 0;
        this.quantity = 1;
        this.init();
    }

    activateTab(tabId) {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabPanels = document.querySelectorAll('.tab-panel');
        const ids = Array.from(tabPanels).map(p => p.id);
        const index = ids.indexOf(tabId);
        if (index === -1) return;
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabPanels.forEach(panel => { panel.classList.remove('active'); panel.style.display = 'none'; });
        if (tabButtons[index]) tabButtons[index].classList.add('active');
        if (tabPanels[index]) { tabPanels[index].classList.add('active'); tabPanels[index].style.display = 'block'; }
    }

    updatePayments() {
        const wrap = document.querySelector('#payment .tab-content');
        if (!wrap) return;
        const pd = this.productData || {};
        const methods = Array.isArray(pd.payment_methods) ? pd.payment_methods : [];
        const methodLabel = (m) => ({ bcp: 'BCP', yape: 'Yape', plin: 'Plin' }[m] || m);
        const logoUrl = (m) => `/images/pagos/${m}.jpg`;
        const logos = methods.map(m => `
            <div class="pay-chip" title="${methodLabel(m)}">
                <img src="${logoUrl(m)}" alt="${methodLabel(m)}" loading="lazy" onerror="this.onerror=null; this.replaceWith(document.createTextNode('${methodLabel(m)}'));" />
            </div>
        `).join('');

        let creditSection = '';
        if (pd.payment_credit_html) {
            creditSection = `<div class="payment-method">${pd.payment_credit_html}</div>`;
        } else if (pd.show_payment_credit) {
            const monthly = (typeof pd.monthly_payment === 'number' && pd.show_monthly)
                ? `Desde S/ ${pd.monthly_payment.toFixed(2)} al mes`
                : '';
            const monthlyHTML = monthly ? `<p>${monthly}</p>` : '';
            creditSection = `
                <div class="payment-method">
                    <h4> Con Credicálidda</h4>
                    ${monthlyHTML}
                    <div class="pay-logos">${logos}</div>
                </div>`;
        }

        let cashSection = '';
        if (pd.payment_cash_html) {
            cashSection = `<div class="payment-method">${pd.payment_cash_html}</div>`;
        } else if (pd.show_payment_cash) {
            const priceLine = (typeof pd.price_online === 'number' && pd.show_price_online)
                ? `Precio online: S/ ${pd.price_online.toFixed(2)}`
                : '';
            const priceHTML = priceLine ? `<p>${priceLine}</p>` : '';
            cashSection = `
                <div class="payment-method">
                    <h4> Pago al Contado</h4>
                    ${priceHTML}
                </div>`;
        }

        const combined = [creditSection, cashSection].filter(Boolean).join('');
        wrap.innerHTML = combined
            ? `<h3>Formas de Pago Disponibles</h3><div class="payment-methods">${combined}</div>`
            : `<h3>Formas de Pago</h3><p></p>`;
    }

    updateShipping() {
        // Shipping: CMS-driven only. If no CMS content, hide the tab (no predefined text).
        const panel = document.getElementById('shipping');
        const container = document.querySelector('#shipping .tab-content');
        if (!panel || !container) return;

        const pd = this.productData || {};
        const hasContent = !!(pd.shipping_html || pd.shipping);
        const visible = pd.show_shipping !== false;

        if (!visible) {
            // Hide entire panel if disabled in CMS
            panel.classList.remove('active');
            panel.style.display = 'none';
            const btn = document.querySelector('.tab-btn[data-tab="shipping"]');
            if (btn) btn.style.display = 'none';
            // If active, switch to description
            const activeBtn = document.querySelector('.tab-btn.active');
            if (activeBtn && activeBtn.dataset && activeBtn.dataset.tab === 'shipping') this.activateTab('description');
            return;
        }

        // Ensure tab button visible
        const btn = document.querySelector('.tab-btn[data-tab="shipping"]');
        if (btn) btn.style.display = '';

        let wrap = document.querySelector('#shipping .tab-content .shipping-info');
        if (!wrap) {
            container.innerHTML = '<div class="shipping-info"></div>';
            wrap = document.querySelector('#shipping .tab-content .shipping-info');
        }

        const msg = hasContent ? (pd.shipping_html || pd.shipping) : 'Sin información de envío.';
        wrap.innerHTML = `
            <div class="shipping-option">
                <h4>🚚 Información de Envío</h4>
                <div>${msg}</div>
            </div>
        `;
    }

    async init() {
        // Get product slug from URL (?slug=...)
        const slug = this.getProductSlug();
        if (slug) {
            await this.loadProductData(slug);
            this.setupEventListeners();
            this.initializeGallery();
            this.initializeTabs();
            // If there is a hash, activate that tab on load
            const h = (window.location.hash || '').replace('#','');
            if (h) this.activateTab(h);
            // Keep tabs in sync with hash changes
            window.addEventListener('hashchange', () => {
                const hh = (window.location.hash || '').replace('#','');
                if (hh) this.activateTab(hh);
            });
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
            if (!s) return { name: '', value: '' };
            if (typeof s === 'string') {
                const idx = s.indexOf(':');
                return idx > -1 ? { name: s.slice(0, idx).trim(), value: s.slice(idx + 1).trim() } : { name: s, value: '' };
            }
            // If object with explicit name/value (from front matter)
            if (typeof s === 'object' && ('name' in s || 'value' in s)) {
                return { name: String(s.name || '').trim(), value: String(s.value || '').trim() };
            }
            // Fallback: take first key as name and its value as value
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
            payment_methods: (Array.isArray(p.payment_methods) && p.payment_methods.length > 0) ? p.payment_methods : ['bcp','yape','plin'],
            shipping: p.shipping || '',
            // New editable/optional fields
            show_payment_credit: p.show_payment_credit !== false,
            show_payment_cash: p.show_payment_cash !== false,
            show_monthly: p.show_monthly !== false,
            show_price_online: p.show_price_online !== false,
            payment_credit_html: p.payment_credit_html || '',
            payment_cash_html: p.payment_cash_html || '',
            show_shipping: p.show_shipping !== false,
            shipping_html: p.shipping_html || ''
        };
    }

    renderProductData() {
        if (!this.productData) return;

        // Update page title and meta
        document.title = `${this.productData.title} - Credicálidda`;
        
        // Update breadcrumb
        document.getElementById('breadcrumb-product').textContent = this.productData.title;

        // Update product info (hide description at top; all details live in tabs)
        document.getElementById('product-brand').textContent = this.productData.brand || '';
        document.getElementById('product-title').textContent = this.productData.title || '';
        const descEl = document.getElementById('product-description');
        if (descEl) {
            descEl.textContent = '';
            descEl.style.display = 'none';
        }

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

        // Update detailed description (fallback message) with robust fallbacks
        const descHTML = (this.productData.detailed_description && this.productData.detailed_description.trim())
            ? this.productData.detailed_description
            : '<p>Aún no hay una descripción detallada para este producto.</p>';
        let dd = document.getElementById('detailed-description');
        if (dd) {
            dd.innerHTML = descHTML;
        } else {
            // Fallback: write directly into description tab content
            const descPanel = document.querySelector('#description .tab-content');
            if (descPanel) {
                descPanel.innerHTML = `<h3>Descripción del Producto</h3>${descHTML}`;
                const parent = descPanel.closest('.tab-panel');
                if (parent) parent.style.display = parent.classList.contains('active') ? 'block' : 'none';
            } else {
                console.debug('[ProductPage] No se encontró contenedor de descripción');
            }
        }

        // Update payments and shipping
        this.updatePayments();
        this.updateShipping();

        // Double-check tabs populated (defensive)
        setTimeout(() => {
            try {
                const dd2 = document.getElementById('detailed-description');
                if (dd2 && dd2.innerHTML.trim() === '') {
                    dd2.innerHTML = '<p>Aún no hay una descripción detallada para este producto.</p>';
                }
                const specsEl = document.getElementById('specifications-list');
                if (specsEl && specsEl.children.length === 0) {
                    this.updateSpecifications();
                }
                const payWrap = document.querySelector('#payment .tab-content');
                if (payWrap && payWrap.innerHTML.trim() === '') {
                    this.updatePayments();
                }
                let shipWrap = document.querySelector('#shipping .tab-content .shipping-info');
                if (!shipWrap) {
                    const scont = document.querySelector('#shipping .tab-content');
                    if (scont) {
                        scont.innerHTML = '<div class="shipping-info"></div>';
                        shipWrap = scont.querySelector('.shipping-info');
                    }
                }
                if (shipWrap && shipWrap.innerHTML.trim() === '') this.updateShipping();
            } catch (e) { console.debug('[ProductPage] Defensive populate error', e); }
        }, 0);
    }

    updateProductImages() {
        const mainImage = document.getElementById('main-product-image');
        const thumbnailsContainer = document.getElementById('product-thumbnails');
        
        const toProxy = (url) => {
            try {
                if (!url) return url;
                const u = String(url);
                if (/^https?:\/\//i.test(u)) {
                    // Use weserv proxy (expects hostless URL)
                    const hostless = u.replace(/^https?:\/\//i, '');
                    return `https://images.weserv.nl/?url=${encodeURIComponent(hostless)}`;
                }
                return url;
            } catch { return url; }
        };

        if (this.productData.images && this.productData.images.length > 0) {
            // Set main image
            mainImage.dataset.src = this.productData.images[0];
            mainImage.src = this.productData.images[0];
            mainImage.alt = this.productData.title;
            let triedProxyMain = false;
            mainImage.onerror = () => {
                if (!triedProxyMain) {
                    triedProxyMain = true;
                    mainImage.src = toProxy(mainImage.dataset.src);
                } else {
                    mainImage.src = '/images/placeholder-product.jpg';
                }
            };

            // Create thumbnails
            thumbnailsContainer.innerHTML = this.productData.images.map((image, index) => `
                <div class="thumbnail ${index === 0 ? 'active' : ''}"
                     onclick="productPageManager.changeMainImage(${index})"
                     onmouseenter="productPageManager.changeMainImage(${index})">
                    <img src="${image}" data-src="${image}" alt="${this.productData.title}" loading="lazy">
                </div>
            `).join('');

            // Attach error fallback for thumbnails
            thumbnailsContainer.querySelectorAll('img').forEach(img => {
                let tried = false;
                img.addEventListener('error', () => {
                    if (!tried) {
                        tried = true;
                        const original = img.getAttribute('data-src') || img.src;
                        const hostless = String(original).replace(/^https?:\/\//i, '');
                        img.src = `https://images.weserv.nl/?url=${encodeURIComponent(hostless)}`;
                    } else {
                        const thumb = img.closest('.thumbnail');
                        if (thumb) thumb.style.display = 'none';
                    }
                });
            });
        }
    }

    updateSpecifications() {
        const specsContainer = document.getElementById('specifications-list');
        if (Array.isArray(this.productData.specifications) && this.productData.specifications.length > 0) {
            specsContainer.innerHTML = this.productData.specifications.map(spec => `
                <tr>
                    <td class="spec-name">${spec.name}</td>
                    <td class="spec-value">${spec.value}</td>
                </tr>
            `).join('');
        } else {
            specsContainer.innerHTML = `
                <tr>
                    <td class="spec-name">—</td>
                    <td class="spec-value">Sin especificaciones técnicas</td>
                </tr>
            `;
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
        if (!stockElement) return; // UI de stock removida en product.html
        if (this.productData.stock > 0) {
            stockElement.textContent = `${this.productData.stock} unidades disponibles`;
            stockElement.className = 'stock-available';
        } else {
            stockElement.textContent = 'Agotado';
            stockElement.className = 'stock-unavailable';
        }
    }

    setupEventListeners() {
        const waBtn = document.getElementById('whatsapp-btn');
        const calcBtn = document.getElementById('calculate-financing');

        // WhatsApp button
        if (waBtn) waBtn.addEventListener('click', (e) => { e.preventDefault(); this.contactWhatsApp(); });
        // Calculate financing button
        if (calcBtn) calcBtn.addEventListener('click', () => this.calculateFinancing());
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

        // Initialize visibility based on 'active' class
        tabPanels.forEach(panel => {
            panel.style.display = panel.classList.contains('active') ? 'block' : 'none';
        });

        tabButtons.forEach((button, index) => {
            button.addEventListener('click', () => {
                // Remove active class from all tabs and panels
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabPanels.forEach(panel => { panel.classList.remove('active'); panel.style.display = 'none'; });

                // Add active class to clicked tab and corresponding panel
                button.classList.add('active');
                tabPanels[index].classList.add('active');
                tabPanels[index].style.display = 'block';
                // Update hash for deep-linking
                const id = tabPanels[index].id;
                if (id) history.replaceState(null, '', `#${id}`);
            });
        });

        // Delegate clicks from summary link to activate tab
        document.addEventListener('click', (e) => {
            const a = e.target.closest('a.more-link[data-tab]');
            if (!a) return;
            e.preventDefault();
            const id = a.getAttribute('data-tab');
            if (id) {
                this.activateTab(id);
                history.replaceState(null, '', `#${id}`);
                const tabsTop = document.querySelector('.product-details');
                if (tabsTop) tabsTop.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    changeMainImage(index) {
        if (this.productData.images && this.productData.images[index]) {
            const img = document.getElementById('main-product-image');
            img.dataset.src = this.productData.images[index];
            let triedProxy = false;
            img.onerror = () => {
                if (!triedProxy) {
                    triedProxy = true;
                    const hostless = String(img.dataset.src || '').replace(/^https?:\/\//i, '');
                    img.src = `https://images.weserv.nl/?url=${encodeURIComponent(hostless)}`;
                } else {
                    img.src = '/images/placeholder-product.jpg';
                }
            };
            img.src = this.productData.images[index];
            
            // Update active thumbnail
            document.querySelectorAll('.thumbnail').forEach((thumb, i) => {
                thumb.classList.toggle('active', i === index);
            });
            
            this.currentImageIndex = index;
        }
    }

    // Quantity UI removed

    contactWhatsApp() {
        const qty = this.quantity || 1;
        const price = (this.productData && typeof this.productData.price_online === 'number')
            ? `Precio online: S/ ${this.productData.price_online.toFixed(2)}`
            : '';
        const monthly = (this.productData && this.productData.show_monthly !== false && typeof this.productData.monthly_payment === 'number')
            ? `Quiero pagar en cuotas desde: S/ ${this.productData.monthly_payment.toFixed(2)} al mes`
            : '';
        const url = window.location.href;
        const msg = [
            `Hola 👋, me interesa este producto: ${this.productData?.title || ''}`,
            price,
            monthly,
            `Cantidad: ${qty}`,
            `Link: ${url}`
        ].filter(Boolean).join('\n');

        // Try to use a global setting if exists, else fallback
        const number = (window.CredicAlidda && window.CredicAlidda.whatsapp)
            || (window.SiteSettings && window.SiteSettings.whatsapp)
            || '51999999999';

        const whatsappUrl = `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;
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
