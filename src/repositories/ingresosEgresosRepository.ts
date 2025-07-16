import sql from 'mssql';
import { getConnection } from '../app/db/mssql';

export async function createIngresoEgreso(data: any) {
    const { sucursalId, tipo, motivo, productoId, cantidad, fecha } = data;
    
    const transaction = new sql.Transaction(await getConnection());
    
    try {
        await transaction.begin();

        const incomeRequest = new sql.Request(transaction);
        incomeRequest.input('sucursalId', sql.Int, sucursalId);
        incomeRequest.input('tipo', sql.NVarChar, tipo);
        incomeRequest.input('motivo', sql.NVarChar, motivo);
        incomeRequest.input('productoId', sql.Int, productoId);
        incomeRequest.input('cantidad', sql.Int, cantidad);
        incomeRequest.input('fecha', sql.Date, fecha);

        const result = await incomeRequest.query(`
            INSERT INTO IngresosEgresos (sucursalId, tipo, motivo, productoId, cantidad, fecha) 
            OUTPUT INSERTED.*
            VALUES (@sucursalId, @tipo, @motivo, @productoId, @cantidad, @fecha)
        `);

        const stockUpdateRequest = new sql.Request(transaction);
        stockUpdateRequest.input('productoId', sql.Int, productoId);
        stockUpdateRequest.input('cantidad', sql.Int, cantidad);
        stockUpdateRequest.input('sucursalId', sql.Int, sucursalId);

        if (tipo === 'ingreso') {
            await stockUpdateRequest.query(`
                UPDATE StockSucursal SET cantidad = cantidad + @cantidad WHERE productoId = @productoId AND sucursalId = @sucursalId
            `);
        } else if (tipo === 'egreso' || tipo === 'mermado' || tipo === 'perdido') {
            await stockUpdateRequest.query(`
                UPDATE StockSucursal SET cantidad = cantidad - @cantidad WHERE productoId = @productoId AND sucursalId = @sucursalId
            `);
        }

        await transaction.commit();
        return result.recordset[0];

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}