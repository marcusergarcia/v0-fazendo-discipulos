export interface AvatarParams {
  genero?: string | null
  idade?: number | null
  etnia?: string | null
}

export function generateAvatar({ genero, idade, etnia }: AvatarParams): string {
  // Normalizar valores
  const generoStr = genero?.toLowerCase() === 'feminino' ? 'female' : 
                    genero?.toLowerCase() === 'masculino' ? 'male' : 'neutral'
  
  const etniaStr = etnia?.toLowerCase() || 'diverse'
  
  // Determinar faixa etária
  let faixaEtaria = 'adult'
  if (idade) {
    if (idade < 18) faixaEtaria = 'teen'
    else if (idade < 30) faixaEtaria = 'young'
    else if (idade < 50) faixaEtaria = 'adult'
    else faixaEtaria = 'senior'
  }
  
  // Gerar avatar usando DiceBear API com estilo moderno e amigável
  const style = 'avataaars' // Estilo cartoon amigável
  const seed = `${generoStr}-${etniaStr}-${faixaEtaria}-${Date.now()}`
  
  const params = new URLSearchParams({
    seed,
    // Configurações baseadas em gênero
    ...(generoStr === 'female' && { top: 'longHair,curly,bun' }),
    ...(generoStr === 'male' && { top: 'shortHair,fade,caesar' }),
    // Configurações de cor de pele baseada em etnia
    ...(etniaStr === 'branca' && { skinColor: 'light' }),
    ...(etniaStr === 'preta' && { skinColor: 'brown,black' }),
    ...(etniaStr === 'parda' && { skinColor: 'brown,light' }),
    ...(etniaStr === 'amarela' && { skinColor: 'yellow,light' }),
    ...(etniaStr === 'indigena' && { skinColor: 'brown' }),
  })
  
  return `https://api.dicebear.com/7.x/${style}/svg?${params.toString()}`
}

export function calcularIdade(dataNascimento: string | Date | null): number | null {
  if (!dataNascimento) return null
  
  const hoje = new Date()
  const nascimento = new Date(dataNascimento)
  let idade = hoje.getFullYear() - nascimento.getFullYear()
  const mes = hoje.getMonth() - nascimento.getMonth()
  
  if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--
  }
  
  return idade
}
