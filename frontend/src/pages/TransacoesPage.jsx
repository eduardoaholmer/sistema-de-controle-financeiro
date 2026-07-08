import { useEffect, useState } from "react";
import { listarCategorias } from "../api/categorias";
import {
  atualizarTransacao,
  criarTransacao,
  excluirTransacao,
  listarTransacoes,
} from "../api/transacoes";

function mesAtual() {
  const hoje = new Date();
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;
}

const FORM_VAZIO = { descricao: "", valor: "", data: "", categoria_id: "" };

export function TransacoesPage() {
  const [transacoes, setTransacoes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [mesFiltro, setMesFiltro] = useState(mesAtual());
  const [form, setForm] = useState(FORM_VAZIO);
  const [editandoId, setEditandoId] = useState(null);
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(true);

  const [ano, mes] = mesFiltro.split("-").map(Number);

  async function carregar() {
    setCarregando(true);
    try {
      const [transacoesRes, categoriasRes] = await Promise.all([
        listarTransacoes({ ano, mes }),
        listarCategorias(),
      ]);
      setTransacoes(transacoesRes);
      setCategorias(categoriasRes);
    } catch (erro) {
      setErro(erro.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mesFiltro]);

  function iniciarEdicao(transacao) {
    setEditandoId(transacao.id);
    setForm({
      descricao: transacao.descricao,
      valor: transacao.valor,
      data: transacao.data,
      categoria_id: String(transacao.categoria.id),
    });
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setForm(FORM_VAZIO);
  }

  async function handleSubmit(evento) {
    evento.preventDefault();
    setErro(null);
    const dados = {
      descricao: form.descricao,
      valor: Number(form.valor),
      data: form.data,
      categoria_id: Number(form.categoria_id),
    };
    try {
      if (editandoId) {
        await atualizarTransacao(editandoId, dados);
      } else {
        await criarTransacao(dados);
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
      await excluirTransacao(id);
      await carregar();
    } catch (erro) {
      setErro(erro.message);
    }
  }

  return (
    <div className="pagina">
      <div className="cabecalho-pagina">
        <h1>Transações</h1>
        <label className="filtro-mes">
          Mês
          <input type="month" value={mesFiltro} onChange={(e) => setMesFiltro(e.target.value)} />
        </label>
      </div>

      <form className="card form-inline" onSubmit={handleSubmit}>
        <label>
          Descrição
          <input
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            required
            minLength={2}
          />
        </label>
        <label>
          Valor
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={form.valor}
            onChange={(e) => setForm({ ...form, valor: e.target.value })}
            required
          />
        </label>
        <label>
          Data
          <input
            type="date"
            value={form.data}
            onChange={(e) => setForm({ ...form, data: e.target.value })}
            required
          />
        </label>
        <label>
          Categoria
          <select
            value={form.categoria_id}
            onChange={(e) => setForm({ ...form, categoria_id: e.target.value })}
            required
          >
            <option value="" disabled>
              Selecione
            </option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nome} ({categoria.tipo === "RECEITA" ? "Receita" : "Despesa"})
              </option>
            ))}
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
              <th>Data</th>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Valor</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {transacoes.map((transacao) => (
              <tr key={transacao.id}>
                <td>{transacao.data.split("-").reverse().join("/")}</td>
                <td>{transacao.descricao}</td>
                <td>{transacao.categoria.nome}</td>
                <td className={transacao.tipo === "RECEITA" ? "valor-receita" : "valor-despesa"}>
                  {transacao.tipo === "RECEITA" ? "+" : "-"} R$ {Number(transacao.valor).toFixed(2)}
                </td>
                <td className="acoes">
                  <button className="link" onClick={() => iniciarEdicao(transacao)}>
                    Editar
                  </button>
                  <button className="link perigo" onClick={() => handleExcluir(transacao.id)}>
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
            {transacoes.length === 0 && (
              <tr>
                <td colSpan={5}>Nenhuma transação neste mês.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
