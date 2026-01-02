export const PERGUNTAS_BATISMO = {
  11: [
    {
      id: "b11-q1",
      pergunta: 'O que significa a palavra "batismo" em sua origem grega?',
      tipo: "multipla_escolha" as const,
      opcoes: [
        "Aspergir ou borrifar água",
        "Imergir ou mergulhar completamente",
        "Purificar com óleo",
        "Abençoar com água benta",
      ],
      respostaCorreta: 1,
      explicacao:
        'A palavra "batismo" vem do grego "baptizo", que significa imergir ou mergulhar completamente na água.',
    },
    {
      id: "b11-q2",
      pergunta: "Segundo Mateus 28:19, o batismo é:",
      tipo: "multipla_escolha" as const,
      opcoes: [
        "Uma tradição opcional da igreja",
        "Uma ordenança direta de Jesus Cristo",
        "Um ritual inventado pelos apóstolos",
        "Uma sugestão para quem desejar",
      ],
      respostaCorreta: 1,
      explicacao:
        'Jesus ordenou claramente: "Ide e fazei discípulos, batizando-os…" (Mateus 28:19). O batismo é uma ordenança, não uma tradição opcional.',
    },
    {
      id: "b11-q3",
      pergunta: "O batismo cristão é:",
      tipo: "verdadeiro_falso" as const,
      resposta: true,
      afirmacao: "Um ato de obediência pública que declara nossa fé em Cristo e identificação com Ele",
      explicacao:
        "O batismo não é ritual mágico, mas uma declaração pública de que você morreu para o pecado e ressuscitou para uma nova vida em Cristo.",
    },
  ],
  12: [
    {
      id: "b12-q1",
      pergunta: "O que perdoa os pecados de uma pessoa?",
      tipo: "multipla_escolha" as const,
      opcoes: ["A água do batismo", "A cerimônia religiosa", "Somente o sangue de Jesus Cristo", "A fé mais o batismo"],
      respostaCorreta: 2,
      explicacao:
        "SOMENTE O SANGUE DE JESUS perdoa pecados (1 João 1:7, Efésios 1:7). A água do batismo não tem poder salvador.",
    },
    {
      id: "b12-q2",
      pergunta: "Segundo Efésios 2:8-9, a salvação é:",
      tipo: "multipla_escolha" as const,
      opcoes: [
        "Pela graça mediante a fé, não vem das obras",
        "Pela fé mais o batismo",
        "Pelas boas obras e rituais",
        "Por merecer através de obediência",
      ],
      respostaCorreta: 0,
      explicacao:
        'Efésios 2:8-9 é claro: "pela graça sois salvos, por meio da fé… NÃO VEM DAS OBRAS". O batismo é consequência da salvação, não causa.',
    },
    {
      id: "b12-q3",
      pergunta: "O ladrão na cruz foi salvo sem ser batizado.",
      tipo: "verdadeiro_falso" as const,
      resposta: true,
      afirmacao: "Jesus prometeu o paraíso ao ladrão na cruz (Lucas 23:43) sem que ele fosse batizado",
      explicacao:
        "Isso prova que a salvação é pela fé no sacrifício de Cristo, não pelo batismo. O batismo é testemunho público de uma salvação que já ocorreu.",
    },
  ],
  // Continue com as perguntas dos passos 13-22...
} as const

export function getPerguntasBatismo(passo: number) {
  return PERGUNTAS_BATISMO[passo as keyof typeof PERGUNTAS_BATISMO] || []
}
