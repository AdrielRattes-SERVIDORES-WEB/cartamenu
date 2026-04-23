import React, { useState } from 'react';

export default function CommissionCalculator() {
  const [monthly, setMonthly] = useState(3000);
  const [rate, setRate] = useState(30);

  const monthlyLoss = Math.round(monthly * (rate / 100));
  const yearlyLoss = monthlyLoss * 12;
  const cartamenuCost = 10;
  const yearlySaving = yearlyLoss - cartamenuCost;

  return (
    <div className="my-10 bg-[#1B1F2A] rounded-2xl p-6 sm:p-8 not-prose">
      <p className="text-xs font-bold text-[#FF3008] uppercase tracking-widest mb-1">Calculadora</p>
      <h3 className="text-xl sm:text-2xl font-black text-white mb-6">
        ¿Cuánto estás perdiendo con las apps de delivery?
      </h3>

      <div className="grid sm:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm font-semibold text-gray-400 mb-2">
            Facturación mensual en delivery (€)
          </label>
          <input
            type="range"
            min={500}
            max={20000}
            step={500}
            value={monthly}
            onChange={(e) => setMonthly(Number(e.target.value))}
            className="w-full accent-[#FF3008]"
          />
          <p className="text-2xl font-black text-white mt-2">{monthly.toLocaleString('es-ES')} €/mes</p>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-400 mb-2">
            Comisión de la plataforma (%)
          </label>
          <input
            type="range"
            min={15}
            max={35}
            step={1}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="w-full accent-[#FF3008]"
          />
          <p className="text-2xl font-black text-white mt-2">{rate}%</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-400 mb-1">Pierdes al mes</p>
          <p className="text-xl font-black text-[#FF3008]">{monthlyLoss.toLocaleString('es-ES')} €</p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-400 mb-1">Pierdes al año</p>
          <p className="text-xl font-black text-[#FF3008]">{yearlyLoss.toLocaleString('es-ES')} €</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-center">
          <p className="text-xs text-emerald-400 mb-1">Ahorras con CartaMenu</p>
          <p className="text-xl font-black text-emerald-400">{yearlySaving.toLocaleString('es-ES')} €</p>
        </div>
      </div>

      <a
        href="/checkout-plan?plan=auto"
        className="block w-full text-center bg-[#FF3008] hover:bg-[#e02b07] text-white font-bold py-3.5 rounded-xl transition-colors text-sm"
      >
        Empieza con CartaMenu por 10 €/año →
      </a>
    </div>
  );
}
