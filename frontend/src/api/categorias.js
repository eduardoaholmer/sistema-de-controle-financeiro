import { api } from "./client";

export function listarCategorias(tipo) {
  const query = tipo ? `?tipo=${tipo}` : "";
  return api.get(`/categorias/${query}`);
}

export function criarCategoria(dados) {
  return api.post("/categorias/", dados);
}

export function atualizarCategoria(id, dados) {
  return api.put(`/categorias/${id}`, dados);
}

export function excluirCategoria(id) {
  return api.delete(`/categorias/${id}`);
}
