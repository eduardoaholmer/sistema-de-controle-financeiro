import { api } from "./client";

export function listarTransacoes({ ano, mes, tipo, categoriaId } = {}) {
  const params = new URLSearchParams();
  if (ano) params.set("ano", ano);
  if (mes) params.set("mes", mes);
  if (tipo) params.set("tipo", tipo);
  if (categoriaId) params.set("categoria_id", categoriaId);
  const query = params.toString() ? `?${params.toString()}` : "";
  return api.get(`/transacoes/${query}`);
}

export function criarTransacao(dados) {
  return api.post("/transacoes/", dados);
}

export function atualizarTransacao(id, dados) {
  return api.put(`/transacoes/${id}`, dados);
}

export function excluirTransacao(id) {
  return api.delete(`/transacoes/${id}`);
}
