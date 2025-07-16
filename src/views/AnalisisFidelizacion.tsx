import React, { useState } from "react";



const mockCupones = [
  { id: 1, nombre: "Cupon 10%", tipo: "cupon" },
  { id: 2, nombre: "Cupon 2x1", tipo: "cupon" },
];
const mockCampanas = [
  { id: 1, nombre: "Campaña Invierno", tipo: "campana" },
  { id: 2, nombre: "Campaña Verano", tipo: "campana" },
];
const mockUsos = [
  { id: 1, tipo: "cupon", nombre: "Cupon 10%", usuario: "Juan", fecha: "2024-07-01" },
  { id: 2, tipo: "cupon", nombre: "Cupon 10%", usuario: "Ana", fecha: "2024-07-01" },
  { id: 3, tipo: "campana", nombre: "Campaña Invierno", usuario: "Pedro", fecha: "2024-07-02" },
  { id: 4, tipo: "cupon", nombre: "Cupon 2x1", usuario: "Juan", fecha: "2024-07-03" },
  { id: 5, tipo: "campana", nombre: "Campaña Verano", usuario: "Ana", fecha: "2024-07-03" },
  { id: 6, tipo: "cupon", nombre: "Cupon 10%", usuario: "Pedro", fecha: "2024-07-04" },
];

export default function AnalisisFidelizacion() {
  const [tipo, setTipo] = useState("cupon");
  const [seleccionado, setSeleccionado] = useState<string>("");

  const items = tipo === "cupon" ? mockCupones : mockCampanas;
  const usosFiltrados = mockUsos.filter(u => u.tipo === tipo && (seleccionado ? u.nombre === seleccionado : true));

  
  const conteoPorUsuario = usosFiltrados.reduce((acc: Record<string, number>, uso) => {
    acc[uso.usuario] = (acc[uso.usuario] || 0) + 1;
    return acc;
  }, {});
  const conteoPorFecha = usosFiltrados.reduce((acc: Record<string, number>, uso) => {
    acc[uso.fecha] = (acc[uso.fecha] || 0) + 1;
    return acc;
  }, {});

  

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-black">Análisis de Fidelización</h2>
      <div className="flex gap-4 mb-4">
        <select className="border rounded px-3 py-2 text-black" value={tipo} onChange={e => { setTipo(e.target.value); setSeleccionado(""); }}>
          <option value="cupon">Cupones</option>
          <option value="campana">Campañas</option>
        </select>
        <select className="border rounded px-3 py-2 text-black" value={seleccionado} onChange={e => setSeleccionado(e.target.value)}>
          <option value="">Todos</option>
          {items.map(i => <option key={i.id} value={i.nombre}>{i.nombre}</option>)}
        </select>

      </div>
      <div className="mb-6">
        <h3 className="font-semibold text-black mb-2">Lista de usos</h3>
        <table className="w-full border text-black">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Nombre</th>
              <th className="p-2 border">Usuario</th>
              <th className="p-2 border">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {usosFiltrados.map((u, i) => (
              <tr key={i}>
                <td className="p-2 border">{u.nombre}</td>
                <td className="p-2 border">{u.usuario}</td>
                <td className="p-2 border">{u.fecha}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mb-6">
        <h3 className="font-semibold text-black mb-2">Usuarios que más han usado</h3>
        <ul className="list-disc ml-6 text-black">
          {Object.entries(conteoPorUsuario).sort((a, b) => b[1] - a[1]).map(([usuario, count]) => (
            <li key={usuario}>{usuario}: {count} usos</li>
          ))}
        </ul>
      </div>
      <div className="mb-6">
        <h3 className="font-semibold text-black mb-2">Usos por fecha</h3>
        <ul className="list-disc ml-6 text-black">
          {Object.entries(conteoPorFecha).sort().map(([fecha, count]) => (
            <li key={fecha}>{fecha}: {count} usos</li>
          ))}
        </ul>
        {}
        <div className="mt-4 p-4 bg-gray-100 rounded text-gray-500">[Gráfico dinámico aquí]</div>
      </div>
    </div>
  );
}