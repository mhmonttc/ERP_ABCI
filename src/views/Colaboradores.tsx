"use client";
import React, { useEffect, useState } from "react";

const initialForm = {
  nombreCompleto: "",
  rut: "",
  email: "",
  password: "",
  nacimiento: "",
  telefono: "",
  sucursal: "",
  skills: [] as number[] 
};
const PAGE_SIZE = 10;

function validarRut(rut: string) {
  rut = rut.replace(/[^0-9kK]/g, "");
  if (rut.length < 8) return false;
  let cuerpo = rut.slice(0, -1);
  let dv = rut.slice(-1).toUpperCase();
  let suma = 0,
    multiplo = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i]) * multiplo;
    multiplo = multiplo < 7 ? multiplo + 1 : 2;
  }
  let dvEsperadoNum = 11 - (suma % 11);
  let dvEsperado = dvEsperadoNum === 11 ? "0" : dvEsperadoNum === 10 ? "K" : dvEsperadoNum.toString();
  return dv == dvEsperado;
}

export default function Colaboradores() {
  const [form, setForm] = useState(initialForm);
  const [colaboradores, setColaboradores] = useState<any[]>([]);
  const [sucursales, setSucursales] = useState<{ id: number; nombre: string }[]>([]);
  const [skills, setSkills] = useState<{ id: number; nombre: string }[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [rutError, setRutError] = useState("");
  const totalPages = Math.ceil(colaboradores.length / PAGE_SIZE);

  useEffect(() => {
    fetch("/api/sucursales")
      .then(res => res.json())
      .then(data => setSucursales(data));
    fetch("/api/colaboradores")
      .then(res => res.json())
      .then(data => setColaboradores(data));
    fetch("/api/skills")
      .then(res => res.json())
      .then(data => setSkills(data.filter((s: any) => s.habilitado)));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, multiple, options } = e.target as any;
    if (name === "rut") {
      setForm(f => ({ ...f, rut: value }));
      if (value && !validarRut(value)) setRutError("RUT inválido");
      else setRutError("");
    } else if (name === "skills" && multiple) {
      const selected = Array.from(options).filter((o: any) => o.selected).map((o: any) => Number(o.value));
      setForm(f => ({ ...f, skills: selected }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rutError || !form.rut || !validarRut(form.rut)) return;
    let res;
    const payload = { ...form, skills: form.skills };
    if (editId !== null) {
      res = await fetch(`/api/colaboradores/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } else {
      res = await fetch("/api/colaboradores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    }
    if (res.ok) {
      const nuevo = await res.json();
      if (editId !== null) {
        setColaboradores(colaboradores.map(c => c.id === editId ? nuevo : c));
      } else {
        setColaboradores([...colaboradores, nuevo]);
      }
      setForm(initialForm);
      setPage(1);
      setRutError("");
      setEditId(null);
    }
  };

  const handleEdit = (id: number) => {
    const colab = colaboradores.find(c => c.id === id);
    if (colab) {
      setForm({ ...colab, skills: colab.skills ? colab.skills.map((s: any) => s.id) : [] });
      setEditId(id);
    }
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/colaboradores/${id}`, { method: "DELETE" });
    if (res.ok) setColaboradores(colaboradores.filter(c => c.id !== id));
    setForm(initialForm);
    setEditId(null);
  };

  const paginatedColabs = colaboradores.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="max-w-3xl mx-auto mt-8 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-black">Administración de Colaboradores</h2>
      <p className="mb-4 text-black">Complete el siguiente formulario para registrar un nuevo colaborador:</p>
      <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-black font-semibold mb-1">Nombre completo</label>
          <input type="text" name="nombreCompleto" className="border rounded px-3 py-2 w-full text-black" value={form.nombreCompleto} onChange={handleChange} required />
        </div>
        <div>
          <label className="block text-black font-semibold mb-1">RUT</label>
          <input type="text" name="rut" className="border rounded px-3 py-2 w-full text-black" value={form.rut} onChange={handleChange} required />
          {rutError && <span className="text-red-600 text-sm">{rutError}</span>}
        </div>
        <div>
          <label className="block text-black font-semibold mb-1">Correo electrónico</label>
          <input type="email" name="email" className="border rounded px-3 py-2 w-full text-black" value={form.email} onChange={handleChange} required />
        </div>
        <div>
          <label className="block text-black font-semibold mb-1">Contraseña</label>
          <input type="password" name="password" className="border rounded px-3 py-2 w-full text-black" value={form.password} onChange={handleChange} required />
        </div>
        <div>
          <label className="block text-black font-semibold mb-1">Fecha de nacimiento</label>
          <input type="date" name="nacimiento" className="border rounded px-3 py-2 w-full text-black" value={form.nacimiento} onChange={handleChange} required />
        </div>
        <div>
          <label className="block text-black font-semibold mb-1">Teléfono de contacto</label>
          <input type="tel" name="telefono" className="border rounded px-3 py-2 w-full text-black" value={form.telefono} onChange={handleChange} required />
        </div>
        <div className="md:col-span-2">
          <label className="block text-black font-semibold mb-1">Sucursal</label>
          <select name="sucursal" className="border rounded px-3 py-2 w-full text-black" value={form.sucursal} onChange={handleChange} required>
            <option value="">-- Seleccione sucursal --</option>
            {sucursales.map(s => (
              <option key={s.id} value={s.id}>{s.nombre}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-black font-semibold mb-1">Skills habilitadas</label>
          <select name="skills" multiple className="border rounded px-3 py-2 w-full text-black" value={form.skills.map(String)} onChange={handleChange}>
            {skills.map(s => (
              <option key={s.id} value={s.id}>{s.nombre}</option>
            ))}
          </select>
          <span className="text-xs text-gray-500">Ctrl+Click para seleccionar varias</span>
        </div>
        <div className="md:col-span-2 flex justify-end">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700">
            {editId !== null ? "Actualizar Colaborador" : "Guardar Colaborador"}
          </button>
        </div>
      </form>
      <h3 className="text-lg font-bold mb-2 text-black">Colaboradores registrados</h3>
      <table className="min-w-full border mt-4">
        <thead>
          <tr>
            <th className="border px-2 py-1 text-black">Nombre completo</th>
            <th className="border px-2 py-1 text-black">RUT</th>
            <th className="border px-2 py-1 text-black">Correo</th>
            <th className="border px-2 py-1 text-black">Sucursal</th>
            <th className="border px-2 py-1 text-black">Skills</th>
            <th className="border px-2 py-1 text-black">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {paginatedColabs.length === 0 ? (
            <tr><td colSpan={6} className="text-center text-gray-400 py-2">No hay colaboradores registrados</td></tr>
          ) : (
            paginatedColabs.map(colab => (
              <tr key={colab.id}>
                <td className="border px-2 py-1 text-black">{colab.nombreCompleto}</td>
                <td className="border px-2 py-1 text-black">{colab.rut}</td>
                <td className="border px-2 py-1 text-black">{colab.email}</td>
                <td className="border px-2 py-1 text-black">{sucursales.find(s => s.id == colab.sucursal)?.nombre || ""}</td>
                <td className="border px-2 py-1 text-black">{colab.skills && colab.skills.length > 0 ? colab.skills.map((s: any) => s.nombre).join(", ") : ""}</td>
                <td className="border px-2 py-1 text-black flex gap-2 justify-center">
                  <button onClick={() => handleEdit(colab.id)} title="Editar" className="text-blue-600 hover:text-blue-800">
                    <svg xmlns="http:
                  </button>
                  <button onClick={() => handleDelete(colab.id)} title="Eliminar" className="text-red-600 hover:text-red-800">
                    <svg xmlns="http:
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-2 py-1 rounded bg-gray-200 disabled:opacity-50">Anterior</button>
          <span className="px-2 py-1">Página {page} de {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-2 py-1 rounded bg-gray-200 disabled:opacity-50">Siguiente</button>
        </div>
      )}
    </div>
  );
}