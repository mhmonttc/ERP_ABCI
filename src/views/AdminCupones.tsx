import React, { useState, useEffect } from "react";

interface Regla {
  campo: string;
  operador: string;
  valor: string;
}

interface Cupon {
  id?: string;
  nombre: string;
  textoCupon: string;
  reglas: Regla[];
  montoDescuento?: number;
  limiteUsoTotal?: number;
  clienteId?: number | null;
}

interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  
}

const campos = [
  { value: "fecha", label: "Fecha" },
  { value: "rut", label: "RUT Cliente" },
  { value: "montoCompra", label: "Monto Compra" },
  { value: "montoServicio", label: "Monto Servicio" },
  { value: "claseServicio", label: "Clase Servicio" },
  { value: "medioPago", label: "Medio de Pago" },
];

const operadores = [
  { value: "=", label: "Igual a" },
  { value: ">", label: "Mayor que" },
  { value: "<", label: "Menor que" },
  { value: "contiene", label: "Contiene" },
];

export default function AdminCupones() {
  const [cupones, setCupones] = useState<Cupon[]>([]);
  const [nombre, setNombre] = useState("");
  const [textoCupon, setTextoCupon] = useState("");
  const [montoDescuento, setMontoDescuento] = useState<number | ''>('');
  const [limiteUsoTotal, setLimiteUsoTotal] = useState<number | ''>('');
  const [clienteId, setClienteId] = useState<number | ''>('');
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [reglas, setReglas] = useState<Regla[]>([]);
  const [editingCupon, setEditingCupon] = useState<Cupon | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cuponesRes = await fetch("/api/cupones");
        const cuponesData: Cupon[] = (await cuponesRes.json()) || [];
        setCupones(cuponesData);

        const clientesRes = await fetch("/api/clientes");
        const clientesData: Cliente[] = (await clientesRes.json()) || [];
        setClientes(clientesData);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      }
    };
    fetchData();
  }, []);

  const agregarRegla = () => {
    setReglas([...reglas, { campo: "fecha", operador: "=", valor: "" }]);
  };

  const actualizarRegla = (idx: number, key: keyof Regla, value: string) => {
    const nuevas = reglas.map((r, i) => i === idx ? { ...r, [key]: value } : r);
    setReglas(nuevas);
  };

  const eliminarRegla = (idx: number) => {
    setReglas(reglas.filter((_, i) => i !== idx));
  };

  const resetForm = () => {
    setNombre("");
    setTextoCupon("");
    setMontoDescuento('');
    setLimiteUsoTotal('');
    setClienteId('');
    setReglas([]);
    setEditingCupon(null);
  };

  const crearCupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !textoCupon) return;

    const cuponData = {
      nombre,
      textoCupon,
      montoDescuento: montoDescuento === '' ? undefined : Number(montoDescuento),
      limiteUsoTotal: limiteUsoTotal === '' ? undefined : Number(limiteUsoTotal),
      clienteId: clienteId === '' ? null : Number(clienteId),
      reglas,
    };

    const res = await fetch("/api/cupones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cuponData)
    });
    if (res.ok) {
      const nuevo = await res.json();
      setCupones([...cupones, nuevo]);
      resetForm();
    }
  };

  const actualizarCupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCupon || !nombre || !textoCupon) return;

    const cuponData = {
      id: editingCupon.id,
      nombre,
      textoCupon,
      montoDescuento: montoDescuento === '' ? undefined : Number(montoDescuento),
      limiteUsoTotal: limiteUsoTotal === '' ? undefined : Number(limiteUsoTotal),
      clienteId: clienteId === '' ? null : Number(clienteId),
      reglas,
    };

    const res = await fetch(`/api/cupones/${editingCupon.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cuponData)
    });
    if (res.ok) {
      const actualizado = await res.json();
      setCupones(cupones.map(c => c.id === actualizado.id ? actualizado : c));
      resetForm();
    }
  };

  const eliminarCupon = async (id: string) => {
    const res = await fetch(`/api/cupones/${id}`, { method: "DELETE" });
    if (res.ok) setCupones(cupones.filter(c => c.id !== id));
  };

  const editarCupon = (cupon: Cupon) => {
    setEditingCupon(cupon);
    setNombre(cupon.nombre);
    setTextoCupon(cupon.textoCupon);
    setMontoDescuento(cupon.montoDescuento ?? '');
    setLimiteUsoTotal(cupon.limiteUsoTotal ?? '');
    setClienteId(cupon.clienteId ?? '');
    setReglas(cupon.reglas || []);
  };

  return (
    <div className="max-w-3xl mx-auto mt-8 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-black">{editingCupon ? "Editar Cupón" : "Administrador de Cupones"}</h2>
      <form onSubmit={editingCupon ? actualizarCupon : crearCupon} className="space-y-4">
        <div>
          <label className="block text-black font-semibold mb-1">Nombre del cupón</label>
          <input type="text" className="border rounded px-3 py-2 w-full text-black" value={nombre} onChange={e => setNombre(e.target.value)} required />
        </div>
        <div>
          <label className="block text-black font-semibold mb-1">Texto del cupón</label>
          <input type="text" className="border rounded px-3 py-2 w-full text-black" value={textoCupon} onChange={e => setTextoCupon(e.target.value)} required />
        </div>
        <div>
          <label className="block text-black font-semibold mb-1">Monto de Descuento</label>
          <input type="number" step="0.01" className="border rounded px-3 py-2 w-full text-black" value={montoDescuento} onChange={e => setMontoDescuento(Number(e.target.value))} placeholder="Ej: 10.50" />
        </div>
        <div>
          <label className="block text-black font-semibold mb-1">Límite de Uso Total</label>
          <input type="number" className="border rounded px-3 py-2 w-full text-black" value={limiteUsoTotal} onChange={e => setLimiteUsoTotal(Number(e.target.value))} placeholder="Ej: 50" />
        </div>
        <div>
          <label className="block text-black font-semibold mb-1">Cliente Específico (Opcional)</label>
          <select
            className="border rounded px-3 py-2 w-full text-black"
            value={clienteId}
            onChange={e => setClienteId(Number(e.target.value))}
          >
            <option value="">Todos los clientes</option>
            {clientes.map(c => (
              <option key={c.id} value={c.id}>{c.nombre} {c.apellido} ({c.email})</option>
            ))}
          </select>
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
              <input className="border rounded px-2 py-1 text-black" value={regla.valor} onChange={e => actualizarRegla(idx, "valor", e.target.value)} placeholder="Valor" />
              <button type="button" className="text-red-500 font-bold px-2" onClick={() => eliminarRegla(idx)}>X</button>
            </div>
          ))}
          <button type="button" className="bg-blue-500 text-white px-3 py-1 rounded mt-2" onClick={agregarRegla}>Agregar regla</button>
        </div>
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded font-bold">{editingCupon ? "Actualizar Cupón" : "Crear cupón"}</button>
        {editingCupon && (
          <button type="button" className="bg-gray-500 text-white px-4 py-2 rounded font-bold ml-2" onClick={resetForm}>Cancelar Edición</button>
        )}
      </form>
      <div className="mt-8">
        <h3 className="text-lg font-bold mb-2 text-black">Cupones creados</h3>
        {cupones.length === 0 ? <div className="text-gray-400">No hay cupones registrados</div> : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b text-left text-black">Nombre</th>
                  <th className="py-2 px-4 border-b text-left text-black">Texto</th>
                  <th className="py-2 px-4 border-b text-left text-black">Descuento</th>
                  <th className="py-2 px-4 border-b text-left text-black">Límite</th>
                  <th className="py-2 px-4 border-b text-left text-black">Cliente</th>
                  <th className="py-2 px-4 border-b text-left text-black">Reglas</th>
                  <th className="py-2 px-4 border-b text-left text-black">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cupones.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b text-black">{c.nombre}</td>
                    <td className="py-2 px-4 border-b text-black">{c.textoCupon}</td>
                    <td className="py-2 px-4 border-b text-black">{c.montoDescuento !== undefined && c.montoDescuento !== null ? `$${c.montoDescuento}` : 'N/A'}</td>
                    <td className="py-2 px-4 border-b text-black">{c.limiteUsoTotal !== undefined && c.limiteUsoTotal !== null ? c.limiteUsoTotal : 'N/A'}</td>
                    <td className="py-2 px-4 border-b text-black">{c.clienteId !== undefined && c.clienteId !== null ? (clientes.find(cli => cli.id === c.clienteId)?.nombre || 'Desconocido') : 'Todos'}</td>
                    <td className="py-2 px-4 border-b text-black">
                      <ul className="list-disc list-inside">
                        {(c.reglas || []).map((r, j) => (
                          <li key={j}>{campos.find(ca => ca.value === r.campo)?.label} {operadores.find(op => op.value === r.operador)?.label} {r.valor}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="py-2 px-4 border-b text-black">
                      <button onClick={() => editarCupon(c)} className="text-blue-500 hover:text-blue-700 mr-2" title="Editar">
                        <i className="bi bi-pencil-square"></i>
                      </button>
                      <button onClick={() => eliminarCupon(c.id!)} className="text-red-500 hover:text-red-700" title="Eliminar">
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
