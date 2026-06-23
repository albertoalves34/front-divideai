"use client"

import { ArrowLeft, KeyRound, Mail, User } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { atualizarPix } from "@/lib/api"
import { getUsuarioLogado, setUsuarioLogado } from "@/lib/auth"
import type { UsuarioResponse } from "@/lib/types"

export default function PerfilPage() {
  const router = useRouter()
  const [usuario, setUsuario] = useState<UsuarioResponse | null>(null)
  const [chavePix, setChavePix] = useState("")
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    const u = getUsuarioLogado()
    if (!u) {
      router.replace("/login")
      return
    }
    setUsuario(u)
    setChavePix(u.chavePix ?? "")
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!usuario) return
    setSalvando(true)
    try {
      const atualizado = await atualizarPix(usuario.id, chavePix)
      setUsuario(atualizado)
      setUsuarioLogado(atualizado)
      toast.success("Chave Pix atualizada")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível salvar")
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

        <h1 className="mb-6 text-2xl font-semibold tracking-tight">
          Meu perfil
        </h1>

        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                  <User className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Nome</p>
                  <p className="truncate font-medium">{usuario.nome}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                  <Mail className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">E-mail</p>
                  <p className="truncate font-medium">{usuario.email}</p>
                </div>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-border bg-card p-6"
          >
            <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold">
              <KeyRound className="h-4 w-4 text-primary" />
              Chave Pix
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Cadastre sua chave para que outros participantes possam te pagar.
            </p>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pix">Sua chave Pix</Label>
              <Input
                id="pix"
                value={chavePix}
                onChange={(e) => setChavePix(e.target.value)}
                placeholder="E-mail, telefone, CPF ou chave aleatória"
              />
            </div>
            <Button type="submit" className="mt-4 w-full" disabled={salvando}>
              {salvando ? "Salvando..." : "Salvar chave Pix"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}
