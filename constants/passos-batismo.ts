// Fase Intermediária: Preparação para o Batismo
// 12 Passos sobre Batismo Cristão

export const PASSOS_BATISMO = {
  1: {
    numero: 1,
    titulo: "O que é Batismo segundo a Bíblia",
    objetivo: "Compreender o significado bíblico do batismo como ordenança de Jesus",
    versiculo: "Mateus 28:19",
    textoVersiculo:
      "Portanto, ide, fazei discípulos de todas as nações, batizando-os em nome do Pai, e do Filho, e do Espírito Santo",
    introducao:
      "O batismo não é apenas um ritual religioso, mas uma ordenança deixada por Jesus Cristo. Vamos entender seu verdadeiro significado bíblico.",
    topicos: [
      "Definição bíblica de batismo",
      "Batismo como ordenança de Cristo",
      "O batismo nas escrituras",
      "Simbolismo do batismo",
    ],
    videos: [
      {
        id: "video-b1-1",
        titulo: "O que é o Batismo? - Augustus Nicodemus",
        url: "https://www.youtube.com/watch?v=xrMBQqrGr6A",
        duracao: "15:30",
        canal: "Augustus Nicodemus",
      },
      {
        id: "video-b1-2",
        titulo: "Batismo: Significado e Importância",
        url: "https://www.youtube.com/watch?v=exemplo",
        duracao: "12:00",
        canal: "Voltemos ao Evangelho",
      },
      {
        id: "video-b1-3",
        titulo: "Por que Jesus foi batizado?",
        url: "https://www.youtube.com/watch?v=exemplo2",
        duracao: "10:45",
        canal: "Pr. Hernandes Dias Lopes",
      },
    ],
    artigos: [
      {
        id: "artigo-b1-1",
        titulo: "Batismo: O que a Bíblia ensina",
        fonte: "Monergismo",
        url: "https://monergismo.com",
      },
      {
        id: "artigo-b1-2",
        titulo: "A Ordenança do Batismo",
        fonte: "Bereianos",
        url: "https://bereianos.blogspot.com",
      },
      {
        id: "artigo-b1-3",
        titulo: "O Batismo de Jesus",
        fonte: "Voltemos ao Evangelho",
        url: "https://voltemosaoevangelho.com",
      },
    ],
    leituraSemanal: {
      semana: 1,
      tema: "Batismo nas Escrituras",
      referencias: [
        { livro: "Mateus", capitulo: 3, versiculos: "13-17" },
        { livro: "Mateus", capitulo: 28, versiculos: "18-20" },
        { livro: "Marcos", capitulo: 16, versiculos: "15-16" },
        { livro: "Atos", capitulo: 2, versiculos: "37-41" },
      ],
      descricao: "Leia sobre o batismo de Jesus e a Grande Comissão",
    },
    perguntaChave: "Por que Jesus ordenou o batismo?",
    missao: "Leia os textos sobre batismo e reflita sobre seu significado",
    recompensa: "Estudante do Batismo",
    icone: "📖",
    xp: 150,
    fase: "intermediaria",
  },
  // Continuar com os outros 11 passos...
  2: {
    numero: 2,
    titulo: "Batismo NÃO perdoa pecados",
    objetivo: "Entender que o batismo não tem poder salvífico - apenas Jesus salva",
    versiculo: "Efésios 2:8-9",
    textoVersiculo:
      "Porque pela graça sois salvos, mediante a fé; e isto não vem de vós; é dom de Deus; não de obras, para que ninguém se glorie",
    introducao:
      "É fundamental entender que o batismo não nos salva. A salvação é exclusivamente pela fé em Jesus Cristo.",
    topicos: ["Salvação somente pela fé", "Batismo não é obra meritória", "O ladrão na cruz", "Graça versus obras"],
    videos: [
      {
        id: "video-b2-1",
        titulo: "Batismo salva? - Augustus Nicodemus",
        url: "https://www.youtube.com/watch?v=exemplo",
        duracao: "18:20",
        canal: "Augustus Nicodemus",
      },
      {
        id: "video-b2-2",
        titulo: "Salvação pela Fé, não pelo Batismo",
        url: "https://www.youtube.com/watch?v=exemplo",
        duracao: "14:15",
        canal: "Voltemos ao Evangelho",
      },
      {
        id: "video-b2-3",
        titulo: "O Ladrão na Cruz",
        url: "https://www.youtube.com/watch?v=exemplo",
        duracao: "11:30",
        canal: "Pr. Hernandes Dias Lopes",
      },
    ],
    artigos: [
      {
        id: "artigo-b2-1",
        titulo: "O Batismo salva?",
        fonte: "Monergismo",
        url: "https://monergismo.com",
      },
      {
        id: "artigo-b2-2",
        titulo: "Salvação pela Fé Somente",
        fonte: "Bereianos",
        url: "https://bereianos.blogspot.com",
      },
      {
        id: "artigo-b2-3",
        titulo: "Graça Soberana",
        fonte: "Voltemos ao Evangelho",
        url: "https://voltemosaoevangelho.com",
      },
    ],
    leituraSemanal: {
      semana: 2,
      tema: "Salvação pela Fé",
      referencias: [
        { livro: "Romanos", capitulo: 3, versiculos: "23-28" },
        { livro: "Romanos", capitulo: 4, versiculos: "1-8" },
        { livro: "Efésios", capitulo: 2, versiculos: "1-10" },
        { livro: "Tito", capitulo: 3, versiculos: "4-7" },
      ],
      descricao: "Entenda a doutrina da salvação pela graça mediante a fé",
    },
    perguntaChave: "Como somos salvos segundo a Bíblia?",
    missao: "Explique com suas palavras por que o batismo não salva",
    recompensa: "Defensor da Graça",
    icone: "⚔️",
    xp: 150,
    fase: "intermediaria",
  },
  // Adicionar os passos 3-12...
}

export type PassoBatismoNumero = keyof typeof PASSOS_BATISMO

export const TOTAL_PASSOS_BATISMO = 12
