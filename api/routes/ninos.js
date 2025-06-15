const express = require('express');
const router = express.Router();
const { poolConnect, sql } = require('../config/db');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// POST / - Register a new child
router.post('/', [verifyToken, checkRole(['Tutor', 'Administrador'])], async (req, res) => {
    try {
        const { Nombres, Apellidos, Genero, FechaNacimiento, DireccionResidencia, CodigoIdentificacionPropio } = req.body;
        const id_Tutor = req.user.id; // Get tutor ID from authenticated user

        // Handle CodigoIdentificacionPropio being null or an empty string
        const codigoIdentificacionPropio = CodigoIdentificacionPropio ? CodigoIdentificacionPropio : null;

        const pool = await poolConnect;
        const request = pool.request()
            .input('id_Tutor', sql.Int, id_Tutor)
            .input('Nombres', sql.NVarChar(100), Nombres)
            .input('Apellidos', sql.NVarChar(100), Apellidos)
            .input('Genero', sql.Char(1), Genero)
            .input('FechaNacimiento', sql.Date, FechaNacimiento)
            .input('DireccionResidencia', sql.NVarChar(255), DireccionResidencia)
            .input('CodigoIdentificacionPropio', sql.NVarChar(18), codigoIdentificacionPropio);
        
        const result = await request.execute('usp_RegisterNino');
        
        res.status(201).json({ message: 'Niño registrado exitosamente.', data: result.recordset[0] });
    } catch (err) {
        console.error('SQL error on POST /api/ninos:', err);
        res.status(500).send({ message: 'Error al registrar el niño.', error: err.message });
    }
});

// GET /tutor/:tutorId - Get all children for a specific tutor
router.get('/tutor/:tutorId', [verifyToken, checkRole(['Tutor', 'Administrador'])], async (req, res) => {
    try {
        const { tutorId } = req.params;
        const pool = await poolConnect;
        const result = await pool.request()
            .input('id_Tutor', sql.Int, tutorId)
            .execute('usp_GetNinosByTutor');
        
        res.json(result.recordset);

    } catch (err) {
        console.error('SQL error on GET /api/ninos/tutor/:tutorId:', err);
        res.status(500).send({ message: 'Failed to retrieve ninos for tutor.', error: err.message });
    }
});

// GET /:ninoId - Get details for a specific child
router.get('/:ninoId', [verifyToken, checkRole(['Administrador', 'Medico', 'Tutor'])], async (req, res) => {
    try {
        const { ninoId } = req.params;
        const pool = await poolConnect;
        const result = await pool.request()
            .input('id_Nino', sql.Int, ninoId)
            .execute('usp_GetNinoDetailsById');
        
        if (result.recordset.length === 0) {
            return res.status(404).send({ message: 'Nino not found.' });
        }
        res.json(result.recordset[0]);

    } catch (err) {
        console.error('SQL error on GET /api/ninos/:ninoId:', err);
        res.status(500).send({ message: 'Failed to retrieve nino details.', error: err.message });
    }
});

// GET /:ninoId/appointments - Get appointments for a specific child
router.get('/:ninoId/appointments', [verifyToken, checkRole(['Administrador', 'Medico', 'Tutor'])], async (req, res) => {
    try {
        const { ninoId } = req.params;
        const pool = await poolConnect;
        const result = await pool.request()
            .input('id_Nino', sql.Int, ninoId)
            .execute('usp_GetAppointmentsByNino');
        res.json(result.recordset);
    } catch (err) {
        console.error('SQL error on GET /api/ninos/:ninoId/appointments:', err);
        res.status(500).send({ message: 'Failed to retrieve appointments.', error: err.message });
    }
});

// PUT /:id - Update a child's record
router.put('/:id', [verifyToken, checkRole(['Administrador', 'Medico'])], async (req, res) => {
    try {
        const { id } = req.params;
        const { Nombres, Apellidos, FechaNacimiento, Genero, CodigoIdentificacionPropio, id_CentroSaludAsignado } = req.body;

        const pool = await poolConnect;
        await pool.request()
            .input('id_Nino', sql.Int, id)
            .input('Nombres', sql.NVarChar(100), Nombres)
            .input('Apellidos', sql.NVarChar(100), Apellidos)
            .input('FechaNacimiento', sql.Date, FechaNacimiento)
            .input('Genero', sql.Char(1), Genero)
            .input('CodigoIdentificacionPropio', sql.NVarChar(20), CodigoIdentificacionPropio)
            .input('id_CentroSaludAsignado', sql.Int, id_CentroSaludAsignado)
            .execute('usp_UpdateNino');

        res.status(200).send({ message: 'Child record updated successfully.' });
    } catch (err) {
        console.error('SQL error on PUT /api/ninos/:id:', err);
        res.status(500).send({ message: 'Failed to update child record.', error: err.message });
    }
});

// DELETE /:id - Delete a child's record
router.delete('/:id', [verifyToken, checkRole(['Administrador'])], async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolConnect;
        await pool.request()
            .input('id_Nino', sql.Int, id)
            .execute('usp_DeleteNino');

        res.status(200).send({ message: 'Child record deleted successfully.' });
    } catch (err) {
        console.error('SQL error on DELETE /api/ninos/:id:', err);
        res.status(500).send({ message: 'Failed to delete child record.', error: err.message });
    }
});

// POST /link - Link a tutor to a child using an activation code
router.post('/link', [verifyToken, checkRole(['Tutor'])], async (req, res) => {
    try {
        const { CodigoActivacion } = req.body;
        const id_Tutor = req.user.id;

        if (!CodigoActivacion) {
            return res.status(400).send({ message: 'El código de activación es requerido.' });
        }

        const pool = await poolConnect;
        const request = await pool.request()
            .input('id_Tutor', sql.Int, id_Tutor)
            .input('CodigoActivacion', sql.NVarChar(10), CodigoActivacion)
            
        const result = await request.execute('usp_LinkNinoToTutor');

        if (result.recordset.length === 0) {
            return res.status(404).send({ message: 'No se encontró ningún niño con ese código de activación o el código es incorrecto.' });
        }
        
        res.status(200).json({ message: 'Niño vinculado exitosamente.', data: result.recordset[0] });

    } catch (err) {
        console.error('SQL error on POST /api/ninos/link:', err);
        res.status(500).send({ message: err.message || 'Error al vincular el niño.' });
    }
});

module.exports = router;
