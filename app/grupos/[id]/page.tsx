"use client"

import {
  ArrowLeft,
  Check,
  Link as LinkIcon,
  Trash2,
  UserPlus,
} from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { AppHeader } from "@/components/app-header"
import { ParticipantesLista } from "@/components/participantes-lista"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  adicionarMembro,
  buscarGrupo,
  deletarGrupo,
  removerMembro,
} from "@/lib/api"
import { getUsuarioLogado } from "@/lib/auth"
import type { GrupoResponse, UsuarioResponse } from "@/lib/types"

export default function GrupoDetalhePage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const grupoId = Number(params.id)

  const [usuario, setUsuario] = useState<UsuarioResponse | null>(null)
  const [grupo, setGrupo] = useState<GrupoResponse | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [novoMembroId, setNovoMembroId] = useState("")
  const [processando, setProcessando] = useState(false)
  const [copiado, setCopiado] = useState(false)

  async function recarregar() {
    const g = await buscarGrupo(grupoId)
    setGrupo(g)
  }

  useEffect(() => {
    const u = getUsuarioLogado()
    if (!u) {
      router.replace("/login")
      return
    }
    setUsuario(u)
    buscarGrupo(grupoId)
      .then(setGrupo)
      .catch(() => toast.error("Grupo não encontrado"))
      .finally(() => setCarregando(false))
  }, [router, grupoId])

  async function copiarLink() {
    if (!grupo) return
    const url = `${window.location.origin}/public/${grupo.codigoPublico}`
    await navigator.clipboard.writeText(url)
    setCopiado(true)
    toast.success("Link público copiado")
    setTimeout(() => setCopiado(false), 1500)
  }

  async function handleAdicionar(e: React.FormEvent) {
    e.preventDefault()
    const id = Number(novoMembroId)
    if (!id) return
    setProcessando(true)
    try {
      await adicionarMembro(grupoId, id)
      setNovoMembroId("")
      await recarregar()
      toast.success("Membro adicionado")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível adicionar")
    } finally {
      setProcessando(false)
    }
  }

  async function handleRemover(u: UsuarioResponse) {
    try {
      await removerMembro(grupoId, u.id)
      await recarregar()
      toast.success(`${u.nome.split(" ")[0]} removido`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível remover")
    }
  }

  async function handleDeletar() {
    if (!confirm("Tem certeza que deseja excluir este grupo?")) return
    try {
      await deletarGrupo(grupoId)
      toast.success("Grupo excluído")
      router.push("/")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível excluir")
    }
  }

  if (!usuario) return null

  return (
    <div className="min-h-dvh">
      <AppHeader nome={usuario.nome.split(" ")[0]} />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </Button>

        {carregando ? (
          <div className="h-40 animate-pulse rounded-2xl border border-border bg-muted/50" />
        ) : !grupo ? (
          <p className="text-sm text-muted-foreground">Grupo não encontrado.</p>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="text-2xl font-semibold tracking-tight text-balance">
                    {grupo.nome}
                  </h1>
                  {grupo.descricao && (
                    <p className="mt-1 text-pretty text-muted-foreground">
                      {grupo.descricao}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={handleDeletar}
                  aria-label="Excluir grupo"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <Button
                variant="secondary"
                className="mt-4 w-full"
                onClick={copiarLink}
              >
                {copiado ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <LinkIcon className="h-4 w-4" />
                )}
                {copiado ? "Link copiado!" : "Copiar link público"}
              </Button>
            </div>

            <section>
              <h2 className="mb-3 text-lg font-semibold">
                Participantes
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  {grupo.participantes.length}
                </span>
              </h2>
              <ParticipantesLista
                participantes={grupo.participantes}
                onRemover={handleRemover}
              />
            </section>

            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="mb-1 text-lg font-semibold">Adicionar membro</h2>
              <p className="mb-4 text-sm text-muted-foreground">
                Informe o ID do usuário que deseja adicionar ao grupo.
              </p>
              <form onSubmit={handleAdicionar} className="flex items-end gap-2">
                <div className="flex flex-1 flex-col gap-1.5">
                  <Label htmlFor="membro">ID do usuário</Label>
                  <Input
                    id="membro"
                    type="number"
                    min={1}
                    value={novoMembroId}
                    onChange={(e) => setNovoMembroId(e.target.value)}
                    placeholder="Ex: 42"
                    required
                  />
                </div>
                <Button type="submit" disabled={processando}>
                  <UserPlus className="h-4 w-4" />
                  Adicionar
                </Button>
              </form>
            </section>
          </div>
        )}
      </main>
    </div>
  )
}
