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

function IconeReceita() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 11 12 6 7 11" />
      <line x1="12" y1="18" x2="12" y2="6" />
    </svg>
  );
}

function IconeDespesa() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="7 13 12 18 17 13" />
      <line x1="12" y1="6" x2="12" y2="18" />
    </svg>
  );
}

function IconeSaldo() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4z" />
    </svg>
  );
}

function CartoesSkeleton() {
  return (
    <div className="cartoes-resumo">
      {[0, 1, 2].map((i) => (
        <div key={i} className="card cartao-resumo">
          <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 11 }} />
          <div className="cartao-resumo-info" style={{ flex: 1 }}>
            <div className="skeleton skeleton-linha" style={{ width: "50%" }} />
            <div className="skeleton skeleton-linha" style={{ width: "70%", height: "1.4em", marginTop: 4 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function SkeletonLinhas({ colunas, quantidade = 5 }) {
  return Array.from({ length: quantidade }, (_, i) => (
    <tr key={i}>
      {Array.from({ length: colunas }, (_, j) => (
        <td key={j}>
          <div className="skeleton skeleton-linha" style={{ width: j === 1 ? "75%" : "55%" }} />
        </td>
      ))}
    </tr>
  ));
}

export function DashboardPage() {
  const [mesFiltro, setMesFiltro] = useState(mesAtual());
  const [resumo, setResumo] = useState(null);
  const [gastosPorCategoria, setGastosPorCategoria] = useState([]);
  const [ultimasMovimentacoes, setUltimasMovimentacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const [ano, mes] = mesFiltro.split("-").map(Number);

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      setErro(null);
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
      } finally {
        setCarregando(false);
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

      {carregando ? (
        <CartoesSkeleton />
      ) : resumo && (
        <div className="cartoes-resumo">
          <div className="card cartao-resumo cartao-borda-receita">
            <div className="cartao-icone cartao-icone-receita"><IconeReceita /></div>
            <div className="cartao-resumo-info">
              <span>Receitas</span>
              <strong className="valor-receita">{formatarMoeda(resumo.total_receitas)}</strong>
            </div>
          </div>
          <div className="card cartao-resumo cartao-borda-despesa">
            <div className="cartao-icone cartao-icone-despesa"><IconeDespesa /></div>
            <div className="cartao-resumo-info">
              <span>Despesas</span>
              <strong className="valor-despesa">{formatarMoeda(resumo.total_despesas)}</strong>
            </div>
          </div>
          <div className="card cartao-resumo cartao-borda-saldo">
            <div className="cartao-icone cartao-icone-saldo"><IconeSaldo /></div>
            <div className="cartao-resumo-info">
              <span>Saldo</span>
              <strong className={Number(resumo.saldo) >= 0 ? "valor-receita" : "valor-despesa"}>
                {formatarMoeda(resumo.saldo)}
              </strong>
            </div>
          </div>
        </div>
      )}

      <div className="graficos">
        <div className="card grafico">
          <h2>Receitas x Despesas</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={dadosBarras}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="nome" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(valor) => formatarMoeda(valor)} />
              <Bar dataKey="valor" radius={[5, 5, 0, 0]}>
                <Cell fill="#22c55e" />
                <Cell fill="#ef4444" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card grafico">
          <h2>Gastos por categoria</h2>
          {dadosPizza.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Nenhuma despesa neste mês.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={dadosPizza} dataKey="valor" nameKey="nome" outerRadius={85} label>
                  {dadosPizza.map((_, indice) => (
                    <Cell key={indice} fill={CORES_CATEGORIAS[indice % CORES_CATEGORIAS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(valor) => formatarMoeda(valor)} />
                <Legend wrapperStyle={{ fontSize: "0.8rem" }} />
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
            {carregando ? (
              <SkeletonLinhas colunas={4} quantidade={5} />
            ) : ultimasMovimentacoes.length === 0 ? (
              <tr className="tabela-vazia">
                <td colSpan={4}>Nenhuma movimentação ainda.</td>
              </tr>
            ) : (
              ultimasMovimentacoes.map((transacao) => (
                <tr key={transacao.id}>
                  <td>{transacao.data.split("-").reverse().join("/")}</td>
                  <td>{transacao.descricao}</td>
                  <td>
                    {transacao.categoria.nome}{" "}
                    <span className={`badge badge-${transacao.tipo.toLowerCase()}`}>
                      {transacao.tipo === "RECEITA" ? "Receita" : "Despesa"}
                    </span>
                  </td>
                  <td className={transacao.tipo === "RECEITA" ? "valor-receita" : "valor-despesa"}>
                    {transacao.tipo === "RECEITA" ? "+" : "−"} {formatarMoeda(transacao.valor)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
