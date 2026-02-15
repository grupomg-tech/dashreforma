import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle } from "lucide-react";
import FilterPanel from "@/components/dashboard/FilterPanel";
import { ImpactCards, SummaryCards, ImpactBadge } from "@/components/dashboard/ImpactOverview";
import TopProducts from "@/components/dashboard/TopProducts";
import TaxCharts from "@/components/dashboard/TaxCharts";
import { COLORS } from "@/components/dashboard/utils";

const API_URL = "/dashboards/api/graficos/dados-relatorio/";

const Index = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const [empresa, setEmpresa] = useState(urlParams.get("empresa") || "");
  const [periodoInicial, setPeriodoInicial] = useState(urlParams.get("periodo_inicial") || "");
  const [periodoFinal, setPeriodoFinal] = useState(urlParams.get("periodo_final") || "");
  const [aliquotaIbs, setAliquotaIbs] = useState(urlParams.get("aliquota_ibs") || "18.5");
  const [aliquotaCbs, setAliquotaCbs] = useState(urlParams.get("aliquota_cbs") || "8.5");
  const [aliquotaIs, setAliquotaIs] = useState(urlParams.get("aliquota_is") || "0");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);


  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        empresa,
        periodo_inicial: periodoInicial,
        periodo_final: periodoFinal,
        aliquota_ibs: aliquotaIbs,
        aliquota_cbs: aliquotaCbs,
        aliquota_is: aliquotaIs,
      });
      const res = await fetch(`${API_URL}?${params}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error(`Erro HTTP ${res.status}`);
      const text = await res.text();
      if (text.startsWith("<!") || text.startsWith("<html")) {
        throw new Error("API retornou HTML em vez de JSON. Verifique se o servidor está rodando.");
      }
      const json = JSON.parse(text);
      setData(json?.dados || json);
    } catch (e: any) {
      setError(
        e.message === "Failed to fetch"
          ? "Não foi possível conectar à API. Verifique se o servidor está rodando."
          : e.message || "Erro ao buscar dados"
      );
    } finally {
      setLoading(false);
    }
  }, [empresa, periodoInicial, periodoFinal, aliquotaIbs, aliquotaCbs, aliquotaIs]);

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(fetchData, 30000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [autoRefresh, fetchData]);

  const graficos = data?.graficos || {};
  const resumoAtual = data?.resumo?.apuracao_atual;
  const resumoReforma = data?.resumo?.apuracao_reforma;
  const produtosEntrada = data?.entradas?.produtos || [];
  const produtosSaida = data?.saidas?.produtos || [];

  const impactoDelta = resumoAtual && resumoReforma ? {
    debitos: resumoReforma.debitos - resumoAtual.debitos,
    creditos: resumoReforma.creditos - resumoAtual.creditos,
    resultado: resumoReforma.resultado - resumoAtual.resultado,
    carga: resumoReforma.carga_tributaria_efetiva - resumoAtual.carga_tributaria_efetiva,
  } : null;

  // Derived chart data
  const barDataCompras = graficos?.carga_tributaria_compras?.datasets?.[0]?.data
    ? [{ name: "Compras", "Sistema Atual": graficos.carga_tributaria_compras.datasets[0].data[0], Reforma: graficos.carga_tributaria_compras.datasets[0].data[1] }]
    : data?.entradas
      ? [{ name: "Compras", "Sistema Atual": data.entradas.carga_tributaria_atual || 0, Reforma: data.entradas.carga_tributaria_reforma || 0 }]
      : [];

  const barDataVendas = graficos?.carga_tributaria_vendas?.datasets?.[0]?.data
    ? [{ name: "Vendas", "Sistema Atual": graficos.carga_tributaria_vendas.datasets[0].data[0], Reforma: graficos.carga_tributaria_vendas.datasets[0].data[1] }]
    : data?.saidas
      ? [{ name: "Vendas", "Sistema Atual": data.saidas.carga_tributaria_atual || 0, Reforma: data.saidas.carga_tributaria_reforma || 0 }]
      : [];

  const derivePieData = (source: string, produtos: any[]) => {
    const g = graficos?.[source];
    if (g) {
      return (g.labels || []).map((label: string, i: number) => ({
        name: label, value: g.datasets?.[0]?.data?.[i] || 0,
      }));
    }
    if (produtos.length > 0) {
      const totals: Record<string, number> = { ICMS: 0, PIS: 0, COFINS: 0, "IBS/CBS": 0 };
      produtos.forEach((p: any) => {
        totals.ICMS += p.icms || 0;
        totals.PIS += p.pis || 0;
        totals.COFINS += p.cofins || 0;
        totals["IBS/CBS"] += p.ibs_cbs || 0;
      });
      return Object.entries(totals).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));
    }
    return [];
  };

  const pieDataEntradas = derivePieData("tributos_entradas", produtosEntrada);
  const pieDataSaidas = derivePieData("tributos_saidas", produtosSaida);

  const deriveComparativo = (source: string) => {
    const g = graficos?.[source];
    if (!g) return [];
    return (g.labels || []).map((label: string, i: number) => ({
      tributo: label,
      Atual: g.datasets?.[0]?.data?.[i] || 0,
      Reforma: g.datasets?.[1]?.data?.[i] || 0,
    }));
  };

  const comparativoEntradas = deriveComparativo("comparativo_entradas");
  const comparativoSaidas = deriveComparativo("comparativo_saidas");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-md border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#4e6ae9] to-[#764ba2] bg-clip-text text-transparent">
              Dashboard Reforma Tributária
            </h1>
            <p className="text-sm text-muted-foreground">Análise comparativa de impacto fiscal • Interativo</p>
          </div>
          {data && impactoDelta && (
            <div className="hidden md:flex items-center gap-3">
              <ImpactBadge label="Impacto Carga" value={impactoDelta.carga} suffix="pp" />
              <ImpactBadge label="Impacto Resultado" value={impactoDelta.resultado} prefix="R$" />
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Filters */}
        <FilterPanel
          empresa={empresa} setEmpresa={setEmpresa}
          periodoInicial={periodoInicial} setPeriodoInicial={setPeriodoInicial}
          periodoFinal={periodoFinal} setPeriodoFinal={setPeriodoFinal}
          aliquotaIbs={aliquotaIbs} setAliquotaIbs={setAliquotaIbs}
          aliquotaCbs={aliquotaCbs} setAliquotaCbs={setAliquotaCbs}
          aliquotaIs={aliquotaIs} setAliquotaIs={setAliquotaIs}
          loading={loading} autoRefresh={autoRefresh} setAutoRefresh={setAutoRefresh}
          onSubmit={fetchData}
        />

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="shadow-lg border-none">
                <CardContent className="pt-6 space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-red-200 bg-red-50 shadow-lg border-none">
              <CardContent className="pt-6 text-center text-red-600 font-medium flex items-center justify-center gap-2">
                <AlertTriangle className="h-5 w-5" /> {error}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Dashboard Content */}
        {data && !loading && (
          <div className="space-y-8">
            {/* Impact Overview */}
            {impactoDelta && <ImpactCards delta={impactoDelta} />}

            {/* Summary Cards */}
            {resumoAtual && resumoReforma && (
              <SummaryCards atual={resumoAtual} reforma={resumoReforma} />
            )}

            {/* Top Products - Interactive */}
            <TopProducts produtosEntrada={produtosEntrada} produtosSaida={produtosSaida} />

            {/* Tax Charts */}
            <TaxCharts
              barDataCompras={barDataCompras}
              barDataVendas={barDataVendas}
              pieDataEntradas={pieDataEntradas}
              pieDataSaidas={pieDataSaidas}
              comparativoEntradas={comparativoEntradas}
              comparativoSaidas={comparativoSaidas}
              entradas={data?.entradas}
              saidas={data?.saidas}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
