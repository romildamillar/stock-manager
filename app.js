// app.js - Logica principal

(() => {
  let editingId       = null;
  let pendingDeleteId = null;
  let moveProductId   = null;

  function refresh() {
    UI.renderDashboard();
    UI.renderTable(
      document.getElementById('search-input').value,
      document.getElementById('filter-category').value,
      document.getElementById('filter-stock').value
    );
    UI.populateCategoryFilter();
  }

  // Navegacao
  document.querySelectorAll('.nav-item').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const view = link.dataset.view;
      document.querySelectorAll('.nav-item').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      document.getElementById('view-' + view).classList.add('active');
      document.getElementById('page-title').textContent = view === 'dashboard' ? 'Dashboard' : 'Produtos';
      refresh();
    });
  });

  // Filtros
  ['search-input','filter-category','filter-stock'].forEach(function(id) {
    document.getElementById(id).addEventListener(id === 'search-input' ? 'input' : 'change', function() {
      UI.renderTable(
        document.getElementById('search-input').value,
        document.getElementById('filter-category').value,
        document.getElementById('filter-stock').value
      );
    });
  });

  // Modal produto - abrir/fechar
  document.getElementById('btn-new-product').addEventListener('click', function() { editingId = null; UI.openModal(); });
  document.getElementById('modal-close').addEventListener('click', UI.closeModal);
  document.getElementById('btn-cancel').addEventListener('click', UI.closeModal);
  document.getElementById('modal-overlay').addEventListener('click', function(e) {
    if (e.target === document.getElementById('modal-overlay')) UI.closeModal();
  });

  // Salvar produto
  document.getElementById('btn-save').addEventListener('click', function() {
    const data = UI.getFormData();
    if (!UI.validateForm(data)) { UI.showToast('Preencha os campos obrigatorios.', 'error'); return; }
    if (editingId) {
      Storage.update(editingId, data);
      UI.showToast('Produto atualizado!');
    } else {
      Storage.create(data);
      UI.showToast('Produto adicionado!');
    }
    UI.closeModal();
    refresh();
  });

  // Tabs de movimentacao
  document.querySelectorAll('.move-tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      UI._switchTab(tab.dataset.tab);
      if (tab.dataset.tab === 'historico' && moveProductId) {
        UI.renderHistorico(moveProductId);
      }
    });
  });

  // Acoes da tabela
  document.getElementById('products-tbody').addEventListener('click', function(e) {
    const moveBtn = e.target.closest('.move-btn');
    const editBtn = e.target.closest('.edit-btn');
    const delBtn  = e.target.closest('.delete-btn');

    if (moveBtn) {
      moveProductId = moveBtn.dataset.id;
      const product = Storage.getById(moveProductId);
      if (product) UI.openMoveModal(product);
    }
    if (editBtn) {
      const product = Storage.getById(editBtn.dataset.id);
      if (!product) return;
      editingId = editBtn.dataset.id;
      UI.openModal(product);
    }
    if (delBtn) {
      pendingDeleteId = delBtn.dataset.id;
      document.getElementById('confirm-overlay').classList.remove('hidden');
    }
  });

  // Entrada
  document.getElementById('btn-entrada').addEventListener('click', function() {
    const qty  = Number(document.getElementById('entrada-qty').value);
    const nota = document.getElementById('entrada-nota').value;
    const obs  = document.getElementById('entrada-obs').value;
    if (!qty || qty <= 0) {
      document.getElementById('entrada-qty').classList.add('error');
      UI.showToast('Informe a quantidade.', 'error');
      return;
    }
    const notaCompleta = [nota, obs].filter(Boolean).join(' | ');
    Storage.entrada(moveProductId, qty, notaCompleta);
    const updated = Storage.getById(moveProductId);
    UI._updateMoveQty(updated.qty);
    document.getElementById('entrada-qty').value  = '';
    document.getElementById('entrada-nota').value = '';
    document.getElementById('entrada-obs').value  = '';
    UI.showToast('Entrada de ' + qty + ' unidade(s) registrada!');
    refresh();
  });

  // Saida
  document.getElementById('btn-saida').addEventListener('click', function() {
    const qty     = Number(document.getElementById('saida-qty').value);
    const nota    = document.getElementById('saida-nota').value;
    const obs     = document.getElementById('saida-obs').value;
    const product = Storage.getById(moveProductId);
    if (!qty || qty <= 0) {
      document.getElementById('saida-qty').classList.add('error');
      UI.showToast('Informe a quantidade.', 'error');
      return;
    }
    if (qty > product.qty) {
      document.getElementById('saida-qty').classList.add('error');
      UI.showToast('Estoque insuficiente! Disponivel: ' + product.qty, 'error');
      return;
    }
    const notaCompleta = [nota, obs].filter(Boolean).join(' | ');
    Storage.saida(moveProductId, qty, notaCompleta);
    const updated = Storage.getById(moveProductId);
    UI._updateMoveQty(updated.qty);
    document.getElementById('saida-qty').value  = '';
    document.getElementById('saida-nota').value = '';
    document.getElementById('saida-obs').value  = '';
    UI.showToast('Saida de ' + qty + ' unidade(s) registrada!');
    refresh();
  });

  // Fechar modal movimentacao
  document.getElementById('move-close').addEventListener('click', UI.closeMoveModal);
  document.getElementById('move-overlay').addEventListener('click', function(e) {
    if (e.target === document.getElementById('move-overlay')) UI.closeMoveModal();
  });

  // Confirmar exclusao
  document.getElementById('confirm-ok').addEventListener('click', function() {
    if (pendingDeleteId) {
      Storage.remove(pendingDeleteId);
      UI.showToast('Produto excluido.');
      pendingDeleteId = null;
      refresh();
    }
    document.getElementById('confirm-overlay').classList.add('hidden');
  });
  document.getElementById('confirm-cancel').addEventListener('click', function() {
    pendingDeleteId = null;
    document.getElementById('confirm-overlay').classList.add('hidden');
  });

  // Escape fecha modais
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      UI.closeModal();
      UI.closeMoveModal();
      document.getElementById('confirm-overlay').classList.add('hidden');
    }
  });

  refresh();
})();
