"use client"

import type { UsuarioResponse } from "./types"

const STORAGE_KEY = "dividai_usuario"

export function getUsuarioLogado(): UsuarioResponse | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as UsuarioResponse) : null
  } catch {
    return null
  }
}

export function setUsuarioLogado(usuario: UsuarioResponse) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(usuario))
}

export function logout() {
  localStorage.removeItem(STORAGE_KEY)
}
