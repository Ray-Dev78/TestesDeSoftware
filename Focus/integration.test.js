const request = require('supertest');
const app = require('./server'); 

describe('Testes de Integração - Sistema Focus (Fluxos Completos)', () => {
  
  // Geramos um email aleatório para não dar erro de "Email já cadastrado" se rodar o teste várias vezes
  const testEmail = `user_${Date.now()}@test.com`; 
  let createdTaskId = null;

  it('1. Fluxo de Registro e Login (Frontend -> API -> DB)', async () => {
    // Passo A: Simula o frontend enviando dados de cadastro
    const resRegister = await request(app).post('/api/register').send({
      nome: 'Usuário Teste Integração',
      email: testEmail,
      senha: '123'
    });
    expect(resRegister.statusCode).toBe(201);
    expect(resRegister.body.success).toBe(true);

    // Passo B: Simula o frontend fazendo login logo em seguida
    const resLogin = await request(app).post('/api/login').send({
      email: testEmail,
      senha: '123'
    });
    expect(resLogin.statusCode).toBe(200);
    expect(resLogin.body.user).toBeDefined();
  });

  it('2. Fluxo de Criação e Persistência de Tarefa (Frontend -> API -> DB)', async () => {
    // Simula o frontend enviando uma nova tarefa
    const resCreate = await request(app)
      .post('/api/tasks')
      .send({ titulo: 'Tarefa de Integração', prioridade: 'alta' });

    expect(resCreate.statusCode).toBe(201);
    expect(resCreate.body.task.id).toBeDefined();
    
    createdTaskId = resCreate.body.task.id; // Salva o ID para o próximo teste
  });

  it('3. Fluxo de Conclusão de Tarefa (DB -> API -> Frontend)', async () => {
    // Simula o frontend clicando em "concluir" e enviando o PATCH
    const resPatch = await request(app)
      .patch(`/api/tasks/${createdTaskId}`)
      .send({ status: 'concluida' });

    expect(resPatch.statusCode).toBe(200);
    expect(resPatch.body.message).toBe('Tarefa atualizada!');
  });
});