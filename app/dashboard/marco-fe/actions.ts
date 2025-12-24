"use server"

import { createClient } from "@/lib/supabase/server"

export async function assinarConfissaoFe({
  discipuloId,
  assinatura,
  ehBatizado,
}: {
  discipuloId: string
  assinatura: string
  ehBatizado: boolean
}) {
  try {
    const supabase = await createClient()

    // Atualizar registro do discípulo
    const { error: updateError } = await supabase
      .from("discipulos")
      .update({
        confissao_fe_assinada: true,
        data_confissao_fe: new Date().toISOString(),
        assinatura_digital: assinatura,
        eh_batizado: ehBatizado,
        data_resposta_batismo: new Date().toISOString(),
        compromisso_discipulador: true,
        data_compromisso_discipulador: new Date().toISOString(),
        // Se não é batizado, manter na fase 1 para fazer fase intermediária
        // Se é batizado, avançar para fase 2
        fase_atual: ehBatizado ? 2 : 1,
        passo_atual: ehBatizado ? 1 : 1,
      })
      .eq("id", discipuloId)

    if (updateError) {
      console.error("Erro ao atualizar discípulo:", updateError)
      return { error: "Erro ao processar confissão de fé" }
    }

    // Criar notificação para o discipulador
    const { data: discipulo } = await supabase
      .from("discipulos")
      .select("discipulador_id")
      .eq("id", discipuloId)
      .single()

    if (discipulo?.discipulador_id) {
      await supabase.from("notificacoes").insert({
        user_id: discipulo.discipulador_id,
        discipulo_id: discipuloId,
        tipo: "marco_fe",
        titulo: "Marco de Fé Assinado!",
        mensagem: `Seu discípulo assinou a Confissão de Fé e se comprometeu com o discipulado${!ehBatizado ? ". Ele iniciará a fase sobre batismo." : "!"}`,
        link: `/discipulador/discipulos/${discipuloId}`,
      })
    }

    let mensagem = "Confissão de fé assinada com sucesso!"
    if (!ehBatizado) {
      mensagem += " Você será direcionado para estudar sobre batismo."
    } else {
      mensagem += " Você está pronto para a Fase 2!"
    }

    return { success: true, mensagem }
  } catch (error) {
    console.error("Erro ao assinar confissão:", error)
    return { error: "Erro inesperado ao processar confissão de fé" }
  }
}
