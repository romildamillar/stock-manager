/**
 * app.js
 * Lógica principal — conecta Storage ↔ UI e gerencia eventos.
 */

(() => {
  /* ── Estado ─────────────────────────────────────────────── */
  let currentView    = 'dashboard';
  let editingId      = null;
  let pendingDeleteId = null;

  /* ── Refresh geral ──────────────────────────────────────── */
  function refresh() {
    UI.renderDashboard();
    UI.renderTable(
      document.getElementById('search-input').value,
      document.getElementById('filter-category').value,
      document.getElementById('filter-stock').value
    );
    UI.populateCategoryFilter();
  }

  /* ── Navegação ──────────────────────────────────────────── */
  document.querySelectorAll('.nav-item').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const view = link.dataset.view;
      document.querySelectorAll('.nav-item').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      document.getElementById(`view-${view}`).classList.add('active');
      document.getElementById('page-title').textContent =
        view === 'dashboard' ? 'Dashboard' : 'Produtos';
      currentView = view;
      refresh();
    });
  });

  /* ── Busca e filtros ────────────────────────────────────── */
  document.getElementById('search-input').addEventListener('input', () => {
    UI.renderTable(
      document.getElementById('search-input').value,
      document.getElementById('filter-category').value,
      document.getElementById('filter-stock').value
    );
  });

  document.getElementById('filter-category').addEventListener('change', () => {
    UI.renderTable(
      document.getElementById('search-input').value,
      document.getElementById('filter-category').value,
      document.getElementById('filter-stock').value
    );
  });

  document.getElementById('filter-stock').addEventListener('change', () => {
    UI.renderTable(
      document.getElementById('search-input').value,
      document.getElementById('filter-category').value,
      document.getElementById('filter-stock').value
    );
  });

  /* ── Abrir modal (novo produto) ─────────────────────────── */
  document.getElementById('btn-new-product').addEventListener('click', () => {
    editingId = null;
    UI.openModal();
  });

  /* ── Fechar modal ───────────────────────────────────────── */
  document.getElementById('modal-close').addEventListener('click', UI.closeModal);
  document.getElementById('btn-cancel').addEventListener('click',  UI.closeModal);
  document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modal-overlay')) UI.closeModal();
  });

  /* ── Salvar produto ─────────────────────────────────────── */
  document.getElementById('btn-save').addEventListener('click', () => {
    const data = UI.getFormData();
    if (!UI.validateForm(data)) {
      UI.showToast('Preencha os campos obrigatórios.', 'error');
      return;
    }
    if (editingId) {
      Storage.update(editingId, data);
      UI.showToast('Produto atualizado com sucesso!');
    } else {
      Storage.create(data);
      UI.showToast('Produto adicionado com sucesso!');
    }
    UI.closeModal();
    refresh();
  });

  /* ── Ações da tabela (editar / excluir) ─────────────────── */
  document.getElementById('products-tbody').addEventListener('click', e => {
    const editBtn = e.target.closest('.edit-btn');
    const delBtn  = e.target.closest('.delete-btn');

    if (editBtn) {
      const id      = editBtn.dataset.id;
      const product = Storage.getById(id);
      if (!product) return;
      editingId = id;
      UI.openModal(product);
    }

    if (delBtn) {
      pendingDeleteId = delBtn.dataset.id;
      document.getElementById('confirm-overlay').classList.remove('hidden');
    }
  });

  /* ── Confirmar exclusão ─────────────────────────────────── */
  document.getElementById('confirm-ok').addEventListener('click', () => {
    if (pendingDeleteId) {
      Storage.remove(pendingDeleteId);
      UI.showToast('Produto excluído.');
      pendingDeleteId = null;
      refresh();
    }
    document.getElementById('confirm-overlay').classList.add('hidden');
  });

  document.getElementById('confirm-cancel').addEventListener('click', () => {
    pendingDeleteId = null;
    document.getElementById('confirm-overlay').classList.add('hidden');
  });

  /* ── Fechar confirm com Escape ──────────────────────────── */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      UI.closeModal();
      document.getElementById('confirm-overlay').classList.add('hidden');
    }
  });

  /* ── Init ───────────────────────────────────────────────── */
  refresh();
})();
