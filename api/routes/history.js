const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../config/db');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Endpoint to get the list of people (tutor and their children)
router.get('/people', verifyToken, async (req, res) => {
    try {
        // Defensive check to ensure user and user.id exist on the request object
        if (!req.user || typeof req.user.id === 'undefined') {
            console.error('Authentication error: User ID not found in token payload. Payload:', req.user);
            return res.status(401).send({ message: 'Authentication error: User ID is missing from token.' });
        }

        const userId = req.user.id;
        console.log(`Fetching people list for UserId: ${userId}`);

        const pool = getPool();
        const result = await pool.request()
            .input('UserId', sql.Int, userId)
            .execute('usp_GetTutorAndChildrenForHistory');
        
        console.log(`Successfully fetched ${result.recordset.length} people for UserId: ${userId}`);
        res.json(result.recordset);

    } catch (error) { 
        // Log the specific database or execution error
        console.error(`Error fetching people for history for UserId: ${req.user ? req.user.id : 'N/A'}. Error:`, error.message);
        res.status(500).send({ message: 'Failed to retrieve people list due to a server error.' });
    }
});

// Endpoint to get vaccination history for a selected person
router.get('/vaccinations', verifyToken, async (req, res) => {
    const { personType, personId } = req.query;

    if (!personType || !personId) {
        return res.status(400).send({ message: 'Person type and ID are required.' });
    }

    try {
        const pool = getPool();
        const result = await pool.request()
            .input('PersonType', sql.VarChar, personType)
            .input('PersonId', sql.Int, personId)
            .execute('usp_GetVaccinationHistory');
        res.json(result.recordset);
    } catch (error) {
        console.error('--- DETAILED VACCINATION HISTORY ERROR ---');
        console.error('Timestamp:', new Date().toISOString());
        console.error('Error Message:', error.message);
        console.error('Error Code:', error.code);
        console.error('Full Error Object:', JSON.stringify(error, null, 2));
        res.status(500).send({ message: 'Failed to retrieve vaccination history.' });
    }
});

// GET /api/history/patient/:id - Get a patient's complete history
router.get('/patient/:id', [verifyToken, checkRole(['Medico'])], async (req, res) => {
    try {
        const { id } = req.params;
        const pool = getPool();

        const request = pool.request().input('id_Nino', sql.Int, id);

        // Assumes usp_GetPatientHistory returns two result sets: patient details and vaccination records
        const result = await request.execute('usp_GetPatientHistory');

        const patientDetails = result.recordsets[0][0] || {};
        const vaccinationRecords = result.recordsets[1] || [];

        res.json({ ...patientDetails, records: vaccinationRecords });

    } catch (err) {
        console.error('SQL error on GET /api/history/patient/:id:', err);
        res.status(500).send({ message: 'Failed to retrieve patient history.', error: err.message });
    }
});

module.exports = router;
