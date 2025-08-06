// Smart Search Functionality
class SmartSearch {
    constructor() {
        this.searchInput = document.getElementById('searchInput');
        this.searchForm = document.getElementById('searchForm');
        this.searchSuggestions = document.getElementById('searchSuggestions');
        this.popularSearches = document.getElementById('popularSearches');
        this.dynamicSuggestions = document.getElementById('dynamicSuggestions');
        this.noResults = document.getElementById('noResults');
        this.similarCategories = document.getElementById('similarCategories');
        
        this.currentFocus = -1;
        this.isOpen = false;
        
        // Categories database
        this.categories = [
            {
                name: 'Celulares',
                key: 'celulares',
                keywords: ['celular', 'móvil', 'smartphone', 'teléfono', 'iphone', 'android'],
                icon: `<rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line>`
            },
            {
                name: 'Televisores',
                key: 'televisores',
                keywords: ['tv', 'televisor', 'smart tv', 'pantalla', 'monitor'],
                icon: `<rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line>`
            },
            {
                name: 'Electrodomésticos',
                key: 'electrodomesticos',
                keywords: ['electrodoméstico', 'lavadora', 'refrigeradora', 'cocina', 'horno', 'microondas', 'licuadora'],
                icon: `<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-1.414-.586H13"></path>`
            },
            {
                name: 'Tecnología',
                key: 'tecnologia',
                keywords: ['laptop', 'computadora', 'tablet', 'auriculares', 'cámara', 'tecnología'],
                icon: `<rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m10 16 6-6-6-6"></path>`
            },
            {
                name: 'Muebles',
                key: 'muebles',
                keywords: ['mueble', 'sala', 'cama', 'mesa', 'silla', 'sofá', 'closet'],
                icon: `<path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3"></path><path d="M2 16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0v5Z"></path>`
            },
            {
                name: 'Motos y Scooters',
                key: 'motos-scooters',
                keywords: ['moto', 'scooter', 'motocicleta', 'bicicleta'],
                icon: `<path d="M5 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"></path><path d="M19 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"></path><path d="M10.5 12V7"></path><path d="M8 7h8l4 5"></path>`
            },
            {
                name: 'Tablets',
                key: 'tablets',
                keywords: ['tablet', 'ipad'],
                icon: `<rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line>`
            },
            {
                name: 'Gamer',
                key: 'gamer',
                keywords: ['gaming', 'gamer', 'videojuego', 'consola', 'playstation', 'xbox', 'nintendo'],
                icon: `<rect x="2" y="6" width="20" height="8" rx="1"></rect><path d="m6 12-2-2v8l2-2"></path><path d="m14 12 2-2v8l-2-2"></path><path d="M8 8v4"></path><path d="M16 8v4"></path>`
            },
            {
                name: 'Construcción',
                key: 'construccion',
                keywords: ['construcción', 'herramienta', 'cemento', 'ladrillo', 'pintura'],
                icon: `<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>`
            }
        ];
        
        this.init();
    }
    
    init() {
        // Event listeners
        this.searchInput.addEventListener('focus', () => this.showSuggestions());
        this.searchInput.addEventListener('input', (e) => this.handleInput(e));
        this.searchInput.addEventListener('keydown', (e) => this.handleKeydown(e));
        this.searchForm.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Click outside to close
        document.addEventListener('click', (e) => {
            if (!this.searchInput.contains(e.target) && !this.searchSuggestions.contains(e.target)) {
                this.hideSuggestions();
            }
        });
        
        // Add click handlers to popular searches
        this.addClickHandlers();
    }
    
    showSuggestions() {
        if (!this.isOpen) {
            this.searchSuggestions.classList.add('show');
            this.isOpen = true;
            
            if (this.searchInput.value.trim() === '') {
                this.showPopularSearches();
            } else {
                this.handleInput({ target: this.searchInput });
            }
        }
    }
    
    hideSuggestions() {
        this.searchSuggestions.classList.remove('show');
        this.isOpen = false;
        this.currentFocus = -1;
        this.hideAllSections();
    }
    
    showPopularSearches() {
        this.hideAllSections();
        this.popularSearches.classList.add('active');
    }
    
