# Endpoints da API

Resumo objetivo das rotas disponíveis na aplicação.

## Base

- prefixo principal: `/api`
- autenticação: cookie `token`
- documentação Swagger UI: `GET /api/docs`
- especificação OpenAPI JSON: `GET /api/openapi.json`

## Solicitações

### `POST /api/solicitacoes`

Cria uma nova solicitação.

Campos de destaque:

- `tipo_requisicao`
- `subgrupo_campanha`
- `genero`
- `num_calce`
- `brinde_id`
- `marca`
- `modelo`

### `GET /api/solicitacoes`

Lista solicitações com filtros por:

- status
- gerente
- setor
- tipo
- matrícula
- RFID
- código de barras
- intervalo de datas
- página

Regras de acesso:

- disponível apenas para `Admin Master`, `Admin`, `Aprovador` e `Separador`
- `Admin Master` vê todos os tipos
- os demais perfis veem exclusivamente os `tipo_requisicao` do seu cadastro
- status `aguardando_troca` só aparece para aprovadores com `pode_aprovar_troca = true`

### `GET /api/solicitacoes/:id`

Retorna detalhe da solicitação com:

- dados da solicitação
- voucher
- histórico
- bloco de separação derivado

### `GET /api/solicitacoes/separacao`

Lista a fila operacional de separação para usuários autorizados.

### `GET /api/solicitacoes/trocas`

Lista a fila de solicitações em `aguardando_troca` para aprovadores com `pode_aprovar_troca = true`.

### `POST /api/solicitacoes/:id/aprovar`

Aprova a solicitação.

### `POST /api/solicitacoes/:id/aprovar-troca`

Reativa o voucher original e recoloca a solicitação no fluxo após aprovação da troca.

### `POST /api/solicitacoes/:id/rejeitar`

Rejeita a solicitação.

### `POST /api/solicitacoes/:id/separar`

Confirma a separação e consolida o brinde final.

### `POST /api/solicitacoes/:id/cancelar`

Cancela a solicitação.

## Retiradas

### `GET /api/retiradas`

Endpoint de preview.

### `POST /api/retiradas/bipar`

Realiza a retirada por `codigo_voucher`.

### `POST /api/retiradas/solicitar-troca`

Recebe um `codigo_voucher` já resgatado e move a solicitação para `aguardando_troca`.

## Administração

### Administradores

- `POST /api/admin/user-admin`
- `GET /api/admin/user-admin`
- `GET /api/admin/user-admin/:id`
- `PUT /api/admin/user-admin/:id`
- `DELETE /api/admin/user-admin/:id`

Observações:

- acesso exclusivo de `Admin Master`
- `Admin Master` é determinado por `setor = automacao` no JWT
- `Admin` comum é controlado por `user_admin`

### Aprovadores

- `POST /api/admin/user-aprovacao`
- `GET /api/admin/user-aprovacao`
- `GET /api/admin/user-aprovacao/:id`
- `PATCH /api/admin/user-aprovacao/:id`

Observações:

- suporta `pode_aprovar_troca`
- `tipo_requisicao` pode ser nulo para aprovadores globais de troca

### Operadores de separação

- `POST /api/admin/user-separacao`
- `GET /api/admin/user-separacao`
- `GET /api/admin/user-separacao/:id`
- `PUT /api/admin/user-separacao/:id`
- `DELETE /api/admin/user-separacao/:id`

### Operadores de bipagem

- `POST /api/admin/user-bipagem`
- `GET /api/admin/user-bipagem`
- `GET /api/admin/user-bipagem/:id`
- `PUT /api/admin/user-bipagem/:id`
- `DELETE /api/admin/user-bipagem/:id`

### Catálogo de brindes

- `POST /api/admin/brindes`
- `GET /api/admin/brindes`
- `GET /api/admin/brindes/:id`
- `PUT /api/admin/brindes/:id`
- `DELETE /api/admin/brindes/:id`

### Usuários autorizados a criar solicitação

- `POST /api/user-solicitacao`
- `GET /api/user-solicitacao`
- `GET /api/user-solicitacao/:id`
- `PUT /api/user-solicitacao/:id`
- `DELETE /api/user-solicitacao/:id`

Observações:

- acesso permitido para `Admin Master` e `Admin`

## Dashboard

- `GET /api/admin/dashboard/summary`
- `GET /api/admin/dashboard/analytics`
- `GET /api/admin/dashboard/export-solicitacoes`
- `GET /api/admin/dashboard/recent-activity`

Observações:

- acesso permitido para `Admin Master` e `Admin`
