-- Criar nova tabela otimizada para perguntas reflexivas
-- 1 linha por discípulo por passo com array de respostas

CREATE TABLE IF NOT EXISTS perguntas_reflexivas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discipulo_id UUID NOT NULL REFERENCES discipulos(id) ON DELETE CASCADE,
    fase_numero INTEGER NOT NULL,
    passo_numero INTEGER NOT NULL,
    
    -- Array JSONB com as 3 respostas
    respostas JSONB NOT NULL DEFAULT '[]'::jsonb,
    -- Estrutura: [
    --   { "pergunta_id": 1, "pergunta": "texto da pergunta", "resposta": "texto da resposta" },
    --   { "pergunta_id": 2, "pergunta": "texto da pergunta", "resposta": "texto da resposta" },
    --   { "pergunta_id": 3, "pergunta": "texto da pergunta", "resposta": "texto da resposta" }
    -- ]
    
    -- Status único para as 3 perguntas
    situacao TEXT NOT NULL DEFAULT 'nao_iniciado' CHECK (situacao IN ('nao_iniciado', 'enviado', 'aprovado', 'reprovado')),
    
    -- Pontuação consolidada (30 XP quando aprovado)
    xp_ganho INTEGER DEFAULT 0,
    
    -- Feedback do discipulador
    feedback_discipulador TEXT,
    
    -- Relacionamentos
    discipulador_id UUID REFERENCES profiles(id),
    notificacao_id UUID REFERENCES notificacoes(id),
    
    -- Timestamps
    data_envio TIMESTAMP WITH TIME ZONE,
    data_aprovacao TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint: apenas 1 registro por discípulo por passo
    UNIQUE(discipulo_id, fase_numero, passo_numero)
);

-- Índices para performance
CREATE INDEX idx_perguntas_reflexivas_discipulo ON perguntas_reflexivas(discipulo_id);
CREATE INDEX idx_perguntas_reflexivas_situacao ON perguntas_reflexivas(situacao);
CREATE INDEX idx_perguntas_reflexivas_fase_passo ON perguntas_reflexivas(fase_numero, passo_numero);

-- Habilitar RLS
ALTER TABLE perguntas_reflexivas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Discípulos veem suas próprias perguntas reflexivas"
    ON perguntas_reflexivas FOR SELECT
    USING (
        discipulo_id IN (
            SELECT id FROM discipulos WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Discipuladores veem perguntas de seus discípulos"
    ON perguntas_reflexivas FOR SELECT
    USING (
        discipulador_id = auth.uid()
        OR discipulo_id IN (
            SELECT id FROM discipulos 
            WHERE discipulador_id = auth.uid()
        )
    );

CREATE POLICY "Discípulos podem inserir suas perguntas"
    ON perguntas_reflexivas FOR INSERT
    WITH CHECK (
        discipulo_id IN (
            SELECT id FROM discipulos WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Discípulos podem atualizar suas perguntas não aprovadas"
    ON perguntas_reflexivas FOR UPDATE
    USING (
        discipulo_id IN (
            SELECT id FROM discipulos WHERE user_id = auth.uid()
        )
        AND situacao != 'aprovado'
    );

CREATE POLICY "Discipuladores podem aprovar/reprovar"
    ON perguntas_reflexivas FOR UPDATE
    USING (
        discipulador_id = auth.uid()
        OR discipulo_id IN (
            SELECT id FROM discipulos WHERE discipulador_id = auth.uid()
        )
    );

COMMENT ON TABLE perguntas_reflexivas IS 'Armazena as 3 perguntas reflexivas de cada passo em um array JSONB, com 1 linha por discípulo por passo';
COMMENT ON COLUMN perguntas_reflexivas.respostas IS 'Array JSONB com as 3 perguntas e respostas: [{"pergunta_id": 1, "pergunta": "...", "resposta": "..."}]';
