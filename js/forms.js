// Forms handling and validation for Credicálidda

class FormManager {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupContactForm();
        this.setupNewsletterForm();
        this.setupSearchForm();
    }
    
    setupContactForm() {
        const contactForm = Utils.$('#contactForm');
        const contactModal = Utils.$('#contactModal');
        const closeModalBtn = Utils.$('#closeModal');
        const cancelBtn = Utils.$('#cancelBtn');
        
        if (contactForm) {
            Utils.addEvent(contactForm, 'submit', (e) => this.handleContactSubmit(e));
        }
        
        if (closeModalBtn) {
            Utils.addEvent(closeModalBtn, 'click', () => this.closeContactModal());
        }
        
        if (cancelBtn) {
            Utils.addEvent(cancelBtn, 'click', () => this.closeContactModal());
        }
        
        if (contactModal) {
            Utils.addEvent(contactModal, 'click', (e) => {
                if (e.target === contactModal) {
                    this.closeContactModal();
                }
            });
        }
        
        // Form validation on input
        const formInputs = contactForm?.querySelectorAll('input[required]');
        formInputs?.forEach(input => {
            Utils.addEvent(input, 'blur', () => this.validateField(input));
            Utils.addEvent(input, 'input', () => this.clearFieldError(input));
        });
    }
    
    setupNewsletterForm() {
        const newsletterForm = Utils.$('#newsletterForm');
        
        if (newsletterForm) {
            Utils.addEvent(newsletterForm, 'submit', (e) => this.handleNewsletterSubmit(e));
        }
    }
    
    setupSearchForm() {
        const searchForm = Utils.$('#searchForm');
        const searchInput = Utils.$('#searchInput');
        
        if (searchForm) {
            Utils.addEvent(searchForm, 'submit', (e) => this.handleSearchSubmit(e));
        }
        
        if (searchInput) {
            // Debounced search as user types
            Utils.addEvent(searchInput, 'input', Utils.debounce((e) => {
                this.handleSearchInput(e.target.value);
            }, 300));
        }
    }
    
    handleContactSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const userData = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            dni: formData.get('dni'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            acceptMarketing: formData.get('acceptMarketing') === 'on'
        };
        
        // Validate form
        const validation = this.validateContactForm(userData);
        if (!validation.isValid) {
            this.showFormErrors(validation.errors);
            return;
        }
        
        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<div class="loading-spinner"></div> Enviando...';
        submitBtn.disabled = true;
        
        // Simulate form processing
        setTimeout(() => {
            this.processContactForm(userData);
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }, 1500);
    }
    
    processContactForm(userData) {
        try {
            // Get current products from ProductManager
            const products = ProductManager.instance?.currentProducts || [];
            
            if (products.length === 0) {
                this.showNotification('Error: No hay productos seleccionados', 'error');
                return;
            }
            
            // Generate WhatsApp URL
            const whatsappUrl = ProductManager.instance.generateWhatsAppMessage(userData, products);
            
            // Save lead data to localStorage for analytics
            this.saveLead(userData, products);
            
            // Close modal
            this.closeContactModal();
            
            // Show success message
            this.showNotification('Redirigiendo a WhatsApp...', 'success');
            
            // Open WhatsApp after a short delay
            setTimeout(() => {
                window.open(whatsappUrl, '_blank');
            }, 1000);
            
        } catch (error) {
            Utils.errorHandler.log(error, 'processContactForm');
            this.showNotification('Error al procesar el formulario. Intenta nuevamente.', 'error');
        }
    }
    
    handleNewsletterSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const email = formData.get('email');
        
        if (!Utils.validate.email(email)) {
            this.showNotification('Por favor ingresa un email válido', 'error');
            return;
        }
        
        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.innerHTML = '<div class="loading-spinner"></div>';
        submitBtn.disabled = true;
        
        // Simulate newsletter subscription
        setTimeout(() => {
            this.processNewsletterSubscription(email);
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            form.reset();
        }, 1000);
    }
    
    processNewsletterSubscription(email) {
        try {
            // Save newsletter subscription
            const newsletters = Utils.storage.get('newsletters') || [];
            
            if (!newsletters.includes(email)) {
                newsletters.push(email);
                Utils.storage.set('newsletters', newsletters);
                this.showNotification('¡Suscripción exitosa! Gracias por unirte.', 'success');
            } else {
                this.showNotification('Este email ya está suscrito.', 'info');
            }
            
        } catch (error) {
            Utils.errorHandler.log(error, 'processNewsletterSubscription');
            this.showNotification('Error al suscribirse. Intenta nuevamente.', 'error');
        }
    }
    
    handleSearchSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const query = formData.get('search') || formData.get('q');
        
        if (query && query.trim()) {
            this.performSearch(query.trim());
        }
    }
    
    handleSearchInput(query) {
        // If SmartSearch exists, do not run legacy suggestions to avoid conflicts
        if (document.getElementById('searchSuggestions')) return;

        if (query.trim().length >= 2) {
            this.showSearchSuggestions(query.trim());
        } else {
            this.hideSearchSuggestions();
        }
    }
    
    performSearch(query) {
        try {
            // Redirect to products page with search query
            const url = new URL('/productos.html', window.location.origin);
            url.searchParams.set('search', query);
            window.location.href = url.toString();
            
        } catch (error) {
            Utils.errorHandler.log(error, 'performSearch');
        }
    }
    
    showSearchSuggestions(query) {
        // If SmartSearch exists, skip legacy suggestions
        if (document.getElementById('searchSuggestions')) return;

        // Implementation for search suggestions dropdown
        // This would be implemented based on available products
        const suggestions = ProductManager.instance?.searchProducts(query).slice(0, 5) || [];
        
        // Create or update suggestions dropdown
        this.updateSearchSuggestions(suggestions, query);
    }
    
    updateSearchSuggestions(suggestions, query) {
        const searchContainer = Utils.$('.search-container');
        if (!searchContainer) return;
        // If SmartSearch exists, skip legacy suggestions
        if (document.getElementById('searchSuggestions')) return;
        
        // Remove existing suggestions
        const existingSuggestions = searchContainer.querySelector('.search-suggestions');
        if (existingSuggestions) {
            existingSuggestions.remove();
        }
        
        if (suggestions.length === 0) return;
        
        // Create suggestions dropdown
        const suggestionsEl = Utils.createElement('div', 'search-suggestions');
        
        suggestions.forEach(product => {
            const suggestion = Utils.createElement('div', 'search-suggestion');
            suggestion.innerHTML = `
                <div class="suggestion-image">
                    <img src="${product.images[0]}" alt="${product.name}" onerror="this.style.display='none'">
                </div>
                <div class="suggestion-content">
                    <div class="suggestion-name">${this.highlightQuery(product.name, query)}</div>
                    <div class="suggestion-price">${Utils.formatPrice(product.price)}</div>
                </div>
            `;
            
            Utils.addEvent(suggestion, 'click', () => {
                this.selectSearchSuggestion(product);
            });
            
            suggestionsEl.appendChild(suggestion);
        });
        
        searchContainer.appendChild(suggestionsEl);
    }
    
    highlightQuery(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }
    
    selectSearchSuggestion(product) {
        // Navigate to product page or perform action
        const searchInput = Utils.$('#searchInput');
        if (searchInput) {
            searchInput.value = product.name;
        }
        this.hideSearchSuggestions();
        this.performSearch(product.name);
    }
    
    hideSearchSuggestions() {
        // If SmartSearch exists, skip legacy removal to avoid deleting main suggestions container
        if (document.getElementById('searchSuggestions')) return;
        const suggestions = Utils.$('.search-suggestions');
        if (suggestions) {
            suggestions.remove();
        }
    }
    
    validateContactForm(userData) {
        const errors = {};
        let isValid = true;
        
        // Validate first name
        if (!Utils.validate.required(userData.firstName)) {
            errors.firstName = 'El nombre es requerido';
            isValid = false;
        } else if (!Utils.validate.minLength(userData.firstName, 2)) {
            errors.firstName = 'El nombre debe tener al menos 2 caracteres';
            isValid = false;
        }
        
        // Validate last name
        if (!Utils.validate.required(userData.lastName)) {
            errors.lastName = 'El apellido es requerido';
            isValid = false;
        } else if (!Utils.validate.minLength(userData.lastName, 2)) {
            errors.lastName = 'El apellido debe tener al menos 2 caracteres';
            isValid = false;
        }
        
        // Validate DNI
        if (!Utils.validate.required(userData.dni)) {
            errors.dni = 'El DNI es requerido';
            isValid = false;
        } else if (!Utils.validate.dni(userData.dni)) {
            errors.dni = 'El DNI debe tener 8 dígitos';
            isValid = false;
        }
        
        // Validate email
        if (!Utils.validate.required(userData.email)) {
            errors.email = 'El email es requerido';
            isValid = false;
        } else if (!Utils.validate.email(userData.email)) {
            errors.email = 'Ingresa un email válido';
            isValid = false;
        }
        
        // Validate phone (optional)
        if (userData.phone && !Utils.validate.phone(userData.phone)) {
            errors.phone = 'Ingresa un teléfono válido';
            isValid = false;
        }
        
        return { isValid, errors };
    }
    
    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        let error = '';
        
        switch (fieldName) {
            case 'firstName':
            case 'lastName':
                if (!Utils.validate.required(value)) {
                    error = 'Este campo es requerido';
                } else if (!Utils.validate.minLength(value, 2)) {
                    error = 'Debe tener al menos 2 caracteres';
                }
                break;
                
            case 'dni':
                if (!Utils.validate.required(value)) {
                    error = 'El DNI es requerido';
                } else if (!Utils.validate.dni(value)) {
                    error = 'El DNI debe tener 8 dígitos';
                }
                break;
                
            case 'email':
                if (!Utils.validate.required(value)) {
                    error = 'El email es requerido';
                } else if (!Utils.validate.email(value)) {
                    error = 'Ingresa un email válido';
                }
                break;
                
            case 'phone':
                if (value && !Utils.validate.phone(value)) {
                    error = 'Ingresa un teléfono válido';
                }
                break;
        }
        
        this.showFieldError(field, error);
        return !error;
    }
    
    showFieldError(field, error) {
        this.clearFieldError(field);
        
        if (error) {
            field.classList.add('error');
            
            const errorEl = Utils.createElement('div', 'field-error', error);
            field.parentNode.appendChild(errorEl);
        }
    }
    
    clearFieldError(field) {
        field.classList.remove('error');
        
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }
    
    showFormErrors(errors) {
        Object.keys(errors).forEach(fieldName => {
            const field = Utils.$(`[name="${fieldName}"]`);
            if (field) {
                this.showFieldError(field, errors[fieldName]);
            }
        });
        
        // Focus on first error field
        const firstErrorField = Utils.$('.error');
        if (firstErrorField) {
            firstErrorField.focus();
        }
    }
    
    closeContactModal() {
        const modal = Utils.$('#contactModal');
        if (modal) {
            modal.classList.remove('active');
            
            // Clear form
            const form = modal.querySelector('form');
            if (form) {
                form.reset();
                this.clearAllErrors(form);
            }
        }
    }
    
    clearAllErrors(form) {
        const errorFields = form.querySelectorAll('.error');
        errorFields.forEach(field => this.clearFieldError(field));
        
        const errorMessages = form.querySelectorAll('.field-error');
        errorMessages.forEach(error => error.remove());
    }
    
    saveLead(userData, products) {
        try {
            const leads = Utils.storage.get('leads') || [];
            
            const lead = {
                id: Date.now().toString(),
                userData,
                products: products.map(p => ({
                    id: p.id,
                    name: p.name,
                    price: p.price
                })),
                timestamp: new Date().toISOString(),
                source: 'contact_form'
            };
            
            leads.push(lead);
            Utils.storage.set('leads', leads);
            
        } catch (error) {
            Utils.errorHandler.log(error, 'saveLead');
        }
    }
    
    showNotification(message, type = 'info') {
        // Reuse the notification system from ProductManager
        if (ProductManager.instance) {
            ProductManager.instance.showNotification(message, type);
        } else {
            alert(message); // Fallback
        }
    }
}

// Global function to open WhatsApp (called from HTML)
window.openWhatsApp = () => {
    const number = (window.CredicAlidda && window.CredicAlidda.whatsapp)
        || (window.SiteSettings && window.SiteSettings.whatsapp)
        || '51967156094';
    const defaultMessage = encodeURIComponent(
        '¡Hola! Me interesa obtener más información sobre sus productos y servicios financieros. ¿Podrían brindarme asesoría personalizada?'
    );
    const whatsappUrl = `https://api.whatsapp.com/send/?phone=${number}&text=${defaultMessage}&type=phone_number&app_absent=0`;
    window.open(whatsappUrl, '_blank');
};

// Initialize form manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.FormManager = new FormManager();
});

// Export for global access
window.FormManager = FormManager;
