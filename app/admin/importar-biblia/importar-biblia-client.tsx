'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { buscarCapitulosVazios, atualizarCapitulo, diagnosticarCapitulos } from './actions'

export default function ImportarBibliaClient() {
  const [status, setStatus] = useState<any>(null)
  const [importando, setImportando] = useState(false)
  const [progresso, setProgresso] = useState(0)
  const [logs, setLogs] = useState<string[]>([])
  const [stats, setStats] = useState({ sucessos: 0, falhas: 0 })

  const verificarStatus = async () => {
    addLog('🔍 Buscando capítulos vazios no banco de dados...')
    const diagnostico = await diagnosticarCapitulos()
    setStatus(diagnostico)
    addLog(`✅ Encontrados ${diagnostico.capitulosVazios} capítulos vazios`)
  }

  const addLog = (message: string) => {
    setLogs(prev => [...prev, message])
  }

  const iniciarImportacao = async () => {
    setImportando(true)
    setLogs([])
    setStats({ sucessos: 0, falhas: 0 })
    setProgresso(0)

    try {
      addLog('📥 Baixando Bíblia ACF completa do GitHub...')
      
      const response = await fetch(
        'https://raw.githubusercontent.com/thiagobodruk/biblia/master/json/acf.json'
      )
      const bibliaCompleta = await response.json()
      
      addLog(`✅ Bíblia baixada: ${bibliaCompleta.length} livros`)

      addLog('🔍 Buscando capítulos vazios no banco de dados...')
      const capitulosVazios = await buscarCapitulosVazios()
      addLog(`✅ Encontrados ${capitulosVazios.length} capítulos vazios`)

      let sucessos = 0
      let falhas = 0

      for (let i = 0; i < capitulosVazios.length; i++) {
        const cap = capitulosVazios[i]
        const porcentagem = Math.round(((i + 1) / capitulosVazios.length) * 100)
        setProgresso(porcentagem)

        const livroNome = cap.livros_biblia?.nome || ''
        const numCap = cap.numero_capitulo

        addLog(`📖 Importando ${livroNome} capítulo ${numCap}...`)

        try {
          const livro = bibliaCompleta.find((l: any) => l.name === livroNome)
          
          if (!livro) {
            addLog(`⚠️ Livro ${livroNome} não encontrado no JSON`)
            falhas++
            continue
          }

          const capitulo = livro.chapters.find((c: any) => c.chapter === numCap)
          
          if (!capitulo || !capitulo.text) {
            addLog(`⚠️ Capítulo ${numCap} não encontrado em ${livroNome}`)
            falhas++
            continue
          }

          const result = await atualizarCapitulo(cap.id, capitulo.text)
          
          if (result.error) {
            addLog(`❌ Erro ao salvar ${livroNome} ${numCap}`)
            falhas++
          } else {
            sucessos++
          }

          await new Promise(resolve => setTimeout(resolve, 50))
        } catch (error: any) {
          addLog(`❌ Erro em ${livroNome} ${numCap}: ${error.message}`)
          falhas++
        }

        setStats({ sucessos, falhas })
      }

      addLog(`🎉 Importação concluída!`)
      addLog(`✅ Sucessos: ${sucessos}`)
      addLog(`❌ Falhas: ${falhas}`)
    } catch (error: any) {
      addLog(`❌ Erro fatal: ${error.message}`)
    } finally {
      setImportando(false)
      verificarStatus()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Button onClick={verificarStatus} disabled={importando} variant="outline">
          Verificar Status
        </Button>
        <Button onClick={iniciarImportacao} disabled={importando} className="flex-1">
          {importando ? 'Importando...' : 'Iniciar Importação'}
        </Button>
      </div>

      {status && (
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">Status da Tabela capitulos_biblia:</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>📊 Total de capítulos: {status.totalCapitulos}</p>
            <p>📭 Capítulos vazios (sem texto): {status.capitulosVazios}</p>
            <p>✅ Capítulos preenchidos: {status.capitulosPreenchidos}</p>
          </CardContent>
        </Card>
      )}

      {importando && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progresso</span>
            <span>{progresso}%</span>
          </div>
          <Progress value={progresso} className="h-2" />
          <p className="text-sm text-muted-foreground">
            ✅ Sucessos: {stats.sucessos} | ❌ Falhas: {stats.falhas}
          </p>
        </div>
      )}

      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Logs de Importação</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-1 font-mono text-xs">
                {logs.map((log, i) => (
                  <div key={i}>{log}</div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
