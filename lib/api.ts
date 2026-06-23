import type { GrupoResponse, UsuarioResponse } from "./types"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ""

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    ...options,
  })

  if (!res.ok) {
    let mensagem = `Erro ${res.status}`
    try {
      const data = await res.json()
      mensagem = data.message || data.error || mensagem
    } catch {
      // resposta sem corpo
    }
    throw new Error(mensagem)
  }

  if (res.status === 204) return undefined as T

  const text = await res.text()
  if (!text) return undefined as T
  try {
    return JSON.parse(text) as T
  } catch {
    return text as unknown as T
  }
}

// ---------- Autenticação ----------

export function cadastrar(body: { nome: string; email: string; senha: string }) {
  return request<UsuarioResponse>("/usuarios/cadastro", {
    method: "POST",
    body: JSON.stringify(body),
  })
}

export function login(body: { email: string; senha: string }) {
  return request<UsuarioResponse>("/usuarios/login", {
    method: "POST",
    body: JSON.stringify(body),
  })
}

// ---------- Usuário ----------

export function buscarUsuario(id: number) {
  return request<UsuarioResponse>(`/usuarios/${id}`)
}

export function atualizarPix(id: number, chavePix: string) {
  return request<UsuarioResponse>(`/usuarios/${id}/pix`, {
    method: "PUT",
    headers: { "Content-Type": "text/plain" },
    body: chavePix,
  })
}

// ---------- Grupos ----------

export function criarGrupo(body: { nome: string; descricao: string; criadorId: number }) {
  return request<GrupoResponse>("/grupo/criar", {
    method: "POST",
    body: JSON.stringify(body),
  })
}

export function buscarGrupo(id: number) {
  return request<GrupoResponse>(`/grupos/${id}`)
}

export function listarGruposDoUsuario(id: number) {
  return request<GrupoResponse[]>(`/usuarios/${id}/grupos`)
}

export function atualizarGrupo(
  id: number,
  body: { nome: string; descricao: string; criadorId: number },
) {
  return request<GrupoResponse>(`/grupos/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  })
}

export function deletarGrupo(id: number) {
  return request<void>(`/grupos/${id}`, { method: "DELETE" })
}

export function listarParticipantes(grupoId: number) {
  return request<UsuarioResponse[]>(`/grupos/${grupoId}/participantes`)
}

export function adicionarMembro(grupoId: number, usuarioId: number) {
  return request<void>(`/grupos/${grupoId}/membros/${usuarioId}`, {
    method: "POST",
  })
}

export function adicionarMembroPorEmail(grupoId: number, email: string) {
  return request<void>(`/grupos/${grupoId}/membros/email`, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: email,
  })
}

export function removerMembro(grupoId: number, usuarioId: number) {
  return request<void>(`/grupos/${grupoId}/membros/${usuarioId}`, {
    method: "DELETE",
  })
}

export function buscarGrupoPublico(codigoPublico: string) {
  return request<GrupoResponse>(`/public/${codigoPublico}`)
}
