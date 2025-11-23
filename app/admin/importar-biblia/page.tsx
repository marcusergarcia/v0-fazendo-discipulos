"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { atualizarCapitulo, buscarCapitulosVazios, diagnosticarCapitulos, buscarCapitulosPreenchidos } from "./actions"

// Mapeamento de abreviações para IDs dos livros
const livrosMap: Record<string, number> = {
  gn: 1,
  ex: 2,
  lv: 3,
  nm: 4,
  dt: 5,
  js: 6,
  jz: 7,
  rt: 8,
  "1sm": 9,
  "2sm": 10,
  "1rs": 11,
  "2rs": 12,
  "1cr": 13,
  "2cr": 14,
  ed: 15,
  ne: 16,
  et: 17,
  job: 18,
  sl: 19,
  pv: 20,
  ec: 21,
  ct: 22,
  is: 23,
  jr: 24,
  lm: 25,
  ez: 26,
  dn: 27,
  os: 28,
  jl: 29,
  am: 30,
  ob: 31,
  jn: 32,
  mq: 33,
  na: 34,
  hc: 35,
  sf: 36,
  ag: 37,
  zc: 38,
  ml: 39,
  mt: 40,
  mc: 41,
  lc: 42,
  jo: 43,
  at: 44,
  rm: 45,
  "1co": 46,
  "2co": 47,
  gl: 48,
  ef: 49,
  fp: 50,
  cl: 51,
  "1ts": 52,
  "2ts": 53,
  "1tm": 54,
  "2tm": 55,
  tt: 56,
  fm: 57,
  hb: 58,
  tg: 59,
  "1pe": 60,
  "2pe": 61,
  "1jo": 62,
  "2jo": 63,
  "3jo": 64,
  jd: 65,
  ap: 66,
}

// Mapeamento de abreviações do banco para abreviações da API
const abreviacaoAPIMap: Record<string, string> = {
  at: "acts", // Atos no banco é "at", na API é "acts"
  // Adicione outros se necessário
}

