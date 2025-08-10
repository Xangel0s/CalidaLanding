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
    // support both \n--- and \r\n--- terminator
    let end = md.indexOf('\n---', 3);
    if (end === -1) end = md.indexOf('\r\n---', 3);
    if (end === -1) { out.content = md; return out; }
    // Determine terminator length (4 for \n---, 5 for \r\n---)
    const termLen = md.slice(end, end + 4) === '\n---' ? 4 : 5;
    const raw = md.slice(3, end).trim();
    const body = md.slice(end + termLen).replace(/^[-\s]*\r?\n/, '').trim();
    out.content = body;

    const lines = raw.split(/\r?\n/);
    let i = 0;
    const parseScalar = (val) => {
      if (val == null) return '';
      let v = String(val).trim();
      v = v.replace(/^"|"$/g, '');
      if (/^[-+]?[0-9]*\.?[0-9]+$/.test(v)) {
        const num = Number(v); return Number.isNaN(num) ? v : num;
      }
      if (v === 'true' || v === 'false') return v === 'true';
      return v;
    };

    while (i < lines.length) {
      const line = lines[i];
      if (!line || !line.trim()) { i++; continue; }

      // key: value or key: (list/object start)
      const idx = line.indexOf(':');
      if (idx === -1) { i++; continue; }
      const key = line.slice(0, idx).trim();
      let rest = line.slice(idx + 1);

      // If next line(s) form a list starting with '- '
      const next = lines[i + 1];
      if (next && next.trim().startsWith('- ')) {
        const arr = [];
        i++; // move to first list item
        let currentObj = null;
        while (i < lines.length) {
          const l = lines[i];
          if (!l) { i++; continue; }
          const trimmed = l.trim();
          // End list when line does not start with '-' or space-indented continuation
          if (!trimmed.startsWith('- ') && !/^\s+\S/.test(l)) break;

          if (trimmed.startsWith('- ')) {
            // Start new item
            const itemLine = trimmed.slice(2);
            if (itemLine.includes(':')) {
              const cidx = itemLine.indexOf(':');
              const ik = itemLine.slice(0, cidx).trim();
              const iv = parseScalar(itemLine.slice(cidx + 1).trim());
              currentObj = {}; currentObj[ik] = iv; arr.push(currentObj);
            } else {
              arr.push(parseScalar(itemLine));
              currentObj = null;
            }
            i++;
            // collect continuation lines for object items (indented key: value)
            while (i < lines.length) {
              const cont = lines[i];
              if (!cont) { i++; continue; }
              if (/^\s{2,}[^\s].*:\s*.+/.test(cont)) {
                const t = cont.trim();
                const c2idx = t.indexOf(':');
                const ck = t.slice(0, c2idx).trim();
                const cv = parseScalar(t.slice(c2idx + 1).trim());
                if (currentObj) currentObj[ck] = cv;
                i++;
                continue;
              }
              break;
            }
          } else {
            // Indented continuation without a new '- ' (ignore or attach if object exists)
            i++;
          }
        }
        out.data[key] = arr;
        continue;
      }

      // Simple scalar
      out.data[key] = parseScalar(rest);
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
          const mapGallery = (g) => {
            if (!Array.isArray(g)) return [];
            return g.map(item => {
              if (!item) return '';
              if (typeof item === 'string') return fix(item);
              if (typeof item === 'object' && item.image) return fix(item.image);
              return '';
            }).filter(Boolean);
          };
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
            gallery: mapGallery(it.gallery),
            description: it.description || '',
            body: '',
            specs: Array.isArray(it.specs) ? it.specs : [],
            benefits: [],
            payment_methods: Array.isArray(it.payment_methods) ? it.payment_methods : [],
            // CMS-first fields from catalog as fallback
            show_payment_credit: it.show_payment_credit !== false,
            show_payment_cash: it.show_payment_cash !== false,
            show_monthly: it.show_monthly !== false,
            show_price_online: it.show_price_online !== false,
            payment_credit_html: it.payment_credit_html || '',
            payment_cash_html: it.payment_cash_html || '',
            show_shipping: it.show_shipping !== false,
            shipping_html: it.shipping_html || '',
            shipping: it.shipping || ''
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
      // Editable sections from front matter
      show_payment_credit: data.show_payment_credit !== false,
      show_payment_cash: data.show_payment_cash !== false,
      show_monthly: data.show_monthly !== false,
      show_price_online: data.show_price_online !== false,
      payment_credit_html: data.payment_credit_html || '',
      payment_cash_html: data.payment_cash_html || '',
      show_shipping: data.show_shipping !== false,
      shipping_html: data.shipping_html || '',
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

    // Merge with catalog entry to backfill missing fields (best-effort)
    try {
      const catalog = await loadCatalog();
      const it = (catalog || []).find(i => i.slug === slug);
      if (it) {
        // Backfill textual/meta fields only if missing
        const empty = (v) => v == null || (typeof v === 'string' && v.trim() === '') || (Array.isArray(v) && v.length === 0);
        if (empty(p.title) && it.title) p.title = it.title;
        if (empty(p.brand) && it.brand) p.brand = it.brand;
        if (empty(p.description) && it.description) p.description = it.description;
        if (empty(p.body) && it.body) p.body = it.body;
        if (empty(p.specs) && Array.isArray(it.specs)) p.specs = it.specs;
        if (empty(p.benefits) && Array.isArray(it.benefits)) p.benefits = it.benefits;
        if (empty(p.payment_methods) && Array.isArray(it.payment_methods)) p.payment_methods = it.payment_methods;
        if (empty(p.payment_credit_html) && it.payment_credit_html) p.payment_credit_html = it.payment_credit_html;
        if (empty(p.payment_cash_html) && it.payment_cash_html) p.payment_cash_html = it.payment_cash_html;
        if (p.show_payment_credit === undefined && typeof it.show_payment_credit === 'boolean') p.show_payment_credit = it.show_payment_credit;
        if (p.show_payment_cash === undefined && typeof it.show_payment_cash === 'boolean') p.show_payment_cash = it.show_payment_cash;
        if (p.show_monthly === undefined && typeof it.show_monthly === 'boolean') p.show_monthly = it.show_monthly;
        if (p.show_price_online === undefined && typeof it.show_price_online === 'boolean') p.show_price_online = it.show_price_online;
        if (empty(p.shipping_html) && it.shipping_html) p.shipping_html = it.shipping_html;
        if (p.show_shipping === undefined && typeof it.show_shipping === 'boolean') p.show_shipping = it.show_shipping;
        if (empty(p.shipping) && it.shipping) p.shipping = it.shipping;
        if (p.price_online == null && typeof it.price_online === 'number') p.price_online = it.price_online;
        if (p.price_regular == null && typeof it.price_regular === 'number') p.price_regular = it.price_regular;
        if (p.monthly_payment == null && typeof it.monthly_payment === 'number') p.monthly_payment = it.monthly_payment;
        if (p.discount == null && typeof it.discount === 'number') p.discount = it.discount;

        // Images: prepend catalog image if not already present
        if (it.image) {
          const catImg = fix(it.image);
          const imgs = new Set([catImg, p.image, ...(p.gallery || [])].filter(Boolean));
          const list = Array.from(imgs);
          p.image = list[0] || p.image || '';
          p.gallery = list;
        }
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
    const products = (await Promise.all(filtered.map(async (it) => {
      const p = await loadProductBySlug(it.slug);
      // Prefer normalized fields from MD over catalog to avoid overriding with raw paths
      // Also ensure final image is set
      const merged = { ...it, ...p };
      if (!merged.image && p.image) merged.image = p.image;
      return merged;
    })))
      // Ocultar fichas inactivas o sin stock
      .filter(p => (p.status || '').toLowerCase() !== 'inactivo')
      .filter(p => (typeof p.stock === 'number' ? p.stock > 0 : true));

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

    // Filtrar inactivos/sin stock antes de renderizar
    const pDestOk = pDest
      .filter(p => (p.status || '').toLowerCase() !== 'inactivo')
      .filter(p => (typeof p.stock === 'number' ? p.stock > 0 : true));
    const pBestOk = pBest
      .filter(p => (p.status || '').toLowerCase() !== 'inactivo')
      .filter(p => (typeof p.stock === 'number' ? p.stock > 0 : true));

    if (featuredTrack) featuredTrack.innerHTML = pDestOk.map(buildHomeCard).join('');
    if (bestTrack) bestTrack.innerHTML = pBestOk.map(buildHomeCard).join('');

    // Initialize carousels after content is injected
    try {
      // Featured carousel container
      const featuredContainer = (featuredTrack && (featuredTrack.closest('.best-sellers-carousel') || featuredTrack.parentElement?.closest('.best-sellers-carousel'))) 
        || document.getElementById('featuredProductsCarousel');
      if (featuredContainer && typeof Carousel === 'function') {
        new Carousel(featuredContainer, {
          infiniteScroll: true,
          loop: true,
          autoPlay: false,
          itemsToShow: 1,
          gap: 24,
          breakpoints: {
            640: { itemsToShow: 2 },
            900: { itemsToShow: 3 },
            1200: { itemsToShow: 4 }
          }
        });
      }

      // Best sellers carousel container (if exists on page)
      const bestContainer = (bestTrack && (bestTrack.closest('.best-sellers-carousel') || bestTrack.parentElement?.closest('.best-sellers-carousel'))) 
        || document.getElementById('bestSellersCarousel');
      if (bestContainer && typeof Carousel === 'function') {
        new Carousel(bestContainer, {
          infiniteScroll: true,
          loop: true,
          autoPlay: false,
          itemsToShow: 1,
          gap: 24,
          breakpoints: {
            640: { itemsToShow: 2 },
            900: { itemsToShow: 3 },
            1200: { itemsToShow: 4 }
          }
        });
      }
    } catch (err) {
      console.warn('No se pudo inicializar los carouseles de home:', err);
    }
  };

  global.CMSProducts = CMS;

})(window);
