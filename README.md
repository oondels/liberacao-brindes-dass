# Liberação de Brindes DASS

API backend em `Node.js`, `TypeScript`, `Express`, `TypeORM` e `Zod` para gestão do fluxo de solicitação, aprovação, separação, troca, voucher, retirada e catálogo de brindes da DASS.

Swagger disponível em `GET /api/docs` e especificação OpenAPI em `GET /api/openapi.json`.

## Visão geral

O sistema atende três frentes principais:

- operação de solicitações de brindes e calçados
- gestão de permissões administrativas por tipo de requisição
- autorização RBAC por matrícula e nível administrativo
- gestão modular do catálogo de brindes ativos

O fluxo atual suporta:

- criação de solicitação autenticada com validação por matrícula e tipo
- aprovação ou rejeição por aprovadores autorizados
- etapa operacional de separação antes da liberação do voucher
- geração de voucher transacional
- retirada por bipagem do voucher com permissão por tabela
- solicitação de troca para brindes já retirados, com reativação do voucher original
- histórico persistido das transições da solicitação
- catálogo administrativo de brindes ativos com vínculo opcional por `brinde_id`
- RBAC com `Admin Master`, `Admin`, aprovador, separador e operador de bipagem
- dashboard administrativo com resumo, analytics, exportação e atividade recente

## Stack e arquitetura

### Tecnologias

- `Node.js`
- `TypeScript`
- `Express 5`
- `TypeORM`
- `PostgreSQL`
- `Zod`
- `JWT` em cookie

### Estrutura do projeto

```text
src/
  config/        # ambiente e DataSource
  controllers/   # camada HTTP
  middleware/    # autenticação, autorização e validação
  migrations/    # evolução do banco
  models/        # entidades TypeORM
  routes/        # definição das rotas
  schemas/       # contratos zod
  services/      # regras de negócio
  types/         # tipos auxiliares e DTOs
```

### Organização por responsabilidade

- `routes` definem os endpoints públicos e administrativos
- `controllers` adaptam a camada HTTP para os serviços
- `services` concentram regras de negócio, transações e repositórios
- `models` representam as tabelas e relações do banco
- `middleware` aplica autenticação e autorização por papel ou matrícula
- `schemas` garantem contratos de entrada e filtros com `zod`

## Controle de acesso

O sistema usa autenticação por JWT em cookie e autorização por RBAC.

Perfis relevantes:

- `Admin Master`: qualquer usuário autenticado com `setor = automacao` no JWT
- `Admin`: matrícula cadastrada em `user_admin`
- `Aprovador`: matrícula cadastrada em `user_aprovacao`
- `Separador`: matrícula cadastrada em `user_separacao`
- `Operador de bipagem`: matrícula cadastrada em `user_bipagem`

Regras de visibilidade:

- `GET /api/solicitacoes` não é uma listagem aberta para qualquer usuário autenticado
- `Admin Master` vê todos os tipos e todos os status
- `Admin` vê apenas os `tipo_requisicao` cadastrados em `user_admin`
- `Aprovador` vê apenas os `tipo_requisicao` cadastrados em `user_aprovacao`
- `Separador` vê apenas os `tipo_requisicao` cadastrados em `user_separacao`
- solicitações em `aguardando_troca` só entram na listagem para aprovadores com `pode_aprovar_troca = true`, respeitando o escopo por tipo

## Fluxo operacional atual

### 1. Criação da solicitação

O usuário autenticado cria a solicitação em `POST /api/solicitacoes`.

Regras relevantes:

- a matrícula autenticada precisa existir em `user_criacao_solicitacao`
- o `tipo_requisicao` precisa estar no escopo de permissão do usuário
- `genero` é obrigatório em novas solicitações
- `num_calce` é obrigatório
- `marca` e `modelo` são obrigatórios apenas para `teste_calce`
- `sandalia` é um `tipo_requisicao` próprio
- `brinde_5s` é tratado como `subgrupo_campanha` de `campanha`
- `brinde_id` pode ser informado para vincular a solicitação ao catálogo de brindes ativos

### 2. Aprovação

A aprovação ocorre em `POST /api/solicitacoes/:id/aprovar`.

Regras relevantes:

