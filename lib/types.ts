export type UsuarioResponse = {
  id: number
  nome: string
  email: string
  chavePix: string | null
}

export type GrupoResponse = {
  id: number
  nome: string
  descricao: string
  dataCriacao: string
  participantes: UsuarioResponse[]
  codigoPublico: string
}

export type Categoria = "ALIMENTACAO" | "MORADIA" | "TRANSPORTE" | "LAZER" | "SAUDE" | "OUTROS"

export type TipoDivisao = "IGUALITARIA" | "PERSONALIZADA"

export type DespesaResponse = {
  id: number
  grupoId: number
  pagadorId: number
  descricao: string
  valor: number
  data: string
  categoria: Categoria
  tipoDivisao: TipoDivisao
}

export type DespesaRequest = {
  pagadorId: number
  descricao: string
  valor: number
  data: string
  categoria: Categoria
  tipoDivisao: TipoDivisao
  divisoes: Record<number, number>
}

export type DebitoResponse = {
  devedorId: number
  DevedorNome: string
  credorId: number
  credorNome: string
  valor: number
}

export type ResumoGrupoResponse = {
  grupoId: number
  nomeGrupo: string
  totalGasto: number
  saldoPorUsuario: Record<string, number>
  debitosPendentes: DebitoResponse[]
}
