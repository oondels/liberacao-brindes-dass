# Endpoints da API

Resumo objetivo das rotas disponíveis na aplicação.

## Base

- prefixo principal: `/`
- autenticação: cookie `token`
- documentação Swagger UI: `GET /docs`
- especificação OpenAPI JSON: `GET /openapi.json`

## Solicitações

### `POST /solicitacoes`

Cria uma nova solicitação.

Campos de destaque:

- `tipo_requisicao`
- `subgrupo_campanha`
- `genero`
- `num_calce`
- `brinde_id`
- `marca`
- `modelo`

### `GET /solicitacoes`

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

### `GET /solicitacoes/:id`

Retorna detalhe da solicitação com:

- dados da solicitação
- voucher
- histórico
- bloco de separação derivado

### `GET /solicitacoes/separacao`

Lista a fila operacional de separação para usuários autorizados.

### `GET /solicitacoes/trocas`

Lista a fila de solicitações em `aguardando_troca` para aprovadores com `pode_aprovar_troca = true`.

### `POST /solicitacoes/:id/aprovar`

Aprova a solicitação.

### `POST /solicitacoes/:id/aprovar-troca`

Reativa o voucher original e recoloca a solicitação no fluxo após aprovação da troca.

### `POST /solicitacoes/:id/rejeitar`

Rejeita a solicitação.

### `POST /solicitacoes/:id/separar`

Confirma a separação e consolida o brinde final.

### `POST /solicitacoes/:id/cancelar`

Cancela a solicitação.

## Retiradas

### `GET /retiradas`

Endpoint de preview.

### `GET /retiradas/voucher/:codigo`

Consulta os dados do voucher e da solicitação sem alterar o status.

Retorna:

- dados do voucher
- dados do colaborador
- dados do brinde
- datas de solicitação e aprovação
- aprovador
- status atuais do voucher e da solicitação

### `POST /retiradas/bipar`

Realiza a retirada por `codigo_voucher`.

### `POST /retiradas/solicitar-troca`

Recebe um `codigo_voucher` já resgatado e move a solicitação para `aguardando_troca`.

## Administração

### Administradores

- `POST /admin/user-admin`
- `GET /admin/user-admin`
- `GET /admin/user-admin/:id`
- `PUT /admin/user-admin/:id`
- `DELETE /admin/user-admin/:id`

Observações:

- acesso exclusivo de `Admin Master`
- `Admin Master` é determinado por `setor = automacao` no JWT
- `Admin` comum é controlado por `user_admin`

### Aprovadores

- `POST /admin/user-aprovacao`
- `GET /admin/user-aprovacao`
- `GET /admin/user-aprovacao/:id`
- `PATCH /admin/user-aprovacao/:id`

Observações:

- suporta `pode_aprovar_troca`
- `tipo_requisicao` pode ser nulo para aprovadores globais de troca

### Operadores de separação

- `POST /admin/user-separacao`
- `GET /admin/user-separacao`
- `GET /admin/user-separacao/:id`
- `PUT /admin/user-separacao/:id`
- `DELETE /admin/user-separacao/:id`

### Operadores de bipagem

- `POST /admin/user-bipagem`
- `GET /admin/user-bipagem`
- `GET /admin/user-bipagem/:id`
- `PUT /admin/user-bipagem/:id`
- `DELETE /admin/user-bipagem/:id`

### Catálogo de brindes

- `POST /admin/brindes`
- `GET /admin/brindes`
- `GET /admin/brindes/:id`
- `PUT /admin/brindes/:id`
- `DELETE /admin/brindes/:id`

### Usuários autorizados a criar solicitação

- `POST /user-solicitacao`
- `GET /user-solicitacao`
- `GET /user-solicitacao/:id`
- `PUT /user-solicitacao/:id`
- `DELETE /user-solicitacao/:id`

Observações:

- acesso permitido para `Admin Master` e `Admin`

## Dashboard

- `GET /admin/dashboard/summary`
- `GET /admin/dashboard/analytics`
- `GET /admin/dashboard/export-solicitacoes`
- `GET /admin/dashboard/recent-activity`

Observações:

- acesso permitido para `Admin Master` e `Admin`
