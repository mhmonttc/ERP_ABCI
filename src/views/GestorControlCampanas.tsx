"use client";

import React, { useState, useEffect } from "react";

interface Sucursal {
  id: number;
  nombre: string;
}

interface CampanaUso {
  nombreCampana: string;
  usos: number;
  ingresosGenerados: number;
  sucursalNombre?: string;
}

export default function GestorControlCampanas() {
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [selectedSucursalId, setSelectedSucursalId] = useState<number | "all">("all");
  const [campanasUso, setCampanasUso] = useState<CampanaUso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const exportToCsv = () => {
    if (campanasUso.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }

    const headers = [
      "Campaña",
      "Usos",
      "Ingresos Generados",
      ...(selectedSucursalId === "all" ? ["Sucursal"] : []),
    ];

    const rows = campanasUso.map((uso) => [
      uso.nombreCampana,
      uso.usos,
      uso.ingresosGenerados,
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
      link.setAttribute("download", "uso_campanas.csv");
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
    const fetchCampanaUsage = async () => {
      setLoading(true);
      setError(null);
      try {
        
        
        const url = selectedSucursalId === "all"
          ? "/api/campanas/uso"
          : `/api/campanas/uso?sucursalId=${selectedSucursalId}`;
        
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Error al cargar el uso de campañas: ${res.statusText}`);
        }
        const data: CampanaUso[] = await res.json();
        setCampanasUso(data);
      } catch (err: any) {
        console.error("Error al cargar el uso de campañas:", err);
        setError(err.message || "Error al cargar el uso de campañas.");
      } finally {
        setLoading(false);
      }
    };

    fetchCampanaUsage();
  }, [selectedSucursalId]);

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-black">Gestor de Control de Campañas</h2>

      <div className="mb-4 flex items-center">
        <div>
          <label htmlFor="sucursal-select" className="block text-black font-semibold mb-1">Filtrar por Sucursal:</label>
          <select
            id="sucursal-select"
            className="border rounded px-3 py-2 w-full md:w-64 text-black"
            value={selectedSucursalId}
            onChange={(e) => setSelectedSucursalId(e.target.value === "all" ? "all" : Number(e.target.value))}
          >
            <option value="all">Todas las Sucursales</option>
            {sucursales.map((s) => (
              <option key={s.id} value={s.id}>{s.nombre}</option>
            ))}
          </select>
        </div>
        <button
          onClick={exportToCsv}
          className="ml-4 mt-7 bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700 transition"
        >
          Exportar a Excel
        </button>
      </div>

      {loading && <div className="text-gray-500">Cargando datos de uso de campañas...</div>}
      {error && <div className="text-red-500">Error: {error}</div>}

      {!loading && !error && (
        campanasUso.length === 0 ? (
          <div className="text-gray-400">No hay datos de uso de campañas disponibles.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b text-left text-black">Campaña</th>
                  <th className="py-2 px-4 border-b text-left text-black">Usos</th>
                  <th className="py-2 px-4 border-b text-left text-black">Ingresos Generados</th>
                  {selectedSucursalId === "all" && <th className="py-2 px-4 border-b text-left text-black">Sucursal</th>}
                </tr>
              </thead>
              <tbody>
                {campanasUso.map((uso, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b text-black">{uso.nombreCampana}</td>
                    <td className="py-2 px-4 border-b text-black">{uso.usos}</td>
                    <td className="py-2 px-4 border-b text-black">${uso.ingresosGenerados.toLocaleString()}</td>
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
