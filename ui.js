/**
 * ui.js
 * Renderização da interface — separada da lógica de negócio.
 */

const UI = (() => {

  /* ── Formatadores ──────────────────────────────────────── */
  function formatCurrency(value) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function stockBadge(product) {
    if (product.qty === 0)            return '<span class="badge badge--out">Sem estoque</span>';
    if (product.qty <= product.minQty) return '<span class="badge badge--low">Baixo</span>';
    return '<span class="badge badge--ok">OK</span>';
  }

  /* ── Dashboard ─────────────────────────────────────────── */
  function renderDashboard() {
    const stats = Storage.getStats();

    document.getElementById('stat-total').textContent      = stats.total;
    document.getElementById('stat-low').textContent        = stats.lowStock.length + stats.outOfStock.length;
    document.getElementById('stat-value').textContent      = formatCurrency(stats.totalValue);
    document.getElementById('stat-categories').textContent = stats.categories.length;
    document.getElementById('total-products').textContent  = `${stats.total} produto${stats.total !== 1 ? 's' : ''}`;

    // Alertas de estoque baixo
    const lowEl   = document.getElementById('low-stock-list');
    const lowList = [...stats.outOfStock, ...stats.lowStock];
    if (lowList.length === 0) {
      lowEl.innerHTML = '<div class="empty-state">Nenhum produto com estoque baixo. ✓</div>';
    } else {
      lowEl.innerHTML = lowList.map(p => `
        <div class="low-stock-item">
          <div>
            <div class="low-stock-item__name">${escHtml(p.name)}</div>
            <div style="font-size:0.78rem;color:var(--text-3)">${escHtml(p.category)}</div>
          </div>
          <div class="low-stock-item__qty">${p.qty === 0 ? 'Zerado' : `${p.qty} restantes`}</div>
        </div>
      `).join('');
    }

    // Últimos 5 produtos
    const all     = Storage.getAll().slice(-5).reverse();
    const recentEl = document.getElementById('recent-products');
    if (all.length === 0) {
      recentEl.innerHTML = '<div class="empty-state">Nenhum produto ainda.</div>';
    } else {
      recentEl.innerHTML = all.map(p => `
        <div class="recent-item">
          <div>
            <div class="recent-item__name">${escHtml(p.name)}</div>
            <div class="recent-item__cat">${escHtml(p.category)}</div>
          </div>
          <div class="recent-item__price">${formatCurrency(p.price)}</div>
        </div>
      `).join('');
    }
  }

  /* ── Tabela de produtos ────────────────────────────────── */
  function renderTable(query = '', category = '', stockFilter = '') {
    let list = Storage.getAll();

    // Filtros
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)  ||
        p.category.toLowerCase().includes(q)
      );
    }
    if (category) {
      list = list.filter(p => p.category === category);
    }
    if (stockFilter === 'low') {
      list = list.filter(p => p.qty <= p.minQty);
    } else if (stockFilter === 'ok') {
      list = list.filter(p => p.qty > p.minQty);
    }

    const tbody  = document.getElementById('products-tbody');
    const emptyEl = document.getElementById('empty-products');

    if (list.length === 0) {
      tbody.innerHTML = '';
      emptyEl.classList.remove('hidden');
      return;
    }
    emptyEl.classList.add('hidden');

    tbody.innerHTML = list.map(p => `
      <tr data-id="${p.id}">
        <td class="td-name">
          ${escHtml(p.name)}
          ${p.sku ? `<div style="font-size:0.75rem;color:var(--text-3);font-family:var(--mono)">${escHtml(p.sku)}</div>` : ''}
        </td>
        <td>${escHtml(p.category)}</td>
        <td class="td-mono">${p.qty}</td>
        <td class="td-mono">${formatCurrency(p.price)}</td>
        <td class="td-mono">${formatCurrency(p.price * p.qty)}</td>
        <td>${stockBadge(p)}</td>
        <td>
          <div class="td-actions">
            <button class="btn btn--icon edit-btn" data-id="${p.id}" title="Editar">✎</button>
            <button class="btn btn--icon del delete-btn" data-id="${p.id}" title="Excluir">✕</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  /* ── Select de categorias ──────────────────────────────── */
  function populateCategoryFilter() {
    const stats    = Storage.getStats();
    const select   = document.getElementById('filter-category');
    const current  = select.value;
    select.innerHTML = '<option value="">Todas as categorias</option>' +
      stats.categories.map(c => `<option value="${escHtml(c)}" ${c === current ? 'selected' : ''}>${escHtml(c)}</option>`).join('');
  }

  function populateCategoryDatalist() {
    const stats  = Storage.getStats();
    const dl     = document.getElementById('category-list');
    dl.innerHTML = stats.categories.map(c => `<option value="${escHtml(c)}">`).join('');
  }

  /* ── Modal ─────────────────────────────────────────────── */
  function openModal(product = null) {
    document.getElementById('modal-title').textContent = product ? 'Editar Produto' : 'Novo Produto';
    document.getElementById('field-name').value     = product?.name     || '';
    document.getElementById('field-category').value = product?.category || '';
    document.getElementById('field-sku').value      = product?.sku      || '';
    document.getElementById('field-qty').value      = product?.qty      ?? '';
    document.getElementById('field-min').value      = product?.minQty   ?? 5;
    document.getElementById('field-price').value    = product?.price    ?? '';
    document.getElementById('field-desc').value     = product?.desc     || '';
    populateCategoryDatalist();
    document.getElementById('modal-overlay').classList.remove('hidden');
    document.getElementById('field-name').focus();
  }

  function closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
    clearErrors();
  }

  function clearErrors() {
    document.querySelectorAll('.form-input.error').forEach(el => el.classList.remove('error'));
  }

  function getFormData() {
    return {
      name:     document.getElementById('field-name').value,
      category: document.getElementById('field-category').value,
      sku:      document.getElementById('field-sku').value,
      qty:      document.getElementById('field-qty').value,
      minQty:   document.getElementById('field-min').value,
      price:    document.getElementById('field-price').value,
      desc:     document.getElementById('field-desc').value,
    };
  }

  function validateForm(data) {
    let valid = true;
    clearErrors();
    if (!data.name.trim()) {
      document.getElementById('field-name').classList.add('error');
      valid = false;
    }
    if (!data.category.trim()) {
      document.getElementById('field-category').classList.add('error');
      valid = false;
    }
    if (data.qty === '' || isNaN(Number(data.qty)) || Number(data.qty) < 0) {
      document.getElementById('field-qty').classList.add('error');
      valid = false;
    }
    if (data.price === '' || isNaN(Number(data.price)) || Number(data.price) < 0) {
      document.getElementById('field-price').classList.add('error');
      valid = false;
    }
    return valid;
  }

  /* ── Toast ─────────────────────────────────────────────── */
  let toastTimer;
  function showToast(msg, type = 'success') {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.className   = `toast toast--${type}`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.add('hidden'), 3000);
  }

  /* ── Helpers ───────────────────────────────────────────── */
  function escHtml(str) {
    return String(str)
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;');
  }

  return {
    renderDashboard,
    renderTable,
    populateCategoryFilter,
    openModal,
    closeModal,
    getFormData,
    validateForm,
    showToast,
  };
})();
