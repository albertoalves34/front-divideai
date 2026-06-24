"use client"

import {
  ArrowLeft,
  Check,
  Link as LinkIcon,
  Plus,
  Receipt,
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
  adicionarMembroPorEmail,
  buscarGrupo,
  buscarResumo,
  deletarGrupo,
  listarDespesas,
  registrarDespesa,
  removerMembro,
} from "@/lib/api"
import { getUsuarioLogado } from "@/lib/auth"
import type { Categoria, DespesaResponse, GrupoResponse, ResumoGrupoResponse, UsuarioResponse } from "@/lib/types"

const CATEGORIAS: { value: Categoria; label: string }[] = [
  { value: "ALIMENTACAO", label: "Alimentação" },
  { value: "MORADIA", label: "Moradia" },
  { value: "TRANSPORTE", label: "Transporte" },
  { value: "LAZER", label: "Lazer" },
  { value: "SAUDE", label: "Saúde" },
  { value: "OUTROS", label: "Outros" },
]

function formatarValor(valor: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor)
}

function formatarData(data: string) {
  const [ano, mes, dia] = data.split("-")
  return `${dia}/${mes}/${ano}`
}

export default function GrupoDetalhePage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const grupoId = Number(params.id)

  const [usuario, setUsuario] = useState<UsuarioResponse | null>(null)
  const [grupo, setGrupo] = useState<GrupoResponse | null>(null)
  const [despesas, setDespesas] = useState<DespesaResponse[]>([])
  const [resumo, setResumo] = useState<ResumoGrupoResponse | null>(null)
  const [carregando, setCarregando] = useState(true)

  const [novoMembroEmail, setNovoMembroEmail] = useState("")
  const [processandoMembro, setProcessandoMembro] = useState(false)
  const [copiado, setCopiado] = useState(false)

  const hoje = new Date().toISOString().split("T")[0]
  const [descricao, setDescricao] = useState("")
  const [valor, setValor] = useState("")
  const [data, setData] = useState(hoje)
  const [categoria, setCategoria] = useState<Categoria>("OUTROS")
  const [pagadorId, setPagadorId] = useState<number | "">("")
  const [processandoDespesa, setProcessandoDespesa] = useState(false)

  async function recarregar() {
    const g = await buscarGrupo(grupoId)
    setGrupo(g)
    const [d, r] = await Promise.allSettled([
      listarDespesas(grupoId),
      buscarResumo(grupoId),
    ])
    if (d.status === "fulfilled") setDespesas(d.value)
    if (r.status === "fulfilled") setResumo(r.value)
  }

  useEffect(() => {
    const u = getUsuarioLogado()
    if (!u) {
      router.replace("/login")
      return
    }
    setUsuario(u)
    buscarGrupo(grupoId)
      .then((g) => {
        setGrupo(g)
        setPagadorId(u.id)
        return Promise.allSettled([listarDespesas(grupoId), buscarResumo(grupoId)])
      })
      .then((results) => {
        if (!results) return
        const [d, r] = results
        if (d.status === "fulfilled") setDespesas(d.value)
        if (r.status === "fulfilled") setResumo(r.value)
      })
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
    if (!novoMembroEmail) return
    setProcessandoMembro(true)
    try {
      await adicionarMembroPorEmail(grupoId, novoMembroEmail)
      setNovoMembroEmail("")
      await recarregar()
      toast.success("Membro adicionado")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível adicionar")
    } finally {
      setProcessandoMembro(false)
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

  async function handleRegistrarDespesa(e: React.FormEvent) {
    e.preventDefault()
    if (!valor || !descricao || pagadorId === "") return
    setProcessandoDespesa(true)
    try {
      await registrarDespesa(grupoId, {
        pagadorId: Number(pagadorId),
        descricao,
        valor: Number(valor),
        data,
        categoria,
        tipoDivisao: "IGUALITARIA",
        divisoes: {},
      })
      setDescricao("")
      setValor("")
      setData(hoje)
      setCategoria("OUTROS")
      await recarregar()
      toast.success("Despesa registrada")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível registrar despesa")
    } finally {
      setProcessandoDespesa(false)
    }
  }

  function nomePagador(id: number) {
    return grupo?.participantes.find((p) => p.id === id)?.nome ?? `#${id}`
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
            {/* Info do grupo */}
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

            {/* Participantes */}
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

            {/* Adicionar membro */}
            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="mb-1 text-lg font-semibold">Adicionar membro</h2>
              <p className="mb-4 text-sm text-muted-foreground">
                Informe o ID do usuário que deseja adicionar ao grupo.
              </p>
              <form onSubmit={handleAdicionar} className="flex items-end gap-2">
                <div className="flex flex-1 flex-col gap-1.5">
                  <Label htmlFor="membro">Email do usuário</Label>
                  <Input
                    id="membro"
                    type="email"
                    value={novoMembroEmail}
                    onChange={(e) => setNovoMembroEmail(e.target.value)}
                    placeholder="Ex: amigo@email.com"
                    required
                  />
                </div>
                <Button type="submit" disabled={processandoMembro}>
                  <UserPlus className="h-4 w-4" />
                  Adicionar
                </Button>
              </form>
            </section>

            {/* Registrar despesa */}
            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="mb-1 text-lg font-semibold">Adicionar despesa</h2>
              <p className="mb-4 text-sm text-muted-foreground">
                O valor será dividido igualmente entre todos os participantes.
              </p>
              <form onSubmit={handleRegistrarDespesa} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Input
                    id="descricao"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Ex: Pizza do jantar"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="valor">Valor (R$)</Label>
                    <Input
                      id="valor"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={valor}
                      onChange={(e) => setValor(e.target.value)}
                      placeholder="0,00"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="data">Data</Label>
                    <Input
                      id="data"
                      type="date"
                      value={data}
                      onChange={(e) => setData(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="categoria">Categoria</Label>
                    <select
                      id="categoria"
                      value={categoria}
                      onChange={(e) => setCategoria(e.target.value as Categoria)}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      {CATEGORIAS.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="pagador">Quem pagou</Label>
                    <select
                      id="pagador"
                      value={pagadorId}
                      onChange={(e) => setPagadorId(Number(e.target.value))}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      required
                    >
                      {grupo.participantes.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nome.split(" ")[0]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <Button type="submit" disabled={processandoDespesa} className="mt-1">
                  <Plus className="h-4 w-4" />
                  Registrar despesa
                </Button>
              </form>
            </section>

            {/* Resumo de saldos */}
            {despesas.length > 0 && (
              <section className="rounded-2xl border border-border bg-card p-6">
                <h2 className="mb-1 text-lg font-semibold">Quem deve a quem</h2>
                {!resumo ? (
                  <p className="mt-3 text-sm text-muted-foreground">Calculando saldos…</p>
                ) : resumo.debitosPendentes.length === 0 ? (
                  <>
                    <p className="mb-1 text-sm text-muted-foreground">
                      Total gasto: {formatarValor(resumo.totalGasto)}
                    </p>
                    <p className="mt-3 text-sm font-medium text-green-600">Todos estão quites!</p>
                  </>
                ) : (
                  <>
                    <p className="mb-4 text-sm text-muted-foreground">
                      Total gasto: {formatarValor(resumo.totalGasto)}
                    </p>
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
                  </>
                )}
              </section>
            )}

            {/* Histórico de despesas */}
            <section>
              <h2 className="mb-3 text-lg font-semibold">
                Histórico
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  {despesas.length} despesa{despesas.length !== 1 ? "s" : ""}
                </span>
              </h2>
              {despesas.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-10 text-muted-foreground">
                  <Receipt className="h-8 w-8 opacity-40" />
                  <p className="text-sm">Nenhuma despesa registrada ainda.</p>
                </div>
              ) : (
                <ul className="flex flex-col gap-2">
                  {[...despesas].reverse().map((d) => (
                    <li
                      key={d.id}
                      className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">{d.descricao}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatarData(d.data)} · {CATEGORIAS.find((c) => c.value === d.categoria)?.label ?? d.categoria} · pago por{" "}
                          <span className="font-medium">{nomePagador(d.pagadorId).split(" ")[0]}</span>
                        </p>
                      </div>
                      <span className="ml-4 shrink-0 font-semibold">
                        {formatarValor(d.valor)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  )
}
