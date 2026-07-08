import { api } from "./client";

export function registrar(nome, email, senha) {
  return api.post("/auth/register", { nome, email, senha });
}

export function login(email, senha) {
  const form = new URLSearchParams({ username: email, password: senha });
  return api.postForm("/auth/login", form);
}

export function obterUsuarioAtual() {
  return api.get("/auth/me");
}