- exige autenticação e middleware `isManager`
- a matrícula também precisa existir em `user_aprovacao`
- a aprovação é limitada por `tipo_requisicao`
- `teste_calce` continua gerando voucher imediatamente
- os demais tipos seguem para `aguardando_separacao`
- para `campanha` e `falta_zero`, a definição do brinde pode ser concluída na aprovação

### 3. Separação

A separação ocorre em `POST /api/solicitacoes/:id/separar`.

Regras relevantes:

- exige autenticação e permissão em `user_separacao`
- a solicitação precisa estar em `aguardando_separacao`
- o operador pode confirmar o brinde por `brinde_id` do catálogo, por override manual de `marca/modelo`, ou usando os dados já presentes
- ao final da separação, `marca` e `modelo` precisam estar resolvidos
- o voucher é gerado nessa etapa para todos os tipos que não sejam `teste_calce`

### 4. Retirada

A retirada ocorre em `POST /api/retiradas/bipar`.

Regras relevantes:

- exige autenticação
- exige cadastro em `user_bipagem`
- o voucher precisa existir, estar ativo e com status `pendente`
- ao resgatar o voucher, a solicitação passa para `retirado`

### 5. Troca

O fluxo de troca usa:

- `POST /api/retiradas/solicitar-troca` para iniciar a devolução operacional de um voucher já resgatado
- `GET /api/solicitacoes/trocas` para fila de análise de troca
- `POST /api/solicitacoes/:id/aprovar-troca` para reativar o voucher original

Regras relevantes:

- a solicitação de troca só pode começar com voucher `resgatado` e solicitação `retirado`
- o aprovador de troca precisa estar em `user_aprovacao` com `pode_aprovar_troca = true`
- quando a troca é aprovada, o voucher original volta para `pendente` e `ativo = true`
- `teste_calce` volta para `aprovado`
- os demais tipos voltam para `aguardando_separacao`

## Tipos, estados e domínio

### Tipos de requisição

- `teste_calce`
- `brinde_interno`
- `pense_aja`
- `campanha`
- `falta_zero`
- `sandalia`

### Subgrupos de campanha

- `brigada_incendio`
- `eficiencia`
- `hora_extra`
- `brinde_5s`

### Status da solicitação

- `pendente_aprovacao`
- `aguardando_separacao`
- `aguardando_troca`
- `aprovado`
- `rejeitado`
- `retirado`
- `cancelado`

### Status do voucher

- `pendente`
- `resgatado`
- `cancelado`

## Rotas principais

### Documentação

- `GET /api/docs`
- `GET /api/openapi.json`

### Solicitações

- `POST /api/solicitacoes`
- `GET /api/solicitacoes`
- `GET /api/solicitacoes/:id`
- `GET /api/solicitacoes/separacao`
- `GET /api/solicitacoes/trocas`
- `POST /api/solicitacoes/:id/aprovar`
- `POST /api/solicitacoes/:id/aprovar-troca`
- `POST /api/solicitacoes/:id/rejeitar`
- `POST /api/solicitacoes/:id/separar`
- `POST /api/solicitacoes/:id/cancelar`

### Retiradas

- `GET /api/retiradas`
- `POST /api/retiradas/bipar`
- `POST /api/retiradas/solicitar-troca`

### Administração

- `POST /api/admin/user-admin`
- `GET /api/admin/user-admin`
- `GET /api/admin/user-admin/:id`
- `PUT /api/admin/user-admin/:id`
- `DELETE /api/admin/user-admin/:id`
- `POST /api/admin/user-aprovacao`
- `GET /api/admin/user-aprovacao`
- `GET /api/admin/user-aprovacao/:id`
- `PATCH /api/admin/user-aprovacao/:id`
- `POST /api/admin/user-bipagem`
- `GET /api/admin/user-bipagem`
- `GET /api/admin/user-bipagem/:id`
- `PUT /api/admin/user-bipagem/:id`
- `DELETE /api/admin/user-bipagem/:id`
- `POST /api/admin/user-separacao`
- `GET /api/admin/user-separacao`
- `GET /api/admin/user-separacao/:id`
- `PUT /api/admin/user-separacao/:id`
- `DELETE /api/admin/user-separacao/:id`
- `POST /api/admin/brindes`
- `GET /api/admin/brindes`
- `GET /api/admin/brindes/:id`
- `PUT /api/admin/brindes/:id`
- `DELETE /api/admin/brindes/:id`
- `POST /api/user-solicitacao`
- `GET /api/user-solicitacao`
- `GET /api/user-solicitacao/:id`
- `PUT /api/user-solicitacao/:id`
- `DELETE /api/user-solicitacao/:id`

