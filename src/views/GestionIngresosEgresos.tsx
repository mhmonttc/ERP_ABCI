import React, { useEffect, useState } from "react";

export default function GestionIngresosEgresos() {
  const [sucursales, setSucursales] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [movimientos, setMovimientos] = useState<any[]>([]);
  const [form, setForm] = useState({
    sucursalId: "",
    tipo: "ingreso",
    motivo: "",
    productoId: "",
    cantidad: "",
    fecha: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetch("/api/sucursales")
      .then(res => res.json())
      .then(data => setSucursales(data.filter((s: any) => s.enabled)));
    
    
    
    
  }, []);

  useEffect(() => {
    if (form.sucursalId) {
      fetch(`/api/productos/by-sucursal/${form.sucursalId}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setProductos(data);
          } else {
            setProductos([]);
          }
        })
        .catch(() => setProductos([]));
    } else {
      setProductos([]);
    }
  }, [form.sucursalId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prevForm => {
      const newForm = { ...prevForm, [name]: value };
      if (name === "sucursalId") {
        newForm.productoId = ""; 
      }
      return newForm;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/ingresos-egresos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        cantidad: parseInt(form.cantidad, 10),
        productoId: parseInt(form.productoId, 10),
        sucursalId: parseInt(form.sucursalId, 10),
      }),
    });

    if (res.ok) {
      const nuevoMovimiento = await res.json();
      setMovimientos([...movimientos, nuevoMovimiento]);
      setForm({
        sucursalId: "",
        tipo: "ingreso",
        motivo: "",
        productoId: "",
        cantidad: "",
        fecha: new Date().toISOString().split('T')[0],
      });
    } else {
      alert("Error al crear el movimiento");
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-black">Registrar Ingreso/Egreso</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-black font-medium">Sucursal</label>
          <select name="sucursalId" value={form.sucursalId} onChange={handleChange} className="w-full border rounded p-2 text-black" required>
            <option value="">Seleccione</option>
            {sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-black font-medium">Producto</label>
          <select name="productoId" value={form.productoId} onChange={handleChange} className="w-full border rounded p-2 text-black" required>
            <option value="">Seleccione</option>
            {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-black font-medium">Tipo de Movimiento</label>
          <select name="tipo" value={form.tipo} onChange={handleChange} className="w-full border rounded p-2 text-black" required>
            <option value="ingreso">Ingreso</option>
            <option value="egreso">Egreso</option>
            <option value="mermado">Mermado</option>
            <option value="perdido">Perdido</option>
          </select>
        </div>
        <div>
          <label className="block text-black font-medium">Motivo</label>
          <input name="motivo" value={form.motivo} onChange={handleChange} className="w-full border rounded p-2 text-black" required />
        </div>
        <div>
          <label className="block text-black font-medium">Cantidad</label>
          <input name="cantidad" type="number" min="1" value={form.cantidad} onChange={handleChange} className="w-full border rounded p-2 text-black" required />
        </div>
        <div>
          <label className="block text-black font-medium">Fecha</label>
          <input name="fecha" type="date" value={form.fecha} onChange={handleChange} className="w-full border rounded p-2 text-black" required />
        </div>
        <div className="md:col-span-2">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full">Registrar Movimiento</button>
        </div>
      </form>

      <h2 className="text-2xl font-bold mb-4 text-black">Historial de Movimientos</h2>
      <table className="w-full border text-black">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Fecha</th>
            <th className="p-2 border">Tipo</th>
            <th className="p-2 border">Motivo</th>
            <th className="p-2 border">Producto</th>
            <th className="p-2 border">Cantidad</th>
            <th className="p-2 border">Sucursal</th>
          </tr>
        </thead>
        <tbody>
          {movimientos.map((m, idx) => (
            <tr key={idx} className="text-center">
              <td className="border p-2">{new Date(m.fecha).toLocaleDateString()}</td>
              <td className="border p-2">{m.tipo}</td>
              <td className="border p-2">{m.motivo}</td>
              <td className="border p-2">{productos.find(p => p.id === m.productoId)?.nombre}</td>
              <td className="border p-2">{m.cantidad}</td>
              <td className="border p-2">{sucursales.find(s => s.id === m.sucursalId)?.nombre}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
