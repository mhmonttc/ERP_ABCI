"use client";

import React, { useState, useEffect } from "react";

interface Sucursal {
  id: number;
  nombre: string;
}

interface CuponUso {
  idCupon: string;
  nombreCupon: string;
  textoCupon: string;
  montoDescuento: number;
  usos: number;
  montoTotalDescontado: number;
  ultimaFechaUso?: string; 
  sucursalNombre?: string; 
}

export default function GestorControlCupones() {
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [selectedSucursalId, setSelectedSucursalId] = useState<number | "all">("all");
  const [cuponesUso, setCuponesUso] = useState<CuponUso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const exportToCsv = () => {
    if (cuponesUso.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }

    const headers = [
      "Cupón",
      "Texto Cupón",
      "Descuento",
      "Usos",
      "Monto Total Descontado",
      "Último Uso",
      ...(selectedSucursalId === "all" ? ["Sucursal"] : []),
    ];

    const rows = cuponesUso.map((uso) => [
      uso.nombreCupon,
      uso.textoCupon,
      uso.montoDescuento,
      uso.usos,
      uso.montoTotalDescontado,
      uso.ultimaFechaUso || "N/A",
      ...(selectedSucursalId === "all" ? [uso.sucursalNombre || "N/A"] : []),
    ]);

    let csvContent = headers.join(",") + "\n";
    rows.forEach((row) => {
      csvContent += row.map(e => `"${e}"`).join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "uso_cupones.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  useEffect(() => {
    
    fetch("/api/sucursales")
      .then((res) => res.json())
      .then((data: Sucursal[]) => {
        if (Array.isArray(data)) {
          setSucursales(data);
        } else {
          console.error("Error fetching sucursales or data is not an array:", data);
          setSucursales([]);
        }
      })
      .catch((err) => console.error("Error al cargar sucursales:", err));
  }, []);

  useEffect(() => {
    const fetchCuponUsage = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = selectedSucursalId === "all"
          ? "/api/cupones/uso"
          : `/api/cupones/uso?sucursalId=${selectedSucursalId}`;
        
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Error al cargar el uso de cupones: ${res.statusText}`);
        }
        const data: CuponUso[] = await res.json();
        setCuponesUso(data);
      } catch (err: any) {
        console.error("Error al cargar el uso de cupones:", err);
        setError(err.message || "Error al cargar el uso de cupones.");
      } finally {
        setLoading(false);
      }
    };

    fetchCuponUsage();
  }, [selectedSucursalId]);

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-black">Gestor de Control de Cupones</h2>

      <div className="mb-4">
        <label htmlFor="sucursal-select" className="block text-black font-semibold mb-1">Filtrar por Sucursal:</label>
        <select
          id="sucursal-select"
          className="border rounded px-3 py-2 w-full md:w-1/2 text-black"
          value={selectedSucursalId}
          onChange={(e) => setSelectedSucursalId(e.target.value === "all" ? "all" : Number(e.target.value))}
        >
          <option value="all">Todas las Sucursales</option>
          {sucursales.map((s) => (
            <option key={s.id} value={s.id}>{s.nombre}</option>
          ))}
        </select>
        <button
          onClick={exportToCsv}
          className="ml-4 bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700 transition"
        >
          Exportar a Excel
        </button>
      </div>

      {loading && <div className="text-gray-500">Cargando datos de uso de cupones...</div>}
      {error && <div className="text-red-500">Error: {error}</div>}

      {!loading && !error && (
        cuponesUso.length === 0 ? (
          <div className="text-gray-400">No hay datos de uso de cupones disponibles.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b text-left text-black">Cupón</th>
                  <th className="py-2 px-4 border-b text-left text-black">Texto Cupón</th>
                  <th className="py-2 px-4 border-b text-left text-black">Descuento</th>
                  <th className="py-2 px-4 border-b text-left text-black">Usos</th>
                  <th className="py-2 px-4 border-b text-left text-black">Monto Total Descontado</th>
                  <th className="py-2 px-4 border-b text-left text-black">Último Uso</th>
                  {selectedSucursalId === "all" && <th className="py-2 px-4 border-b text-left text-black">Sucursal</th>}
                </tr>
              </thead>
              <tbody>
                {cuponesUso.map((uso, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b text-black">{uso.nombreCupon}</td>
                    <td className="py-2 px-4 border-b text-black">{uso.textoCupon}</td>
                    <td className="py-2 px-4 border-b text-black">${uso.montoDescuento.toLocaleString()}</td>
                    <td className="py-2 px-4 border-b text-black">{uso.usos}</td>
                    <td className="py-2 px-4 border-b text-black">${uso.montoTotalDescontado.toLocaleString()}</td>
                    <td className="py-2 px-4 border-b text-black">{uso.ultimaFechaUso || 'N/A'}</td>
                    {selectedSucursalId === "all" && <td className="py-2 px-4 border-b text-black">{uso.sucursalNombre || 'N/A'}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}
