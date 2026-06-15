# Progresso

## Tentativas Anteriores
1. Investigação da falta de feedback na separação unitária e lote.
2. Correção de sobreposição de rotas Express (`/lote/separar` vs `/:id/separar`).

## Ações Realizadas
1. Identificado e corrigido o problema de manipulação de referência do componente `<alert>` (`notificacao.value`) nos métodos `salvarSeparacao()` e `handleSeparacaoLote()` dentro de `ListagemSolicitacoes.vue`. A sobrescrita direta impedia o Vue de disparar o método `mostrarAlerta`.
2. O retorno da função `separarEmLote()` em `solicitacaoService.js` foi corrigido para acessar apenas `response.data`, evitando que a resposta voltasse como `undefined`.
3. A correção do frontend permitiu que a UI volte a exibir as validações retornadas pelo backend, solucionando a percepção de erro silencioso para o usuário.
4. Identificado e corrigido um bug de roteamento no backend, onde a rota genérica `/:id/separar` estava interceptando a rota específica `/lote/separar`.
5. Adicionado tratamento no frontend para garantir que a variável `isBatchSeparacao` seja limpa corretamente ao abrir o modal de separação unitária, evitando o disparo acidental do envio em lote vazio.

## Próximos Passos
1. Análise sobre visualização de status para usuário com permissão de separação realizada com sucesso. Aguardando novos pedidos do usuário.
