# Changelog

Todas as alterações relevantes do projeto **Controle de Estoque** são documentadas aqui.

## [2026-07-11]

### Adicionado
- Conversão de unidades (UN/CX/PCT/FARDO) nas telas de Movimentações, Transferência e Pedidos: ao registrar entrada/saída, transferir estoque entre filiais ou montar um pedido, agora dá pra informar a quantidade em caixa/fardo/pacote — o sistema pede "quantas UN tem em 1 CX?" e converte automaticamente pra unidade real do produto, mostrando o total já convertido (ex: "3 CX (45 UN)"). Isso permite que uma filial conte em caixas e outra em unidades para o mesmo item, sem bagunçar o estoque.
- Botão de conversão de produto para UN (ícone ÷ na aba Produtos): converte um item de CX/PCT/FARDO para UN em todas as filiais de uma vez, recalculando estoque, mínimo, preço unitário e quantidade a pedir. O SKU não muda.
- Ordenação clicável nas colunas da tabela de Produtos (SKU, nome, setor, unidade, estoque, mínimo, preço).
- Botões de editar e apagar em cada movimentação, com ajuste automático do estoque (inclusive nos dois lados de uma transferência vinculada).
- Sugestão automática de SKU por setor ao cadastrar um produto novo.
- Aviso de SKUs duplicados na aba Produtos, quando o mesmo código está sendo usado por produtos diferentes.
- Modal "Novidades" no cabeçalho, listando as atualizações mais recentes direto no app.
- Ordenação clicável nas colunas da tabela de Pedidos (Produto, Setor, Estoque, Mínimo).
- Classificação "Matriz" / "Local" por item em Pedidos, com filtro na tela: só os itens marcados "Matriz" entram no pedido enviado pra Umuarama (PDF, texto copiado e .txt); itens "Local" ficam de fora, pra serem comprados por conta própria.
- Campo de origem da entrada (Comprado localmente / Veio da matriz) ao registrar uma entrada em Movimentações, exibido no histórico.
- Botão "PDF (Local)" em Pedidos, gerando um documento separado só com os itens marcados como compra local.
- Botão "Redefinir p/ Matriz" em Pedidos, pra voltar todos os itens de uma filial pra "Matriz" de uma vez, sem precisar clicar item por item.
- Autoria: toda movimentação (entrada/saída/transferência) e edição de produto passa a registrar quem fez, exibido no histórico de Movimentações.
- Cabeçalho mostra "Última atualização: quem e quando" a cada mudança salva no estoque.
- Sincronização quase em tempo real entre quem estiver com o app aberto ao mesmo tempo (via Supabase Realtime) — reduz bastante o risco de duas pessoas sobrescreverem uma a outra ao editar juntas, embora não elimine 100% (editar o mesmíssimo item nos mesmos segundos ainda pode gerar conflito).
- Botão "Backup" no cabeçalho: baixa um `.json` com todo o estoque (produtos + movimentações), como cópia de segurança fora do banco.
- Lixeira (aba Produtos): apagar um produto agora só o esconde e preserva seu histórico de movimentações, com opção de restaurar.

### Corrigido
- Validação de SKU que impedia salvar um produto com um SKU legitimamente reaproveitado em outra filial (ex: editar "Chá" em Palotina).
- Migração automática que realinha SKU, unidade e setor dos produtos de todas as filiais com o catálogo de Toledo (usado como fonte de verdade).
- PDF do pedido agora agrupa os itens por Setor (na ordem Tanato, Cozinha, Limpeza, Funerária), em vez de seguir a ordem interna dos produtos (que aparentava alfabética e ignorava qualquer organização por setor).

## [2026-07-03]

### Adicionado
- Aba "Transferência": mover estoque de um produto entre filiais, com histórico das transferências recentes.

### Corrigido
- Transferência que somava estoque no produto errado quando o SKU coincidia mas era um produto diferente (agora exige SKU **e** nome batendo para reaproveitar o produto de destino).

## [2026-07-02] — Primeira versão

### Adicionado
- Controle de estoque por filial (Toledo, Assis, Palotina, Cafelândia, Corbélia): painel, produtos, movimentações, pedidos e relatórios.
- Login restrito a dois usuários (Dhierry e Francielle) via Supabase Auth.
- Armazenamento compartilhado em nuvem via Supabase, com fallback para localStorage quando não configurado.
- Geração de PDF do pedido de compra por filial.
- Replicação do catálogo base de Toledo para as demais filiais.

### Corrigido
- Página em branco ao gerar PDF de pedidos, tanto em pedidos pequenos quanto em pedidos com mais de uma página.
- Aba Pedidos mostrando todas as filiais empilhadas ao mesmo tempo em vez de só a filial selecionada.
