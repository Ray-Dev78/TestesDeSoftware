const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database'); // Importa a configuração do banco de dados

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (Frontend)
app.use(express.static(path.join(__dirname, 'focus-final')));

// Rota inicial - redireciona para a index do frontend
app.get('/', (req, res) => {
    res.redirect('/pages/index.html');
});

// --- ROTAS DE AUTENTICAÇÃO ---

// Cadastro de usuário
app.post('/api/register', (req, res) => {
    const { nome, email, senha } = req.body;
    
    if (!nome || !email || !senha) {
        return res.status(400).json({ success: false, message: 'Preencha todos os campos!' });
    }

    // Verifica se o email já existe
    db.get("SELECT email FROM users WHERE email = ?", [email], (err, row) => {
        if (err) return res.status(500).json({ success: false, message: 'Erro no servidor' });
        
        if (row) {
            return res.status(400).json({ success: false, message: 'Email já cadastrado!' });
        }

        // Insere o novo usuário
        const query = "INSERT INTO users (nome, email, senha) VALUES (?, ?, ?)";
        db.run(query, [nome, email, senha], function(err) {
            if (err) return res.status(500).json({ success: false, message: 'Erro ao cadastrar' });
            
            res.status(201).json({ success: true, message: 'Conta criada com sucesso!' });
        });
    });
});

// Login de usuário
app.post('/api/login', (req, res) => {
    const { email, senha, is_admin, codigo_admin } = req.body;
    
    db.get("SELECT * FROM users WHERE email = ? AND senha = ?", [email, senha], (err, user) => {
        if (err) return res.status(500).json({ success: false, message: 'Erro no servidor' });
        
        if (!user) {
            return res.status(401).json({ success: false, message: 'E-mail ou senha incorretos!' });
        }

        // Validação simples de admin
        if (is_admin === 'on' || is_admin === true) {
            if (codigo_admin !== '6666') {
                return res.status(401).json({ success: false, message: 'Código de administrador inválido!' });
            }
        }

        res.json({ 
            success: true, 
            message: 'Login realizado com sucesso!',
            user: { id: user.id, nome: user.nome, email: user.email }
        });
    });
});

// --- ROTAS DE TAREFAS ---

// Listar todas as tarefas com suas etiquetas
app.get('/api/tasks', (req, res) => {
    const query = `
        SELECT t.*, GROUP_CONCAT(tg.tag) as tags
        FROM tasks t
        LEFT JOIN task_tags tg ON t.id = tg.task_id
        GROUP BY t.id
    `;

    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: 'Erro ao buscar tarefas' });
        
        // Formata as tags de string para array
        const formattedTasks = rows.map(task => ({
            ...task,
            tags: task.tags ? task.tags.split(',') : []
        }));
        
        res.json(formattedTasks);
    });
});

// Adicionar nova tarefa
app.post('/api/tasks', (req, res) => {
    const { titulo, prioridade, etiqueta } = req.body;
    
    if (!titulo) {
        return res.status(400).json({ success: false, message: 'O título da tarefa é obrigatório!' });
    }

    db.run("INSERT INTO tasks (title, priority, status) VALUES (?, ?, ?)", 
        [titulo, prioridade || 'intermediaria', 'pendente'], 
        function(err) {
            if (err) return res.status(500).json({ success: false, message: 'Erro ao criar tarefa' });

            const taskId = this.lastID;
            const tags = Array.isArray(etiqueta) ? etiqueta : (etiqueta ? [etiqueta] : []);

            if (tags.length > 0) {
                const tagStmt = db.prepare("INSERT INTO task_tags (task_id, tag) VALUES (?, ?)");
                tags.forEach(tag => tagStmt.run(taskId, tag));
                tagStmt.finalize();
            }

            res.status(201).json({ success: true, task: { id: taskId, title: titulo, priority: prioridade, tags, status: 'pendente' } });
        }
    );
});

// Atualizar status da tarefa (Concluir)
app.patch('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    db.run("UPDATE tasks SET status = ? WHERE id = ?", [status, id], function(err) {
        if (err) return res.status(500).json({ success: false, message: 'Erro ao atualizar tarefa' });
        if (this.changes === 0) return res.status(404).json({ success: false, message: 'Tarefa não encontrada' });
        
        res.json({ success: true, message: 'Tarefa atualizada!' });
    });
});

