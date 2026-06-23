"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { criarGrupo } from "@/lib/api"
import { getUsuarioLogado } from "@/lib/auth"
import type { UsuarioResponse } from "@/lib/types"

export default function CriarGrupoPage() {
  const router = useRouter()
  const [usuario, setUsuario] = useState<UsuarioResponse | null>(null)
  const [nome, setNome] = useState("")
  const [descricao, setDescricao] = useState("")
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    const u = getUsuarioLogado()
    if (!u) {
      router.replace("/login")
      return
    }
    setUsuario(u)
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!usuario) return
    setSalvando(true)
    try {
      const grupo = await criarGrupo({
        nome,
        descricao,
        criadorId: usuario.id,
      })
      toast.success("Grupo criado!")
      router.push(`/grupos/${grupo.id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível criar")
    } finally {
      setSalvando(false)
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

        <h1 className="mb-1 text-2xl font-semibold tracking-tight">
          Novo grupo
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Dê um nome e uma descrição para o seu grupo de despesas.
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nome">Nome do grupo</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Viagem à praia"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="descricao">Descrição</Label>
            <Input
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Despesas do fim de semana"
            />
          </div>
          <Button type="submit" className="mt-1" disabled={salvando}>
            {salvando ? "Criando..." : "Criar grupo"}
          </Button>
        </form>
      </main>
    </div>
  )
}
