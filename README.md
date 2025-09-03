# Desafio Node.js – API Completa

API completa em Node.js + TypeScript usando Fastify, Drizzle ORM (PostgreSQL), autenticação JWT e testes automatizados. Inclui documentação Swagger/Scalar em ambiente de desenvolvimento.

## Requisitos
- Node.js 22+
- Docker e Docker Compose
- npm (ou outro gerenciador, mas o projeto usa `package-lock.json`)

## Tecnologias
- Fastify 5
- TypeScript
- Drizzle ORM + PostgreSQL
- Zod (validação)
- JWT (autenticação)
- Argon2 (hash de senhas)
- Vitest (testes)
- Swagger/OpenAPI + Scalar API Reference (em `/docs` quando `NODE_ENV=development`)
- Docker (containerização)

## Configuração
1. Clone o repositório e acesse a pasta do projeto.
2. Instale as dependências:
```bash
npm install
```
3. Suba o banco Postgres com Docker:
```bash
docker compose up -d
```
4. Crie um arquivo `.env` na raiz com:
```bash
# URL do banco (Docker local padrão)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/desafio

# Ativa docs em /docs
NODE_ENV=development
```
5. Rode as migrações (Drizzle):
```bash
npm run db:migrate
```
(opcional) Para inspecionar o schema/estado com o Drizzle Studio:
```bash
npm run db:studio
```

## Executando o servidor
```bash
npm run dev
```
- Porta padrão: `http://localhost:3333`
- Logs legíveis habilitados
- Documentação da API (em dev): `http://localhost:3333/docs`

## Endpoints
Base URL: `http://localhost:3333`

### Autenticação
- POST `/sessions`
  - Login do usuário
  - Body (JSON):
    ```json
    { "email": "user@example.com", "password": "senha123" }
    ```
  - Respostas:
    - 200: `{ "token": "<jwt_token>" }`

### Usuários
- POST `/users`
  - Criar um usuário
  - Body (JSON):
    ```json
    {
      "name": "João Silva",
      "email": "joao@example.com",
      "password": "senha123",
      "role": "student"
    }
    ```
  - Respostas:
    - 201: `{ "userId": "<uuid>" }`

- GET `/users` (requer autenticação - apenas managers)
  - Lista todos os usuários
  - Headers: `Authorization: Bearer <token>`
  - Query params: `search` (opcional)
  - 200: `{ "users": [{ "id": "<uuid>", "name": "...", "email": "...", "role": "..." }] }`

- GET `/users/:id` (requer autenticação)
  - Busca um usuário pelo ID
  - Headers: `Authorization: Bearer <token>`
  - Parâmetros: `id` (UUID)
  - Respostas:
    - 200: `{ "user": { "id": "<uuid>", "name": "...", "email": "...", "role": "..." } }`
    - 404: `{ "message": "User not found" }`

- PUT `/users/:id` (requer autenticação)
  - Atualiza um usuário
  - Headers: `Authorization: Bearer <token>`
  - Parâmetros: `id` (UUID)
  - Body (JSON) - todos os campos são opcionais:
    ```json
    {
      "name": "João Santos",
      "email": "joao.santos@example.com",
      "password": "novaSenha123",
      "role": "manager"
    }
    ```
  - Respostas:
    - 200: `{ "message": "User updated successfully" }`
    - 404: `{ "message": "User not found" }`

- DELETE `/users/:id` (requer autenticação - apenas managers)
  - Deleta um usuário
  - Headers: `Authorization: Bearer <token>`
  - Parâmetros: `id` (UUID)
  - Respostas:
    - 200: `{ "message": "User deleted successfully" }`
    - 404: `{ "message": "User not found" }`

### Cursos
- POST `/courses` (requer autenticação)
  - Cria um curso
  - Headers: `Authorization: Bearer <token>`
  - Body (JSON):
    ```json
    { "title": "Curso de Docker" }
    ```
  - Respostas:
    - 201: `{ "courseId": "<uuid>" }`

- GET `/courses`
  - Lista todos os cursos com busca e ordenação
  - Query params: `search` (opcional), `orderBy` (opcional, padrão: "title")
  - 200: `{ "courses": [{ "id": "<uuid>", "title": "..." }] }`

- GET `/courses/:id`
  - Busca um curso pelo ID
  - Parâmetros: `id` (UUID)
  - Respostas:
    - 200: `{ "course": { "id": "<uuid>", "title": "...", "description": "... | null" } }`
    - 404: vazio

Há um arquivo `requisicoes.http` com exemplos prontos (compatível com extensões de REST Client).

## Modelos (schema)
Tabelas principais definidas em `src/database/schema.ts`:
- `users`
  - `id` (uuid, pk, default random)
  - `name` (text, obrigatório)
  - `email` (text, único, obrigatório)
  - `password` (text, obrigatório, hash Argon2)
  - `role` (enum: 'student' | 'manager', padrão: 'student')
- `courses`
  - `id` (uuid, pk, default random)
  - `title` (text, único, obrigatório)
  - `description` (text, opcional)
- `enrollments`
  - `id` (uuid, pk, default random)
  - `userId` (uuid, fk para users.id)
  - `courseId` (uuid, fk para courses.id)
  - `createdAt` (timestamp, padrão: now())
  - Índice único em (userId, courseId)

