export const RESUMOS_GERAIS_PASSOS = {
  1: {
    titulo: "A Criação e a Imagem de Deus",
    topicos: [
      {
        titulo: "Criados com Propósito",
        descricao:
          "Deus criou o universo de forma ordenada em sete dias, culminando com a humanidade como coroa de Sua criação, destinada a refletir Sua glória e exercer mordomia sobre a Terra.",
      },
      {
        titulo: "Portadores da Imagem Divina",
        descricao:
          "Fomos criados à imagem e semelhança de Deus (Imago Dei), possuindo racionalidade, moralidade, criatividade e espiritualidade que nos distinguem e nos conferem dignidade inestimável.",
      },
      {
        titulo: "Chamados ao Relacionamento",
        descricao:
          "Deus, que é relacional em Sua natureza trinitária, nos criou para comunhão íntima com Ele e com outros, pois relacionamentos genuínos nos transformam e nos aproximam do coração do Criador.",
      },
    ],
  },
  2: {
    titulo: "Resumo do Aprendizado",
    topicos: [
      {
        titulo: "O Amor Supremo de Deus",
        descricao:
          "João 3:16 revela o amor incomparável de Deus pela humanidade. Ele não apenas amou o mundo com palavras, mas demonstrou esse amor de forma tangível ao dar Seu Filho unigênito como sacrifício supremo pelos nossos pecados.",
      },
      {
        titulo: "O Dom Inestimável da Salvação",
        descricao:
          "A salvação não pode ser merecida por obras humanas, mas é oferecida gratuitamente a todos que creem. O sacrifício de Cristo é o ápice da história da redenção, oferecendo perdão, reconciliação e a promessa da vida eterna.",
      },
      {
        titulo: "A Universalidade do Amor Divino",
        descricao:
          "O amor de Deus transcende todas as barreiras geográficas, étnicas e sociais, estendendo-se a toda a humanidade sem discriminação. A oferta de salvação é verdadeiramente universal e inclusiva, não limitada por fronteiras.",
      },
    ],
  },
  3: {
    titulo: "Resumo do Aprendizado",
    topicos: [
      {
        titulo: "O que é o Pecado para Deus?",
        descricao:
          "O pecado é qualquer transgressão da lei de Deus, uma rebelião contra Sua vontade perfeita. Ele se manifesta em pensamentos, palavras e ações que se opõem ao caráter santo de Deus, causando separação entre o homem e seu Criador.",
      },
      {
        titulo: "A Queda do Homem e o Pecado Original",
        descricao:
          "A queda de Adão e Eva no Jardim do Éden trouxe o pecado original para toda a humanidade. Desde então, todos nascemos com uma natureza pecaminosa, separados de Deus e inclinados ao mal. Esta condição é universal e afeta cada ser humano.",
      },
      {
        titulo: "As Consequências do Pecado",
        descricao:
          "O pecado traz consequências devastadoras: morte física e espiritual, separação de Deus, culpa, vergonha e o julgamento divino. Mas Deus, em Seu amor, providenciou a solução através do sacrifício de Jesus Cristo, oferecendo perdão e restauração para todos que se arrependem e creem.",
      },
    ],
  },
  4: {
    titulo: "Consequências do Pecado",
    topicos: [
      {
        titulo: "Culpa: O Peso da Condenação",
        descricao:
          "O pecado gera culpa tanto pela herança do pecado original de Adão quanto por nossas transgressões pessoais. Todos nascemos sob condenação, mas através do sacrifício de Cristo, Sua justiça é creditada a nós, removendo completamente a culpa e garantindo que não há 'nenhuma condenação' para os que estão em Cristo.",
      },
      {
        titulo: "Morte Espiritual: Separados da Fonte da Vida",
        descricao:
          "A morte espiritual é a separação de Deus, a consequência direta do pecado. Cada pessoa nasce espiritualmente morta, insensível à voz de Deus e inclinada ao mal. Antes da conversão, vivemos sob a influência do pecado, do mundo e do diabo, incapazes de responder a Deus sem Sua intervenção.",
      },
      {
        titulo: "Inimizade: A Guerra contra o Criador",
        descricao:
          "O pecado nos torna inimigos de Deus, criando uma barreira de hostilidade entre o Criador e a criatura. Não existe neutralidade: ou somos inimigos de Deus, ou inimigos do pecado. Jesus veio destruir esta barreira através da cruz, oferecendo reconciliação e paz com Deus a todos que creem.",
      },
      {
        titulo: "Escravidão: Aprisionados pelo Pecado",
        descricao:
          "O pecado não apenas nos separa de Deus, mas nos escraviza, criando uma prisão interior da qual não podemos escapar sozinhos. Jesus declarou que 'todo o que comete pecado é escravo do pecado'. Somente através da cruz de Cristo e do poder do Espírito Santo podemos ser libertados desta escravidão e viver na liberdade dos filhos de Deus.",
      },
    ],
  },
} as const

export type ResumoGeralPasso = {
  titulo: string
  topicos: Array<{
    titulo: string
    descricao: string
  }>
}
