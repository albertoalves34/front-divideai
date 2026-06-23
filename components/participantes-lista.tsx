"use client"

import { Check, Copy, KeyRound, Trash2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import type { UsuarioResponse } from "@/lib/types"

function iniciais(nome: string) {
  return nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("")
}

function PixValor({ chave }: { chave: string }) {
  const [copiado, setCopiado] = useState(false)

  async function copiar() {
    await navigator.clipboard.writeText(chave)
    setCopiado(true)
    toast.success("Chave Pix copiada")
    setTimeout(() => setCopiado(false), 1500)
  }

  return (
    <button
      type="button"
      onClick={copiar}
      className="mt-0.5 flex items-center gap-1.5 text-sm text-primary transition-colors hover:text-primary/80"
    >
      <KeyRound className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate font-medium">{chave}</span>
      {copiado ? (
        <Check className="h-3.5 w-3.5 shrink-0" />
      ) : (
        <Copy className="h-3.5 w-3.5 shrink-0 opacity-60" />
      )}
    </button>
  )
}

export function ParticipantesLista({
  participantes,
  onRemover,
}: {
  participantes: UsuarioResponse[]
  onRemover?: (usuario: UsuarioResponse) => void
}) {
  if (!participantes || participantes.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
        Nenhum participante ainda.
      </p>
    )
  }

  return (
    <ul className="flex flex-col gap-2">
      {participantes.map((p) => (
        <li
          key={p.id}
          className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
        >
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarFallback className="bg-secondary text-secondary-foreground">
              {iniciais(p.nome)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium leading-tight">{p.nome}</p>
            {p.chavePix ? (
              <PixValor chave={p.chavePix} />
            ) : (
              <p className="mt-0.5 text-sm text-muted-foreground">
                Sem chave Pix cadastrada
              </p>
            )}
          </div>
          {onRemover && (
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 text-muted-foreground hover:text-destructive"
              onClick={() => onRemover(p)}
              aria-label={`Remover ${p.nome}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </li>
      ))}
    </ul>
  )
}
