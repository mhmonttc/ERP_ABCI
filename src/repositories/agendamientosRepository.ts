import sql from 'mssql';
import { getConnection } from '../app/db/mssql';

export async function getAgendamientos(sucursalId: string | null, skillId: string | null, fecha: string | null, mes: string | null) {
    const pool = await getConnection();
    const request = pool.request();
    let query = '';

    if (mes && !fecha) {
        const [year, month] = mes.split('-');
        query = `
            SELECT DISTINCT CONVERT(date, fecha) as fecha
            FROM Agendamientos
            WHERE YEAR(fecha) = @year AND MONTH(fecha) = @month
        `;
        request.input('year', sql.Int, Number(year));
        request.input('month', sql.Int, Number(month));

        if (sucursalId && sucursalId !== 'all') {
            query += ` AND sucursalId = @sucursalId`;
            request.input('sucursalId', sql.Int, Number(sucursalId));
        }
        if (skillId && skillId !== 'all') {
            query += ` AND skillId = @skillId`;
            request.input('skillId', sql.Int, Number(skillId));
        }
        const result = await request.query(query);
        return result.recordset.map(row => row.fecha.toISOString().split('T')[0]);

    } else {
        query = `
            SELECT 
                a.id, 
                a.fecha, 
                a.horario, 
                a.estado,
                a.sucursalId,
                a.skillId,
                c.id as colaboradorId,
                c.nombreCompleto as colaboradorNombre,
                s.nombre as sucursalNombre,
                sk.nombre as skillNombre,
                cl.nombre as clienteNombre,
                cl.apellido as clienteApellido,
                a.montoTotal
            FROM Agendamientos a
            JOIN Colaboradores c ON a.colaboradorId = c.id
            JOIN Sucursales s ON a.sucursalId = s.id
            JOIN Skills sk ON a.skillId = sk.id
            JOIN Clientes cl ON a.clienteId = cl.id
            WHERE 1=1
        `;

        if (sucursalId && sucursalId !== 'all') {
            query += ` AND a.sucursalId = @sucursalId`;
            request.input('sucursalId', sql.Int, Number(sucursalId));
        }

        if (skillId && skillId !== 'all') {
            query += ` AND a.skillId = @skillId`;
            request.input('skillId', sql.Int, Number(skillId));
        }
        
        if (fecha) {
            query += ` AND CONVERT(date, a.fecha) = @fecha`;
            request.input('fecha', sql.Date, fecha);
        }

        query += ` ORDER BY a.fecha, a.horario`;
        const result = await request.query(query);
        return result.recordset;
    }
}

export async function createAgendamiento(agendamientoData: any, productos: any[]) {
    const pool = await getConnection();
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();

        const checkAvailabilityRequest = new sql.Request(transaction);
        const availabilityResult = await checkAvailabilityRequest
            .input('colaboradorId', sql.Int, agendamientoData.colaboradorId)
            .input('fecha', sql.Date, agendamientoData.fecha)
            .input('horario', sql.VarChar, agendamientoData.horario)
            .query(`
                SELECT COUNT(*) as count FROM Agendamientos
                WHERE colaboradorId = @colaboradorId AND fecha = @fecha AND horario = @horario;
            `);

        if (availabilityResult.recordset[0].count > 0) {
            throw new Error('El horario seleccionado ya no está disponible. Por favor, elige otro.');
        }

        const agendamientoRequest = new sql.Request(transaction);
        const resultAgendamiento = await agendamientoRequest
            .input('sucursalId', sql.Int, agendamientoData.sucursalId)
            .input('skillId', sql.Int, agendamientoData.skillId)
            .input('colaboradorId', sql.Int, agendamientoData.colaboradorId)
            .input('clienteId', sql.Int, agendamientoData.clienteId)
            .input('fecha', sql.Date, agendamientoData.fecha)
            .input('horario', sql.VarChar, agendamientoData.horario)
            .input('montoTotal', sql.Decimal(10, 2), agendamientoData.montoTotal)
            .input('estado', sql.VarChar, 'Agendado')
            .input('cuponAplicado', sql.NVarChar, agendamientoData.cuponAplicado || null)
            .input('montoDescuento', sql.Decimal(10, 2), agendamientoData.montoDescuento || 0)
            .input('campanaAplicada', sql.NVarChar, agendamientoData.campanaAplicada || null)
            .query(`
                INSERT INTO Agendamientos (sucursalId, skillId, colaboradorId, clienteId, fecha, horario, montoTotal, estado, cuponAplicado, montoDescuento, campanaAplicada)
                OUTPUT INSERTED.id
                VALUES (@sucursalId, @skillId, @colaboradorId, @clienteId, @fecha, @horario, @montoTotal, @estado, @cuponAplicado, @montoDescuento, @campanaAplicada);
            `);

        const agendamientoId = resultAgendamiento.recordset[0].id;

        if (!agendamientoId) {
            throw new Error('No se pudo crear el registro en la tabla Agendamientos.');
        }

        const ventaRequest = new sql.Request(transaction);
        const resultVenta = await ventaRequest
            .input('sucursalId', sql.Int, agendamientoData.sucursalId)
            .input('colaboradorId', sql.Int, agendamientoData.colaboradorId)
            .input('total', sql.Decimal(10, 2), agendamientoData.montoTotal)
            .input('fecha', sql.DateTime, new Date(agendamientoData.fecha))
            .query(`
                INSERT INTO Ventas (sucursalId, colaboradorId, total, fecha)
                OUTPUT INSERTED.id
                VALUES (@sucursalId, @colaboradorId, @total, @fecha);
            `);
        
        const ventaId = resultVenta.recordset[0].id;

        if (!ventaId) {
            throw new Error('No se pudo crear el registro en la tabla Ventas.');
        }

        if (productos && productos.length > 0) {
            for (const producto of productos) {
                const priceRequest = new sql.Request(transaction);
                const priceResult = await priceRequest
                    .input('productoId', sql.Int, producto.productoId)
                    .query('SELECT precio FROM Productos WHERE id = @productoId');
                
                if (priceResult.recordset.length === 0) {
                    throw new Error(`Producto con ID ${producto.productoId} no encontrado.`);
                }
                const precioUnitario = priceResult.recordset[0].precio;

                const detalleRequest = new sql.Request(transaction);
                await detalleRequest
                    .input('ventaId', sql.Int, ventaId)
                    .input('productoId', sql.Int, producto.productoId)
                    .input('cantidad', sql.Int, producto.cantidad)
                    .input('precioUnitario', sql.Decimal(10, 2), precioUnitario)
                    .query(`
                        INSERT INTO VentaItems (ventaId, productoId, cantidad, precioUnitario)
                        VALUES (@ventaId, @productoId, @cantidad, @precioUnitario);
                    `);
            }
        }

        await transaction.commit();
        return agendamientoId;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}
export async function getAgendamientosByColaborador(colaboradorId: string, startDate: string, endDate: string) {
    const pool = await getConnection();
    const result = await pool.request()
        .input('colaboradorId', sql.Int, colaboradorId)
        .input('startDate', sql.Date, startDate)
        .input('endDate', sql.Date, endDate)
        .query(`
            SELECT fecha, horario
            FROM Agendamientos
            WHERE colaboradorId = @colaboradorId AND fecha BETWEEN @startDate AND @endDate
        `);
    return result.recordset || [];
}