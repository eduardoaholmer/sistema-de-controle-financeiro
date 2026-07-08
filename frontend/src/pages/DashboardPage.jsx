import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { obterGastosPorCategoria, obterResumo, obterUltimasMovimentacoes } from "../api/dashboard";

const CORES_CATEGORIAS = ["#6366f1", "#f59e0b", "#06b6d4", "#ec4899", "#84cc16", "#8b5cf6"];

function mesAtual() {
  const hoje = new Date();
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;
}

function formatarMoeda(valor) {
  return `R$ ${Number(valor).toFixed(2)}`;
}

export function DashboardPage() {
  const [mesFiltro, setMesFiltro] = useState(mesAtual());
  const [resumo, setResumo] = useState(null);
  const [gastosPorCategoria, setGastosPorCategoria] = useState([]);
  const [ultimasMovimentacoes, setUltimasMovimentacoes] = useState([]);
  const [erro, setErro] = useState(null);

  const [ano, mes] = mesFiltro.split("-").map(Number);

  useEffect(() => {
    async function carregar() {
      try {
        const [resumoRes, gastosRes, ultimasRes] = await Promise.all([
          obterResumo(ano, mes),
          obterGastosPorCategoria(ano, mes),
          obterUltimasMovimentacoes(5),
        ]);
        setResumo(resumoRes);
        setGastosPorCategoria(gastosRes);
        setUltimasMovimentacoes(ultimasRes);
      } catch (erro) {
        setErro(erro.message);
      }
    }
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mesFiltro]);

  const dadosBarras = resumo
    ? [
        { nome: "Receitas", valor: Number(resumo.total_receitas) },
        { nome: "Despesas", valor: Number(resumo.total_despesas) },
      ]
    : [];

  const dadosPizza = gastosPorCategoria.map((g) => ({ nome: g.categoria, valor: Number(g.total) }));

  if (erro) return <p className="mensagem-erro">{erro}</p>;

  return (
    <div className="pagina">
      <div className="cabecalho-pagina">
        <h1>Dashboard</h1>
        <label className="filtro-mes">
          Mês
          <input type="month" value={mesFiltro} onChange={(e) => setMesFiltro(e.target.value)} />
        </label>
      </div>

      {resumo && (
        <div className="cartoes-resumo">
          <div className="card cartao-resumo">
            <span>Receitas</span>
            <strong className="valor-receita">{formatarMoeda(resumo.total_receitas)}</strong>
          </div>
          <div className="card cartao-resumo">
            <span>Despesas</span>
            <strong className="valor-despesa">{formatarMoeda(resumo.total_despesas)}</strong>
          </div>
          <div className="card cartao-resumo">
            <span>Saldo</span>
            <strong className={Number(resumo.saldo) >= 0 ? "valor-receita" : "valor-despesa"}>
              {formatarMoeda(resumo.saldo)}
            </strong>
          </div>
        </div>
      )}

      <div className="graficos">
        <div className="card grafico">
          <h2>Receitas x Despesas</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={dadosBarras}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nome" />
              <YAxis />
              <Tooltip formatter={(valor) => formatarMoeda(valor)} />
              <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                <Cell fill="#22c55e" />
                <Cell fill="#ef4444" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card grafico">
          <h2>Gastos por categoria</h2>
          {dadosPizza.length === 0 ? (
            <p>Nenhuma despesa neste mês.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={dadosPizza} dataKey="valor" nameKey="nome" outerRadius={90} label>
                  {dadosPizza.map((_, indice) => (
                    <Cell key={indice} fill={CORES_CATEGORIAS[indice % CORES_CATEGORIAS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(valor) => formatarMoeda(valor)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="card">
        <h2>Últimas movimentações</h2>
        <table className="tabela">
          <thead>
            <tr>
              <th>Data</th>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            {ultimasMovimentacoes.map((transacao) => (
              <tr key={transacao.id}>
                <td>{transacao.data.split("-").reverse().join("/")}</td>
                <td>{transacao.descricao}</td>
                <td>{transacao.categoria.nome}</td>
                <td className={transacao.tipo === "RECEITA" ? "valor-receita" : "valor-despesa"}>
                  {transacao.tipo === "RECEITA" ? "+" : "-"} {formatarMoeda(transacao.valor)}
                </td>
              </tr>
            ))}
            {ultimasMovimentacoes.length === 0 && (
              <tr>
                <td colSpan={4}>Nenhuma movimentação ainda.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
