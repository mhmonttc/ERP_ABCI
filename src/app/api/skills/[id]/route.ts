import { NextRequest, NextResponse } from "next/server";
import { editSkill, removeSkill } from '../../../../services/skillsService';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const skill = await editSkill(params.id, body);
    return NextResponse.json(skill);
  } catch (error) {
    console.error('Error en PUT /api/skills/[id]:', error);
    
    if (error instanceof Error && error.message === 'El nombre es obligatorio') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Error interno del servidor', details: String(error) }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await removeSkill(params.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error en DELETE /api/skills/[id]:', error);
    return NextResponse.json({ error: 'Error interno del servidor', details: String(error) }, { status: 500 });
  }
}
