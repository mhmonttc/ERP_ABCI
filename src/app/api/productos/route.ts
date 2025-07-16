import { NextRequest, NextResponse } from "next/server";
import { fetchProductos, addProducto } from '../../../services/productosService';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const sucursalId = searchParams.get('sucursalId');

  try {
    const productos = await fetchProductos(code, sucursalId);
    if (code && sucursalId) {
      return NextResponse.json(productos);
    } else {
      return NextResponse.json(productos);
    }
  } catch (error) {
    console.error('Error en GET /api/productos:', error);
    return NextResponse.json({ error: 'Error interno del servidor', details: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const nuevoProducto = await addProducto(body);
    return NextResponse.json(nuevoProducto, { status: 201 });
  } catch (error) {
    console.error('Error en POST /api/productos:', error);
    return NextResponse.json({ error: 'Error interno del servidor', details: String(error) }, { status: 500 });
  }
}
