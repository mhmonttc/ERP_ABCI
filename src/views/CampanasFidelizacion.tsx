import React, { useEffect, useState } from "react";

interface Regla {
  campo: string;
  operador: string;
  valor: string;
}

interface Campana {
  id?: string;
  nombre: string;
  descuento: number;
  reglas: Regla[];
  sucursalId?: number | null;
  fechaInicio?: string;
  fechaFin?: string;
}

interface Sucursal {
  id: number;
  nombre:string;
}

const campos = [
  { value: "montoCompra", label: "Monto Compra" },
  { value: "claseServicio", label: "Clase Servicio" },
  
];

const operadores = [
  { value: "=", label: "Igual a" },
  { value: ">", label: "Mayor que" },
  { value: "<", label: "Menor que" },
  { value: "contiene", label: "Contiene" },
];

export default function CampanasFidelizacion() {
  const [campanas, setCampanas] = useState<Campana[]>([]);
  const [nombre, setNombre] = useState("");
  const [descuento, setDescuento] = useState(0);
  const [reglas, setReglas] = useState<Regla[]>([]);
  const [sucursalId, setSucursalId] = useState<number | "all">("all");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);

  useEffect(() => {
    
    fetch("/api/campanas")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCampanas(data);
        } else {
          setCampanas([]);
        }
      });

    
    fetch("/api/sucursales")
      .then((res) => res.json())
      .then((data: Sucursal[]) => {
        if (Array.isArray(data)) {
          setSucursales(data);
        }
      });
  }, []);

  const agregarRegla = () => {
    setReglas([...reglas, { campo: "montoCompra", operador: ">", valor: "" }]);
  };

  const actualizarRegla = (idx: number, key: keyof Regla, value: string) => {
    const nuevas = reglas.map((r, i) => i === idx ? { ...r, [key]: value } : r);
    setReglas(nuevas);
  };

  const eliminarRegla = (idx: number) => {
    setReglas(reglas.filter((_, i) => i !== idx));
  };

  const crearCampana = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || descuento <= 0 || !fechaInicio || !fechaFin || reglas.length === 0) {
        alert("Por favor, completa todos los campos, incluyendo al menos una regla.");
        return;
    }

    const campanaData = {
      nombre,
      descuento,
      reglas,
      sucursalId: sucursalId === "all" ? null : Number(sucursalId),
      fechaInicio,
      fechaFin,
    };

    const res = await fetch("/api/campanas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(campanaData)
    });

    if (res.ok) {
      const nueva = await res.json();
      setCampanas([...campanas, nueva]);
      setNombre("");
      setDescuento(0);
      setReglas([]);
      setSucursalId("all");
      setFechaInicio("");
      setFechaFin("");
    } else {
        const errorData = await res.json();
        alert(`Error al crear la campaña: ${errorData.message}`);
    }
  };

  const eliminarCampana = async (id: string) => {
    const res = await fetch(`/api/campanas?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setCampanas(campanas.filter(c => c.id !== id));
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-black">Administrador de Campañas</h2>
      <form onSubmit={crearCampana} className="space-y-4">
        <div>
          <label className="block text-black font-semibold mb-1">Nombre campaña</label>
          <input type="text" className="border rounded px-3 py-2 w-full text-black" value={nombre} onChange={e => setNombre(e.target.value)} required />
        </div>
        <div>
          <label className="block text-black font-semibold mb-1">Descuento (%)</label>
          <input type="number" className="border rounded px-3 py-2 w-32 text-black" value={descuento} min={1} max={100} onChange={e => setDescuento(Number(e.target.value))} required />
        </div>
        <div>
          <label className="block text-black font-semibold mb-1">Reglas de promoción</label>
          {reglas.map((regla, idx) => (
            <div key={idx} className="flex gap-2 mb-2 items-center">
              <select className="border rounded px-2 py-1 text-black" value={regla.campo} onChange={e => actualizarRegla(idx, "campo", e.target.value)}>
                {campos.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <select className="border rounded px-2 py-1 text-black" value={regla.operador} onChange={e => actualizarRegla(idx, "operador", e.target.value)}>
                {operadores.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <input className="border rounded px-2 py-1 text-black" value={regla.valor} onChange={e => actualizarRegla(idx, "valor", e.target.value)} placeholder="Valor" required />
              <button type="button" className="text-red-500 font-bold px-2" onClick={() => eliminarRegla(idx)}>X</button>
            </div>
          ))}
          <button type="button" className="bg-blue-500 text-white px-3 py-1 rounded mt-2" onClick={agregarRegla}>Agregar regla</button>
        </div>
        <div>
          <label className="block text-black font-semibold mb-1">Sucursal (Opcional)</label>
          <select
            className="border rounded px-3 py-2 w-full text-black"
            value={sucursalId}
            onChange={e => setSucursalId(e.target.value === "all" ? "all" : Number(e.target.value))}
          >
            <option value="all">Todas las Sucursales</option>
            {sucursales.map(s => (
              <option key={s.id} value={s.id}>{s.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-black font-semibold mb-1">Fecha de Inicio</label>
          <input type="date" className="border rounded px-3 py-2 w-full text-black" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} required />
        </div>
        <div>
          <label className="block text-black font-semibold mb-1">Fecha de Fin</label>
          <input type="date" className="border rounded px-3 py-2 w-full text-black" value={fechaFin} onChange={e => setFechaFin(e.target.value)} required />
        </div>
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded font-bold">Crear campaña</button>
      </form>
      <div className="mt-8">
        <h3 className="text-lg font-bold mb-2 text-black">Campañas creadas</h3>
        {campanas.length === 0 ? <div className="text-gray-400">No hay campañas registradas</div> : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b text-left text-black">Nombre</th>
                  <th className="py-2 px-4 border-b text-left text-black">Descuento</th>
                  <th className="py-2 px-4 border-b text-left text-black">Reglas</th>
                  <th className="py-2 px-4 border-b text-left text-black">Sucursal</th>
                  <th className="py-2 px-4 border-b text-left text-black">Fecha Inicio</th>
                  <th className="py-2 px-4 border-b text-left text-black">Fecha Fin</th>
                  <th className="py-2 px-4 border-b text-left text-black">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {campanas.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b text-black">{c.nombre}</td>
                    <td className="py-2 px-4 border-b text-black">{c.descuento}%</td>
                    <td className="py-2 px-4 border-b text-black">
                      <ul className="list-disc list-inside">
                        {(c.reglas || []).map((r, j) => (
                          <li key={j}>{r.campo} {r.operador} {r.valor}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="py-2 px-4 border-b text-black">{c.sucursalId ? (sucursales.find(s => s.id === c.sucursalId)?.nombre || 'Desconocida') : 'Todas'}</td>
                    <td className="py-2 px-4 border-b text-black">{c.fechaInicio || 'N/A'}</td>
                    <td className="py-2 px-4 border-b text-black">{c.fechaFin || 'N/A'}</td>
                    <td className="py-2 px-4 border-b text-black">
                      <button onClick={() => eliminarCampana(c.id!)} className="text-red-500 hover:text-red-700" title="Eliminar">
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
