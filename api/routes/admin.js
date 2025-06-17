const express = require('express');
const { sql, connectDB } = require('../config/db');
const { verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/admin/dashboard-stats
// Protegido para que solo los administradores puedan acceder.
router.get('/dashboard-stats', verifyAdmin, async (req, res) => {
    try {
        const pool = await connectDB();
        const result = await pool.request().execute('usp_GetAdminDashboardStats');

        if (result.recordset.length === 0) {
            return res.status(404).send({ message: 'No se pudieron obtener las estadísticas.' });
        }

        // El procedimiento devuelve una sola fila con todas las estadísticas
        res.json(result.recordset[0]);

    } catch (err) {
        console.error('Error al obtener estadísticas del dashboard:', err);
        res.status(500).send({ 
            message: 'Error del servidor al obtener estadísticas.',
            error: { 
                name: err.name,
                message: err.message,
                stack: err.stack 
            }
        });
    }
});

// GET /api/admin/audit-log
// Protegido para que solo los administradores puedan acceder.
router.get('/audit-log', verifyAdmin, async (req, res) => {
    try {
        const pool = await connectDB();
        const result = await pool.request().execute('usp_GetAuditLog');

        res.json(result.recordset);

    } catch (err) {
        console.error('Error al obtener la bitácora de auditoría:', err);
        res.status(500).send({ 
            message: 'Error del servidor al obtener la bitácora.',
            error: {
                name: err.name,
                message: err.message,
            }
        });
    }
});

module.exports = router;
