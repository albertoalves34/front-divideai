"use client"

import { Wallet } from "lucide-react"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { ParticipantesLista } from "@/components/participantes-lista"
import { buscarGrupoPublico, buscarResumo } from "@/lib/api"
import type { GrupoResponse, ResumoGrupoResponse } from "@/lib/types"

function formatarValor(valor: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor)
}

export default function GrupoPublicoPage() {
  const params = useParams<{ codigo: string }>()
  const codigo = params.codigo

  const [grupo, setGrupo] = useState<GrupoResponse | null>(null)
  const [resumo, setResumo] = useState<ResumoGrupoResponse | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(false)

  useEffect(() => {
    buscarGrupoPublico(codigo)
      .then((g) => {
        setGrupo(g)
        setCarregando(false)
        buscarResumo(g.id).then(setResumo).catch(() => {})
      })
      .catch(() => {
        setErro(true)
        setCarregando(false)
      })
  }, [codigo])

  return (
    <div className="min-h-dvh">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-2xl items-center gap-2 px-4 py-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Wallet className="h-5 w-5" />
          </span>
          <span className="text-lg font-semibold tracking-tight">Divideaí</span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        {carregando ? (
          <div className="h-40 animate-pulse rounded-2xl border border-border bg-muted/50" />
        ) : erro || !grupo ? (
          <div className="rounded-2xl border border-dashed border-border px-6 py-12 text-center">
            <p className="font-medium">Grupo não encontrado</p>
            <p className="text-sm text-muted-foreground">
              O link pode estar incorreto ou expirado.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-border bg-card p-6 text-center">
              <p className="text-sm font-medium text-primary">Página de pagamento</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-balance">
                {grupo.nome}
              </h1>
              {grupo.descricao && (
                <p className="mt-1 text-pretty text-muted-foreground">{grupo.descricao}</p>
              )}
              {resumo && (
                <p className="mt-3 text-sm text-muted-foreground">
                  Total gasto:{" "}
                  <span className="font-semibold text-foreground">
                    {formatarValor(resumo.totalGasto)}
                  </span>
                </p>
              )}
            </div>

            {/* Quem deve a quem */}
            {resumo && resumo.debitosPendentes.length > 0 && (
              <section className="rounded-2xl border border-border bg-card p-6">
                <h2 className="mb-4 text-lg font-semibold">Quem deve a quem</h2>
                <ul className="flex flex-col gap-2">
                  {resumo.debitosPendentes.map((d, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-2 text-sm"
                    >
                      <span>
                        <span className="font-medium">{d.DevedorNome.split(" ")[0]}</span>
                        {" deve para "}
                        <span className="font-medium">{d.credorNome.split(" ")[0]}</span>
                      </span>
                      <span className="font-semibold text-destructive">
                        {formatarValor(d.valor)}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {resumo && resumo.debitosPendentes.length === 0 && (
              <p className="text-center text-sm font-medium text-green-600">
                Todos estão quites!
              </p>
            )}

            <section>
              <h2 className="mb-1 text-lg font-semibold">Participantes e chaves Pix</h2>
              <p className="mb-3 text-sm text-muted-foreground">
                Toque em uma chave Pix para copiar e fazer o pagamento.
              </p>
              <ParticipantesLista participantes={grupo.participantes} />
            </section>
          </div>
        )}
      </main>
    </div>
  )
}