Escopo administrativo:

- `Admin Master` pode acessar todas as rotas acima, incluindo `user-admin`
- `Admin` pode gerenciar aprovadores, separadores, bipagem, catálogo, dashboard e `user-solicitacao`
- `Admin` não pode criar, editar ou remover registros em `user-admin`

### Dashboard

- `GET /api/admin/dashboard/summary`
- `GET /api/admin/dashboard/analytics`
- `GET /api/admin/dashboard/export-solicitacoes`
- `GET /api/admin/dashboard/recent-activity`

## Configuração do ambiente

### Pré-requisitos

- `Node.js` 20+ recomendado
- `npm`
- `PostgreSQL`

### Arquivos de ambiente

O projeto carrega:

- `.env` quando `NODE_ENV=development`
- `.env.production` para outros ambientes

### Variáveis obrigatórias

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=liberacao_brinde

PORT=3000
JWT_SECRET=troque_esta_chave

NOTIFICATION_API=https://sua-api-notificacao
NOTIFICATION_API_KEY=sua-chave

RABBITMQ_URL=
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASS=
```

Observações:

- `NOTIFICATION_API` e `NOTIFICATION_API_KEY` são obrigatórios no parse do ambiente, mesmo que o fluxo principal ainda não use notificações ativamente
- `RABBITMQ` e `Redis` estão previstos na configuração, mas não são parte crítica do fluxo principal atual

## Como configurar e rodar

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar o ambiente

Crie o arquivo `.env` na raiz do projeto com as variáveis necessárias.

### 3. Garantir que o banco exista

Crie a base PostgreSQL apontada em `DB_NAME` e configure o acesso em `DB_HOST`, `DB_PORT`, `DB_USER` e `DB_PASSWORD`.

### 4. Executar as migrations

```bash
npm run migration:run
```

### 5. Rodar em desenvolvimento

```bash
npm run dev
```

## Documentação complementar

- [Regras de negócio](docs/regras-negocio.md)
- [Mapeamento de banco](docs/banco-de-dados.md)
- [Inventário de endpoints](docs/endpoints.md)
- Swagger UI: `/api/docs`

O servidor sobe em:

```text
http://localhost:3000
```

ou na porta configurada em `PORT`.

### 6. Gerar build

```bash
npm run build
```

### 7. Executar em ambiente compilado

Hoje o `script` `start` do `package.json` aponta para `dist/index.ts`. Se for executar em produção por JavaScript compilado, o alvo correto gerado pelo `tsc` é `dist/index.js`.

## Scripts disponíveis

```bash
npm run dev
npm run build
npm run migration:run
npm run migration:revert
npm run migration:generate
```

## Segurança e autorização

- autenticação via cookie `token`
- criação de solicitação controlada por `user_criacao_solicitacao`
- aprovação controlada por `user_aprovacao`
- separação controlada por `user_separacao`
- retirada controlada por cargo/setor autorizado
- validações de payload e query centralizadas com `zod`

## Banco de dados

O `DataSource` principal está em [src/config/db.ts](/home/oendel/code/dass/liberacao_tenis_dass/src/config/db.ts:1).

Entidades operacionais principais:

- `SolicitacaoBrinde`
- `VoucherSolicitacao`
- `SolicitacaoHistorico`
- `BrindeAtivo`
- `UserAprovacao`
- `UserCriacaoSolicitacao`
- `UserSeparacao`

Mapeamento detalhado das tabelas:

- [docs/banco-de-dados.md](docs/banco-de-dados.md)

## Documentação adicional

- [docs/regras-negocio.md](docs/regras-negocio.md)
- [docs/banco-de-dados.md](docs/banco-de-dados.md)
- [docs/endpoints.md](docs/endpoints.md)

## Limitações e observações atuais

- `GET /api/retiradas` ainda é apenas um endpoint de preview
- não há suíte automatizada de testes no repositório
- o CORS está configurado estaticamente em [src/index.ts](/home/oendel/code/dass/liberacao_tenis_dass/src/index.ts:1)
- o fluxo usa catálogo de brindes, mas não controla saldo de estoque; o cadastro representa itens ativos disponíveis, não inventário quantitativo
