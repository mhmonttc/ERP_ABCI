import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getConnection } from '@/app/db/mssql';
import sql from 'mssql';

export async function POST(request: Request) {
  try {
    const { nombre, email, telefono, password } = await request.json();

    if (!nombre || !email || !password) {
      return NextResponse.json({ message: 'Todos los campos son obligatorios, excepto el teléfono.' }, { status: 400 });
    }

    const pool = await getConnection();
    const userExistsResult = await pool.request()
      .input('email', sql.VarChar, email)
      .query('SELECT * FROM Clientes WHERE email = @email');

    if (userExistsResult.recordset.length > 0) {
      return NextResponse.json({ message: 'El correo electrónico ya está registrado.' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const nameParts = nombre.split(' ');
    const nombreValue = nameParts.shift() || '';
    const apellidoValue = nameParts.join(' ');

    const result = await pool.request()
      .input('nombre', sql.VarChar, nombreValue)
      .input('apellido', sql.VarChar, apellidoValue)
      .input('email', sql.VarChar, email)
      .input('telefono', sql.VarChar, telefono || null)
      .input('password', sql.VarChar, hashedPassword)
      .query(`
        INSERT INTO Clientes (nombre, apellido, email, telefono, password, fechaRegistro) 
        OUTPUT inserted.id, inserted.nombre, inserted.apellido, inserted.email, inserted.telefono, inserted.fechaRegistro
        VALUES (@nombre, @apellido, @email, @telefono, @password, GETDATE())
      `);

    const newUser = result.recordset[0];

    return NextResponse.json(newUser);
  } catch (error) {
    console.error('Error en el registro:', error);
    return NextResponse.json({ message: 'Error en el servidor' }, { status: 500 });
  }
}