    hideAllSections() {
        this.popularSearches.classList.remove('active');
        this.dynamicSuggestions.classList.remove('active');
        this.noResults.classList.remove('active');
    }
    
    handleInput(e) {
        const query = e.target.value.trim().toLowerCase();
        
        if (query === '') {
            this.showPopularSearches();
            return;
        }
        
        const matches = this.searchCategories(query);
        
        if (matches.length > 0) {
            this.showDynamicSuggestions(matches);
        } else {
            this.showNoResults(query);
        }
        
        this.currentFocus = -1;
    }
    
    searchCategories(query) {
        return this.categories.filter(category => {
            // Check if query matches category name or any keyword
            const nameMatch = category.name.toLowerCase().includes(query);
            const keywordMatch = category.keywords.some(keyword => 
                keyword.toLowerCase().includes(query) || query.includes(keyword.toLowerCase())
            );
            return nameMatch || keywordMatch;
        });
    }
    
    showDynamicSuggestions(matches) {
        this.hideAllSections();
        this.dynamicSuggestions.classList.add('active');
        
        const html = `
            <div class="suggestions-header">Categorías encontradas</div>
            ${matches.map(category => `
                <div class="suggestion-item" data-category="${category.key}">
                    <svg class="suggestion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        ${category.icon}
                    </svg>
                    <span>${category.name}</span>
                </div>
            `).join('')}
        `;
        
        this.dynamicSuggestions.innerHTML = html;
        this.addClickHandlers();
    }
    
    showNoResults(query) {
        this.hideAllSections();
        this.noResults.classList.add('active');
        
        // Show similar categories (popular ones)
        const similarCategories = this.categories.slice(0, 4);
        const html = similarCategories.map(category => `
            <div class="suggestion-item" data-category="${category.key}">
                <svg class="suggestion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    ${category.icon}
                </svg>
                <span>${category.name}</span>
            </div>
        `).join('');
        
        this.similarCategories.innerHTML = html;
        this.addClickHandlers();
    }
    
    addClickHandlers() {
        const suggestionItems = this.searchSuggestions.querySelectorAll('.suggestion-item');
        suggestionItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const category = item.getAttribute('data-category');
                this.selectCategory(category);
            });
        });
    }
    
    handleKeydown(e) {
        const suggestionItems = this.searchSuggestions.querySelectorAll('.suggestion-item:not([style*="display: none"])');
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.currentFocus++;
            if (this.currentFocus >= suggestionItems.length) this.currentFocus = 0;
            this.setActive(suggestionItems);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.currentFocus--;
            if (this.currentFocus < 0) this.currentFocus = suggestionItems.length - 1;
            this.setActive(suggestionItems);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (this.currentFocus > -1) {
                const category = suggestionItems[this.currentFocus].getAttribute('data-category');
                this.selectCategory(category);
            } else {
                this.handleSubmit(e);
            }
        } else if (e.key === 'Escape') {
            this.hideSuggestions();
            this.searchInput.blur();
        }
    }
    
    setActive(suggestionItems) {
        // Remove highlighting from all items
        suggestionItems.forEach(item => item.classList.remove('highlighted'));
        
        // Highlight current item
        if (this.currentFocus >= 0 && suggestionItems[this.currentFocus]) {
            suggestionItems[this.currentFocus].classList.add('highlighted');
        }
    }
    
    selectCategory(categoryKey) {
        // Redirect to novedades.html with category filter
        window.location.href = `novedades.html?categoria=${categoryKey}`;
    }
    
    handleSubmit(e) {
        e.preventDefault();
        const query = this.searchInput.value.trim();
        
        if (query === '') return;
        
        // Try to find exact match first
        const exactMatch = this.categories.find(category => 
            category.name.toLowerCase() === query.toLowerCase() ||
            category.keywords.some(keyword => keyword.toLowerCase() === query.toLowerCase())
        );
        
        if (exactMatch) {
            this.selectCategory(exactMatch.key);
        } else {
            // Try partial match
            const partialMatch = this.searchCategories(query);
            if (partialMatch.length > 0) {
                this.selectCategory(partialMatch[0].key);
            } else {
                // Fallback to general search in tecnologia category
                window.location.href = `novedades.html?busqueda=${encodeURIComponent(query)}`;
            }
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SmartSearch();
});
