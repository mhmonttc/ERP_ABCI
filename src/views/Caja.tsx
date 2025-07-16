"use client";
import React, { useState, useEffect } from "react";

interface Sucursal {
  id: number;
  nombre: string;
}

export default function Caja() {
  const [items, setItems] = useState<any[]>([]);
  const [code, setCode] = useState("");
  const [product, setProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [selectedSucursalId, setSelectedSucursalId] = useState<number | string>("");

  useEffect(() => {
    
    fetch("/api/sucursales")
      .then((res) => res.json())
      .then((data: Sucursal[]) => {
        if (Array.isArray(data)) {
          setSucursales(data);
          if (data.length > 0) {
            setSelectedSucursalId(data[0].id); 
          }
        }
      });
  }, []);

  const fetchProduct = async () => {
    if (!code.trim() || !selectedSucursalId) {
        setError("Por favor, selecciona una sucursal y un código de producto.");
        return;
    }
    const res = await fetch(`/api/productos?code=${code.trim().toUpperCase()}&sucursalId=${selectedSucursalId}`);
    if (res.ok) {
      const found = await res.json();
      if (found) {
        setProduct(found);
        setError("");
      } else {
        setProduct(null);
        setError("Producto no encontrado en esta sucursal.");
      }
    } else {
      setProduct(null);
      setError("Error al buscar el producto.");
    }
  };

  const addItem = () => {
    if (!product || !quantity || isNaN(Number(quantity)) || Number(quantity) < 1) return;
    const idx = items.findIndex(i => i.code === product.code);
    let newItems;
    if (idx !== -1) {
      newItems = [...items];
      newItems[idx].quantity += Number(quantity);
    } else {
      newItems = [...items, { ...product, quantity: Number(quantity) }];
    }
    setItems(newItems);
    setTotal(newItems.reduce((sum, item) => sum + item.price * item.quantity, 0));
    setProduct(null);
    setCode("");
    setQuantity(1);
  };

  const removeItem = (idx: number) => {
    const newItems = items.filter((_, i) => i !== idx);
    setItems(newItems);
    setTotal(newItems.reduce((sum, item) => sum + item.price * item.quantity, 0));
  };

  const increaseQty = (idx: number) => {
    const newItems = [...items];
    newItems[idx].quantity += 1;
    setItems(newItems);
    setTotal(newItems.reduce((sum, item) => sum + item.price * item.quantity, 0));
  };

  const decreaseQty = (idx: number) => {
    const newItems = [...items];
    if (newItems[idx].quantity > 1) {
      newItems[idx].quantity -= 1;
      setItems(newItems);
      setTotal(newItems.reduce((sum, item) => sum + item.price * item.quantity, 0));
    }
  };

  const finalizarVenta = async () => {
    if (items.length === 0 || !selectedSucursalId) return;
    const res = await fetch("/api/ventas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items, total, sucursalId: selectedSucursalId, fecha: new Date().toISOString() })
    });
    if (res.ok) {
      alert("Venta registrada correctamente");
      setItems([]);
      setTotal(0);
      setShowPaymentOptions(false);
    } else {
      const errorData = await res.json();
      alert(`Error al registrar la venta: ${errorData.message}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6 mt-8">
      <h2 className="text-xl font-bold mb-4 text-black">Caja Registradora</h2>
      
      <div className="mb-4">
        <label htmlFor="sucursal-select" className="block text-black font-semibold mb-1">Sucursal</label>
        <select
          id="sucursal-select"
          className="border rounded px-3 py-2 w-full text-black"
          value={selectedSucursalId}
          onChange={(e) => setSelectedSucursalId(Number(e.target.value))}
        >
          <option value="" disabled>Selecciona una sucursal</option>
          {sucursales.map((s) => (
            <option key={s.id} value={s.id}>{s.nombre}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 mb-4 items-end">
        <input
          type="text"
          placeholder="Código del producto"
          value={code}
          onChange={e => setCode(e.target.value)}
          className="border rounded px-3 py-2 flex-1 text-black"
          disabled={!selectedSucursalId}
        />
        <button
          onClick={fetchProduct}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          disabled={!selectedSucursalId}
        >Traer</button>
        <input
          type="number"
          placeholder="1"
          value={quantity}
          min={1}
          onChange={e => setQuantity(Number(e.target.value))}
          className="border rounded px-3 py-2 w-20 text-center text-black"
          disabled={!product}
        />
        <button
          onClick={addItem}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          disabled={!product}
        >Agregar</button>
      </div>
      {error && <div className="text-red-500 mb-2 text-black">{error}</div>}
      {}
      <div className="mb-4">
        <h3 className="font-semibold mb-2 text-black">Productos en la compra</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm text-black">
            <thead>
              <tr className="bg-[#e0f7fa] text-black">
                <th className="px-2 py-1 border">Código</th>
                <th className="px-2 py-1 border">Nombre</th>
                <th className="px-2 py-1 border">Cantidad</th>
                <th className="px-2 py-1 border">Precio</th>
                <th className="px-2 py-1 border">Subtotal</th>
                <th className="px-2 py-1 border">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item.code} className="text-center text-black">
                  <td className="border px-2 py-1">{item.code}</td>
                  <td className="border px-2 py-1">{item.name}</td>
                  <td className="border px-2 py-1 flex items-center justify-center gap-1">
                    <button onClick={() => decreaseQty(idx)} className="text-gray-600 hover:text-blue-600 px-1" title="Disminuir">-</button>
                    <span className="text-black">{item.quantity}</span>
                    <button onClick={() => increaseQty(idx)} className="text-gray-600 hover:text-blue-600 px-1" title="Aumentar">+</button>
                  </td>
                  <td className="border px-2 py-1">${typeof item.price === 'number' ? item.price.toFixed(2) : 'N/A'}</td>
                  <td className="border px-2 py-1">${(typeof item.price === 'number' && typeof item.quantity === 'number') ? (item.price * item.quantity).toFixed(2) : 'N/A'}</td>
                  <td className="border px-2 py-1">
                    <button onClick={() => removeItem(idx)} className="text-red-500 hover:underline" title="Eliminar">🗑️</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={6} className="text-gray-400 py-2 text-black">No hay productos agregados</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex justify-between font-bold text-lg text-black">
        <span>Total:</span>
        <span>${total.toFixed(2)}</span>
      </div>
      <div className="mt-6 flex justify-end">
        <button
          onClick={finalizarVenta} 
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 font-semibold shadow"
          disabled={items.length === 0}
        >Finalizar venta</button>
      </div>
      {}
    </div>
  );
}
