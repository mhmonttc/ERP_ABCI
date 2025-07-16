import sql from 'mssql';
import { getConnection } from '../app/db/mssql';

export async function getClientes() {
    const pool = await getConnection();
    const result = await pool.request().query('SELECT id, nombre, apellido, email, fechaRegistro, telefono, direccion FROM Clientes ORDER BY fechaRegistro DESC');
    return result.recordset;
}