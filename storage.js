/**
 * storage.js
 * Camada de dados — CRUD no localStorage.
 * sm_products  → lista de produtos
 * sm_moves     → histórico de movimentações por produto
 */

const Storage = (() => {
  const KEY_P = 'sm_products';
  const KEY_M = 'sm_moves';

  /* ── Produtos ──────────────────────────────────────────── */
  function getAll() {
    try { return JSON.parse(localStorage.getItem(KEY_P)) || []; } catch { return []; }
  }
  function _save(list) { localStorage.setItem(KEY_P, JSON.stringify(list)); }

  function create(data) {
    const list = getAll();
    const product = {
      id:        crypto.randomUUID(),
      name:      data.name.trim(),
      category:  data.category.trim(),
      sku:       data.sku?.trim() || '',
      qty:       Number(data.qty),
      minQty:    Number(data.minQty) || 5,
      price:     Number(data.price),
      desc:      data.desc?.trim() || '',
      createdAt: new Date().toISOString(),
    };
    list.push(product);
    _save(list);
    return product;
  }

  function update(id, data) {
    const list = getAll();
    const idx  = list.findIndex(p => p.id === id);
    if (idx === -1) return null;
    list[idx] = {
      ...list[idx],
      name:     data.name.trim(),
      category: data.category.trim(),
      sku:      data.sku?.trim() || '',
      qty:      Number(data.qty),
      minQty:   Number(data.minQty) || 5,
      price:    Number(data.price),
      desc:     data.desc?.trim() || '',
    };
    _save(list);
    return list[idx];
  }

  function remove(id) {
    _save(getAll().filter(p => p.id !== id));
    // remove movimentações do produto
    const moves = getMoves().filter(m => m.productId !== id);
    localStorage.setItem(KEY_M, JSON.stringify(moves));
  }

  function getById(id) { return getAll().find(p => p.id === id) || null; }

  function getStats() {
    const list = getAll();
    const totalValue = list.reduce((s, p) => s + p.price * p.qty, 0);
    const lowStock   = list.filter(p => p.qty <= p.minQty && p.qty > 0);
    const outOfStock = list.filter(p => p.qty === 0);
    const categories = [...new Set(list.map(p => p.category))];
    return { total: list.length, totalValue, lowStock, outOfStock, categories };
  }

  /* ── Movimentações ─────────────────────────────────────── */
  function getMoves(productId = null) {
    try {
      const all = JSON.parse(localStorage.getItem(KEY_M)) || [];
      return productId ? all.filter(m => m.productId === productId) : all;
    } catch { return []; }
  }

  function addMove(productId, tipo, qty, nota = '') {
    const all = getMoves();
    all.push({
      id:        crypto.randomUUID(),
      productId,
      tipo,        // 'entrada' | 'saida'
      qty:       Number(qty),
      nota:      nota.trim(),
      date:      new Date().toISOString(),
    });
    localStorage.setItem(KEY_M, JSON.stringify(all));
  }

  /* Entrada: aumenta estoque */
  function entrada(productId, qty, nota) {
    const p = getById(productId);
    if (!p) return;
    update(productId, { ...p, qty: p.qty + Number(qty) });
    addMove(productId, 'entrada', qty, nota);
  }

  /* Saída: diminui estoque */
  function saida(productId, qty, nota) {
    const p = getById(productId);
    if (!p || Number(qty) > p.qty) return false;
    update(productId, { ...p, qty: p.qty - Number(qty) });
    addMove(productId, 'saida', qty, nota);
    return true;
  }

  return { getAll, create, update, remove, getById, getStats, getMoves, entrada, saida };
})();
