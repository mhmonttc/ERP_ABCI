import { NextRequest, NextResponse } from "next/server";
import { editColaborador, removeColaborador } from '../../../../services/colaboradoresService';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { nombreCompleto, rut, email, nacimiento, telefono, sucursal } = body;
    if (!nombreCompleto || !rut || !email || !nacimiento || !telefono || !sucursal) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }
    const colaborador = await editColaborador(params.id, body);
    return NextResponse.json(colaborador);
  } catch (error) {
    console.error('Error en PUT /api/colaboradores/[id]:', error);
    return NextResponse.json({ error: 'Error interno del servidor', details: String(error) }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await removeColaborador(params.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error en DELETE /api/colaboradores/[id]:', error);
    return NextResponse.json({ error: 'Error interno del servidor', details: String(error) }, { status: 500 });
  }
}
