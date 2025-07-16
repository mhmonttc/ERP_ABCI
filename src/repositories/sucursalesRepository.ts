import sql from 'mssql';
import { getConnection } from '../app/db/mssql';

export async function getSucursales() {
    const pool = await getConnection();
    const result = await pool.request().query("SELECT * FROM Sucursales");
    return result.recordset || [];
}

export async function createSucursal(sucursalData: any) {
    const pool = await getConnection();
    const { nombre, lat, lng, enabled, visible } = sucursalData;
    
    const result = await pool.request()
        .input('nombre', sql.NVarChar, nombre)
        .input('lat', sql.Float, lat)
        .input('lng', sql.Float, lng)
        .input('enabled', sql.Bit, enabled)
        .input('visible', sql.Bit, visible)
        .query(`INSERT INTO Sucursales (nombre, lat, lng, enabled, visible) OUTPUT INSERTED.* VALUES (@nombre, @lat, @lng, @enabled, @visible)`);
    
    return result.recordset[0];
}