// Excluir tarefa
app.delete('/api/tasks/:id', (req, res) => {
    const { id } = req.params;

    db.run("DELETE FROM tasks WHERE id = ?", [id], function(err) {
        if (err) return res.status(500).json({ success: false, message: 'Erro ao excluir tarefa' });
        if (this.changes === 0) return res.status(404).json({ success: false, message: 'Tarefa não encontrada' });
        
        res.json({ success: true, message: 'Tarefa excluída com sucesso!' });
    });
});

// --- ROTA DE DASHBOARD (ESTATÍSTICAS) ---
app.get('/api/stats', (req, res) => {
    const query = `
        SELECT t.*, GROUP_CONCAT(tg.tag) as tags
        FROM tasks t
        LEFT JOIN task_tags tg ON t.id = tg.task_id
        GROUP BY t.id
    `;

    db.all(query, [], (err, tasks) => {
        if (err) return res.status(500).json({ success: false, message: 'Erro ao calcular estatísticas' });

        const formattedTasks = tasks.map(t => ({
            ...t,
            tags: t.tags ? t.tags.split(',') : []
        }));

        const total = formattedTasks.length;
        const concluidas = formattedTasks.filter(t => t.status === 'concluida').length;
        const pendentes = formattedTasks.filter(t => t.status === 'pendente').length;
        
        const etiquetasDisponiveis = ['matematica', 'portugues', 'fisica', 'webii', 'ingles', 'geografia'];
        const statsPorEtiqueta = {};

        etiquetasDisponiveis.forEach(tag => {
            const tarefasDaTag = formattedTasks.filter(t => t.tags.includes(tag));
            const concluidasDaTag = tarefasDaTag.filter(t => t.status === 'concluida').length;
            if (tarefasDaTag.length > 0) {
                statsPorEtiqueta[tag] = {
                    total: tarefasDaTag.length,
                    concluidas: concluidasDaTag,
                    porcentagem: Math.round((concluidasDaTag / tarefasDaTag.length) * 100)
                };
            }
        });

        res.json({
            resumo: {
                totalConcluidasSemana: concluidas,
                tarefasParaHoje: pendentes,
                tarefasAtrasadas: 0,
                progressoGeral: total > 0 ? Math.round((concluidas / total) * 100) : 0,
                totalTarefas: total
            },
            detalhePorEtiqueta: statsPorEtiqueta
        });
    });
});

// --- ROTAS DE ADMINISTRAÇÃO ---

// Listar todos os usuários ativos
app.get('/api/admin/users', (req, res) => {
    db.all("SELECT id, nome, email, senha FROM users WHERE deleted = 0", [], (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: 'Erro ao buscar usuários' });
        res.json(rows);
    });
});

// Listar todos os usuários excluídos
app.get('/api/admin/users/deleted', (req, res) => {
    db.all("SELECT id, nome, email, senha FROM users WHERE deleted = 1", [], (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: 'Erro ao buscar usuários excluídos' });
        res.json(rows);
    });
});

// Excluir usuário (Soft Delete)
app.delete('/api/admin/users/:id', (req, res) => {
    const { id } = req.params;
    db.run("UPDATE users SET deleted = 1 WHERE id = ?", [id], function(err) {
        if (err) return res.status(500).json({ success: false, message: 'Erro ao excluir usuário' });
        res.json({ success: true, message: 'Usuário movido para a lixeira' });
    });
});

// Restaurar usuário
app.patch('/api/admin/users/:id/restore', (req, res) => {
    const { id } = req.params;
    db.run("UPDATE users SET deleted = 0 WHERE id = ?", [id], function(err) {
        if (err) return res.status(500).json({ success: false, message: 'Erro ao restaurar usuário' });
        res.json({ success: true, message: 'Usuário restaurado com sucesso' });
    });
});

// Excluir usuário permanentemente
app.delete('/api/admin/users/:id/permanent', (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM users WHERE id = ?", [id], function(err) {
        if (err) return res.status(500).json({ success: false, message: 'Erro ao excluir permanentemente' });
        res.json({ success: true, message: 'Usuário removido definitivamente' });
    });
});

// Iniciar servidor (Apenas se NÃO estiver rodando testes)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`
        =========================================
        🚀 Servidor Focus rodando com sucesso!
        📂 Frontend: http://localhost:${PORT}
        📡 API: http://localhost:${PORT}/api
        💾 Banco de Dados: SQLite (database.db)
        =========================================
        `);
    });
}

// Exporta o app para o Jest/Supertest
module.exports = app;
