"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { LogOut, User, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { logout } from "@/lib/auth"

export function AppHeader({ nome }: { nome?: string }) {
  const router = useRouter()

  function handleLogout() {
    logout()
    router.push("/login")
  }

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Wallet className="h-5 w-5" />
          </span>
          <span className="text-lg font-semibold tracking-tight">Divideaí</span>
        </Link>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/perfil" className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">{nome ?? "Perfil"}</span>
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            aria-label="Sair"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
