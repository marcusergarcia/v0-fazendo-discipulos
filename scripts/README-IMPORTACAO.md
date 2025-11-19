# Importação da Bíblia ACF

Este guia explica como importar automaticamente todos os textos da Bíblia ACF (Almeida Corrigida Fiel) para o banco de dados Supabase.

## Pré-requisitos

1. **Python 3.7+** instalado
2. **Scripts SQL** já executados (tabelas criadas e capítulos gerados)

## Passo 1: Instalar Dependências

Abra o terminal e execute:

\`\`\`bash
pip install supabase requests
\`\`\`

Ou se você usa Python 3:

\`\`\`bash
pip3 install supabase requests
\`\`\`

## Passo 2: Configurar Variáveis de Ambiente

**Importante:** As variáveis de ambiente já estão configuradas no projeto v0, então você NÃO precisa configurá-las manualmente. O script irá usar automaticamente as variáveis disponíveis.

Se você estiver executando localmente fora do v0, configure:

### Windows (PowerShell):
\`\`\`powershell
$env:SUPABASE_URL="sua-url-do-supabase"
$env:SUPABASE_SERVICE_ROLE_KEY="sua-service-role-key"
\`\`\`

### Windows (CMD):
\`\`\`cmd
set SUPABASE_URL=sua-url-do-supabase
set SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
\`\`\`

### Mac/Linux:
\`\`\`bash
export SUPABASE_URL="sua-url-do-supabase"
export SUPABASE_SERVICE_ROLE_KEY="sua-service-role-key"
\`\`\`

## Passo 3: Executar o Script

\`\`\`bash
python scripts/importar-biblia-acf.py
\`\`\`

Ou:

\`\`\`bash
python3 scripts/importar-biblia-acf.py
\`\`\`

## O que o Script Faz

1. Busca todos os 66 livros da tabela `livros_biblia`
2. Para cada livro, busca todos os capítulos da API ABíbliaDigital
3. Concatena os versículos em texto completo
4. Salva o texto na tabela `capitulos_biblia`
5. Aguarda 0.5 segundos entre requisições para não sobrecarregar a API

## Tempo Estimado

- **Total de capítulos:** 1.189
- **Tempo por capítulo:** ~1 segundo (0.5s de espera + tempo de requisição)
- **Tempo total:** ~20-30 minutos

## Verificar Progresso

Durante a execução, você verá mensagens como:

\`\`\`
📖 [1/66] Importando Gênesis (50 capítulos)...
   Capítulo 1/50... ✅
   Capítulo 2/50... ✅
   ...
\`\`\`

## Verificar no Banco

Após a execução, você pode verificar no Supabase:

\`\`\`sql
-- Verificar total de capítulos preenchidos
SELECT COUNT(*) FROM capitulos_biblia WHERE texto IS NOT NULL;

-- Deve retornar 1189
\`\`\`

## Problemas Comuns

### Erro: No module named 'supabase'
**Solução:** Execute `pip install supabase requests`

### Erro: Variáveis de ambiente não configuradas
**Solução:** Se você está executando no v0, as variáveis já estão configuradas. Se está executando localmente, configure conforme Passo 2.

### API retorna erro 429 (muitas requisições)
**Solução:** Aumente o tempo de espera no script (altere `time.sleep(0.5)` para `time.sleep(1)`)

## Alternativa: Importação Manual

Se preferir não usar a API, você pode:
1. Baixar a Bíblia ACF em formato JSON
2. Modificar o script para ler do arquivo local ao invés da API
3. Executar a importação offline
