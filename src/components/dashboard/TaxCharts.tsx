import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";
import { COLORS, PIE_COLORS, formatCurrency, formatCurrencyShort, formatPercent } from "./utils";

const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

interface TaxChartsProps {
  barDataCompras: any[];
  barDataVendas: any[];
  pieDataEntradas: any[];
  pieDataSaidas: any[];
  comparativoEntradas: any[];
  comparativoSaidas: any[];
  entradas: any;
  saidas: any;
}

const CustomTooltipStyle = {
  borderRadius: 12,
  border: "none",
  boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
  padding: "12px 16px",
};

const TaxCharts = ({
  barDataCompras, barDataVendas, pieDataEntradas, pieDataSaidas,
  comparativoEntradas, comparativoSaidas, entradas, saidas,
}: TaxChartsProps) => {
  return (
    <div className="space-y-6">
      {/* Carga Tributária Visual - Area Charts */}
      {(barDataCompras.length > 0 || barDataVendas.length > 0) && (
        <motion.div variants={item} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GaugeCard
            title="Carga Tributária — Compras"
            description="Impacto percentual sobre o total de compras"
            atualValue={barDataCompras[0]?.["Sistema Atual"] || 0}
            reformaValue={barDataCompras[0]?.Reforma || 0}
          />
          <GaugeCard
            title="Carga Tributária — Vendas"
            description="Impacto percentual sobre o total de vendas"
            atualValue={barDataVendas[0]?.["Sistema Atual"] || 0}
            reformaValue={barDataVendas[0]?.Reforma || 0}
          />
        </motion.div>
      )}

      {/* Comparativo por Tributo */}
      {(comparativoEntradas.length > 0 || comparativoSaidas.length > 0) && (
        <motion.div variants={item} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {comparativoEntradas.length > 0 && (
            <ChartCard title="Comparativo por Tributo — Entradas" description="Atual vs Reforma por tipo de tributo">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparativoEntradas} layout="vertical">
                  <defs>
                    <linearGradient id="gradAtualEnt" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor={COLORS.blue} />
                      <stop offset="100%" stopColor={COLORS.cyan} />
                    </linearGradient>
                    <linearGradient id="gradReformaEnt" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor={COLORS.purple} />
                      <stop offset="100%" stopColor={COLORS.pink} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tickFormatter={formatCurrencyShort} tick={{ fontSize: 11 }} />
                  <YAxis dataKey="tributo" type="category" width={70} tick={{ fontSize: 11, fontWeight: 600 }} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={CustomTooltipStyle} />
                  <Legend />
                  <Bar dataKey="Atual" fill="url(#gradAtualEnt)" radius={[0, 6, 6, 0]} barSize={18} />
                  <Bar dataKey="Reforma" fill="url(#gradReformaEnt)" radius={[0, 6, 6, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          )}
          {comparativoSaidas.length > 0 && (
            <ChartCard title="Comparativo por Tributo — Saídas" description="Atual vs Reforma por tipo de tributo">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparativoSaidas} layout="vertical">
                  <defs>
                    <linearGradient id="gradAtualSai" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor={COLORS.blue} />
                      <stop offset="100%" stopColor={COLORS.cyan} />
                    </linearGradient>
                    <linearGradient id="gradReformaSai" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor={COLORS.purple} />
                      <stop offset="100%" stopColor={COLORS.pink} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tickFormatter={formatCurrencyShort} tick={{ fontSize: 11 }} />
                  <YAxis dataKey="tributo" type="category" width={70} tick={{ fontSize: 11, fontWeight: 600 }} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={CustomTooltipStyle} />
                  <Legend />
                  <Bar dataKey="Atual" fill="url(#gradAtualSai)" radius={[0, 6, 6, 0]} barSize={18} />
                  <Bar dataKey="Reforma" fill="url(#gradReformaSai)" radius={[0, 6, 6, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          )}
        </motion.div>
      )}

      {/* Distribuição de Tributos (Donut Charts) */}
      {(pieDataEntradas.length > 0 || pieDataSaidas.length > 0) && (
        <motion.div variants={item} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pieDataEntradas.length > 0 && <DonutCard title="Composição Tributária — Entradas" data={pieDataEntradas} />}
          {pieDataSaidas.length > 0 && <DonutCard title="Composição Tributária — Saídas" data={pieDataSaidas} />}
        </motion.div>
      )}

      {/* Resumo Entradas vs Saídas */}
      {(entradas || saidas) && (
        <motion.div variants={item} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {entradas && <SummaryDetailCard title="Resumo Entradas (Compras)" color={COLORS.green} data={entradas} tipo="entrada" />}
          {saidas && <SummaryDetailCard title="Resumo Saídas (Vendas)" color={COLORS.orange} data={saidas} tipo="saida" />}
        </motion.div>
      )}
    </div>
  );
};

const GaugeCard = ({ title, description, atualValue, reformaValue }: {
  title: string; description: string; atualValue: number; reformaValue: number;
}) => {
  const diff = reformaValue - atualValue;
  const isIncrease = diff > 0;

  return (
    <Card className="shadow-lg border-none bg-white/80 backdrop-blur-sm overflow-hidden hover:shadow-xl transition-all">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-8 justify-center py-4">
          {/* Atual */}
          <div className="text-center">
            <div className="relative w-28 h-28 mx-auto mb-2">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                <circle cx="50" cy="50" r="42" fill="none" stroke={COLORS.blue} strokeWidth="8"
                  strokeDasharray={`${Math.min(atualValue, 100) * 2.64} 264`}
                  strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold" style={{ color: COLORS.blue }}>{atualValue.toFixed(1)}%</span>
              </div>
            </div>
            <Badge variant="outline" className="text-xs" style={{ borderColor: COLORS.blue, color: COLORS.blue }}>Atual</Badge>
          </div>

          {/* Arrow */}
          <div className="pb-8 text-2xl font-light text-muted-foreground">→</div>

          {/* Reforma */}
          <div className="text-center">
            <div className="relative w-28 h-28 mx-auto mb-2">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                <circle cx="50" cy="50" r="42" fill="none" stroke={COLORS.purple} strokeWidth="8"
                  strokeDasharray={`${Math.min(reformaValue, 100) * 2.64} 264`}
                  strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold" style={{ color: COLORS.purple }}>{reformaValue.toFixed(1)}%</span>
              </div>
            </div>
            <Badge variant="outline" className="text-xs" style={{ borderColor: COLORS.purple, color: COLORS.purple }}>Reforma</Badge>
          </div>
        </div>

        {/* Diff indicator */}
        <div className={`text-center text-sm font-semibold mt-1 ${Math.abs(diff) < 0.01 ? "text-slate-500" : isIncrease ? "text-red-600" : "text-emerald-600"}`}>
          {Math.abs(diff) < 0.01 ? "Sem alteração" : `${isIncrease ? "+" : ""}${diff.toFixed(2)} p.p.`}
        </div>
      </CardContent>
    </Card>
  );
};

const DonutCard = ({ title, data }: { title: string; data: { name: string; value: number }[] }) => {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <Card className="shadow-lg border-none bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <defs>
              {data.map((_, i) => (
                <linearGradient key={i} id={`pieGrad${title.replace(/\s/g, "")}${i}`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={PIE_COLORS[i % PIE_COLORS.length]} stopOpacity={1} />
                  <stop offset="100%" stopColor={PIE_COLORS[i % PIE_COLORS.length]} stopOpacity={0.6} />
                </linearGradient>
              ))}
            </defs>
            <Pie data={data} cx="50%" cy="50%" outerRadius={100} innerRadius={55} dataKey="value"
              paddingAngle={3} cornerRadius={6}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
              labelLine={{ strokeWidth: 2 }}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={`url(#pieGrad${title.replace(/\s/g, "")}${i})`} stroke="white" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v: number) => [formatCurrency(v), ""]}
              contentStyle={CustomTooltipStyle}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Legend below */}
        <div className="flex flex-wrap justify-center gap-3 mt-2">
          {data.map((d, i) => (
            <div key={d.name} className="flex items-center gap-1.5 text-xs">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
              <span className="font-medium">{d.name}</span>
              <span className="text-muted-foreground">({total > 0 ? ((d.value / total) * 100).toFixed(1) : 0}%)</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const ChartCard = ({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) => (
  <Card className="shadow-lg border-none bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all">
    <CardHeader className="pb-2">
      <CardTitle className="text-base">{title}</CardTitle>
      {description && <CardDescription>{description}</CardDescription>}
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

const SummaryDetailCard = ({ title, color, data, tipo }: { title: string; color: string; data: any; tipo: "entrada" | "saida" }) => {
  const rows = tipo === "entrada"
    ? [
        { label: "Compra Bruta", value: formatCurrency(data.compra_bruta || 0) },
        { label: "Créditos", value: formatCurrency(data.creditos || 0) },
        { label: "Compra Líquida", value: formatCurrency(data.compra_liquida || 0) },
        { label: "Carga Atual", value: formatPercent(data.carga_tributaria_atual || 0) },
        { label: "Créditos IBS/CBS", value: formatCurrency(data.creditos_ibs_cbs || 0), highlight: true },
        { label: "Compra Reforma", value: formatCurrency(data.compra_total_reforma || 0), highlight: true },
        { label: "Carga Reforma", value: formatPercent(data.carga_tributaria_reforma || 0), highlight: true },
      ]
    : [
        { label: "Venda Bruta", value: formatCurrency(data.venda_bruta || 0) },
        { label: "Débitos", value: formatCurrency(data.debitos || 0) },
        { label: "Venda Líquida", value: formatCurrency(data.venda_liquida || 0) },
        { label: "Carga Atual", value: formatPercent(data.carga_tributaria_atual || 0) },
        { label: "Débitos IBS/CBS", value: formatCurrency(data.debitos_ibs_cbs || 0), highlight: true },
        { label: "Venda Reforma", value: formatCurrency(data.venda_total_reforma || 0), highlight: true },
        { label: "Carga Reforma", value: formatPercent(data.carga_tributaria_reforma || 0), highlight: true },
      ];

  return (
    <Card className="shadow-lg border-none bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all overflow-hidden">
      <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
      <CardHeader className="pb-2">
        <CardTitle className="text-base" style={{ color }}>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {rows.map((r) => (
            <div key={r.label} className={`flex flex-col px-3 py-2 rounded-lg ${r.highlight ? "bg-purple-50" : "bg-muted/30"}`}>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{r.label}</span>
              <span className={`font-semibold text-sm ${r.highlight ? "text-purple-700" : ""}`}>{r.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaxCharts;
