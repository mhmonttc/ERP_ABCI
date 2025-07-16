import React, { useState, useEffect } from "react";

interface Sucursal {
  id: number;
  nombre: string;
  
}

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  precio: number;
  stock: number;
  sucursalId: number;
  codigo: string;
  fechaIngreso: string;
  estado?: string; 
  cantidadMovimiento?: number; 
}

interface StockAgrupadoItem {
  id: number;
  nombre: string;
  [key: string]: number | string; 
}

const estados = ["bodega", "disponible", "dañado", "servicio tecnico", "mermado"];

export default function GestionExistencias() {
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [selectedSucursalId, setSelectedSucursalId] = useState<number>(0); 
  const [stockPorProductoYEstado, setStockPorProductoYEstado] = useState<Record<number, StockAgrupadoItem>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        
        const sucursalesRes = await fetch("/api/sucursales");
        const sucursalesData: Sucursal[] = await sucursalesRes.json();
        setSucursales(sucursalesData);

        
        const productosRes = await fetch("/api/productos");
        const productosData: Producto[] = await productosRes.json();
        setProductos(productosData);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    
    const calcularStock = () => {
      const stockAgrupado: Record<number, StockAgrupadoItem> = {};

      const productosFiltrados = selectedSucursalId === 0
        ? productos
        : productos.filter(p => p.sucursalId === selectedSucursalId);

      productosFiltrados.forEach(producto => {
        if (!stockAgrupado[producto.id]) {
          stockAgrupado[producto.id] = { id: producto.id, nombre: producto.nombre };
          estados.forEach(estado => {
            stockAgrupado[producto.id][estado] = 0;
          });
        }
        
        if (producto.estado && estados.includes(producto.estado) && producto.cantidadMovimiento !== undefined) {
          (stockAgrupado[producto.id][producto.estado] as number) += producto.cantidadMovimiento;
        }
      });
      setStockPorProductoYEstado(stockAgrupado);
    };

    calcularStock();
  }, [productos, selectedSucursalId]);

  const productosUnicos = Object.values(stockPorProductoYEstado);

  return (
    <div className="max-w-3xl mx-auto mt-8 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-black">Gestión de Existencias</h2>
      <div className="mb-4">
        <label className="mr-2 text-black">Sucursal:</label>
        <select
          className="border rounded px-3 py-2 text-black"
          value={selectedSucursalId}
          onChange={e => setSelectedSucursalId(Number(e.target.value))}
        >
          <option value={0}>Todas</option>
          {sucursales.map(s => (
            <option key={s.id} value={s.id}>{s.nombre}</option>
          ))}
        </select>
      </div>
      <table className="w-full border text-black">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Producto</th>
            {estados.map(estado => (
              <th key={estado} className="p-2 border capitalize">{estado}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {productosUnicos.map(producto => (
            <tr key={producto.id}>
              <td className="p-2 border">{producto.nombre}</td>
              {estados.map(estado => (
                <td key={estado} className="p-2 border">{producto[estado] || 0}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
