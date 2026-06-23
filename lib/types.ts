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
