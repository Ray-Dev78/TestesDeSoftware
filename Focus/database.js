const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Caminho do arquivo do banco de dados
const dbPath = path.resolve(__dirname, 'database.db');

// Conectar ao banco de dados (cria o arquivo se não existir)
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erro ao conectar ao SQLite:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
        setupTables();
    }
});

// Função para criar as tabelas iniciais
function setupTables() {
    db.serialize(() => {
        // Tabela de Usuários
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                senha TEXT NOT NULL,
                deleted INTEGER DEFAULT 0
            )
        `);

        // Tabela de Tarefas
        db.run(`
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                priority TEXT DEFAULT 'intermediaria',
                status TEXT DEFAULT 'pendente'
            )
        `);

        // Tabela de Etiquetas
        db.run(`
            CREATE TABLE IF NOT EXISTS task_tags (
                task_id INTEGER,
                tag TEXT,
                FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
            )
        `);

        console.log('Tabelas verificadas/criadas com sucesso.');

        // Inserir Usuário Administrador padrão se não existir
        db.get("SELECT * FROM users WHERE email = 'admin@focus.com'", (err, row) => {
            if (!row) {
                db.run("INSERT INTO users (nome, email, senha) VALUES (?, ?, ?)", 
                    ['Administrador', 'admin@focus.com', 'admin123']);
                console.log('Usuário Admin padrão criado: admin@focus.com / admin123');
            }
        });
    });
}

module.exports = db;
