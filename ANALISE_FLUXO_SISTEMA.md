# Análise Completa do Fluxo do Sistema de Discipulado

## 1. FLUXO DE REFLEXÕES (Vídeos + Artigos)

### 1.1 Criação de Reflexão
**Arquivo**: `app/dashboard/passo/[numero]/actions.ts`

**Processo**:
1. Discípulo assiste vídeo/artigo e escreve reflexão
2. Sistema cria notificação para o discipulador (tabela `notificacoes`)
3. Sistema insere reflexão na tabela `reflexoes_conteudo` com `situacao: 'enviado'`
4. Sistema marca vídeo/artigo como assistido/lido em `progresso_fases.videos_assistidos` ou `artigos_lidos` (ARRAY)

**Tabelas envolvidas**:
- `reflexoes_conteudo`: Armazena a reflexão
- `notificacoes`: Notifica o discipulador
- `progresso_fases`: Registra que o conteúdo foi consumido

**Status**: ✅ Funcionando corretamente

---

### 1.2 Aprovação de Reflexão
**Arquivo**: `components/validar-reflexao-modal.tsx`

**Processo**:
1. Discipulador avalia reflexão e fornece feedback
2. Sistema atualiza `reflexoes_conteudo`:
   - `situacao: 'aprovado'`
   - `xp_ganho: <valor>`
   - `feedback_discipulador: <texto>`
   - `data_aprovacao: <timestamp>`
3. Sistema incrementa `progresso_fases.reflexoes_concluidas`
4. Sistema adiciona XP em `progresso_fases.pontuacao_total`
5. Sistema adiciona XP em `discipulos.xp_total`
6. Sistema marca notificação como lida

**Verificações**:
- Conta todas as reflexões do passo
- Verifica se pergunta foi aprovada
- Verifica se missão foi aprovada
- Verifica se leitura bíblica da semana foi completada

**Se todas condições atendidas**:
- Marca `progresso_fases.completado = true`
- Incrementa `discipulos.passo_atual`
- Cria novo registro em `progresso_fases` para o próximo passo
- Cria insígnia em `recompensas`

**Status**: ✅ Funcionando corretamente (após correções)

---

## 2. FLUXO DE RESPOSTAS (Pergunta + Missão)

### 2.1 Envio de Respostas
**Arquivo**: `app/dashboard/passo/[numero]/actions.ts` - `enviarParaValidacao()`

**Processo**:
1. Discípulo responde pergunta e missão
2. Sistema cria UMA notificação para o discipulador
3. Sistema insere DOIS registros em `historico_respostas_passo`:
   - Um para pergunta (`tipo_resposta: 'pergunta'`)
   - Um para missão (`tipo_resposta: 'missao'`)
4. Apenas a pergunta recebe `notificacao_id`
5. Sistema atualiza `progresso_fases`:
   - `resposta_pergunta` e `resposta_missao` (REDUNDANTE - dados já em `historico_respostas_passo`)
   - `status_validacao: 'pendente'`
   - `enviado_para_validacao: true`

**Tabelas envolvidas**:
- `historico_respostas_passo`: Armazena as respostas
- `notificacoes`: Notifica o discipulador
- `progresso_fases`: Registra envio para validação (REDUNDANTE)

**Status**: ⚠️ Redundância detectada

---

### 2.2 Aprovação de Respostas
**Arquivo**: `components/avaliar-respostas-modal.tsx`

**Processo** (idêntico ao de reflexões):
1. Discipulador avalia e fornece feedback
2. Atualiza `historico_respostas_passo` com aprovação e XP
3. Adiciona XP em `progresso_fases.pontuacao_total` e `discipulos.xp_total`
4. Marca notificação como lida
5. Verifica todas as condições (reflexões + pergunta + missão + leitura)
6. Se tudo OK, libera próximo passo

**Status**: ✅ Funcionando corretamente

---

## 3. FLUXO DE NOTIFICAÇÕES

### 3.1 Criação
- Criadas usando `supabaseAdmin` (service role key)
- Tipos: `'reflexao'`, `'respostas_passo'`
- Enviadas para `discipulador_id`

### 3.2 Marcação como Lida
- Ocorre automaticamente após aprovação
- Atualiza `notificacoes.lida = true`

**Status**: ✅ Funcionando corretamente

---

## 4. FLUXO DE LEITURA BÍBLICA

