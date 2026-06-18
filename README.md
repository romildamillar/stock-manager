# 📦 Stock Manager

Aplicação de controle de estoque desenvolvida com **HTML, CSS e JavaScript puro**, utilizando `localStorage` para persistência de dados. Projeto de portfólio por Romilda Millar.

## 🔗 Demo

> Link será adicionado após o deploy no Cloudflare Pages.

---

## ✨ Funcionalidades

- ✅ Cadastrar, editar e excluir produtos
- ✅ Campos: nome, categoria, SKU, quantidade, estoque mínimo, preço e descrição
- ✅ Dashboard com estatísticas em tempo real (total, valor, categorias, estoque baixo)
- ✅ Alertas automáticos para produtos com estoque baixo ou zerado
- ✅ Busca por nome, SKU ou categoria
- ✅ Filtros por categoria e nível de estoque
- ✅ Dados salvos localmente no navegador (localStorage)
- ✅ Interface responsiva com tema escuro profissional

---

## 🛠 Tecnologias

- HTML5
- CSS3 (variáveis CSS, Grid, Flexbox)
- JavaScript ES6+ (módulos IIFE, `localStorage`, `crypto.randomUUID`)
- Google Fonts: Inter + JetBrains Mono

---

## 📁 Estrutura

```
stock-manager/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── storage.js   → CRUD no localStorage
│   ├── ui.js        → Renderização da interface
│   └── app.js       → Lógica principal e eventos
└── README.md
```

---

## 🚀 Como rodar localmente

1. Clone o repositório:
   ```bash
   git clone https://github.com/romildamillar/stock-manager.git
   cd stock-manager
   ```

2. Abra no VS Code:
   ```bash
   code .
   ```

3. Use a extensão **Live Server** para rodar:
   - Clique com botão direito em `index.html` → *Open with Live Server*

---

## ☁️ Deploy no Cloudflare Pages

1. Faça push do projeto para o GitHub
2. Acesse [pages.cloudflare.com](https://pages.cloudflare.com)
3. Crie um novo projeto → conecte o repositório `stock-manager`
4. Configurações de build:
   - **Framework preset:** None
   - **Build command:** *(deixar vazio)*
   - **Output directory:** `/` (raiz)
5. Clique em **Save and Deploy**

---

## 👩‍💻 Autora

**Romilda Millar** — [GitHub](https://github.com/romildamillar)
