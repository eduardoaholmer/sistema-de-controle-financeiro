import { api } from "./client";

function queryMes(ano, mes) {
  const params = new URLSearchParams();
  if (ano) params.set("ano", ano);
  if (mes) params.set("mes", mes);
  return params.toString() ? `?${params.toString()}` : "";
}

export function obterResumo(ano, mes) {
  return api.get(`/dashboard/resumo${queryMes(ano, mes)}`);
}

export function obterGastosPorCategoria(ano, mes) {
  return api.get(`/dashboard/gastos-por-categoria${queryMes(ano, mes)}`);
}

export function obterUltimasMovimentacoes(limite = 5) {
  return api.get(`/dashboard/ultimas-movimentacoes?limite=${limite}`);
}
