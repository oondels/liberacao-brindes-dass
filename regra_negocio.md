# Sistema de Liberação de Brindes (tênis, sandália, etc) — SPEC

O sistema consistem em uma aplicação para controlar cadastro e liberação de brindes (tênis, sandálias, etc) para colaboradores de uma empresa. 

- O sistema deve permitir o registro de retirada de brindes.
- O sistema deve funcionar a partir do cadastro de requisições de brinde
  - Nesta requisição sera informado:
    - O numero unico do colaborador (matricula[7 digitos] principal, futura-> rfid[10 digitos] ou codigo de barras[14 digitos])
      - a aprtir desse numero identificador unico do colaborador, sera buscado os dados do mesmo a partir de uma api já configurada que retorna: nome, gerente do colaborador, setor e cargo. Em outra api é retornada o tamanho do pe (se existir cadastro). 
- Além dos dados do colaborador sera informado os dados do brinde: 
  - marca (fila, nike, osklen), 
  - modelo (modelos existentes ou cadastro de modelo novo) 
  - tipo da requisição (teste calce, produção, sobra).
Apos a requisição ser feita por um usuario do tipo (atendente/modelagem/gerente), a requisiçao é aprovada por um gerente (usuario do tipo gerente) e apos ser aprovada é gerado um codigo unico da requisição, esse codigo sera utilizado para gerar um codigo de barras que sera utilizado na portaria para registrar a retirada e validação do brinde. Esse codigo é unico e nao pode nunca ser reutilizado.

## 1) Objetivo
Controlar a **liberação/retirada de brindes** para colaboradores, a partir do cadastro de **requisições de brinde**, registrando de forma rastreável:
- quem recebeu
- qual brinde (marca/modelo)
- qual finalidade (teste calce, produção, sobra)
- quando/por quem foi liberado
- tamanho do pé (vindo de API ou informado manualmente quando ausente)

## 2) Escopo
### Dentro do escopo (MVP)
- Criar **Requisição de Brinde** informando:
  - identificador único do colaborador: **matrícula (7 dígitos) OU RFID (10 dígitos) OU código de barras (14 dígitos)**
  - dados do brinde: **marca**, **modelo (existente ou novo)**, **tipo de requisição** (teste calce | produção | sobra)
  - tamanho do pé:
    - buscar em API de “tamanho do pé”
    - se não existir, permitir **informar manualmente**
- Buscar dados do colaborador via API já configurada:
  - **nome, gerente, setor, cargo**
- Registrar **Retirada** (liberação efetiva) vinculada à requisição
- Consultas básicas:
  - listar requisições (filtros por colaborador, status, período, tipo, marca/modelo)
  - ver detalhes (requisição + retirada + snapshot de dados do colaborador)

## 3) Usuários e papéis
- **Atendente/modelagem/gerente**: cria requisição
- **Portaria**: Registra retirada
- **Admin**: gerencia catálogos (marcas, modelos) e parametrizações
- **Gerente**: aprova requisição

## 4) Jornada principal (MVP)
1. Atendente/modelagem/gerente abre “Nova Requisição”.
2. Informa **um** identificador do colaborador (matrícula/rfid/código de barras).
3. Sistema chama API de colaborador e preenche: nome, gerente, setor, cargo.
4. Sistema chama API de tamanho do pé:
   - se retornar tamanho → preenche
   - se não retornar → exige preenchimento manual
5. Atendente/modelagem/gerente escolhe marca (fila/nike/osklen) e seleciona modelo existente **ou** cadastra modelo novo.
6. Atendente/modelagem/gerente escolhe tipo (teste calce/produção/sobra).
7. Salva a requisição (status: **pendente_aprovacao**).
8. No ato da entrega, portaria bipa o cod de barras gerado e confere, se ok registra a **Retirada** (data/hora, operador, observação opcional) → status: **RETIRADO**. Caso contrario recusa. Apos liberar a retirada, o código de barras da requisição deve ser marcado como “usado” e não pode ser reutilizado.

## 5) Regras de negócio
### Identificador do colaborador
- Deve ser **exatamente um** entre:
  - matrícula: **7 dígitos** Principal identificador, deve ser o preferencial para busca.
  - RFID: **10 dígitos** Futura possibilidade de busca, caso empresa adote RFID.
  - código de barras: **14 dígitos** Futura possibilidade de busca, caso empresa adote código de barras.
- O sistema deve validar tamanho/formato antes de chamar API.

### Dados do colaborador
- Devem ser buscados via API e armazenados como **snapshot** na requisição (para auditoria), mesmo que dados mudem no RH depois.

### Tamanho do pé
- Tentar obter via API de tamanho do pé.
- Se inexistente/sem cadastro → campo manual obrigatório.
- Regra de consistência (assumida): tamanho deve seguir tabela simples (ex.: 33–48 BR) ou enum configurável.

### Catálogo de marca/modelo
- Marca: valores iniciais fixos (fila, nike, osklen), com possibilidade futura de expandir.
- Modelo:
  - selecionar existente
  - ou cadastrar novo (nome + marca + status ativo)
- Evitar duplicidade: modelo novo deve ser normalizado (trim/casefold) e checado por (marca + nome).

### Tipos de requisição
- Apenas: **teste calce**, **produção**, **sobra**.

