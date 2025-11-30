# Análise: Remoção da Tabela historico_respostas_passo

## Status Atual
- **Registros na tabela**: 0 (vazia)
- **Referências no código**: 167 ocorrências em múltiplos arquivos
- **Substituída por**: `perguntas_reflexivas` (nova tabela com array JSONB)

## Arquivos que Referenciam historico_respostas_passo

### Actions e Components (CRÍTICO - Necessita atualização)
- `app/dashboard/passo/[numero]/actions.ts` (4 ocorrências)
- `app/dashboard/passo/[numero]/page.tsx` (1 ocorrência)
- `app/dashboard/passo/aguardando-aprovacao/page.tsx` (1 ocorrência)
- `components/avaliar-respostas-modal.tsx` (2 ocorrências)
- `components/validar-reflexao-modal.tsx` (1 ocorrência)

### Scripts SQL (Manter para histórico)
- Múltiplos scripts de migração e criação

### Documentação
- `ANALISE_FLUXO_SISTEMA.md` (7 ocorrências)

## Ações Necessárias Antes de Remover

### 1. Verificar se actions.ts ainda usa para reflexões antigas
\`\`\`typescript
// Verificar se estas funções ainda são usadas:
- app/dashboard/passo/[numero]/actions.ts:80
- app/dashboard/passo/[numero]/actions.ts:97
- app/dashboard/passo/[numero]/actions.ts:320
- app/dashboard/passo/[numero]/actions.ts:794
\`\`\`

### 2. Atualizar components
- `avaliar-respostas-modal.tsx` - Verificar se ainda recebe dados de historico_respostas_passo
- `validar-reflexao-modal.tsx` - Verificar dependência

### 3. Testar completamente antes de remover
- Envio de reflexões de vídeos/artigos
- Envio de perguntas reflexivas
- Aprovação no painel do discipulador
- Progresso de passo e pontuação

## Recomendação
**NÃO REMOVER AINDA** - A tabela está vazia mas o código ainda tem muitas referências. Precisamos:
1. Verificar cada referência
2. Remover/atualizar código obsoleto
3. Testar extensivamente
4. Só então dropar a tabela

## Script para Remoção Futura (NÃO EXECUTAR AGORA)
\`\`\`sql
-- ATENÇÃO: Só executar após limpar todas as referências no código
DROP TABLE IF EXISTS historico_respostas_passo CASCADE;
