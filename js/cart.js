// Cart Page Logic (front-only)
(function(){
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  function loadItems(){
    try {
      const arr = JSON.parse(localStorage.getItem('cartItems')||'[]');
      return Array.isArray(arr) ? arr : [];
    } catch { return []; }
  }
  function saveItems(items){
    localStorage.setItem('cartItems', JSON.stringify(items));
    const totalQty = items.reduce((s, it) => s + (parseInt(it.qty,10)||0), 0);
    try { localStorage.setItem('cartCount', String(totalQty)); } catch {}
    const badge = $('#cartCount'); if (badge) badge.textContent = String(totalQty);
  }
  function formatPEN(n){ return `S/ ${Number(n||0).toFixed(2)}`; }

  function itemFirstInstallment(it){
    const m = Number(it.monthly||0);
    const q = Math.max(1, parseInt(it.qty,10)||1);
    return m * q;
  }

  function render(){
    const container = $('#cartItems'); if (!container) return;
    const items = loadItems();
    container.innerHTML = '';
    if (items.length === 0){
      container.innerHTML = '<div class="empty">Tu carrito está vacío.</div>';
      updateSummary(items);
      return;
    }
    items.forEach((it, idx) => {
      const node = document.createElement('div');
      node.className = 'cart-item';
      node.innerHTML = `
        <div class="cart-item-thumb"><img src="${it.image || '/images/placeholder-product.jpg'}" alt="${it.title||''}"></div>
        <div class="cart-item-info">
          <div class="cart-item-title">${it.title||''}</div>
          <div class="cart-item-price">Cuota mensual: <strong>${formatPEN(it.monthly||0)}</strong></div>
        </div>
        <div class="cart-item-actions">
          <div class="cart-qty">
            <button class="qminus" aria-label="Disminuir">−</button>
            <input type="number" class="qinput" min="1" value="${it.qty||1}" aria-label="Cantidad">
            <button class="qplus" aria-label="Aumentar">+</button>
          </div>
          <div class="cart-subtotal">Cuotas: ${formatPEN(itemFirstInstallment(it))}</div>
          <button class="cart-remove">Quitar</button>
        </div>`;

      // wire events
      const qinput = $('.qinput', node);
      const qminus = $('.qminus', node);
      const qplus  = $('.qplus', node);
      const remove = $('.cart-remove', node);

      qminus.addEventListener('click', () => {
        const arr = loadItems();
        const cur = arr[idx]; if (!cur) return;
        const v = Math.max(1, (parseInt(cur.qty,10)||1) - 1);
        cur.qty = v; saveItems(arr); render();
      });
      qplus.addEventListener('click', () => {
        const arr = loadItems();
        const cur = arr[idx]; if (!cur) return;
        const v = Math.max(1, (parseInt(cur.qty,10)||1) + 1);
        cur.qty = v; saveItems(arr); render();
      });
      qinput.addEventListener('change', () => {
        const v = parseInt(qinput.value,10);
        const arr = loadItems(); const cur = arr[idx]; if (!cur) return;
        cur.qty = Number.isFinite(v) && v>0 ? v : 1; saveItems(arr); render();
      });
      remove.addEventListener('click', () => {
        const arr = loadItems(); arr.splice(idx,1); saveItems(arr); render();
      });

      container.appendChild(node);
    });
    updateSummary(items);
  }

  function updateSummary(items){
    const subtotal = items.reduce((s,it)=> s + itemFirstInstallment(it), 0);
    const sumSubtotal = $('#sumSubtotal'); if (sumSubtotal) sumSubtotal.textContent = formatPEN(subtotal);
    const sumTotal = $('#sumTotal'); if (sumTotal) sumTotal.textContent = formatPEN(subtotal); // envío por calcular
  }

  // Función para enviar datos usando Formspree
  async function sendToGoogleSheets(formData) {
    try {
      // URL de Formspree
      const formspreeUrl = 'https://formspree.io/f/xdklzjbk';
      
      // Preparar datos para Formspree
      const formBody = new URLSearchParams({
        'Nombre': formData.nombre,
        'Email': formData.email,
        'Teléfono': formData.telefono,
        'Productos': formData.productos,
        'Total': formData.total,
        'Mensaje': formData.mensaje,
        '_subject': 'Nueva consulta de CrediCálidda - Carrito'
      });
      
      // Enviar datos a Formspree
      const response = await fetch(formspreeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formBody
      });
      
      if (response.ok) {
        console.log('✅ Datos enviados a Formspree correctamente');
        return true;
      } else {
        console.error('❌ Error al enviar a Formspree:', response.status);
        return false;
      }
      
    } catch (error) {
      console.error('❌ Error de conexión:', error);
      return false;
    }
  }

  function submitForm(){
    const form = $('#cartForm'); if (!form) return;
    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      
      const name = $('#cfName').value.trim();
      const phone = $('#cfPhone').value.trim();
      const email = $('#cfEmail').value.trim();
      const notes = $('#cfNotes').value.trim();
      const items = loadItems();
      
      // Preparar datos para Google Sheets
      const formData = {
        nombre: name,
        email: email,
        telefono: phone,
        direccion: '', // Se puede agregar si hay campo de dirección
        ciudad: '', // Se puede agregar si hay campo de ciudad
        productos: items.map(it => `${it.title} x${it.qty}`).join(', '),
        total: $('#sumTotal')?.textContent || formatPEN(0),
        mensaje: notes
      };
      
      // Preparar mensaje para WhatsApp
      const lines = [
        'Hola 👋, quiero coordinar mi compra por cuotas:',
        ...items.map(it => `• ${it.title} x${it.qty} - Cuota mensual: ${formatPEN(it.monthly||0)} (Cuotas: ${formatPEN(itemFirstInstallment(it))})`),
        `Total en cuotas: ${$('#sumTotal')?.textContent||formatPEN(0)}`,
        '',
        `Nombre: ${name}`,
        `Celular: ${phone}`,
        email ? `Email: ${email}` : '',
        notes ? `Notas: ${notes}` : ''
      ].filter(Boolean).join('\n');

      const number = (window.CredicAlidda && window.CredicAlidda.whatsapp)
        || (window.SiteSettings && window.SiteSettings.whatsapp)
        || '51967156094';
      const url = `https://api.whatsapp.com/send/?phone=${number}&text=${encodeURIComponent(lines)}&type=phone_number&app_absent=0`;
      
      // Mostrar mensaje de confirmación
      alert('✅ Formulario enviado correctamente. Se abrirá WhatsApp para coordinar tu compra.');
      
      window.open(url, '_blank');
    });
  }

  async function loadRecommended(){
    const wrap = $('#recCarousel'); if (!wrap) return;
    let catalog = [];
    try {
      const res = await fetch('/data/catalogo.json', { cache: 'no-store' });
      if (res.ok) catalog = await res.json();
    } catch {}
    if (!Array.isArray(catalog)) catalog = [];
    // sample up to 10 random
    const shuffled = catalog.slice().sort(()=>Math.random()-0.5).slice(0,10);
    wrap.innerHTML = shuffled.map(p => `
      <div class="card">
        <img src="${p.image || '/images/placeholder-product.jpg'}" alt="${p.title||''}">
        <div class="info">
          <div class="title">${p.title||''}</div>
          <div class="price">${typeof p.price_online==='number' ? formatPEN(p.price_online) : ''}</div>
          <a class="btn btn-primary" href="/${p.slug||''}/p">Ver producto</a>
        </div>
      </div>`).join('');
  }

  function initBadge(){
    try{ const stored = parseInt(localStorage.getItem('cartCount'),10); if (Number.isFinite(stored)&&stored>0){ const b=$('#cartCount'); if(b) b.textContent=String(stored);} }catch{}
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    initBadge();
    render();
    submitForm();
    loadRecommended();
    const checkout = $('#checkoutBtn');
    if (checkout) checkout.addEventListener('click', ()=>{
      const form = $('#cartForm'); if (form) form.scrollIntoView({behavior:'smooth'});
    });
  });
})();
