import { NextResponse } from 'next/server';
import { getConnection } from '../../../db/mssql';
import sql from 'mssql';
import bcrypt from 'bcryptjs';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { nombre, apellido, email, telefono, password } = body;
    const pool = await getConnection();

    if (password) {
      
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.request()
        .input('id', sql.Int, id)
        .input('password', sql.NVarChar, hashedPassword)
        .query('UPDATE Clientes SET password = @password WHERE id = @id');
      return NextResponse.json({ message: 'Contraseña actualizada correctamente.' });
    } else {
      
      await pool.request()
        .input('id', sql.Int, id)
        .input('nombre', sql.NVarChar, nombre)
        .input('apellido', sql.NVarChar, apellido)
        .input('email', sql.NVarChar, email)
        .input('telefono', sql.NVarChar, telefono)
        .query('UPDATE Clientes SET nombre = @nombre, apellido = @apellido, email = @email, telefono = @telefono WHERE id = @id');
      return NextResponse.json({ message: 'Cliente actualizado correctamente.' });
    }
  } catch (error) {
    console.error('Error al actualizar el cliente:', error);
    return NextResponse.json({ error: 'Error interno del servidor al actualizar el cliente' }, { status: 500 });
  }
}
