import { NextRequest, NextResponse } from "next/server";
import { fetchProductosBySucursal } from '../../../../../services/productosService';

export async function GET(req: NextRequest, { params }: { params: { sucursalId: string } }) {
  try {
    const { sucursalId } = params;
    if (!sucursalId) {
      return NextResponse.json({ error: 'sucursalId is required' }, { status: 400 });
    }

    const productos = await fetchProductosBySucursal(sucursalId);
    return NextResponse.json(productos);
  } catch (error) {
    console.error('Error en GET /api/productos/by-sucursal:', error);
    return NextResponse.json({ error: 'Error interno del servidor', details: String(error) }, { status: 500 });
  }
}
