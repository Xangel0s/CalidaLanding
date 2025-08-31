#!/usr/bin/env python3
"""
Servidor Python para Credicálidda - CMS y API de Productos
Desarrollado para pruebas en producción
"""

import json
import os
import re
from datetime import datetime
from flask import Flask, render_template_string, jsonify, request, send_from_directory, redirect, url_for
from flask_cors import CORS
import logging

# Configuración de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Habilitar CORS para desarrollo

# Configuración
PORT = int(os.environ.get('PORT', 3000))
DEBUG = os.environ.get('DEBUG', 'True').lower() == 'true'

class ProductManager:
    """Gestor de productos del catálogo"""
    
    def __init__(self, catalog_path='data/catalogo.json'):
        self.catalog_path = catalog_path
        self.catalog = self.load_catalog()
    
    def load_catalog(self):
        """Cargar catálogo desde JSON"""
        try:
            with open(self.catalog_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                logger.info(f"Catálogo cargado: {len(data.get('items', []))} productos")
                return data
        except Exception as e:
            logger.error(f"Error cargando catálogo: {e}")
            return {"items": []}
    
    def get_all_products(self, filters=None):
        """Obtener todos los productos con filtros opcionales"""
        products = self.catalog.get('items', [])
        
        if filters:
            products = self.apply_filters(products, filters)
        
        return products
    
    def apply_filters(self, products, filters):
        """Aplicar filtros a los productos"""
        filtered = products
        
        # Filtro por categoría
        if filters.get('categoria'):
            categoria = filters['categoria'].lower()
            filtered = [p for p in filtered if p.get('categoria', '').lower() == categoria]
        
        # Filtro por marca
        if filters.get('brand'):
            brand = filters['brand'].lower()
            filtered = [p for p in filtered if p.get('brand', '').lower() == brand]
        
        # Filtro por precio
        if filters.get('min_price'):
            min_price = float(filters['min_price'])
            filtered = [p for p in filtered if p.get('price_online', 0) >= min_price]
        
        if filters.get('max_price'):
            max_price = float(filters['max_price'])
            filtered = [p for p in filtered if p.get('price_online', 0) <= max_price]
        
        # Filtro por destacados
        if filters.get('destacado'):
            filtered = [p for p in filtered if p.get('destacado', False)]
        
        # Filtro por más vendidos
        if filters.get('mas_vendido'):
            filtered = [p for p in filtered if p.get('mas_vendido', False)]
        
        # Filtro por visibilidad
        if filters.get('visible') is not None:
            visible = filters['visible'].lower() == 'true'
            filtered = [p for p in filtered if p.get('visible', True) == visible]
        
        return filtered
    
    def get_product_by_slug(self, slug):
        """Obtener producto por slug"""
        products = self.catalog.get('items', [])
        for product in products:
            if product.get('slug') == slug:
                return product
        return None
    
    def get_categories(self):
        """Obtener todas las categorías únicas"""
        products = self.catalog.get('items', [])
        categories = set()
        for product in products:
            if product.get('categoria'):
                categories.add(product['categoria'])
        return sorted(list(categories))
    
    def get_brands(self):
        """Obtener todas las marcas únicas"""
        products = self.catalog.get('items', [])
        brands = set()
        for product in products:
            if product.get('brand'):
                brands.add(product['brand'])
        return sorted(list(brands))
    
    def search_products(self, query):
        """Buscar productos por texto"""
        products = self.catalog.get('items', [])
        query = query.lower()
        
        results = []
        for product in products:
            # Buscar en título
            if query in product.get('title', '').lower():
                results.append(product)
                continue
            
            # Buscar en descripción
            if query in product.get('description', '').lower():
                results.append(product)
                continue
            
            # Buscar en marca
            if query in product.get('brand', '').lower():
                results.append(product)
                continue
            
            # Buscar en slug
            if query in product.get('slug', '').lower():
                results.append(product)
                continue
        
        return results

# Inicializar gestor de productos
product_manager = ProductManager()

# Rutas principales
@app.route('/')
def index():
    """Página principal"""
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    """Servir archivos estáticos"""
    return send_from_directory('.', filename)

# API REST para productos
@app.route('/api/products', methods=['GET'])
def api_products():
    """API: Obtener productos con filtros"""
    try:
        filters = {}
        
        # Parámetros de filtro
        for param in ['categoria', 'brand', 'min_price', 'max_price', 'destacado', 'mas_vendido', 'visible']:
            if request.args.get(param):
                filters[param] = request.args.get(param)
        
        # Parámetros de paginación
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        
        # Obtener productos filtrados
        products = product_manager.get_all_products(filters)
        
        # Paginación
        total = len(products)
        start = (page - 1) * per_page
        end = start + per_page
        paginated_products = products[start:end]
        
        return jsonify({
            'success': True,
            'data': {
                'products': paginated_products,
                'pagination': {
                    'page': page,
                    'per_page': per_page,
                    'total': total,
                    'pages': (total + per_page - 1) // per_page
                },
                'filters': filters
            }
        })
    
    except Exception as e:
        logger.error(f"Error en API products: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/products/<slug>', methods=['GET'])
def api_product_detail(slug):
    """API: Obtener detalle de producto por slug"""
    try:
        product = product_manager.get_product_by_slug(slug)
        if product:
            return jsonify({
                'success': True,
                'data': product
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Producto no encontrado'
            }), 404
    
    except Exception as e:
        logger.error(f"Error en API product detail: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/search', methods=['GET'])
def api_search():
    """API: Buscar productos"""
    try:
        query = request.args.get('q', '')
        if not query:
            return jsonify({
                'success': False,
                'error': 'Query parameter "q" is required'
            }), 400
        
        results = product_manager.search_products(query)
        
        return jsonify({
            'success': True,
            'data': {
                'query': query,
                'results': results,
                'count': len(results)
            }
        })
    
    except Exception as e:
        logger.error(f"Error en API search: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/categories', methods=['GET'])
def api_categories():
    """API: Obtener categorías"""
    try:
        categories = product_manager.get_categories()
        return jsonify({
            'success': True,
            'data': categories
        })
    
    except Exception as e:
        logger.error(f"Error en API categories: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/brands', methods=['GET'])
def api_brands():
    """API: Obtener marcas"""
    try:
        brands = product_manager.get_brands()
        return jsonify({
            'success': True,
            'data': brands
        })
    
    except Exception as e:
        logger.error(f"Error en API brands: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/stats', methods=['GET'])
def api_stats():
    """API: Estadísticas del catálogo"""
    try:
        products = product_manager.get_all_products()
        
        stats = {
            'total_products': len(products),
            'visible_products': len([p for p in products if p.get('visible', True)]),
            'destacados': len([p for p in products if p.get('destacado', False)]),
            'mas_vendidos': len([p for p in products if p.get('mas_vendido', False)]),
            'categories': len(product_manager.get_categories()),
            'brands': len(product_manager.get_brands()),
            'price_range': {
                'min': min([p.get('price_online', 0) for p in products if p.get('price_online')], default=0),
                'max': max([p.get('price_online', 0) for p in products if p.get('price_online')], default=0)
            }
        }
        
        return jsonify({
            'success': True,
            'data': stats
        })
    
    except Exception as e:
        logger.error(f"Error en API stats: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

# Interfaz web para probar productos
@app.route('/admin/test')
def admin_test():
    """Interfaz web para probar productos"""
    html_template = """
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Credicálidda - Admin Test</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Inter', sans-serif; background: #f5f5f5; }
            .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
            .header { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .header h1 { color: #00BCD4; margin-bottom: 10px; }
            .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px; }
            .stat-card { background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .stat-card h3 { color: #333; margin-bottom: 5px; }
            .stat-card .value { font-size: 24px; font-weight: bold; color: #00BCD4; }
            .controls { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .controls h2 { margin-bottom: 15px; color: #333; }
            .filter-group { margin-bottom: 15px; }
            .filter-group label { display: block; margin-bottom: 5px; font-weight: 500; }
            .filter-group select, .filter-group input { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
            .btn { background: #00BCD4; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin-right: 10px; }
            .btn:hover { background: #0097A7; }
            .btn-secondary { background: #666; }
            .btn-secondary:hover { background: #555; }
            .products { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
            .product-card { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .product-image { width: 100%; height: 200px; object-fit: cover; }
            .product-info { padding: 15px; }
            .product-title { font-weight: bold; margin-bottom: 10px; color: #333; }
            .product-price { font-size: 18px; color: #00BCD4; font-weight: bold; margin-bottom: 5px; }
            .product-brand { color: #666; font-size: 14px; margin-bottom: 5px; }
            .product-category { background: #e3f2fd; color: #1976d2; padding: 2px 8px; border-radius: 12px; font-size: 12px; display: inline-block; }
            .loading { text-align: center; padding: 40px; color: #666; }
            .error { background: #ffebee; color: #c62828; padding: 15px; border-radius: 4px; margin-bottom: 20px; }
            .pagination { display: flex; justify-content: center; gap: 10px; margin-top: 20px; }
            .pagination button { padding: 8px 12px; border: 1px solid #ddd; background: white; cursor: pointer; }
            .pagination button.active { background: #00BCD4; color: white; border-color: #00BCD4; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔧 Credicálidda - Panel de Pruebas</h1>
                <p>Interfaz para probar productos y API del catálogo</p>
            </div>
            
            <div id="stats" class="stats">
                <div class="loading">Cargando estadísticas...</div>
            </div>
            
            <div class="controls">
                <h2>🎛️ Controles de Filtro</h2>
                <div class="filter-group">
                    <label for="category">Categoría:</label>
                    <select id="category">
                        <option value="">Todas las categorías</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label for="brand">Marca:</label>
                    <select id="brand">
                        <option value="">Todas las marcas</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label for="search">Buscar:</label>
                    <input type="text" id="search" placeholder="Buscar productos...">
                </div>
                <div class="filter-group">
                    <label>
                        <input type="checkbox" id="destacados"> Solo destacados
                    </label>
                </div>
                <div class="filter-group">
                    <label>
                        <input type="checkbox" id="masVendidos"> Solo más vendidos
                    </label>
                </div>
                <button class="btn" onclick="loadProducts()">🔍 Filtrar Productos</button>
                <button class="btn btn-secondary" onclick="resetFilters()">🔄 Resetear</button>
                <button class="btn btn-secondary" onclick="loadStats()">📊 Actualizar Stats</button>
            </div>
            
            <div id="products" class="products">
                <div class="loading">Cargando productos...</div>
            </div>
            
            <div id="pagination" class="pagination"></div>
        </div>

        <script>
            let currentPage = 1;
            let totalPages = 1;
            
            // Cargar datos iniciales
            document.addEventListener('DOMContentLoaded', function() {
                loadStats();
                loadCategories();
                loadBrands();
                loadProducts();
            });
            
            async function loadStats() {
                try {
                    const response = await fetch('/api/stats');
                    const data = await response.json();
                    
                    if (data.success) {
                        const stats = data.data;
                        document.getElementById('stats').innerHTML = `
                            <div class="stat-card">
                                <h3>Total Productos</h3>
                                <div class="value">${stats.total_products}</div>
                            </div>
                            <div class="stat-card">
                                <h3>Productos Visibles</h3>
                                <div class="value">${stats.visible_products}</div>
                            </div>
                            <div class="stat-card">
                                <h3>Destacados</h3>
                                <div class="value">${stats.destacados}</div>
                            </div>
                            <div class="stat-card">
                                <h3>Más Vendidos</h3>
                                <div class="value">${stats.mas_vendidos}</div>
                            </div>
                            <div class="stat-card">
                                <h3>Categorías</h3>
                                <div class="value">${stats.categories}</div>
                            </div>
                            <div class="stat-card">
                                <h3>Marcas</h3>
                                <div class="value">${stats.brands}</div>
                            </div>
                        `;
                    }
                } catch (error) {
                    console.error('Error cargando stats:', error);
                }
            }
            
            async function loadCategories() {
                try {
                    const response = await fetch('/api/categories');
                    const data = await response.json();
                    
                    if (data.success) {
                        const select = document.getElementById('category');
                        data.data.forEach(category => {
                            const option = document.createElement('option');
                            option.value = category;
                            option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
                            select.appendChild(option);
                        });
                    }
                } catch (error) {
                    console.error('Error cargando categorías:', error);
                }
            }
            
            async function loadBrands() {
                try {
                    const response = await fetch('/api/brands');
                    const data = await response.json();
                    
                    if (data.success) {
                        const select = document.getElementById('brand');
                        data.data.forEach(brand => {
                            const option = document.createElement('option');
                            option.value = brand;
                            option.textContent = brand;
                            select.appendChild(option);
                        });
                    }
                } catch (error) {
                    console.error('Error cargando marcas:', error);
                }
            }
            
            async function loadProducts(page = 1) {
                try {
                    document.getElementById('products').innerHTML = '<div class="loading">Cargando productos...</div>';
                    
                    const params = new URLSearchParams({
                        page: page,
                        per_page: 12
                    });
                    
                    // Agregar filtros
                    const category = document.getElementById('category').value;
                    const brand = document.getElementById('brand').value;
                    const search = document.getElementById('search').value;
                    const destacados = document.getElementById('destacados').checked;
                    const masVendidos = document.getElementById('masVendidos').checked;
                    
                    if (category) params.append('categoria', category);
                    if (brand) params.append('brand', brand);
                    if (destacados) params.append('destacado', 'true');
                    if (masVendidos) params.append('mas_vendido', 'true');
                    
                    let url = '/api/products?' + params.toString();
                    
                    // Si hay búsqueda, usar endpoint de búsqueda
                    if (search) {
                        url = '/api/search?q=' + encodeURIComponent(search);
                    }
                    
                    const response = await fetch(url);
                    const data = await response.json();
                    
                    if (data.success) {
                        const products = search ? data.data.results : data.data.products;
                        const pagination = search ? null : data.data.pagination;
                        
                        if (pagination) {
                            currentPage = pagination.page;
                            totalPages = pagination.pages;
                        }
                        
                        renderProducts(products);
                        renderPagination();
                    } else {
                        document.getElementById('products').innerHTML = `
                            <div class="error">Error: ${data.error}</div>
                        `;
                    }
                } catch (error) {
                    console.error('Error cargando productos:', error);
                    document.getElementById('products').innerHTML = `
                        <div class="error">Error de conexión: ${error.message}</div>
                    `;
                }
            }
            
            function renderProducts(products) {
                if (products.length === 0) {
                    document.getElementById('products').innerHTML = '<div class="loading">No se encontraron productos</div>';
                    return;
                }
                
                const productsHtml = products.map(product => `
                    <div class="product-card">
                        <img src="${product.image || '/images/placeholder-product.jpg'}" alt="${product.title}" class="product-image" onerror="this.src='/images/placeholder-product.jpg'">
                        <div class="product-info">
                            <div class="product-title">${product.title}</div>
                            <div class="product-price">S/ ${product.price_online || 'N/A'}</div>
                            <div class="product-brand">${product.brand || 'Sin marca'}</div>
                            <div class="product-category">${product.categoria || 'Sin categoría'}</div>
                            ${product.destacado ? '<span style="color: #ff9800;">⭐ Destacado</span>' : ''}
                            ${product.mas_vendido ? '<span style="color: #4caf50;">🔥 Más vendido</span>' : ''}
                        </div>
                    </div>
                `).join('');
                
                document.getElementById('products').innerHTML = productsHtml;
            }
            
            function renderPagination() {
                if (totalPages <= 1) {
                    document.getElementById('pagination').innerHTML = '';
                    return;
                }
                
                let paginationHtml = '';
                
                // Botón anterior
                if (currentPage > 1) {
                    paginationHtml += `<button onclick="loadProducts(${currentPage - 1})">← Anterior</button>`;
                }
                
                // Páginas
                for (let i = 1; i <= totalPages; i++) {
                    if (i === currentPage) {
                        paginationHtml += `<button class="active">${i}</button>`;
                    } else {
                        paginationHtml += `<button onclick="loadProducts(${i})">${i}</button>`;
                    }
                }
                
                // Botón siguiente
                if (currentPage < totalPages) {
                    paginationHtml += `<button onclick="loadProducts(${currentPage + 1})">Siguiente →</button>`;
                }
                
                document.getElementById('pagination').innerHTML = paginationHtml;
            }
            
            function resetFilters() {
                document.getElementById('category').value = '';
                document.getElementById('brand').value = '';
                document.getElementById('search').value = '';
                document.getElementById('destacados').checked = false;
                document.getElementById('masVendidos').checked = false;
                loadProducts(1);
            }
            
            // Búsqueda en tiempo real
            let searchTimeout;
            document.getElementById('search').addEventListener('input', function() {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    loadProducts(1);
                }, 500);
            });
        </script>
    </body>
    </html>
    """
    return html_template

# Ruta para el CMS real
@app.route('/admin/')
def admin_redirect():
    """Redirigir al CMS real"""
    return redirect('/admin/index.html')

if __name__ == '__main__':
    print(f"""
🚀 **Credicálidda Server iniciado**
    
📍 URL Principal: http://localhost:{PORT}/
🔧 Panel de Pruebas: http://localhost:{PORT}/admin/test
📊 API de Productos: http://localhost:{PORT}/api/products
🔍 API de Búsqueda: http://localhost:{PORT}/api/search
📈 API de Estadísticas: http://localhost:{PORT}/api/stats
🏷️ API de Categorías: http://localhost:{PORT}/api/categories
🏭 API de Marcas: http://localhost:{PORT}/api/brands

📋 **Endpoints disponibles:**
   GET /api/products - Listar productos con filtros
   GET /api/products/<slug> - Detalle de producto
   GET /api/search?q=<query> - Buscar productos
   GET /api/categories - Listar categorías
   GET /api/brands - Listar marcas
   GET /api/stats - Estadísticas del catálogo

🔐 **Para acceder al CMS:**
   1. Ve a http://localhost:{PORT}/admin/
   2. Usa Netlify Identity para autenticarte
   3. Gestiona productos, categorías y configuración

⚡ **Modo Debug:** {'Activado' if DEBUG else 'Desactivado'}
    """)
    
    app.run(host='0.0.0.0', port=PORT, debug=DEBUG)
