# Endpoints da API

Resumo objetivo das rotas disponíveis na aplicação.

## Base

- prefixo principal: `/api`
- autenticação: cookie `token`

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

### `GET /api/solicitacoes/:id`

Retorna detalhe da solicitação com:

- dados da solicitação
- voucher
- histórico
- bloco de separação derivado

### `GET /api/solicitacoes/separacao`

Lista a fila operacional de separação para usuários autorizados.

### `POST /api/solicitacoes/:id/aprovar`

Aprova a solicitação.

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

## Administração

### Aprovadores

- `POST /api/admin/user-aprovacao`
- `GET /api/admin/user-aprovacao`
- `GET /api/admin/user-aprovacao/:id`
- `PATCH /api/admin/user-aprovacao/:id`

### Operadores de separação

- `POST /api/admin/user-separacao`
- `GET /api/admin/user-separacao`
- `GET /api/admin/user-separacao/:id`
- `PUT /api/admin/user-separacao/:id`
- `DELETE /api/admin/user-separacao/:id`

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

## Dashboard

- `GET /api/admin/dashboard/summary`
- `GET /api/admin/dashboard/analytics`
- `GET /api/admin/dashboard/export-solicitacoes`
- `GET /api/admin/dashboard/recent-activity`
