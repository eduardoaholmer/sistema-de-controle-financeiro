import { useEffect, useState } from "react";
import {
  atualizarCategoria,
  criarCategoria,
  excluirCategoria,
  listarCategorias,
} from "../api/categorias";

const FORM_VAZIO = { nome: "", tipo: "DESPESA" };

export function CategoriasPage() {
  const [categorias, setCategorias] = useState([]);
  const [form, setForm] = useState(FORM_VAZIO);
  const [editandoId, setEditandoId] = useState(null);
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(true);

  async function carregar() {
    setCarregando(true);
    try {
      setCategorias(await listarCategorias());
    } catch (erro) {
      setErro(erro.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function iniciarEdicao(categoria) {
    setEditandoId(categoria.id);
    setForm({ nome: categoria.nome, tipo: categoria.tipo });
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setForm(FORM_VAZIO);
  }

  async function handleSubmit(evento) {
    evento.preventDefault();
    setErro(null);
    try {
      if (editandoId) {
        await atualizarCategoria(editandoId, { nome: form.nome });
      } else {
        await criarCategoria(form);
      }
      cancelarEdicao();
      await carregar();
    } catch (erro) {
      setErro(erro.message);
    }
  }

  async function handleExcluir(id) {
    setErro(null);
    try {
      await excluirCategoria(id);
      await carregar();
    } catch (erro) {
      setErro(erro.message);
    }
  }

  return (
    <div className="pagina">
      <h1>Categorias</h1>

      <form className="card form-inline" onSubmit={handleSubmit}>
        <label>
          Nome
          <input
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            required
            minLength={2}
          />
        </label>
        <label>
          Tipo
          <select
            value={form.tipo}
            onChange={(e) => setForm({ ...form, tipo: e.target.value })}
            disabled={!!editandoId}
          >
            <option value="DESPESA">Despesa</option>
            <option value="RECEITA">Receita</option>
          </select>
        </label>
        <button type="submit">{editandoId ? "Salvar" : "Adicionar"}</button>
        {editandoId && (
          <button type="button" className="secundario" onClick={cancelarEdicao}>
            Cancelar
          </button>
        )}
      </form>

      {erro && <p className="mensagem-erro">{erro}</p>}

      {carregando ? (
        <p>Carregando...</p>
      ) : (
        <table className="tabela">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Tipo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {categorias.map((categoria) => (
              <tr key={categoria.id}>
                <td>{categoria.nome}</td>
                <td>
                  <span className={`badge badge-${categoria.tipo.toLowerCase()}`}>
                    {categoria.tipo === "RECEITA" ? "Receita" : "Despesa"}
                  </span>
                </td>
                <td className="acoes">
                  <button className="link" onClick={() => iniciarEdicao(categoria)}>
                    Editar
                  </button>
                  <button className="link perigo" onClick={() => handleExcluir(categoria.id)}>
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
            {categorias.length === 0 && (
              <tr>
                <td colSpan={3}>Nenhuma categoria cadastrada ainda.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