async function baixarBibliaJSON(): Promise<any> {
  const url = "https://raw.githubusercontent.com/thiagobodruk/biblia/master/json/acf.json"
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Erro ao baixar Bíblia: ${response.status}`)
  }
  return response.json()
}

export default function ImportarBibliaPage() {
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [total, setTotal] = useState(0)
  const [current, setCurrent] = useState("")
  const [log, setLog] = useState<string[]>([])
  const [diagnostic, setDiagnostic] = useState<{
    totalCapitulos: number
    capitulosVazios: number
    capitulosPreenchidos: number
  } | null>(null)

  const addLog = (message: string) => {
    setLog((prev) => [...prev, message])
  }

  const diagnosticar = async () => {
    const diagnostic = await diagnosticarCapitulos()
    setDiagnostic(diagnostic)
  }

  const importarBiblia = async () => {
    setImporting(true)
    setProgress(0)
    setLog([])

    try {
      addLog("📥 Baixando Bíblia ACF completa do GitHub...")

      const bibliaJSON = await baixarBibliaJSON()
      addLog(`✅ Bíblia baixada: ${bibliaJSON.length} livros`)

      addLog("🔍 Buscando capítulos vazios no banco de dados...")

      const capitulos = await buscarCapitulosVazios()

      setTotal(capitulos.length)
      addLog(`✅ Encontrados ${capitulos.length} capítulos vazios`)

      if (capitulos.length === 0) {
        addLog("ℹ️ Não há capítulos vazios para importar.")
        addLog("ℹ️ Verifique se o script SQL 03-gerar-capitulos-vazios.sql foi executado.")
        setImporting(false)
        return
      }

      let sucessos = 0
      let falhas = 0

      for (let i = 0; i < capitulos.length; i++) {
        const cap = capitulos[i]
        const livro = cap.livros_biblia as any
        const abreviacao = livro.abreviacao?.toLowerCase()
        const nome = livro.nome

        setCurrent(`${nome} ${cap.numero_capitulo}`)
        addLog(`📖 Importando ${nome} capítulo ${cap.numero_capitulo}...`)

        const abreviacaoAPI = abreviacaoAPIMap[abreviacao] || abreviacao

        const livroJSON = bibliaJSON.find((l: any) => l.abbrev?.toLowerCase() === abreviacaoAPI)

        if (!livroJSON) {
          addLog(`⚠️ Livro ${nome} (${abreviacao} / ${abreviacaoAPI}) não encontrado no JSON`)
          falhas++
          setProgress(Math.round(((i + 1) / capitulos.length) * 100))
          continue
        }

        const capituloIndex = cap.numero_capitulo - 1

        if (!livroJSON.chapters || !livroJSON.chapters[capituloIndex]) {
          addLog(`⚠️ Capítulo ${cap.numero_capitulo} não encontrado em ${nome}`)
          falhas++
          setProgress(Math.round(((i + 1) / capitulos.length) * 100))
          continue
        }

        const versiculos = livroJSON.chapters[capituloIndex]
        const textoComVersiculos = versiculos
          .map((versiculo: string, index: number) => `**${index + 1}** ${versiculo}`)
          .join(" ")

        if (textoComVersiculos && textoComVersiculos.trim().length > 0) {
          const { data: updateData, error: updateError } = await atualizarCapitulo(cap.id, textoComVersiculos)

          if (updateError) {
            addLog(`❌ Erro ao salvar ${nome} ${cap.numero_capitulo}: ${updateError.message}`)
            falhas++
          } else {
            if (updateData && updateData.length > 0) {
              sucessos++
            } else {
              addLog(`⚠️ Update não retornou dados para ${nome} ${cap.numero_capitulo}`)
              falhas++
            }
          }
        } else {
          addLog(`⚠️ Texto vazio para ${nome} ${cap.numero_capitulo}`)
          falhas++
        }

        setProgress(Math.round(((i + 1) / capitulos.length) * 100))

        if (i % 50 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 100))
        }
      }

      addLog("🎉 Importação concluída!")
      addLog(`✅ Sucessos: ${sucessos}`)
      addLog(`❌ Falhas: ${falhas}`)
    } catch (error) {
      addLog(`❌ Erro geral: ${error}`)
      console.error("Erro geral:", error)
    } finally {
      setImporting(false)
      setCurrent("")
    }
  }

  const atualizarNumerosVersiculos = async () => {
    setImporting(true)
    setProgress(0)
    setLog([])

    try {
      addLog("📥 Baixando Bíblia ACF completa do GitHub...")

      const bibliaJSON = await baixarBibliaJSON()
      addLog(`✅ Bíblia baixada: ${bibliaJSON.length} livros`)

      addLog("🔍 Buscando capítulos preenchidos no banco de dados...")

      const capitulos = await buscarCapitulosPreenchidos()

      setTotal(capitulos.length)
      addLog(`✅ Encontrados ${capitulos.length} capítulos preenchidos sem números`)

      if (capitulos.length === 0) {
        addLog("ℹ️ Todos os capítulos já têm números de versículos.")
        setImporting(false)
        return
      }

      let sucessos = 0
      let falhas = 0

      for (let i = 0; i < capitulos.length; i++) {
        const cap = capitulos[i]
        const livro = cap.livros_biblia as any
        const abreviacao = livro.abreviacao?.toLowerCase()
        const nome = livro.nome

        setCurrent(`${nome} ${cap.numero_capitulo}`)

        const abreviacaoAPI = abreviacaoAPIMap[abreviacao] || abreviacao
        const livroJSON = bibliaJSON.find((l: any) => l.abbrev?.toLowerCase() === abreviacaoAPI)

        if (!livroJSON) {
          addLog(`⚠️ Livro ${nome} (${abreviacao}) não encontrado no JSON`)
          falhas++
          setProgress(Math.round(((i + 1) / capitulos.length) * 100))
          continue
        }

        const capituloIndex = cap.numero_capitulo - 1

        if (!livroJSON.chapters || !livroJSON.chapters[capituloIndex]) {
          addLog(`⚠️ Capítulo ${cap.numero_capitulo} não encontrado em ${nome}`)
          falhas++
          setProgress(Math.round(((i + 1) / capitulos.length) * 100))
          continue
        }

        const versiculos = livroJSON.chapters[capituloIndex]
        const textoComVersiculos = versiculos
          .map((versiculo: string, index: number) => `**${index + 1}** ${versiculo}`)
          .join(" ")

        if (textoComVersiculos && textoComVersiculos.trim().length > 0) {
          const { data: updateData, error: updateError } = await atualizarCapitulo(cap.id, textoComVersiculos)

          if (updateError) {
            addLog(`❌ Erro ao atualizar ${nome} ${cap.numero_capitulo}: ${updateError.message}`)
            falhas++
          } else {
            if (updateData && updateData.length > 0) {
              sucessos++
            } else {
              addLog(`⚠️ Update não retornou dados para ${nome} ${cap.numero_capitulo}`)
              falhas++
            }
          }
        } else {
          addLog(`⚠️ Texto vazio para ${nome} ${cap.numero_capitulo}`)
          falhas++
        }

        setProgress(Math.round(((i + 1) / capitulos.length) * 100))

        if (i % 50 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 100))
        }
      }

      addLog("🎉 Atualização concluída!")
      addLog(`✅ Sucessos: ${sucessos}`)
      addLog(`❌ Falhas: ${falhas}`)
    } catch (error) {
      addLog(`❌ Erro geral: ${error}`)
      console.error("Erro geral:", error)
    } finally {
      setImporting(false)
      setCurrent("")
    }
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Importar Bíblia ACF</CardTitle>
          <CardDescription>
            Importa automaticamente todos os textos da Bíblia (versão ACF - domínio público) para o banco de dados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-2">
            <Button onClick={diagnosticar} variant="outline" disabled={importing}>
              Verificar Status
            </Button>
            <Button onClick={atualizarNumerosVersiculos} disabled={importing} variant="secondary" className="flex-1">
              {importing ? "Atualizando..." : "Adicionar Números aos Versículos"}
            </Button>
            <Button onClick={importarBiblia} disabled={importing} size="lg" className="flex-1">
              {importing ? "Importando..." : "Importar Capítulos Vazios"}
            </Button>
          </div>

          {diagnostic && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Status da Tabela capitulos_biblia:</h3>
              <ul className="space-y-1 text-sm">
                <li>
                  📊 Total de capítulos: <strong>{diagnostic.totalCapitulos}</strong>
                </li>
                <li>
                  📝 Capítulos vazios (sem texto): <strong>{diagnostic.capitulosVazios}</strong>
                </li>
                <li>
                  ✅ Capítulos preenchidos: <strong>{diagnostic.capitulosPreenchidos}</strong>
                </li>
              </ul>
              {diagnostic.totalCapitulos === 0 && (
                <p className="mt-3 text-amber-700 text-sm">
                  ⚠️ A tabela está vazia! Execute o script{" "}
                  <code className="bg-amber-100 px-1 rounded">03-gerar-capitulos-vazios.sql</code> primeiro.
                </p>
              )}
            </div>
          )}

          {importing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{current}</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
              <p className="text-sm text-center text-muted-foreground">Tempo estimado: ~10-15 minutos</p>
            </div>
          )}

          {log.length > 0 && (
            <div className="bg-muted rounded-lg p-4 max-h-96 overflow-y-auto">
              <div className="font-mono text-xs space-y-1">
                {log.map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
