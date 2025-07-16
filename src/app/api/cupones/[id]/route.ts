import { NextRequest, NextResponse } from "next/server";
import { fetchCuponById, editCupon, removeCupon } from '../../../../services/cuponesService';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const cupon = await fetchCuponById(id);

    if (!cupon) {
      return NextResponse.json({ error: 'Cupón no encontrado' }, { status: 404 });
    }
    return NextResponse.json(cupon);
  } catch (error) {
    console.error('Error en GET /api/cupones/[id]:', error);
    return NextResponse.json({ error: 'Error interno del servidor', details: String(error) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    const { nombre, textoCupon, montoDescuento, limiteUsoTotal, clienteId } = body;

    const updated = await editCupon(id, body);

    if (!updated) {
      return NextResponse.json({ error: 'Cupón no encontrado o no se pudo actualizar' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Cupón actualizado correctamente' });
  } catch (error) {
    console.error('Error en PUT /api/cupones/[id]:', error);
    return NextResponse.json({ error: 'Error interno del servidor', details: String(error) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const deleted = await removeCupon(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Cupón no encontrado o no se pudo eliminar' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Cupón eliminado correctamente' });
  } catch (error) {
    console.error('Error en DELETE /api/cupones/[id]:', error);
    return NextResponse.json({ error: 'Error interno del servidor', details: String(error) }, { status: 500 });
  }
}
