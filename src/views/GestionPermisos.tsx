import React, { useEffect, useState } from "react";

const permisosMenu = [
  { label: "Ventas", submenus: ["Caja", "Gestión de existencias", "Gestión de productos", "Gestión de ingresos/egresos"] },
  { label: "Sucursales", submenus: ["Administrador de Sucursales"] },
  { label: "Fidelización", submenus: ["Administrador de campañas", "Administrador de cupones"] },
  { label: "Colaboradores", submenus: ["Habilidades o Skills", "Gestión de Colaboradores", "Liquidaciones", "Gestión de permisos"] },
  { label: "Calendario", submenus: ["Gestión de Agendamientos", "Nuevo Agendamiento"] },
  { label: "Reportes", submenus: ["Análisis fidelización"] },
  { label: "Administración", submenus: ["Gestión de usuarios web"] },
];

type Permisos = Record<string, string[]>;

export default function GestionPermisos() {
  const [sucursales, setSucursales] = useState<{ id: number; nombre: string }[]>([]);
  const [colaboradores, setColaboradores] = useState<{ id: number; nombre: string; sucursalId: number }[]>([]);
  const [sucursal, setSucursal] = useState("");
  const [colaborador, setColaborador] = useState("");
  const [permisos, setPermisos] = useState<Permisos>({});

  useEffect(() => {
    fetch("/api/sucursales").then(res => res.json()).then(setSucursales);
    fetch("/api/colaboradores").then(res => res.json()).then(setColaboradores);
  }, []);

  useEffect(() => {
    if (colaborador) {
      fetch(`/api/permisos?colaboradorId=${colaborador}`)
        .then(res => res.json())
        .then(data => setPermisos(data || {}));
    } else {
      setPermisos({});
    }
  }, [colaborador]);

  const handleCheck = (menu: string, submenu: string) => {
    setPermisos((prev) => {
      const actual = prev[menu] || [];
      if (actual.includes(submenu)) {
        return { ...prev, [menu]: actual.filter((s) => s !== submenu) };
      } else {
        return { ...prev, [menu]: [...actual, submenu] };
      }
    });
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!colaborador) return;
    await fetch("/api/permisos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ colaboradorId: Number(colaborador), permisos })
    });
    alert("Permisos guardados");
  };

  const colaboradoresFiltrados = sucursal ? colaboradores.filter(c => c.sucursalId == Number(sucursal)) : [];

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-black">Gestión de Permisos de Colaboradores</h2>
      <form onSubmit={handleGuardar} className="space-y-4">
        <div>
          <label className="block text-black font-medium">Sucursal</label>
          <select value={sucursal} onChange={e => { setSucursal(e.target.value); setColaborador(""); }} className="border rounded p-2 text-black" required>
            <option value="">Seleccione</option>
            {sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
          </select>
        </div>
        {sucursal && (
          <div>
            <label className="block text-black font-medium">Colaborador</label>
            <select value={colaborador} onChange={e => setColaborador(e.target.value)} className="border rounded p-2 text-black" required>
              <option value="">Seleccione</option>
              {colaboradoresFiltrados.map((c) => <option key={c.id} value={c.id}>{c.id} - {c.nombre}</option>)}
            </select>
          </div>
        )}
        {colaborador && (
          <div className="border rounded p-4 bg-gray-50">
            <h3 className="font-semibold mb-2 text-black">Permisos actuales</h3>
            {permisosMenu.map(menu => (
              <div key={menu.label} className="mb-2">
                <div className="font-medium text-black">{menu.label}</div>
                <div className="ml-4 flex flex-wrap gap-4">
                  {menu.submenus.map(sub => (
                    <label key={sub} className="flex items-center gap-2 text-black">
                      <input
                        type="checkbox"
                        checked={permisos[menu.label]?.includes(sub) || false}
                        onChange={() => handleCheck(menu.label, sub)}
                      />
                      {sub}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded mt-4">Guardar</button>
      </form>
    </div>
  );
}
