/**
 * storage.js
 * Camada de dados — CRUD no localStorage.
 * Todos os dados ficam em localStorage['sm_products'].
 */

const Storage = (() => {
  const KEY = 'sm_products';

  /** Retorna todos os produtos */
  function getAll() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch {
      return [];
    }
  }

  /** Salva a lista completa */
  function _save(list) {
    localStorage.setItem(KEY, JSON.stringify(list));
  }

  /** Cria um produto novo */
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

  /** Atualiza um produto pelo id */
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

  /** Remove um produto pelo id */
  function remove(id) {
    const list = getAll().filter(p => p.id !== id);
    _save(list);
  }

  /** Retorna um produto pelo id */
  function getById(id) {
    return getAll().find(p => p.id === id) || null;
  }

  /** Estatísticas rápidas */
  function getStats() {
    const list = getAll();
    const totalValue   = list.reduce((s, p) => s + p.price * p.qty, 0);
    const lowStock     = list.filter(p => p.qty <= p.minQty && p.qty > 0);
    const outOfStock   = list.filter(p => p.qty === 0);
    const categories   = [...new Set(list.map(p => p.category))];
    return { total: list.length, totalValue, lowStock, outOfStock, categories };
  }

  return { getAll, create, update, remove, getById, getStats };
})();
