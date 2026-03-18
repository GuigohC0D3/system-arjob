# arjob-api

API backend em NestJS para gerenciamento operacional do Arjob, com autenticacao JWT, persistencia em PostgreSQL via Prisma e modulos voltados para usuarios, clientes, comandas, produtos e cadastros auxiliares.

## Visao geral

O projeto expoe uma API REST organizada por modulos do NestJS. A aplicacao centraliza:

- autenticacao e identificacao do usuario logado;
- cadastro de usuarios, cargos, permissoes e status;
- gestao de clientes, convenios e departamentos;
- operacao de mesas, comandas, itens e produtos;
- registros auxiliares como movimentacao de caixa, tipos de pagamento e relatorios.

O bootstrap da aplicacao ativa validacao global de DTOs, CORS para frontends locais e camadas de logging e tratamento global de excecoes.

## Stack

- Node.js
- NestJS
- Prisma ORM
- PostgreSQL
- JWT
- Jest
- ESLint
- Prettier

## Arquitetura

O projeto segue a estrutura padrao do NestJS:

- `src/main.ts`: inicializacao da aplicacao, `ValidationPipe`, CORS, interceptors e filters globais.
- `src/app.module.ts`: composicao dos modulos principais.
- `src/auth`: registro, login, identificacao do usuario autenticado e logout.
- `src/prisma`: integracao com banco via `PrismaService`.
- `src/logging`: logger em arquivo, interceptor HTTP e filtro global de excecoes.
- `prisma/schema.prisma`: modelagem relacional da aplicacao.
- `prisma/migrations`: historico de migracoes do banco.

## Modulos implementados

- `auth`
- `users`
- `clientes`
- `status`
- `cargos`
- `permissoes`
- `categorias-produtos`
- `produtos`
- `mesas`
- `comandas`
- `convenios`
- `departamentos`
- `movimentacao-caixa`
- `logs-atendimento`
- `tipos-pagamento`
- `relatorios`
- `status-cliente`

## Principais entidades do banco

O schema Prisma modela o dominio com foco em operacao de atendimento e controle interno. Entre as tabelas principais estao:

- `usuarios`, `cargos`, `permissoes` e tabelas de associacao para controle de acesso;
- `clientes`, `status`, `convenio` e `departamento`;
- `mesas`, `comandas`, `itens_comanda` e relacoes com produtos;
- `produtos`, `categoria_produto` e `historico_precos`;
- `movimentacao_caixa`, `tipos_pagamento`, `relatorios` e `logs_atendimentos`.

Tambem existe a tabela `refresh_token_blacklist`, usada no fluxo de logout para invalidacao de token.

## Requisitos

- Node.js 22 ou superior
- npm
- PostgreSQL configurado e acessivel
- variaveis de ambiente da aplicacao

## Variaveis de ambiente

Crie um arquivo `.env` na raiz do projeto com pelo menos:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/arjob"
JWT_SECRET="troque-esta-chave"
JWT_EXPIRES_IN=604800
PORT=3000
```

## Instalacao

```bash
npm install
```

## Preparacao do banco

Gerar o client do Prisma:

```bash
npx prisma generate
```

Aplicar as migracoes:

```bash
npx prisma migrate dev
```

## Como executar

Modo desenvolvimento:

```bash
npm run start:dev
```

Build de producao:

```bash
npm run build
npm run start:prod
```

Por padrao, a API sobe na porta `3000`, ou na porta definida em `PORT`.

## Scripts principais

```bash
npm run build
npm run lint
npm test
npm run test:e2e
```

## Como funciona a autenticacao

O modulo `auth` expõe as rotas:

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/logout`

Fluxo atual:

1. O usuario se registra com nome, email, CPF e senha.
2. A senha e criptografada com `bcrypt`.
3. No login, a API valida CPF e senha e emite um `accessToken` JWT.
4. O token deve ser enviado no header `Authorization: Bearer <token>`.
5. O endpoint `GET /auth/me` retorna os dados do usuario autenticado.
6. O endpoint `POST /auth/logout` registra o token na blacklist para impedir reutilizacao.

## Regras de negocio observadas no codigo

- o registro publico cria usuario ativo, sem permitir definicao direta de cargo ou status;
- CPF e email de usuario sao tratados como unicos;
- a senha do usuario e armazenada de forma hasheada com `bcrypt`;
- campos extras enviados para a API sao rejeitados pela validacao global;
- o `ValidationPipe` aplica transformacao automatica e `whitelist`;
- CORS esta liberado para `http://localhost:5173` e `http://localhost:3000`.

## Endpoints de dominio

Os modulos protegidos por autenticacao atendem os recursos principais da aplicacao, incluindo:

- `/users`
- `/clientes`
- `/status`
- `/cargos`
- `/permissoes`
- `/categorias-produtos`
- `/produtos`
- `/mesas`
- `/comandas`
- `/convenios`
- `/departamentos`
- `/movimentacao-caixa`
- `/logs-atendimento`
- `/tipos-pagamento`
- `/relatorios`
- `/status-cliente`

## Qualidade e testes

O repositório inclui testes unitarios e e2e com Jest para controllers, services e fluxo basico da aplicacao.

## Publicacao e operacao

- o projeto usa `npm` como gerenciador principal;
- arquivos sensiveis como `.env` nao devem ser versionados;
- o diretorio `dist` e dependencias locais sao ignorados pelo Git;
- o historico de banco esta versionado dentro de `prisma/migrations`.
