"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { CONFISSAO_FE_TEXTO, COMPROMISSO_DISCIPULADOR } from "@/constants/confissao-fe"
import { assinarConfissaoFe } from "./actions"
import { Trophy, Heart, CheckCircle2, ChevronRight } from "lucide-react"

interface MarcoFeClientProps {
  discipulo: any
}

export default function MarcoFeClient({ discipulo }: MarcoFeClientProps) {
  const [etapa, setEtapa] = useState<"confissao" | "batismo" | "compromisso">("confissao")
  const [assinatura, setAssinatura] = useState("")
  const [aceitaConfissao, setAceitaConfissao] = useState(false)
  const [ehBatizado, setEhBatizado] = useState<string>("")
  const [aceitaCompromisso, setAceitaCompromisso] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleContinuar = async () => {
    if (etapa === "confissao") {
      if (!aceitaConfissao || !assinatura.trim()) {
        toast({
          title: "Atenção",
          description: "Por favor, aceite a confissão de fé e assine com seu nome completo",
          variant: "destructive",
        })
        return
      }
      setEtapa("batismo")
    } else if (etapa === "batismo") {
      if (!ehBatizado) {
        toast({
          title: "Atenção",
          description: "Por favor, responda sobre seu batismo",
          variant: "destructive",
        })
        return
      }
      setEtapa("compromisso")
    } else if (etapa === "compromisso") {
      if (!aceitaCompromisso) {
        toast({
          title: "Atenção",
          description: "Por favor, aceite o compromisso com o discipulado",
          variant: "destructive",
        })
        return
      }

      setEnviando(true)
      try {
        const resultado = await assinarConfissaoFe({
          discipuloId: discipulo.id,
          assinatura,
          ehBatizado: ehBatizado === "sim",
        })

        if (resultado.error) {
          throw new Error(resultado.error)
        }

        toast({
          title: "Parabéns!",
          description: resultado.mensagem,
        })

        // Redirecionar conforme status de batismo
        setTimeout(() => {
          if (ehBatizado === "nao") {
            router.push("/dashboard/batismo/passo/1")
          } else {
            router.push("/dashboard")
          }
        }, 2000)
      } catch (error) {
        console.error("Erro ao assinar confissão:", error)
        toast({
          title: "Erro",
          description: error instanceof Error ? error.message : "Erro ao processar confissão",
          variant: "destructive",
        })
      } finally {
        setEnviando(false)
      }
    }
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="text-center mb-8">
        <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
        <h1 className="text-4xl font-bold mb-2">Marco de Fé</h1>
        <p className="text-muted-foreground">
          Parabéns por completar a Fase 1! Agora é hora de um compromisso mais profundo com Jesus.
        </p>
      </div>

      {/* Progresso */}
      <div className="flex justify-center gap-2 mb-8">
        <Badge variant={etapa === "confissao" ? "default" : "secondary"}>1. Confissão de Fé</Badge>
        <ChevronRight className="w-4 h-4 mt-1" />
        <Badge variant={etapa === "batismo" ? "default" : "secondary"}>2. Batismo</Badge>
        <ChevronRight className="w-4 h-4 mt-1" />
        <Badge variant={etapa === "compromisso" ? "default" : "secondary"}>3. Compromisso</Badge>
      </div>

      {/* Etapa Confissão */}
      {etapa === "confissao" && (
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Confissão de Fé Cristã</h2>
              <div className="prose prose-sm max-w-none bg-muted p-6 rounded-lg max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap font-sans text-sm">{CONFISSAO_FE_TEXTO}</pre>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="aceita-confissao"
                  checked={aceitaConfissao}
                  onCheckedChange={(checked) => setAceitaConfissao(checked as boolean)}
                />
                <Label htmlFor="aceita-confissao" className="text-sm leading-relaxed cursor-pointer">
                  Eu li, entendi e aceito esta confissão de fé. Declaro que Jesus Cristo é meu Senhor e Salvador.
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assinatura">Assinatura Digital (seu nome completo)</Label>
                <Input
                  id="assinatura"
                  type="text"
                  placeholder="Digite seu nome completo"
                  value={assinatura}
                  onChange={(e) => setAssinatura(e.target.value)}
                  className="font-serif text-lg"
                />
              </div>
            </div>

            <Button onClick={handleContinuar} size="lg" className="w-full">
              Continuar <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      )}

      {/* Etapa Batismo */}
      {etapa === "batismo" && (
        <Card className="p-6">
          <div className="space-y-6">
            <div className="text-center">
              <Heart className="w-12 h-12 mx-auto mb-4 text-blue-500" />
              <h2 className="text-2xl font-bold mb-2">Você é batizado?</h2>
              <p className="text-muted-foreground">
                O batismo é uma ordenança de Jesus e um testemunho público da sua fé. Queremos saber sobre seu batismo.
              </p>
            </div>

            <Separator />

            <RadioGroup value={ehBatizado} onValueChange={setEhBatizado}>
              <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-muted">
                <RadioGroupItem value="sim" id="batizado-sim" />
                <Label htmlFor="batizado-sim" className="flex-1 cursor-pointer">
                  <div className="font-semibold">Sim, já sou batizado</div>
                  <div className="text-sm text-muted-foreground">Fui batizado após minha conversão a Cristo</div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-muted">
                <RadioGroupItem value="nao" id="batizado-nao" />
                <Label htmlFor="batizado-nao" className="flex-1 cursor-pointer">
                  <div className="font-semibold">Não, ainda não sou batizado</div>
                  <div className="text-sm text-muted-foreground">Gostaria de estudar mais sobre batismo</div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-muted">
                <RadioGroupItem value="nao-certeza" id="batizado-nao-certeza" />
                <Label htmlFor="batizado-nao-certeza" className="flex-1 cursor-pointer">
                  <div className="font-semibold">Não tenho certeza</div>
                  <div className="text-sm text-muted-foreground">Preciso entender melhor o que é batismo</div>
                </Label>
              </div>
            </RadioGroup>

            {ehBatizado === "nao" || ehBatizado === "nao-certeza" ? (
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  Vamos direcioná-lo para uma fase especial sobre batismo antes de prosseguir para a Fase 2!
                </p>
              </div>
            ) : null}

            <Button onClick={handleContinuar} size="lg" className="w-full">
              Continuar <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      )}

      {/* Etapa Compromisso */}
      {etapa === "compromisso" && (
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Compromisso com o Discipulado</h2>
              <div className="prose prose-sm max-w-none bg-muted p-6 rounded-lg max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap font-sans text-sm">{COMPROMISSO_DISCIPULADOR}</pre>
              </div>
            </div>

            <Separator />

            <div className="flex items-start space-x-2">
              <Checkbox
                id="aceita-compromisso"
                checked={aceitaCompromisso}
                onCheckedChange={(checked) => setAceitaCompromisso(checked as boolean)}
              />
              <Label htmlFor="aceita-compromisso" className="text-sm leading-relaxed cursor-pointer">
                Eu entendo que fui discipulado e agora me comprometo a fazer discípulos, ensinando tudo o que aprendi
                sobre Jesus.
              </Label>
            </div>

            <Button onClick={handleContinuar} size="lg" className="w-full" disabled={enviando}>
              {enviando ? "Processando..." : "Finalizar e Continuar"} <CheckCircle2 className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
