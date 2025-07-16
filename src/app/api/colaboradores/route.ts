import { NextRequest, NextResponse } from "next/server";
import { fetchColaboradores, addColaborador } from '../../../services/colaboradoresService';

export async function GET() {
  try {
    const colaboradores = await fetchColaboradores();
    return NextResponse.json(colaboradores);
  } catch (error) {
    console.error('Error en GET /api/colaboradores:', error);
    return NextResponse.json({ error: 'Error interno del servidor', details: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nombreCompleto, rut, email, password, nacimiento, telefono, sucursal } = body;
    if (!nombreCompleto || !rut || !email || !password || !nacimiento || !telefono || !sucursal) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }
    const nuevoColaborador = await addColaborador(body);
    return NextResponse.json(nuevoColaborador, { status: 201 });
  } catch (error) {
    console.error('Error en POST /api/colaboradores:', error);
    return NextResponse.json({ error: 'Error interno del servidor', details: String(error) }, { status: 500 });
  }
}
