import sql from 'mssql';
import { getConnection } from '../app/db/mssql';

export async function getVentas(filters: any) {
    const pool = await getConnection();
    const request = pool.request();
    const { sucursalId, mes, colaboradorId } = filters;
    
    let query = `
        SELECT 
            v.id,
            v.fecha,
            v.total,
            s.nombre AS sucursalNombre,
            co.nombreCompleto AS colaboradorNombre,
            vi.cantidad,
            p.nombre AS productoNombre
        FROM Ventas v
        JOIN Sucursales s ON v.sucursalId = s.id
        LEFT JOIN Colaboradores co ON v.colaboradorId = co.id
        LEFT JOIN VentaItems vi ON v.id = vi.ventaId
        LEFT JOIN Productos p ON vi.productoId = p.id
        WHERE 1=1
    `;

    if (sucursalId && sucursalId !== 'all') {
        query += ` AND v.sucursalId = @sucursalId`;
        request.input('sucursalId', sql.Int, Number(sucursalId));
    }

    if (colaboradorId && colaboradorId !== 'all') {
        query += ` AND v.colaboradorId = @colaboradorId`;
        request.input('colaboradorId', sql.Int, Number(colaboradorId));
    }

    if (mes) {
        const [year, month] = mes.split('-');
        query += ` AND YEAR(v.fecha) = @year AND MONTH(v.fecha) = @month`;
        request.input('year', sql.Int, Number(year));
        request.input('month', sql.Int, Number(month));
    }

    query += ` ORDER BY v.fecha DESC`;

    const result = await request.query(query);
    return result.recordset;
}

export async function createVenta(ventaData: any) {
    const { items, total, sucursalId, fecha } = ventaData;
    const pool = await getConnection();
    const transaction = new sql.Transaction(pool);
    
    try {
        await transaction.begin();

        const ventaRequest = new sql.Request(transaction);
        const resultVenta = await ventaRequest
            .input('sucursalId', sql.Int, sucursalId)
            .input('total', sql.Decimal(10, 2), total)
            .input('fecha', sql.DateTime, new Date(fecha))
            .query(`
                INSERT INTO Ventas (sucursalId, total, fecha)
                OUTPUT INSERTED.id
                VALUES (@sucursalId, @total, @fecha);
            `);
        
        const ventaId = resultVenta.recordset[0].id;
        if (!ventaId) {
            throw new Error('No se pudo crear el registro en la tabla Ventas.');
        }

        for (const item of items) {
            const detalleRequest = new sql.Request(transaction);
            await detalleRequest
                .input('ventaId', sql.Int, ventaId)
                .input('productoId', sql.Int, item.id)
                .input('cantidad', sql.Int, item.quantity)
                .input('precioUnitario', sql.Decimal(10, 2), item.price)
                .query(`
                    INSERT INTO VentaItems (ventaId, productoId, cantidad, precioUnitario)
                    VALUES (@ventaId, @productoId, @cantidad, @precioUnitario);
                `);

            const stockRequest = new sql.Request(transaction);
            await stockRequest
                .input('cantidad', sql.Int, item.quantity)
                .input('productoId', sql.Int, item.id)
                .query(`
                    UPDATE Productos SET stock = stock - @cantidad WHERE id = @productoId;
                `);
        }

        await transaction.commit();
        return { ventaId };

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}