import sql from 'mssql';
import { getConnection } from '../app/db/mssql';

export async function getPermisosByColaborador(colaboradorId: string) {
    const pool = await getConnection();
    const result = await pool.request()
        .input('colaboradorId', sql.Int, colaboradorId)
        .query('SELECT menus FROM Permisos WHERE colaboradorId = @colaboradorId');
    
    return result.recordset[0] || null;
}

export async function upsertPermisos(colaboradorId: number, permisos: object) {
    const pool = await getConnection();
    const permisosStr = JSON.stringify(permisos);
    
    const existe = await pool.request()
        .input('colaboradorId', sql.Int, colaboradorId)
        .query('SELECT id FROM Permisos WHERE colaboradorId = @colaboradorId');
    
    if (existe.recordset.length > 0) {
        await pool.request()
            .input('colaboradorId', sql.Int, colaboradorId)
            .input('menus', sql.NVarChar, permisosStr)
            .query('UPDATE Permisos SET menus = @menus WHERE colaboradorId = @colaboradorId');
    } else {
        await pool.request()
            .input('colaboradorId', sql.Int, colaboradorId)
            .input('menus', sql.NVarChar, permisosStr)
            .query('INSERT INTO Permisos (colaboradorId, menus) VALUES (@colaboradorId, @menus)');
    }
    
    return true;
}