## Fluxo principal (Mermaid)

```mermaid
sequenceDiagram
  participant C as Client
  participant S as Fastify Server
  participant V as Zod Validator
  participant DB as Drizzle + PostgreSQL

  C->>S: POST /courses {title}
  S->>V: Validar body
  V-->>S: OK ou Erro 400
  alt válido
    S->>DB: INSERT INTO courses (title)
    DB-->>S: {id}
    S-->>C: 201 {courseId}
  else inválido
    S-->>C: 400
  end

  C->>S: GET /courses
  S->>DB: SELECT id,title FROM courses
  DB-->>S: lista
  S-->>C: 200 {courses: [...]} 

  C->>S: GET /courses/:id
  S->>V: Validar param id (uuid)
  V-->>S: OK ou Erro 400
  alt encontrado
    S->>DB: SELECT * FROM courses WHERE id=...
    DB-->>S: course
    S-->>C: 200 {course}
  else não encontrado
    S-->>C: 404
  end
```

## Scripts
- `npm run dev`: inicia o servidor com reload e carrega variáveis de `.env`
- `npm run db:generate`: gera artefatos do Drizzle a partir do schema
- `npm run db:migrate`: aplica migrações no banco
- `npm run db:studio`: abre o Drizzle Studio (porta 4988)
- `npm run db:seed`: popula o banco com dados de exemplo
- `npm test`: executa todos os testes com coverage
- `npm run pretest`: executa migrações no ambiente de teste

## Testes
O projeto inclui testes automatizados usando Vitest:
- Testes unitários para todas as rotas
- Factories para criação de dados de teste
- Coverage report automático
- Configuração separada para ambiente de teste (`.env.test`)

### Executando testes
```bash
npm test
```

## Autenticação e Autorização
- Sistema de login com JWT
- Hash de senhas usando Argon2
- Middleware de autenticação para rotas protegidas
- Sistema de roles (student/manager)
- Hooks do Fastify para verificação de JWT e roles

## Docker
O projeto inclui:
- `Dockerfile` para containerização da aplicação
- `docker-compose.yml` para PostgreSQL
- Configuração otimizada para produção

## Estrutura do Projeto
```
src/
├── @types/           # Definições de tipos TypeScript
├── database/         # Configuração do banco e schema
├── routes/           # Rotas da API
│   └── hooks/        # Middlewares de autenticação
├── tests/            # Utilitários de teste
│   └── factories/    # Factories para dados de teste
├── utils/            # Utilitários gerais
├── app.ts           # Configuração do Fastify
└── server.ts        # Entrada da aplicação
```

## Configuração de Ambiente
Crie arquivos `.env` e `.env.test` na raiz:

**.env (desenvolvimento)**
```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/desafio
NODE_ENV=development
JWT_SECRET=seu_jwt_secret_aqui
```

**.env.test (testes)**
```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/desafio_test
NODE_ENV=test
JWT_SECRET=test_jwt_secret
```

## Dicas e solução de problemas
- Conexão recusada ao Postgres: confirme `docker compose up -d` e que a porta `5432` não está em uso.
- Variável `DATABASE_URL` ausente: verifique seu `.env`. O Drizzle exige essa variável para `db:generate`, `db:migrate` e `db:studio`.
- Docs não aparecem em `/docs`: garanta `NODE_ENV=development` no `.env` e reinicie o servidor.
- Testes falhando: verifique se o arquivo `.env.test` existe e se as migrações foram aplicadas.
- Drizzle Studio não abre: a porta padrão foi alterada para 4988 para evitar conflitos.

## Funcionalidades Implementadas
- ✅ **CRUD completo de usuários**
  - Criação, listagem, busca, atualização e exclusão
  - Controle de acesso baseado em roles
  - Hash seguro de senhas com Argon2
- ✅ **CRUD completo de cursos**
  - Criação, listagem, busca por ID
  - Sistema de busca e filtros
- ✅ **Sistema de autenticação JWT**
  - Login com email e senha
  - Tokens JWT para autenticação
  - Middleware de verificação de token
- ✅ **Sistema de roles (student/manager)**
  - Controle de acesso granular
  - Operações restritas por role
- ✅ **Relacionamentos entre usuários e cursos**
  - Tabela de enrollments (matrículas)
  - Índices únicos para evitar duplicatas
- ✅ **Testes automatizados com coverage**
  - Testes unitários para todas as rotas
  - Factories para dados de teste
  - Coverage report automático
- ✅ **Documentação automática da API**
  - Swagger/OpenAPI integrado
  - Interface Scalar para visualização
- ✅ **Containerização com Docker**
  - Dockerfile otimizado
  - Docker Compose para PostgreSQL
- ✅ **Seed de dados para desenvolvimento**
  - População automática do banco
  - Dados faker em português
- ✅ **Validação robusta com Zod**
  - Validação de entrada em todas as rotas
  - Mensagens de erro claras
- ✅ **Logs estruturados**
  - Logs formatados com Pino Pretty
  - Rastreamento de requisições

## Licença
ISC (ver `package.json`).
