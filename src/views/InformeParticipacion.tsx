import React, { useState } from "react";


const datosEjemplo = [
  { sucursal: "Sucursal 1", ventas: 250, monto: 320000 },
  { sucursal: "Sucursal 2", ventas: 180, monto: 210000 },
  { sucursal: "Sucursal 3", ventas: 90, monto: 120000 },
];

function calcularTotalVentas(data: any[]) {
  return data.reduce((acc, curr) => acc + curr.ventas, 0);
}

function calcularTotalMonto(data: any[]) {
  return data.reduce((acc, curr) => acc + curr.monto, 0);
}

function exportarCSV(data: any[]) {
  const encabezado = "Sucursal,Ventas,Monto";
  const filas = data.map((d) => `${d.sucursal},${d.ventas},${d.monto}`);
  const csv = [encabezado, ...filas].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "informe_participacion.csv";
  a.click();
  window.URL.revokeObjectURL(url);
}

export default function InformeParticipacion() {
  const [data] = useState(datosEjemplo);
  const totalVentas = calcularTotalVentas(data);
  const totalMonto = calcularTotalMonto(data);

  
  const total = totalVentas;
  let offset = 0;
  const colores = ["#7ee3ea", "#ffb347", "#ff6961", "#a3e635", "#b39ddb"];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Informe de Participación por Sucursal</h2>
      <div className="flex flex-col md:flex-row gap-8 items-center mb-8">
        {}
        <svg width="180" height="180" viewBox="0 0 36 36" className="mx-auto">
          {data.map((d, i) => {
            const porcentaje = (d.ventas / total) * 100;
            const dash = (porcentaje * 100) / 100;
            const circle = (
              <circle
                key={d.sucursal}
                r="16"
                cx="18"
                cy="18"
                fill="transparent"
                stroke={colores[i % colores.length]}
                strokeWidth="3.5"
                strokeDasharray={`${dash} ${100 - dash}`}
                strokeDashoffset={offset}
              />
            );
            offset -= dash;
            return circle;
          })}
        </svg>
        <div>
          <button
            className="mb-4 px-4 py-2 bg-[#7ee3ea] text-black rounded hover:bg-[#5fd1d9] font-semibold"
            onClick={() => exportarCSV(data)}
          >
            Exportar a Excel
          </button>
          <table className="min-w-[300px] border border-gray-300 rounded">
            <thead>
              <tr className="bg-[#e0f7fa]">
                <th className="px-3 py-2 border">Sucursal</th>
                <th className="px-3 py-2 border">Ventas</th>
                <th className="px-3 py-2 border">Monto</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.sucursal}>
                  <td className="px-3 py-2 border text-black">{d.sucursal}</td>
                  <td className="px-3 py-2 border text-black">{d.ventas}</td>
                  <td className="px-3 py-2 border text-black">${d.monto.toLocaleString()}</td>
                </tr>
              ))}
              <tr className="font-bold bg-[#f6fffd]">
                <td className="px-3 py-2 border">Total</td>
                <td className="px-3 py-2 border">{totalVentas}</td>
                <td className="px-3 py-2 border">${totalMonto.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
