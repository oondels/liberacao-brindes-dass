type OpenAPISpec = Record<string, unknown>;

const jsonContent = (schema: Record<string, unknown>) => ({
  "application/json": {
    schema,
  },
});

export const openApiSpec: OpenAPISpec = {
  openapi: "3.0.3",
  info: {
    title: "Liberação de Brindes DASS API",
    version: "1.0.0",
    description:
      "Documentação operacional da API de solicitações, aprovação, separação, troca, retirada e gestão administrativa de brindes.",
  },
  servers: [{ url: "/api", description: "Base relativa da API" }],
  tags: [
    { name: "Health", description: "Verificação simples da aplicação" },
    { name: "Solicitações", description: "Fluxo principal de solicitações de brinde" },
    { name: "Retiradas", description: "Bipagem e troca operacional de vouchers" },
    { name: "Admin - Aprovação", description: "Gestão de usuários aprovadores" },
    { name: "Admin - Separação", description: "Gestão de usuários da fila de separação" },
    { name: "Admin - Bipagem", description: "Gestão de usuários autorizados para bipagem" },
    { name: "Admin - Brindes", description: "Catálogo de brindes ativos" },
    { name: "Admin - Usuário Solicitação", description: "Gestão de usuários criadores" },
    { name: "Dashboard", description: "Endpoints analíticos e de exportação" },
    { name: "Docs", description: "Especificação OpenAPI e Swagger UI" },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "token",
        description: "JWT enviado em cookie `token`.",
      },
    },
    schemas: {
      TipoRequisicao: {
        type: "string",
        enum: ["teste_calce", "brinde_interno", "pense_aja", "campanha", "falta_zero", "sandalia"],
      },
      SubgrupoCampanha: {
        type: "string",
        enum: ["brigada_incendio", "eficiencia", "hora_extra", "brinde_5s"],
        nullable: true,
      },
      GeneroSolicitacao: {
        type: "string",
        enum: ["masculino", "feminino"],
      },
      StatusSolicitacao: {
        type: "string",
        enum: [
          "pendente_aprovacao",
          "aguardando_separacao",
          "aguardando_troca",
          "aprovado",
          "rejeitado",
          "retirado",
          "cancelado",
        ],
      },
      SolicitacaoCreateRequest: {
        type: "object",
        required: ["nome", "matricula", "setor", "gerente", "tipo_requisicao", "genero", "num_calce"],
        properties: {
          nome: { type: "string" },
          matricula: { type: "string" },
          rfid: { type: "string", nullable: true },
          codbarras: { type: "string", nullable: true },
          setor: { type: "string" },
          gerente: { type: "string" },
          tipo_requisicao: { $ref: "#/components/schemas/TipoRequisicao" },
          subgrupo_campanha: { $ref: "#/components/schemas/SubgrupoCampanha" },
          brinde_id: { type: "string", format: "uuid", nullable: true },
          marca: { type: "string", nullable: true },
          modelo: { type: "string", nullable: true },
          genero: { $ref: "#/components/schemas/GeneroSolicitacao" },
          num_calce: { type: "string" },
        },
      },
      SolicitacaoUpdateBrindeRequest: {
        type: "object",
        properties: {
          brinde_id: { type: "string", format: "uuid", nullable: true },
          marca: { type: "string", nullable: true },
          modelo: { type: "string", nullable: true },
        },
      },
      CancelarSolicitacaoRequest: {
        type: "object",
        required: ["motivo"],
        properties: {
          motivo: { type: "string" },
        },
      },
      BiparVoucherRequest: {
        type: "object",
        required: ["codigo_voucher"],
        properties: {
          codigo_voucher: { type: "string" },
        },
      },
      UserAprovacaoRequest: {
        type: "object",
        required: ["nome", "matricula"],
        properties: {
          nome: { type: "string" },
          matricula: { type: "number" },
          rfid: { type: "number", nullable: true },
          codbarras: { type: "number", nullable: true },
          tipo_requisicao: {
            type: "array",
            items: { $ref: "#/components/schemas/TipoRequisicao" },
            nullable: true,
          },
          pode_aprovar_troca: { type: "boolean", default: false },
        },
      },
      UserTiposRequest: {
        type: "object",
        required: ["nome", "matricula"],
        properties: {
          nome: { type: "string" },
          matricula: { type: "number" },
          rfid: { type: "number", nullable: true },
          codbarras: { type: "number", nullable: true },
          tipo_requisicao: {
            type: "array",
            items: { $ref: "#/components/schemas/TipoRequisicao" },
          },
        },
      },
      BrindeAtivoRequest: {
        type: "object",
        required: ["nome", "tipo_requisicao"],
        properties: {
          nome: { type: "string" },
          tipo_requisicao: { $ref: "#/components/schemas/TipoRequisicao" },
          subgrupo_campanha: { $ref: "#/components/schemas/SubgrupoCampanha" },
          marca: { type: "string", nullable: true },
          modelo: { type: "string", nullable: true },
          genero: { $ref: "#/components/schemas/GeneroSolicitacao" },
          num_calce: { type: "number", nullable: true },
          ativo: { type: "boolean", default: true },
        },
      },
    },
  },
  paths: {
    "/docs": {
      get: { tags: ["Docs"], summary: "Abre a interface Swagger UI", responses: { "200": { description: "HTML da documentação Swagger" } } },
    },
    "/openapi.json": {
      get: { tags: ["Docs"], summary: "Retorna a especificação OpenAPI em JSON", responses: { "200": { description: "Especificação OpenAPI" } } },
    },
    "/solicitacoes": {
      post: {
        tags: ["Solicitações"],
        security: [{ cookieAuth: [] }],
        summary: "Cria uma nova solicitação",
        requestBody: { required: true, content: jsonContent({ $ref: "#/components/schemas/SolicitacaoCreateRequest" }) },
        responses: { "201": { description: "Solicitação criada" } },
      },
      get: {
        tags: ["Solicitações"],
        security: [{ cookieAuth: [] }],
        summary: "Lista solicitações com filtros",
        responses: { "200": { description: "Lista paginada de solicitações" } },
      },
    },
    "/solicitacoes/separacao": {
      get: {
        tags: ["Solicitações"],
        security: [{ cookieAuth: [] }],
        summary: "Lista a fila operacional de separação",
        responses: { "200": { description: "Fila de separação" } },
      },
    },
    "/solicitacoes/trocas": {
      get: {
        tags: ["Solicitações"],
        security: [{ cookieAuth: [] }],
        summary: "Lista a fila de solicitações aguardando troca",
        responses: { "200": { description: "Fila de troca" } },
      },
    },
    "/solicitacoes/{id}": {
      get: {
        tags: ["Solicitações"],
        security: [{ cookieAuth: [] }],
        summary: "Obtém o detalhe de uma solicitação",
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { "200": { description: "Detalhe da solicitação" } },
      },
    },
    "/solicitacoes/{id}/aprovar": {
      post: {
        tags: ["Solicitações"],
        security: [{ cookieAuth: [] }],
        summary: "Aprova uma solicitação",
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: { required: true, content: jsonContent({ $ref: "#/components/schemas/SolicitacaoUpdateBrindeRequest" }) },
        responses: { "200": { description: "Solicitação aprovada" } },
      },
    },
    "/solicitacoes/{id}/aprovar-troca": {
      post: {
        tags: ["Solicitações"],
        security: [{ cookieAuth: [] }],
        summary: "Aprova uma troca e reativa o voucher original",
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { "200": { description: "Troca aprovada" } },
      },
    },
    "/solicitacoes/{id}/separar": {
      post: {
        tags: ["Solicitações"],
        security: [{ cookieAuth: [] }],
        summary: "Confirma a separação e libera o voucher",
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: { required: true, content: jsonContent({ $ref: "#/components/schemas/SolicitacaoUpdateBrindeRequest" }) },
        responses: { "200": { description: "Separação confirmada" } },
      },
    },
    "/solicitacoes/{id}/rejeitar": {
      post: {
        tags: ["Solicitações"],
        security: [{ cookieAuth: [] }],
        summary: "Rejeita uma solicitação",
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { "200": { description: "Solicitação rejeitada" } },
      },
    },
    "/solicitacoes/{id}/cancelar": {
      post: {
        tags: ["Solicitações"],
        security: [{ cookieAuth: [] }],
        summary: "Cancela uma solicitação",
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: { required: true, content: jsonContent({ $ref: "#/components/schemas/CancelarSolicitacaoRequest" }) },
        responses: { "200": { description: "Solicitação cancelada" } },
      },
    },
    "/retiradas": {
      get: {
        tags: ["Retiradas"],
        security: [{ cookieAuth: [] }],
        summary: "Preview do módulo de retirada",
        responses: { "200": { description: "Preview simples" } },
      },
    },
    "/retiradas/bipar": {
      post: {
        tags: ["Retiradas"],
        security: [{ cookieAuth: [] }],
        summary: "Resgata um voucher pendente",
        requestBody: { required: true, content: jsonContent({ $ref: "#/components/schemas/BiparVoucherRequest" }) },
        responses: { "200": { description: "Voucher resgatado" } },
      },
    },
    "/retiradas/solicitar-troca": {
      post: {
        tags: ["Retiradas"],
        security: [{ cookieAuth: [] }],
        summary: "Inicia uma troca para voucher já resgatado",
        requestBody: { required: true, content: jsonContent({ $ref: "#/components/schemas/BiparVoucherRequest" }) },
        responses: { "200": { description: "Troca solicitada" } },
      },
    },
    "/admin/user-aprovacao": {
      post: {
        tags: ["Admin - Aprovação"],
        security: [{ cookieAuth: [] }],
        summary: "Cadastra usuário aprovador",
        requestBody: { required: true, content: jsonContent({ $ref: "#/components/schemas/UserAprovacaoRequest" }) },
        responses: { "201": { description: "Usuário aprovador criado" } },
      },
      get: {
        tags: ["Admin - Aprovação"],
        security: [{ cookieAuth: [] }],
        summary: "Lista usuários aprovadores",
        responses: { "200": { description: "Lista de aprovadores" } },
      },
    },
    "/admin/user-aprovacao/{id}": {
      get: {
        tags: ["Admin - Aprovação"],
        security: [{ cookieAuth: [] }],
        summary: "Obtém um usuário aprovador",
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { "200": { description: "Detalhe do aprovador" } },
      },
      patch: {
        tags: ["Admin - Aprovação"],
        security: [{ cookieAuth: [] }],
        summary: "Atualiza um usuário aprovador",
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: { required: true, content: jsonContent({ $ref: "#/components/schemas/UserAprovacaoRequest" }) },
        responses: { "200": { description: "Aprovador atualizado" } },
      },
    },
    "/admin/user-separacao": {
      get: { tags: ["Admin - Separação"], security: [{ cookieAuth: [] }], summary: "Lista usuários de separação", responses: { "200": { description: "Lista de usuários" } } },
      post: {
        tags: ["Admin - Separação"],
        security: [{ cookieAuth: [] }],
        summary: "Cadastra usuário de separação",
        requestBody: { required: true, content: jsonContent({ $ref: "#/components/schemas/UserTiposRequest" }) },
        responses: { "201": { description: "Usuário de separação criado" } },
      },
    },
    "/admin/user-separacao/{id}": {
      get: { tags: ["Admin - Separação"], security: [{ cookieAuth: [] }], summary: "Obtém usuário de separação", parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }], responses: { "200": { description: "Detalhe do usuário" } } },
      put: {
        tags: ["Admin - Separação"],
        security: [{ cookieAuth: [] }],
        summary: "Atualiza usuário de separação",
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: { required: true, content: jsonContent({ $ref: "#/components/schemas/UserTiposRequest" }) },
        responses: { "200": { description: "Usuário atualizado" } },
      },
      delete: { tags: ["Admin - Separação"], security: [{ cookieAuth: [] }], summary: "Remove usuário de separação", parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }], responses: { "200": { description: "Usuário removido" } } },
    },
    "/admin/user-bipagem": {
      get: { tags: ["Admin - Bipagem"], security: [{ cookieAuth: [] }], summary: "Lista usuários de bipagem", responses: { "200": { description: "Lista de usuários" } } },
      post: {
        tags: ["Admin - Bipagem"],
        security: [{ cookieAuth: [] }],
        summary: "Cadastra usuário de bipagem",
        requestBody: { required: true, content: jsonContent({ $ref: "#/components/schemas/UserTiposRequest" }) },
        responses: { "201": { description: "Usuário de bipagem criado" } },
      },
    },
    "/admin/user-bipagem/{id}": {
      get: { tags: ["Admin - Bipagem"], security: [{ cookieAuth: [] }], summary: "Obtém usuário de bipagem", parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }], responses: { "200": { description: "Detalhe do usuário" } } },
      put: {
        tags: ["Admin - Bipagem"],
        security: [{ cookieAuth: [] }],
        summary: "Atualiza usuário de bipagem",
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: { required: true, content: jsonContent({ $ref: "#/components/schemas/UserTiposRequest" }) },
        responses: { "200": { description: "Usuário atualizado" } },
      },
      delete: { tags: ["Admin - Bipagem"], security: [{ cookieAuth: [] }], summary: "Remove usuário de bipagem", parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }], responses: { "200": { description: "Usuário removido" } } },
    },
    "/admin/brindes": {
      get: { tags: ["Admin - Brindes"], security: [{ cookieAuth: [] }], summary: "Lista brindes ativos", responses: { "200": { description: "Lista do catálogo" } } },
      post: {
        tags: ["Admin - Brindes"],
        security: [{ cookieAuth: [] }],
        summary: "Cadastra item no catálogo de brindes ativos",
        requestBody: { required: true, content: jsonContent({ $ref: "#/components/schemas/BrindeAtivoRequest" }) },
        responses: { "201": { description: "Brinde criado" } },
      },
    },
    "/admin/brindes/{id}": {
      get: { tags: ["Admin - Brindes"], security: [{ cookieAuth: [] }], summary: "Obtém item do catálogo", parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }], responses: { "200": { description: "Detalhe do brinde" } } },
      put: {
        tags: ["Admin - Brindes"],
        security: [{ cookieAuth: [] }],
        summary: "Atualiza item do catálogo",
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: { required: true, content: jsonContent({ $ref: "#/components/schemas/BrindeAtivoRequest" }) },
        responses: { "200": { description: "Brinde atualizado" } },
      },
      delete: { tags: ["Admin - Brindes"], security: [{ cookieAuth: [] }], summary: "Remove item do catálogo", parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }], responses: { "200": { description: "Brinde removido" } } },
    },
    "/user-solicitacao": {
      get: { tags: ["Admin - Usuário Solicitação"], security: [{ cookieAuth: [] }], summary: "Lista usuários criadores", responses: { "200": { description: "Lista de usuários" } } },
      post: {
        tags: ["Admin - Usuário Solicitação"],
        security: [{ cookieAuth: [] }],
        summary: "Cadastra usuário criador de solicitações",
        requestBody: { required: true, content: jsonContent({ $ref: "#/components/schemas/UserTiposRequest" }) },
        responses: { "201": { description: "Usuário criado" } },
      },
    },
    "/user-solicitacao/{id}": {
      get: { tags: ["Admin - Usuário Solicitação"], security: [{ cookieAuth: [] }], summary: "Obtém usuário criador", parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }], responses: { "200": { description: "Detalhe do usuário" } } },
      put: {
        tags: ["Admin - Usuário Solicitação"],
        security: [{ cookieAuth: [] }],
        summary: "Atualiza usuário criador",
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: { required: true, content: jsonContent({ $ref: "#/components/schemas/UserTiposRequest" }) },
        responses: { "200": { description: "Usuário atualizado" } },
      },
      delete: { tags: ["Admin - Usuário Solicitação"], security: [{ cookieAuth: [] }], summary: "Remove usuário criador", parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }], responses: { "200": { description: "Usuário removido" } } },
    },
    "/admin/dashboard/summary": {
      get: { tags: ["Dashboard"], security: [{ cookieAuth: [] }], summary: "Resumo do dashboard", responses: { "200": { description: "Resumo consolidado" } } },
    },
    "/admin/dashboard/analytics": {
      get: { tags: ["Dashboard"], security: [{ cookieAuth: [] }], summary: "Indicadores analíticos do dashboard", responses: { "200": { description: "Analytics" } } },
    },
    "/admin/dashboard/export-solicitacoes": {
      get: { tags: ["Dashboard"], security: [{ cookieAuth: [] }], summary: "Exporta solicitações com filtros", responses: { "200": { description: "Exportação das solicitações" } } },
    },
    "/admin/dashboard/recent-activity": {
      get: { tags: ["Dashboard"], security: [{ cookieAuth: [] }], summary: "Retorna a atividade recente", responses: { "200": { description: "Atividade recente" } } },
    },
  },
};

export const renderSwaggerHtml = (): string => `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Liberação de Brindes DASS API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
    <style>
      body { margin: 0; background: #f4f1ea; }
      .topbar { display: none; }
      #swagger-ui { max-width: 1280px; margin: 0 auto; }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: "/api/openapi.json",
        dom_id: "#swagger-ui",
        deepLinking: true,
        persistAuthorization: true,
        displayRequestDuration: true,
      });
    </script>
  </body>
</html>`;
