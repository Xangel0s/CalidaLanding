// CMS Products Loader
// Loads data/catalogo.json and enriches items by parsing _productos/<slug>.md front matter.

(function (global) {
  'use strict';

  const CMS = {};

  function formatPrice(n) {
    if (typeof n !== 'number') return n || '';
    return 'S/ ' + n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  async function fetchJSON(url) {
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error('Error al cargar ' + url);
    return await res.json();
  }

  async function fetchText(url) {
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error('Error al cargar ' + url);
    return await res.text();
  }

  // Naive front-matter parser for simple key: value pairs and simple lists
  function parseFrontMatter(md) {
    const out = { data: {}, content: '' };
    if (!md.startsWith('---')) { out.content = md; return out; }
    const end = md.indexOf('\n---', 3);
    if (end === -1) { out.content = md; return out; }
    const raw = md.slice(3, end).trim();
    const body = md.slice(end + 4).trim();
    out.content = body;

    const lines = raw.split(/\r?\n/);
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      if (!line.trim()) { i++; continue; }
      // list start
      if (line.includes(':') && lines[i + 1] && lines[i + 1].trim().startsWith('- ')) {
        const [kRaw] = line.split(':');
        const key = kRaw.trim();
        const arr = [];
        i++;
        while (i < lines.length && lines[i].trim().startsWith('- ')) {
          const itemLine = lines[i].trim().slice(2);
          if (itemLine.includes(':')) {
            // object item like name: value
            const [ik, iv] = itemLine.split(':');
            const obj = {}; obj[ik.trim()] = iv.trim().replace(/^"|"$/g, '');
            arr.push(obj);
          } else {
            arr.push(itemLine.replace(/^"|"$/g, ''));
          }
          i++;
        }
        out.data[key] = arr;
        continue; // already advanced i
      }
      // simple key: value
      if (line.includes(':')) {
        const idx = line.indexOf(':');
        const key = line.slice(0, idx).trim();
        let val = line.slice(idx + 1).trim();
        val = val.replace(/^"|"$/g, '');
        // numbers
        if (/^[-+]?[0-9]*\.?[0-9]+$/.test(val)) {
          const num = Number(val);
          out.data[key] = Number.isNaN(num) ? val : num;
        } else if (val === 'true' || val === 'false') {
          out.data[key] = val === 'true';
        } else {
          out.data[key] = val;
        }
      }
      i++;
    }
    return out;
  }

  async function loadProductBySlug(slug) {
    let data = {}, content = '';
    try {
      const md = await fetchText(`/_productos/${slug}.md`);
      const parsed = parseFrontMatter(md);
      data = parsed.data || {};
      content = parsed.content || '';
    } catch (e) {
      // Fallback: use catalog entry to avoid breaking product page
      try {
        const catalog = await loadCatalog();
        const it = (catalog || []).find(i => i.slug === slug);
        if (it) {
          // Build minimal product object from catalog
          const fix = (u) => (typeof u === 'string' && !/^https?:\/\//.test(u) && !u.startsWith('/') ? '/' + u : u);
          return {
            slug,
            title: it.title || it.slug,
            brand: it.brand || '',
            category: it.categoria || '',
            tags: it.tags || [],
            price_online: it.price_online ?? null,
            price_regular: it.price_regular ?? null,
            monthly_payment: it.monthly_payment ?? null,
            discount: it.discount ?? null,
            image: fix(it.image || ''),
            gallery: it.gallery ? it.gallery.map(fix) : [],
            description: it.description || '',
            body: '',
            specs: [],
            benefits: [],
            payment_methods: Array.isArray(it.payment_methods) ? it.payment_methods : [],
            shipping: ''
          };
        }
      } catch (_) { /* ignore */ }
      throw e; // rethrow so caller can handle 'not found' state
    }
    // Map fields to a unified product shape
    const p = {
      slug: data.slug || slug,
      title: data.title || data.Nombre || slug,
      brand: data.brand || data.Marca || '',
      category: data.category || '',
      tags: Array.isArray(data.tags) ? data.tags : [],
      price_online: data.price_online ?? null,
      price_regular: data.price_regular ?? null,
      monthly_payment: data.monthly_payment ?? null,
      discount: data.discount ?? null,
      image: data.image || '',
      // support gallery (list of {image} or strings) and images (array of strings)
      gallery: Array.isArray(data.gallery)
        ? data.gallery.map(g => (typeof g === 'string' ? g : (g && g.image) || '')).filter(Boolean)
        : Array.isArray(data.images)
          ? data.images.filter(Boolean)
          : [],
      // descriptions
      description: data.description || data.short_description || '',
      body: content || data.body || '',
      // specs variations
      specs: Array.isArray(data.specs) ? data.specs : (Array.isArray(data.specifications) ? data.specifications : []),
      // extra info
      benefits: Array.isArray(data.benefits) ? data.benefits : [],
      payment_methods: Array.isArray(data.payment_methods) ? data.payment_methods : [],
      shipping: data.shipping || ''
    };
    // ensure image present
    if (!p.image && p.gallery && p.gallery.length) p.image = p.gallery[0];
    // robust normalization for URLs
    const fix = (raw) => {
      if (typeof raw !== 'string' || !raw) return raw;
      let u = raw.trim();
      // resolve './' and '../' to absolute root
      if (u.startsWith('./')) u = u.slice(1);
      if (u.startsWith('../')) {
        while (u.startsWith('../')) u = u.slice(3);
        if (!u.startsWith('/')) u = '/' + u;
      }
      // prepend slash for local relative paths
      if (!/^https?:\/\//i.test(u) && !u.startsWith('/')) u = '/' + u;
      // upgrade http -> https for same-host assets (avoid mixed content)
      if (/^http:\/\//i.test(u)) {
        try {
          const urlObj = new URL(u);
          // if host is same as current or known CDN without https issues, upgrade
          u = 'https://' + urlObj.host + urlObj.pathname + urlObj.search + urlObj.hash;
        } catch (_) { /* ignore parse errors */ }
      }
      // encode spaces
      u = u.replace(/\s/g, '%20');
      return u;
    };
    if (p.image) p.image = fix(p.image);
    if (Array.isArray(p.gallery)) p.gallery = p.gallery.map(fix);

    // Merge with catalog entry as an additional fallback image
    try {
      const catalog = await loadCatalog();
      const it = (catalog || []).find(i => i.slug === slug);
      if (it && it.image) {
        const catImg = fix(it.image);
        // Prepend catalog image if not already present
        const imgs = new Set([catImg, p.image, ...(p.gallery || [])].filter(Boolean));
        const list = Array.from(imgs);
        p.image = list[0] || p.image || '';
        p.gallery = list;
      }
    } catch (_) { /* ignore */ }
    return p;
  }

  async function loadCatalog() {
    try {
      const data = await fetchJSON('/data/catalogo.json');
      return Array.isArray(data.items) ? data.items : [];
    } catch (e) {
      console.warn('No se pudo cargar catalogo.json:', e);
      return [];
    }
  }

  // Build a product card for grids (novedades)
  function buildGridCard(p) {
    const discountBadge = p.discount ? `<span class="discount-badge">-${p.discount}%</span>` : '';
    const regularRow = p.price_regular ? `<div class="price-row"><span class="price-label">Regular:</span><span class="price-regular">${formatPrice(p.price_regular)}</span></div>` : '';
    const monthly = p.monthly_payment ? `<div class="price-installments"><span>Desde: <strong>${formatPrice(p.monthly_payment)}</strong> al mes</span></div>` : '';
    const img = p.image || '/images/products/placeholder.jpg';
    return `
      <div class="product-card">
        <div class="product-badges">${discountBadge}</div>
        <div class="product-image">
          <a href="/product.html?slug=${encodeURIComponent(p.slug)}">
            <img src="${img}" alt="${p.title}" onerror="this.src='/images/products/placeholder.jpg'">
          </a>
        </div>
        <div class="product-info">
          ${p.brand ? `<div class="product-brand">${p.brand.toUpperCase()}</div>` : ''}
          <h3 class="product-title"><a href="/product.html?slug=${encodeURIComponent(p.slug)}">${p.title}</a></h3>
          <div class="product-pricing">
            ${regularRow}
            ${p.price_online ? `<div class="price-row main"><span class="price-label">Online:</span><span class="price-online">${formatPrice(p.price_online)}</span></div>` : ''}
            ${monthly}
          </div>
          <a class="btn btn-primary product-btn" href="/product.html?slug=${encodeURIComponent(p.slug)}">Ver producto</a>
        </div>
      </div>
    `;
  }

  // Build a product card for home carousel (same markup as index)
  function buildHomeCard(p) {
    return buildGridCard(p); // same visual structure works for both
  }

  CMS.loadCatalog = loadCatalog;
  CMS.loadProductBySlug = loadProductBySlug;
  CMS.buildGridCard = buildGridCard;
  CMS.buildHomeCard = buildHomeCard;

  // Page helpers
  CMS.renderNovedadesGrid = async function ({ containerId = 'productsGrid', filters = {} } = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const catalog = await loadCatalog();
    const visibles = catalog.filter(i => i.visible);

    // URL filters (categoria, promocion) and boolean flags from catalog tags if needed
    const url = new URL(window.location.href);
    const categoria = url.searchParams.get('categoria');
    const promocion = url.searchParams.get('promocion');

    const filtered = visibles.filter(i => {
      let ok = true;
      if (categoria) ok = ok && (!i.categoria || i.categoria === categoria);
      if (promocion) {
        // Map promocion to flags or tags in future
        // For now, pass-through (could map ofertas->discount>0, combos->tag combo, novedades->tag novedad, reacondicionados->tag reacondicionado)
        if (promocion === 'ofertas') ok = ok && (i.discount > 0);
        if (promocion === 'combos') ok = ok && (i.tags && i.tags.includes('combo'));
        if (promocion === 'novedades') ok = ok && (i.tags && i.tags.includes('novedad'));
        if (promocion === 'reacondicionados') ok = ok && (i.tags && i.tags.includes('reacondicionado'));
      }
      return ok;
    });

    // Sort by orden asc if provided
    filtered.sort((a, b) => (a.orden || 0) - (b.orden || 0));

    // Load details for each (enrich)
    const products = await Promise.all(filtered.map(async (it) => {
      const p = await loadProductBySlug(it.slug);
      // Prefer normalized fields from MD over catalog to avoid overriding with raw paths
      // Also ensure final image is set
      const merged = { ...it, ...p };
      if (!merged.image && p.image) merged.image = p.image;
      return merged;
    }));

    container.innerHTML = products.map(buildGridCard).join('');
  };

  CMS.renderHomeTracks = async function ({ featuredTrackId = 'featuredProductsTrack', bestTrackId = 'bestSellersTrack' } = {}) {
    const featuredTrack = document.getElementById(featuredTrackId);
    const bestTrack = document.getElementById(bestTrackId);
    const catalog = await loadCatalog();

    const destacados = catalog.filter(i => i.visible && i.destacado);
    const masVendidos = catalog.filter(i => i.visible && i.mas_vendido);

    const [pDest, pBest] = await Promise.all([
      Promise.all(
        destacados
          .sort((a, b) => (a.orden || 0) - (b.orden || 0))
          .map(async it => ({ ...(await loadProductBySlug(it.slug)), ...it }))
      ),
      Promise.all(
        masVendidos
          .sort((a, b) => (a.orden || 0) - (b.orden || 0))
          .map(async it => ({ ...(await loadProductBySlug(it.slug)), ...it }))
      )
    ]);

    if (featuredTrack) featuredTrack.innerHTML = pDest.map(buildHomeCard).join('');
    if (bestTrack) bestTrack.innerHTML = pBest.map(buildHomeCard).join('');
  };

  global.CMSProducts = CMS;

})(window);