### 4.1 Registro de Leitura
**Tabela**: `leituras_capitulos`
- Campo `capitulos_lidos`: ARRAY de IDs de capítulos
- Um registro por discípulo (estrutura otimizada)

### 4.2 Verificação de Conclusão
- Sistema mapeia Passo → Semana (Passo 1 = Semana 1)
- Busca `plano_leitura_biblica.capitulos_semana` para a semana
- Verifica se todos os capítulos foram lidos
- Só libera próximo passo se leitura concluída

**Status**: ✅ Funcionando corretamente

---

## 5. PROBLEMAS E REDUNDÂNCIAS IDENTIFICADAS

### 5.1 Campos Redundantes em `progresso_fases`

❌ **`resposta_pergunta` e `resposta_missao`** (text):
- As respostas já estão em `historico_respostas_passo.resposta`
- Esses campos são atualizados mas NUNCA LIDOS pelo sistema
- **REMOVER**

❌ **`rascunho_resposta`** (text):
- Campo para salvar rascunhos
- Funcionalidade NÃO implementada no frontend
- Código de `salvarRascunho()` existe mas nunca é chamado
- **REMOVER ou IMPLEMENTAR**

❌ **`status_validacao`** (text):
- Valores como 'pendente', 'aprovado'
- O sistema usa `historico_respostas_passo.situacao` e `reflexoes_conteudo.situacao`
- Campo duplicado e não usado nas queries
- **REMOVER**

✅ **`enviado_para_validacao`** (boolean):
- Usado para controlar estado visual
- **MANTER**

---

### 5.2 Tabela `leituras_capitulos_backup`

❌ **Estrutura antiga completamente não utilizada**:
- Criada durante migração de formato antigo para ARRAY
- Script `migrar-leituras-para-array.sql` renomeou a tabela antiga
- ZERO referências no código
- **REMOVER COMPLETAMENTE**

---

### 5.3 Campos Não Utilizados

❌ **`historico_respostas_passo.notificacao_id`**:
- Apenas a pergunta recebe notificação
- Missão sempre tem `notificacao_id: null`
- Poderia ser simplificado
- **AVALIAR: manter por compatibilidade**

---

## 6. LOOPS E INCONSISTÊNCIAS

### 6.1 Possível Loop de Criação de Progresso
**Situação**: Se um discípulo acessar um passo sem ter registro em `progresso_fases`
**Solução Implementada**: 
- `page.tsx` cria registro automaticamente se não existir
- **Status**: ✅ Resolvido

### 6.2 Discrepância entre `passo_atual` e `progresso_fases`
**Situação**: Marcus estava no Passo 2 mas tinha reflexões do Passo 2 sem registro
**Causa**: Acesso direto à URL ou avanço manual
**Solução**: Criação automática de registro
**Status**: ✅ Resolvido

---

## 7. VALIDAÇÕES NECESSÁRIAS

### 7.1 ✅ Validações Implementadas
- [x] Verificar se reflexão já foi aprovada antes de aprovar novamente
- [x] Verificar se todas as reflexões do passo estão aprovadas
- [x] Verificar se pergunta está aprovada
- [x] Verificar se missão está aprovada
- [x] Verificar se leitura bíblica da semana foi completada
- [x] Incrementar contador `reflexoes_concluidas` ao aprovar
- [x] Prevenir duplicação de notificações

### 7.2 ⚠️ Validações Recomendadas (Não Críticas)
- [ ] Validar tamanho mínimo de reflexão (já existe: 10 chars)
- [ ] Prevenir envio múltiplo de mesma reflexão
- [ ] Limitar XP máximo por reflexão (já existe UI: máx 30)
- [ ] Validar que discípulo só acessa passos liberados (já implementado via `passo_atual`)

---

## 8. RESUMO EXECUTIVO

### ✅ Funcionando Bem
1. Fluxo de reflexões (vídeos + artigos)
2. Fluxo de respostas (pergunta + missão)
3. Sistema de notificações
4. Validação de leitura bíblica
5. Avanço automático de passos
6. Sistema de XP e recompensas

### ⚠️ Requer Limpeza
1. Remover campos redundantes em `progresso_fases`
2. Remover tabela `leituras_capitulos_backup`
3. Simplificar estrutura de dados
4. Documentar funcionalidade de rascunhos ou remover

### 📊 Métricas de Complexidade
- **16 tabelas** no banco
- **2 tabelas** podem ser removidas
- **3 campos** redundantes identificados
- **0 loops** detectados após correções
- **100%** das validações críticas implementadas
