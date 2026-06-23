"use client"

import { Wallet } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cadastrar, login } from "@/lib/api"
import { getUsuarioLogado, setUsuarioLogado } from "@/lib/auth"

export default function LoginPage() {
  const router = useRouter()
  const [modo, setModo] = useState<"login" | "cadastro">("login")
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    if (getUsuarioLogado()) router.replace("/")
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setCarregando(true)
    try {
      const usuario =
        modo === "login"
          ? await login({ email, senha })
          : await cadastrar({ nome, email, senha })
      setUsuarioLogado(usuario)
      toast.success(`Bem-vindo, ${usuario.nome.split(" ")[0]}!`)
      router.push("/")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Algo deu errado")
    } finally {
      setCarregando(false)
    }
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Wallet className="h-7 w-7" />
          </span>
          <h1 className="text-2xl font-semibold tracking-tight">Divideaí</h1>
          <p className="mt-1 text-pretty text-sm text-muted-foreground">
            Divida despesas e acerte as contas com quem importa.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
            {(["login", "cadastro"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setModo(m)}
                className={`rounded-lg py-2 text-sm font-medium transition-colors ${
                  modo === m
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                {m === "login" ? "Entrar" : "Cadastrar"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {modo === "cadastro" && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome"
                  required
                />
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <Button type="submit" className="mt-1 w-full" disabled={carregando}>
              {carregando
                ? "Aguarde..."
                : modo === "login"
                  ? "Entrar"
                  : "Criar conta"}
            </Button>
          </form>
        </div>
      </div>
    </main>
  )
}
