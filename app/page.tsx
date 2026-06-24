"use client"

import { ChevronRight, Plus, Users } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { listarGruposDoUsuario } from "@/lib/api"
import { getUsuarioLogado } from "@/lib/auth"
import type { GrupoResponse, UsuarioResponse } from "@/lib/types"

export default function HomePage() {
  const router = useRouter()
  const [usuario, setUsuario] = useState<UsuarioResponse | null>(null)
  const [grupos, setGrupos] = useState<GrupoResponse[]>([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const u = getUsuarioLogado()
    if (!u) {
      router.replace("/login")
      return
    }
    setUsuario(u)
    listarGruposDoUsuario(u.id)
      .then(setGrupos)
      .catch(() => setGrupos([]))
      .finally(() => setCarregando(false))
  }, [router])

  if (!usuario) return null

  return (
    <div className="min-h-dvh">
      <AppHeader nome={usuario.nome.split(" ")[0]} />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Meus grupos
            </h1>
            <p className="text-sm text-muted-foreground">
              Despesas compartilhadas em um só lugar.
            </p>
          </div>
          <Button size="sm" onClick={() => router.push("/grupos/criar")}>
            <Plus className="h-4 w-4" />
            Novo
          </Button>
        </div>

        {carregando ? (
          <div className="flex flex-col gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-xl border border-border bg-muted/50"
              />
            ))}
          </div>
        ) : grupos.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-6 py-12 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
              <Users className="h-6 w-6" />
            </span>
            <div>
              <p className="font-medium">Nenhum grupo ainda</p>
              <p className="text-sm text-muted-foreground">
                Crie um grupo para começar a dividir despesas.
              </p>
            </div>
            <Button onClick={() => router.push("/grupos/criar")}>
              <Plus className="h-4 w-4" />
              Criar grupo
            </Button>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {grupos.map((g) => (
              <li key={g.id}>
                <Link
                  href={`/grupos/${g.id}`}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-accent/40"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                    <Users className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{g.nome}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {g.participantes?.length ?? 0}{" "}
                      {(g.participantes?.length ?? 0) === 1
                        ? "participante"
                        : "participantes"}
                      {g.descricao ? ` · ${g.descricao}` : ""}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
