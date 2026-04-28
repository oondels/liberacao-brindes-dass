# Liberação de Tênis / Brindes DASS

API backend em `Node.js + TypeScript + Express + TypeORM` para controle do fluxo de solicitação, aprovação, geração de voucher e retirada de brindes para colaboradores.

## Análise do projeto atual

O projeto já possui um fluxo principal implementado e coerente para operação:

- cadastro de solicitação de brinde
- controle de permissão para criar solicitação por tipo de requisição
- aprovação ou rejeição por usuários autorizados
- geração automática de voucher na aprovação
- baixa da retirada via código de voucher
- endpoints administrativos para gestão de usuários aprovadores e usuários autorizados a criar solicitações
- endpoints de dashboard para resumo, analytics, exportação e atividade recente

Arquiteturalmente, a base está organizada em camadas simples e objetivas:

- `routes`: definição das rotas HTTP
- `controllers`: adaptação HTTP -> serviço
- `services`: regras de negócio e acesso aos repositórios
- `models`: entidades TypeORM
- `middleware`: autenticação, autorização e validação
- `schemas`: contratos `zod`
- `migrations`: evolução do banco

## Fluxo implementado hoje

1. Usuário autenticado cria uma solicitação em `POST /api/solicitacoes`.
2. O middleware `createSolicitation` valida se a matrícula do usuário pode abrir aquele `tipo_requisicao`.
3. A solicitação nasce com status `pendente_aprovacao`.
4. Um aprovador autorizado aprova ou rejeita a solicitação.
5. Quando aprovada, a API gera um voucher único com `nanoid`.
6. A portaria ou automação bipa o voucher em `POST /api/retiradas/bipar`.
7. O voucher é marcado como `resgatado` e a solicitação passa para `retirado`.

## Regras de negócio observadas no código

- Tipos de requisição suportados:
  - `teste_calce`
  - `brinde_interno`
  - `pense_aja`
  - `campanha`
  - `falta_zero`
- Status da solicitação:
  - `pendente_aprovacao`
  - `aprovado`
  - `rejeitado`
  - `retirado`
  - `cancelado`
- Tipos `campanha` e `falta_zero` podem ser criados sem `marca` e `modelo`; esses campos passam a ser obrigatórios na aprovação.
- Para `campanha`, `subgrupo_campanha` é obrigatório.
- Aprovação só pode ocorrer se a solicitação estiver `pendente_aprovacao`.
- Rejeição só pode ocorrer se a solicitação estiver `pendente_aprovacao`.
- Cancelamento só pode ocorrer quando a solicitação está `pendente_aprovacao` ou `aprovado`.
- Ao cancelar uma solicitação aprovada, o voucher vinculado é cancelado e inativado.
- Retirada só pode ocorrer para voucher ativo e com status `pendente`.

## Perfis e autorizações

- Autenticação via JWT em cookie `token`.
- Criação de solicitação:
  - controlada pela tabela `liberacao_brinde.user_criacao_solicitacao`
  - permissão é validada por matrícula e por tipo de requisição
- Aprovação/rejeição:
  - exige middleware `isManager`
  - também exige cadastro na tabela `liberacao_brinde.user_aprovacao`
  - a permissão também é filtrada por tipo de requisição
- Retirada:
  - permitida para usuários de setor `automacao` ou `portaria`, ou com função contendo `portaria`

## Endpoints principais

### Solicitações

- `POST /api/solicitacoes`
- `GET /api/solicitacoes`
- `GET /api/solicitacoes/:id`
- `POST /api/solicitacoes/:id/aprovar`
- `POST /api/solicitacoes/:id/rejeitar`
- `POST /api/solicitacoes/:id/cancelar`

### Retiradas

- `GET /api/retiradas`
- `POST /api/retiradas/bipar`

### Administração

- `POST /api/admin/user-aprovacao`
- `GET /api/admin/user-aprovacao`
- `GET /api/admin/user-aprovacao/:id`
- `PATCH /api/admin/user-aprovacao/:id`
- `POST /api/user-solicitacao`
- `GET /api/user-solicitacao`
- `GET /api/user-solicitacao/:id`
- `PUT /api/user-solicitacao/:id`
- `DELETE /api/user-solicitacao/:id`

### Dashboard

- `GET /api/admin/dashboard/summary`
- `GET /api/admin/dashboard/analytics`
- `GET /api/admin/dashboard/export-solicitacoes`
- `GET /api/admin/dashboard/recent-activity`

## Banco e entidades

Entidades principais:

- `SolicitacaoBrinde`
- `VoucherSolicitacao`
- `UserAprovacao`
- `UserCriacaoSolicitacao`
- `User`
- `NotificationEmail`

Banco configurado com PostgreSQL e migrations TypeORM. O `DataSource` está em [src/config/db.ts](/home/oendel/code/dass/liberacao_tenis_dass/src/config/db.ts:1).

## Configuração de ambiente

Variáveis exigidas:

```env
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=
PORT=
JWT_SECRET=
NOTIFICATION_API=
NOTIFICATION_API_KEY=
RABBITMQ_URL=
REDIS_HOST=
REDIS_PORT=
REDIS_PASS=
```

Observações:

- `NOTIFICATION_API` e `NOTIFICATION_API_KEY` são obrigatórios no parse do ambiente.
- `RABBITMQ` e `Redis` aparecem na configuração, mas não participam do fluxo principal atual.

## Como rodar

```bash
npm install
npm run migration:run
npm run dev
```

Build:

```bash
npm run build
```

## Pontos fortes da base atual

- Separação de responsabilidades clara
- Uso de `zod` para validar payloads e query params
- Regras críticas de aprovação e retirada estão protegidas no backend
- Aprovação com transação para atualizar solicitação e criar voucher
- Dashboard já contempla indicadores úteis para operação

## Lacunas e riscos atuais

- `GET /api/retiradas` ainda retorna `501 not implemented`
- O campo `motivo` do cancelamento é validado na rota, mas não é persistido
- O script `start` em `package.json` aponta para `node dist/index.ts`; o build gera `dist/index.js`
- Existem serviços de notificação prontos, mas ainda não integrados ao fluxo de solicitação/aprovação/retirada
- O CORS está fixado para origens específicas em [src/index.ts](/home/oendel/code/dass/liberacao_tenis_dass/src/index.ts:1)
- Não há suíte de testes automatizados no projeto

## Estrutura resumida

```text
src/
  config/
  controllers/
  middleware/
  migrations/
  models/
  routes/
  schemas/
  services/
  types/
```

## Documento de processo

O fluxo operacional e as regras de negócio consolidadas estão em [REGRA_NEGOCIO.md](/home/oendel/code/dass/liberacao_tenis_dass/REGRA_NEGOCIO.md:1).
