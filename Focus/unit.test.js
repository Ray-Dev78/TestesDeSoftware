const request = require('supertest');
const app = require('./server'); // Apontando para o arquivo correto

describe('Testes Unitários - API Sistema Focus', () => {

  // --- AUTENTICAÇÃO ---
  describe('Módulo de Autenticação', () => {
    it('1. Deve retornar 400 ao tentar cadastrar usuário sem preencher tudo (Inválido)', async () => {
      const res = await request(app)
        .post('/api/register')
        .send({ nome: 'Teste' }); // Faltando email e senha
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toBe('Preencha todos os campos!');
    });

    it('2. Deve retornar 401 ao fazer login com usuário inexistente ou senha incorreta', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({ email: 'fake@focus.com', senha: 'wrongpassword' });
      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toBe('E-mail ou senha incorretos!');
    });
  });

  // --- TAREFAS ---
  describe('Módulo de Tarefas', () => {
    it('3. Deve listar as tarefas com sucesso (Status 200)', async () => {
      const res = await request(app).get('/api/tasks');
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
    });

    it('4. Deve criar uma nova tarefa com dados válidos', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ titulo: 'Estudar Jest', prioridade: 'alta', etiqueta: 'webii' });
      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
    });

    it('5. Deve retornar 400 ao tentar criar tarefa sem título', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ prioridade: 'baixa' }); // Faltou título
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toBe('O título da tarefa é obrigatório!');
    });

    it('6. Deve retornar 404 ao tentar excluir uma tarefa que não existe', async () => {
      const res = await request(app).delete('/api/tasks/99999');
      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toBe('Tarefa não encontrada');
    });
  });

  // --- ADMINISTRAÇÃO ---
  describe('Módulo de Administração', () => {
    it('7. Deve listar todos os usuários ativos (Status 200)', async () => {
      const res = await request(app).get('/api/admin/users');
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
    });

    it('8. Deve listar todos os usuários excluídos (Status 200)', async () => {
      const res = await request(app).get('/api/admin/users/deleted');
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
    });
  });
});