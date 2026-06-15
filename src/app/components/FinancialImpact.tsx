import { useState } from 'react';
import { ArrowLeft, DollarSign, TrendingDown, Download, AlertCircle } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface FinancialImpactProps {
  onBack: () => void;
}

export function FinancialImpact({ onBack }: FinancialImpactProps) {
  const data = [
    { category: 'Multas SUSESO', potencial: 15000000, mitigado: 500000, ahorro: 14500000 },
    { category: 'Incidentes Laborales', potencial: 8000000, mitigado: 200000, ahorro: 7800000 },
    { category: 'Equipos sin Certificar', potencial: 3500000, mitigado: 300000, ahorro: 3200000 },
    { category: 'Horas Perdidas', potencial: 5000000, mitigado: 200000, ahorro: 4800000 }
  ];

  const total = data.reduce((sum, item) => sum + item.ahorro, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-20 lg:pb-6">
      <div className="bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 pt-16 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button onClick={onBack} className="flex items-center gap-2 text-white/70 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
                <span>Volver</span>
              </button>
              <div>
                <h1 className="text-white text-xl lg:text-2xl font-bold">Impacto Financiero</h1>
                <p className="text-sm text-white/60">Análisis de costos evitados</p>
              </div>
            </div>
            <Button onClick={() => toast.success('Exportando reporte financiero')} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
        <Card className="bg-gradient-to-r from-emerald-900/40 to-green-900/40 border-emerald-500/30">
          <div className="p-8 text-center">
            <DollarSign className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-5xl font-bold text-white mb-2">${(total / 1000000).toFixed(1)}M CLP</h2>
            <p className="text-emerald-400 text-lg">Ahorro total identificado</p>
            <p className="text-white/60 text-sm mt-2">Mi servicio le está ahorrando más de lo que le cuesta</p>
          </div>
        </Card>

        {/* Pitch de Venta - Contexto Ejecutivo */}
        <Card className="bg-gradient-to-r from-blue-900/40 to-cyan-900/40 border-blue-500/30">
          <div className="p-6">
            <h3 className="text-white font-bold text-lg mb-3">📊 ¿Por qué este análisis importa?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <div className="text-cyan-400 font-bold mb-2">ROI Comprobable</div>
                <p className="text-white/80">Cada peso invertido en prevención retorna hasta 4x en costos evitados. Los números no mienten.</p>
              </div>
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <div className="text-cyan-400 font-bold mb-2">Auditorías Sin Estrés</div>
                <p className="text-white/80">Cuando SUSESO o la Mutualidad lleguen, todos los documentos estarán listos en segundos, no días.</p>
              </div>
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <div className="text-cyan-400 font-bold mb-2">Reducción de Seguros</div>
                <p className="text-white/80">Un historial digital de prevención comprobado reduce hasta 30% las primas de seguros de responsabilidad.</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <div className="p-6">
            <h3 className="text-white font-bold text-lg mb-4">Multas Potenciales vs Costo de Mitigación</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="category" stroke="rgba(255,255,255,0.6)" angle={-15} textAnchor="end" height={100} />
                <YAxis stroke="rgba(255,255,255,0.6)" tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.9)', border: '1px solid rgba(255,255,255,0.2)' }} formatter={(value) => `$${Number(value).toLocaleString()} CLP`} />
                <Legend />
                <Bar dataKey="potencial" fill="#EB5757" name="Multa Potencial" />
                <Bar dataKey="mitigado" fill="#27AE60" name="Costo de Mitigación" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.map((item) => (
            <Card key={item.category} className="bg-white/5 border-white/10">
              <div className="p-5">
                <h4 className="text-white font-semibold mb-3">{item.category}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">Multa potencial:</span>
                    <span className="text-red-400 font-semibold">${(item.potencial / 1000000).toFixed(1)}M</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Costo mitigación:</span>
                    <span className="text-yellow-400 font-semibold">${(item.mitigado / 1000000).toFixed(1)}M</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-white/10">
                    <span className="text-white font-semibold">Ahorro neto:</span>
                    <span className="text-emerald-400 font-bold">${(item.ahorro / 1000000).toFixed(1)}M</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}