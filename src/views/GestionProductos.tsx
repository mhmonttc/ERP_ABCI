import React, { useEffect, useState } from "react";

export default function GestionProductos() {
  const [productos, setProductos] = useState<any[]>([]);
  const [sucursales, setSucursales] = useState<any[]>([]);
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    categoria: "",
    precio: "",
    stock: "",
    sucursalId: "",
    codigo: "",
    fechaIngreso: "",
  });

  useEffect(() => {
    fetch("/api/productos")
      .then(res => res.json())
      .then(data => setProductos(data));
    fetch("/api/sucursales")
      .then(res => res.json())
      .then(data => setSucursales(data.filter((s: any) => s.enabled)));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/productos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      const nuevo = await res.json();
      setProductos([...productos, nuevo]);
      setForm({
        nombre: "",
        descripcion: "",
        categoria: "",
        precio: "",
        stock: "",
        sucursalId: "",
        codigo: "",
        fechaIngreso: "",
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-black">Gestión de Productos</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium text-black">Nombre del producto</label>
          <input name="nombre" value={form.nombre} onChange={handleChange} className="w-full border rounded p-2 text-black" required />
        </div>
        <div>
          <label className="block font-medium text-black">Descripción</label>
          <textarea name="descripcion" value={form.descripcion} onChange={handleChange} className="w-full border rounded p-2 text-black" required />
        </div>
        <div>
          <label className="block font-medium text-black">Categoría</label>
          <select name="categoria" value={form.categoria} onChange={handleChange} className="w-full border rounded p-2 text-black" required>
            <option value="">Seleccione una categoría</option>
            <option value="producto">Producto</option>
            <option value="servicio">Servicio</option>
          </select>
        </div>
        <div>
          <label className="block font-medium text-black">Precio</label>
          <input name="precio" type="number" min="0" value={form.precio} onChange={handleChange} className="w-full border rounded p-2 text-black" required />
        </div>
        <div>
          <label className="block font-medium text-black">Stock a ingresar</label>
          <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} className="w-full border rounded p-2 text-black" required />
        </div>
        <div>
          <label className="block font-medium text-black">Sucursal</label>
          <select name="sucursalId" value={form.sucursalId} onChange={handleChange} className="w-full border rounded p-2 text-black" required>
            <option value="">Seleccione una sucursal</option>
            {sucursales.map((s: any) => (
              <option key={s.id} value={s.id}>{s.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium text-black">Código de producto</label>
          <input
            name="codigo"
            value={form.codigo}
            onChange={e => {
              
              const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 13);
              setForm({ ...form, codigo: value });
            }}
            className="w-full border rounded p-2 text-black"
            required
            maxLength={13}
            inputMode="numeric"
            pattern="[0-9]*"
            title="Solo números, máximo 13 dígitos"
          />
        </div>
        <div>
          <label className="block font-medium text-black">Fecha de ingreso</label>
          <input name="fechaIngreso" type="date" value={form.fechaIngreso} onChange={handleChange} className="w-full border rounded p-2 text-black" required />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Guardar producto / Ingresar stock</button>
      </form>
    </div>
  );
}