### Estados da requisição (assumido)
- **PENDENTE_APROVACAO**: aguardando aprovação do gerente.
- **APROVADO**: aprovado, aguardando retirada.
- **REJEITADO**: rejeitado pelo gerente.
- **RETIRADO**: retirada registrada pela portaria.
- **CANCELADO**: cancelado (opcional, para casos de erro).

## 6) Requisitos não-funcionais
- Auditoria: registrar quem criou/alterou e quem liberou (retirada).
- Observabilidade: logs de falhas nas integrações (sem expor dados sensíveis).
- Segurança: acesso restrito a usuários autenticados; trilha de auditoria imutável para retirada.
- Confiabilidade: falhas de API devem ser tratadas com mensagens claras e possibilidade de tentar novamente.

## 7) Critérios de sucesso (Definition of Done do MVP)
- Criar requisição com qualquer um dos 3 identificadores, puxando dados do colaborador.
- Puxar tamanho do pé quando existir; exigir manual quando não existir.
- Cadastrar modelo novo e reutilizá-lo em novas requisições.
- Registrar retirada e impedir “dupla retirada” da mesma requisição.
- Telas de listagem e detalhe com filtros básicos e export opcional (se ficar simples).


---

# Banco de dados para criação de models typeorm:
Lista Funcionarios(Lista principal para busca da api de colaborador, onde sera buscado os dados do colaborador a partir do numero identificador unico (matricula), e os dados retornados da api serao armazenados como snapshot para fins de auditoria):
```sql
CREATE TABLE colaborador.lista_funcionario (
	matricula int8 NULL,
	nome text NULL,
	setor_folha text NULL,
	nome_setor text NULL,
	gerente text NULL,
	funcao text NULL,
	data_att text NULL,
	hora_att text NULL
);
```

- Colaborador (Lista secundaria para busca da api de colaborador, onde sera buscado os dados do colaborador a partir do numero identificador unico (rfid ou codbarras), e os dados retornados da api serao armazenados como snapshot para fins de auditoria):
```sql
CREATE TABLE colaborador.colaboradores (
	id bigserial NOT NULL,
	rfid int8 NULL,
	matricula int8 NULL,
	nome varchar NULL,
	usuarioupdate varchar NULL,
	updatedate timestamp NULL,
	codbarras int8 NULL,
	unidade_dass varchar(50) DEFAULT 'SEST'::character varying NULL,
	CONSTRAINT colaboradores_matricula_key UNIQUE (matricula),
	CONSTRAINT colaboradores_pk_sest PRIMARY KEY (id)
);
```

- Usuario (Tabela para controle de acesso dos usuarios do sistema, onde sera informado o tipo do usuario (atendente/modelagem/gerente/portaria/admin) e os dados de login):
```sql
CREATE TABLE autenticacao.usuarios (
	id bigserial NOT NULL,
	createdat timestamptz DEFAULT now() NULL,
	updatedat timestamptz DEFAULT now() NULL,
	codigo_barras int8 NOT NULL,
	matricula int8 NOT NULL,
	nome varchar NULL,
	usuario varchar NULL,
	senha varchar NULL,
	funcao varchar NULL,
	setor varchar NULL,
	teste_calce int4 DEFAULT 0 NULL,
	pense_aja int4 DEFAULT 0 NULL,
	season int4 DEFAULT 0 NULL,
	ambulatorio int4 DEFAULT 0 NULL,
	limpeza int4 DEFAULT 0 NULL,
	telas int4 NULL,
	unidade varchar NULL,
	nivel varchar NULL,
	pe_confirmado int4 NULL,
	rfid int8 NULL,
	CONSTRAINT matricula_unique UNIQUE (matricula),
	CONSTRAINT user_uniques UNIQUE (matricula),
	CONSTRAINT usuarios_pk PRIMARY KEY (id, codigo_barras, matricula)
);
```

- Requisição de brinde:
```sql
CREATE TABLE brinde_entrega (
  id               uuid DEFAULT gen_random_uuid() NOT NULL,
  nome             VARCHAR(120) NOT NULL,
  usuario        VARCHAR(80)  NOT NULL,   
  marca            VARCHAR(40)  NOT NULL,
  modelo           VARCHAR(60)  NOT NULL,
  setor            VARCHAR(120) NOT NULL,
  gerente          VARCHAR(120) NOT NULL,
  entregue         CHAR(1) NOT NULL CHECK (entregue IN ('S','N')),
  codbarras        int8 NULL,      
  rfid             int8 NULL,      
  liberacao        DATE NOT NULL,            
  matricula        VARCHAR(20) NOT NULL,    
  num_calce        SMALLINT NOT NULL CHECK (num_calce BETWEEN 10 AND 60),
  gerente_approve  VARCHAR(120) NOT NULL,
  created_at TIMESTAMP NOT NULL        
  updated_at TIMESTAMP NOT NULL
  status enum ('PENDENTE_APROVACAO', 'APROVADO', 'REJEITADO', 'RETIRADO', 'CANCELADO') NOT NULL DEFAULT 'PENDENTE_APROVACAO',
  approved_by_user int8 null
  approved_at TIMESTAMP
  canceled_by_user int8 null
  canceled_at TIMESTAMP
  cancel_reason text null        
);
```