# 📚 Focus — Sistema de Organização de Estudos

**IFPB · Campus Campina Grande · Web II · 2026**

Equipe: Alessandra Silva · Emely Maria · José Rayff

Acesse em: https://sistema-web2-1.onrender.com

Para entrar como admin: 
Senha do admin


E-mail: admin@focus.com

Senha:
admin123

Código:
6666
---

## 🗂️ Estrutura de Pastas

```
focus/
│
├── 📄 README.md
│
├── 📁 pages/                    ← Páginas HTML
│   ├── 📄 index.html            ← 1. Landing page + Login/Cadastro
│   ├── 📄 Dashboard.html        ← 2. Área do Estudante
│   └── 📄 Tarefas.html          ← 3. Gerenciamento de Tarefas
│
└── 📁 assets/
    └── 📁 css/                  ← Todo o CSS separado por página
        ├── 📄 global.css        ← Variáveis e reset (importado por todos)
        ├── 📄 index.css         ← Estilos da landing page e login/cadastro
        ├── 📄 Dashboard.css     ← Estilos da área do aluno
        └── 📄 Tarefas.css       ← Estilos do gerenciamento de tarefas
```

---

## 📄 Páginas

| Arquivo | Descrição | Cores |
|---------|-----------|-------|
| `index.html` | Apresentação do sistema + Login e Cadastro | Verde + Branco |
| `Dashboard.html` | Dashboard do aluno: progresso e tarefas | Verde + Branco |
| `Tarefas.html` | Gerenciamento de tarefas | Verde + Branco |

---

## 🔗 Fluxo de Navegação

```
index.html  (Landing Page)
    │
    └──► #acesso  (Login / Cadastro — no final da mesma página)
              │
              ├──► Dashboard.html   (se estudante)
              └──► Tarefas.html     (se administrador)
```

---

## 🎨 Paleta de Cores

| Variável | Valor | Uso |
|----------|-------|-----|
| `--verde` | `#22C55E` | Cor principal |
| `--verde-dk` | `#16A34A` | Verde escuro / hover |
| `--verde-cl` | `#DCFCE7` | Verde claro / fundos |
| `--verde-md` | `#86EFAC` | Verde médio / bordas |
| `--branco` | `#FFFFFF` | Fundo geral |
| `--cinza-cl` | `#F8FAFC` | Fundo secundário |
| `--cinza-bd` | `#E2E8F0` | Bordas |
| `--cinza-txt` | `#64748B` | Textos secundários |
| `--preto` | `#0F172A` | Textos principais |

**Fonte:** [Inter](https://fonts.google.com/specimen/Inter) (Google Fonts)

---

## ▶️ Como Visualizar

1. Abra a pasta `focus/pages/`
2. Clique duas vezes em `index.html`
3. Navegue pelo site pelos botões e links

> ✨ **Recomendado:** VS Code + extensão [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)

---

## 🔧 Integração com o Back-end

Este módulo é só o **front-end** (HTML + CSS). A integração com a API (Node.js + SQLite) será feita pelo time de back-end conectando os `<form>` às rotas da API.

| Página | Rota da API | Método |
|--------|-----------|--------|
| Login | `/api/auth/login` | `POST` |
| Cadastro | `/api/auth/cadastro` | `POST` |
| Dashboard | `/api/tarefas/dashboard` | `GET` |
| Concluir Tarefa | `/api/tarefas/:id/concluir` | `PATCH` |
| Admin — Alunos | `/api/admin/usuarios` | `GET` |
| Admin — Excluir | `/api/admin/usuarios/:id` | `DELETE` |

---

## 📜 Licença

Focus © 2026 · IFPB Campus Campina Grande

---

## 👥 Contribuidores

- **Alessandra Silva**
- **Emely Maria**
- **José Rayff**
