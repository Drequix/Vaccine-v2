// Forcing a reload at 2025-06-17T15:47:39-04:00
// Load environment variables
require('dotenv').config();

// Import required modules
const express = require('express');
const cors = require('cors');
const { connectDB, getPool, sql } = require('./config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const centersRoutes = require('./routes/centers');
const usersRoutes = require('./routes/users');
const historyRoutes = require('./routes/history');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');

// Initialize Express app
const app = express();
const port = process.env.PORT || 3001;

// Enable CORS for frontend
const allowedOrigins = /^http:\/\/(localhost|127\.0\.0\.1|(\d{1,3}\.){3}\d{1,3}):\d+$/;

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.test(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Middleware to parse JSON bodies
app.use(express.json());

// Mount Routers for specific API resource paths
app.use('/api/vaccination-centers', centersRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);

// --- Request Logger Middleware ---
app.use((req, res, next) => {
  console.log(`[API IN] ${req.method} ${req.originalUrl}`);
  next();
});

// Start the server only after a successful database connection
const startServer = async () => {
  try {
    await connectDB(); // Establish database connection
    app.listen(port, () => {
      console.log(`[API START] Server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("[FATAL ERROR] Failed to start server due to database connection issues.", error);
    process.exit(1);
  }
};

startServer();

// --- JWT Verification Middleware ---
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (token == null) {
        return res.sendStatus(401); // Unauthorized - no token
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.error('JWT Verification Error:', err);
            return res.sendStatus(403); // Forbidden - token is not valid
        }
        req.user = user; // Add decoded user payload to request object
        next(); // Proceed to the next middleware or route handler
    });
};

// --- Role-Based Access Control (RBAC) Middleware ---
const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).send({ message: 'Forbidden: Role information is missing.' });
        }

        const userRole = req.user.role.trim().toLowerCase();
        const requiredRoles = roles.map(role => role.trim().toLowerCase());

        if (requiredRoles.includes(userRole)) {
            next(); // User has the required role, proceed
        } else {
            res.status(403).send({ message: `Forbidden: Your role (${req.user.role}) is not authorized to access this resource.` });
        }
    };
};

// GET /api/users - Get all users
app.get('/api/users', [verifyToken, checkRole(['Administrador'])], async (req, res) => {
    try {
        const pool = getPool();
        const result = await pool.request().execute('usp_GetAllUsers');
        res.json(result.recordset);
    } catch (err) {
        console.error('SQL error on GET /api/users:', err);
        res.status(500).send({ message: 'Failed to retrieve users.', error: err.message });
    }
});

// GET /api/users/:id - Get a single user by ID
app.get('/api/users/:id', [verifyToken, checkRole(['Administrador'])], async (req, res) => {
    try {
        const { id } = req.params;
        const pool = getPool();
        const result = await pool.request()
            .input('id_Usuario', sql.Int, id)
            .execute('usp_GetUserById');

        if (result.recordset.length === 0) {
            return res.status(404).send({ message: 'User not found.' });
        }
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('SQL error on GET /api/users/:id:', err);
        res.status(500).send({ message: 'Failed to retrieve user.', error: err.message });
    }
});

// GET /api/roles - Get all roles
app.get('/api/roles', [verifyToken, checkRole(['Administrador'])], async (req, res) => {
    try {
        const pool = getPool();
        const result = await pool.request().query('SELECT id_Rol, Rol FROM Rol');
        res.json(result.recordset);
    } catch (err) {
        console.error('SQL error on GET /api/roles:', err);
        res.status(500).send({ message: 'Failed to retrieve roles.', error: err.message });
    }
});

// PUT /api/users/:id - Update a user
app.put('/api/users/:id', [verifyToken, checkRole(['Administrador'])], async (req, res) => {
    try {
        const { id } = req.params;
        const { id_Rol, id_Estado, Cedula_Usuario, Email } = req.body;

        const pool = getPool();
        await pool.request()
            .input('id_Usuario', sql.Int, id)
            .input('id_Rol', sql.Int, id_Rol)
            .input('id_Estado', sql.Int, id_Estado)
            .input('Cedula_Usuario', sql.NVarChar(15), Cedula_Usuario)
            .input('Email', sql.NVarChar(100), Email)
            .execute('usp_UpdateUser');

        res.status(200).send({ message: 'User updated successfully.' });
    } catch (err) {
        console.error('SQL error on PUT /api/users/:id:', err);
        res.status(500).send({ message: 'Failed to update user.', error: err.message });
    }
});

// DELETE /api/users/:id - Soft delete a user
app.delete('/api/users/:id', [verifyToken, checkRole(['Administrador'])], async (req, res) => {
    try {
        const { id } = req.params;
        const pool = getPool();
        await pool.request()
            .input('id_Usuario', sql.Int, id)
            .execute('usp_DeleteUser');

        res.status(200).send({ message: 'User deactivated successfully.' });
    } catch (err) {
        console.error('SQL error on DELETE /api/users/:id:', err);
        res.status(500).send({ message: 'Failed to deactivate user.', error: err.message });
    }
});

// --- API ROUTES ---

// Basic route
app.get('/', (req, res) => {
  res.send('Vaccination System API is running!');
});

// --- Vaccination Center Endpoints ---



// --- Appointment Endpoints ---

// GET /api/appointments - Get appointments based on user role
app.get('/api/appointments', verifyToken, async (req, res) => {
    console.log('[APPOINTMENTS] Request received for user:', req.user);
    try {
        const { id: userId, role } = req.user;

        if (!userId || !role) {
            return res.status(400).send({ message: 'User ID and role are missing from token.' });
        }

        console.log(`[APPOINTMENTS] Fetching for user ID: ${userId}, Role: ${role}`);
        
        const pool = getPool();
        const request = pool.request();
        
        // Pass parameters to the stored procedure
        request.input('id_Usuario', sql.Int, userId);
        request.input('RolName', sql.NVarChar, role);

        console.log('[APPOINTMENTS] Executing usp_GetAllAppointments...');
        const result = await request.execute('usp_GetAllAppointments');
        
        console.log(`[APPOINTMENTS] Found ${result.recordset.length} appointments.`);
        res.json(result.recordset);

    } catch (err) {
        console.error('SQL error on GET /api/appointments:', err);
        res.status(500).send({ message: 'Failed to retrieve appointments.', error: err.message });
    }
});

// --- Vaccination Center Endpoints ---

// GET /api/vaccination-centers - Get all vaccination centers
app.get('/api/vaccination-centers', verifyToken, async (req, res) => {
    try {
        const pool = getPool();
        const result = await pool.request().execute('usp_GetAllVaccinationCenters');

        console.log('Raw data from DB:', JSON.stringify(result.recordset, null, 2));
        
        // Map database columns to frontend-friendly keys to avoid breaking the client
        const centers = result.recordset.map(center => ({
            id_CentroVacunacion: center.id_CentroVacunacion,
            Nombre: center.NombreCentro, 
            Direccion: center.Direccion,
            Provincia: center.Provincia,
            Municipio: center.Municipio,
            Telefono: center.Telefono,
            Director: center.Director,
            Web: center.Web,
            Capacidad: center.Capacidad,
            Estado: center.NombreEstado 
        }));

        res.json(centers);
    } catch (err) {
        console.error('SQL error on GET /api/vaccination-centers:', err);
        res.status(500).send({ message: 'Failed to retrieve vaccination centers.', error: err.message });
    }
});

// --- Vaccine Endpoints ---

// GET /api/vaccines - Get all vaccines
app.get('/api/vaccines', verifyToken, async (req, res) => {
    try {
        const pool = getPool();
        const result = await pool.request().execute('usp_GetVaccines');
        res.json(result.recordset);
    } catch (err) {
        console.error('SQL error on GET /api/vaccines:', err);
        res.status(500).send({ message: 'Failed to retrieve vaccines.', error: err.message });
    }
});

// --- History Endpoints ---

// GET /api/history/people - Get people (tutor and children) for the history view
app.get('/api/history/people', verifyToken, checkRole(['Tutor']), async (req, res) => {
    try {
        const { id: id_Usuario } = req.user;
        const pool = getPool();
        const result = await pool.request()
            .input('id_Usuario', sql.Int, id_Usuario)
            .execute('usp_GetPeopleForHistory');

        res.json(result.recordset);
    } catch (error) {
        console.error('Detailed error fetching people for history:', {
            message: error.message,
            stack: error.stack,
            originalError: error.originalError, // Specific to mssql driver
            code: error.code
        });
        res.status(500).json({ message: 'Error interno del servidor al obtener la lista de personas.' });
    }
});

// GET /api/history/vaccinations - Get vaccination history for a specific person
app.get('/api/history/vaccinations', verifyToken, checkRole(['Tutor']), async (req, res) => {
    try {
        const { personId, personType } = req.query;

        if (!personId || !personType) {
            return res.status(400).send({ message: 'Person ID and Person Type are required.' });
        }

        const pool = getPool();
        const result = await pool.request()
            .input('PersonId', sql.Int, personId)
            .input('PersonType', sql.NVarChar(10), personType)
            .execute('usp_GetVaccinationHistory');

        res.json(result.recordset);
    } catch (err) {
        console.error('SQL error on GET /api/history/vaccinations:', err);
        res.status(500).send({ message: 'Failed to retrieve vaccination history.', error: err.message });
    }
});

// --- Tutor Endpoints ---

// GET /api/tutors/:id/children - Get all children for a specific tutor
app.get('/api/tutors/:id/children', [verifyToken, checkRole(['Tutor', 'Administrador'])], async (req, res) => {
    try {
        const { id: id_Usuario } = req.params;

        // Security check: Tutors can only request their own children
        if (req.user.role.toLowerCase() === 'tutor' && parseInt(req.user.id, 10) !== parseInt(id_Usuario, 10)) {
            return res.status(403).send({ message: 'Forbidden: You can only view your own children.' });
        }

        const pool = getPool();
        const result = await pool.request()
            .input('id_Usuario', sql.Int, id_Usuario)
            .execute('usp_GetNinosByTutor');

        res.json(result.recordset);
    } catch (err) {
        console.error('SQL error on GET /api/tutors/:id/children:', err);
        res.status(500).send({ message: 'Failed to retrieve children for the tutor.', error: err.message });
    }
});

// POST /api/tutors - Register a new Tutor and associated User with a hashed password
app.post('/api/tutors', async (req, res) => {
    console.log(`Accessed POST /api/tutors with body: ${JSON.stringify(req.body)}`);

    const { Nombres, Apellidos, TipoIdentificacion, NumeroIdentificacion, Telefono, Direccion, Email, Username } = req.body;
    const password = req.body.Password || req.body.password;

    if (!Nombres || !Apellidos || !NumeroIdentificacion || !Email || !password || !Username) {
        return res.status(400).json({ message: 'Missing required fields.' });
    }

    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const pool = getPool();
        const result = await pool.request()
            .input('Cedula_Tutor', sql.NVarChar(15), NumeroIdentificacion)
            .input('Nombres_Tutor', sql.NVarChar(100), Nombres)
            .input('Apellidos_Tutor', sql.NVarChar(100), Apellidos)
            .input('Telefono_Tutor', sql.NVarChar(20), Telefono)
            .input('Email_Tutor', sql.NVarChar(100), Email) // Using main email for both tutor contact and user login
            .input('Direccion_Tutor', sql.NVarChar(200), Direccion)
            .input('Email_Usuario', sql.NVarChar(100), Email)
            .input('Clave_Usuario', sql.NVarChar(255), hashedPassword)
            .output('OutputMessage', sql.NVarChar(255))
            .output('New_id_Usuario', sql.Int)
            .output('New_id_Tutor', sql.Int)
            .execute('usp_RegisterTutor');

        res.status(201).json({
            message: result.output.OutputMessage || 'Tutor registered successfully.',
            userId: result.output.New_id_Usuario,
            tutorId: result.output.New_id_Tutor
        });

    } catch (err) {
        console.error('SQL error on POST /api/tutors:', err);
        const errorMessage = err.originalError?.info?.message || err.message;
        res.status(500).send({ message: 'Failed to register tutor.', error: errorMessage });
    }
});

app.get('/api/tutors/:tutorId/ninos', [verifyToken, checkRole(['Administrador', 'Medico'])], async (req, res) => {
    console.log(`Accessed GET /api/tutors/:tutorId/ninos with params: ${JSON.stringify(req.params)}`);
    try {
        const { tutorId } = req.params;
        const pool = getPool();
        const result = await pool.request()
            .input('id_Tutor', sql.Int, tutorId)
            .execute('usp_GetNinosByTutor');
        res.json(result.recordset);
    } catch (err) {
        console.error('SQL error on GET /api/tutors/:tutorId/ninos:', err);
        res.status(500).send({ message: 'Failed to retrieve ninos for tutor.', error: err.message });
    }
});

// GET /api/tutors/:userId/children - Get all children for a specific tutor
app.get('/api/tutors/:userId/children', [verifyToken, checkRole(['Tutor', 'Administrador', 'Medico'])], async (req, res) => {
    console.log(`Accessed GET /api/tutors/:userId/children with params: ${JSON.stringify(req.params)}`);
    try {
        const { userId } = req.params;

        // Security check: A tutor can only view their own children.
        if (req.user.role === 'Tutor' && req.user.id.toString() !== userId) {
            return res.status(403).send({ message: 'Forbidden: You can only view your own children.' });
        }

        const pool = getPool();
        const result = await pool.request()
            .input('id_Tutor', sql.Int, userId)
            .execute('usp_GetNinosByTutor');
        
        // Map the results to match the frontend's expected structure
        const children = result.recordset.map(child => ({
            id_Nino: child.id_Nino,
            Nombres: child.NinoNombres,
            Apellidos: child.NinoApellidos
        }));

        res.json(children);
    } catch (err) {
        console.error(`SQL error on GET /api/tutors/${req.params.userId}/children:`, err);
        res.status(500).send({ message: 'Failed to retrieve children for tutor.', error: err.message });
    }
});

// --- Nino Endpoints ---
app.post('/api/ninos', [verifyToken, checkRole(['Tutor', 'Administrador'])], async (req, res) => {
    console.log(`Accessed POST /api/ninos with body: ${JSON.stringify(req.body)}`);
    try {
        const { id_Tutor, Nombres, Apellidos, Genero, CodigoIdentificacionPropio, FechaNacimiento, PaisNacimiento } = req.body;
        const pool = getPool();
        const request = pool.request()
            .input('id_Tutor', sql.Int, id_Tutor)
            .input('Nombres', sql.NVarChar(100), Nombres)
            .input('Apellidos', sql.NVarChar(100), Apellidos)
            .input('Genero', sql.Char(1), Genero)
            .input('CodigoIdentificacionPropio', sql.NVarChar(18), CodigoIdentificacionPropio)
            .input('FechaNacimiento', sql.Date, FechaNacimiento)
            .input('PaisNacimiento', sql.NVarChar(100), PaisNacimiento);
        const result = await request.execute('usp_RegisterNino');
        res.status(201).json({ message: 'Nino registered successfully.', data: result.recordset });
    } catch (err) {
        console.error('SQL error on POST /api/ninos:', err);
        res.status(500).send({ message: 'Failed to register nino.', error: err.message });
    }
});

app.get('/api/ninos/:ninoId', [verifyToken, checkRole(['Administrador', 'Medico', 'Tutor'])], async (req, res) => {
    console.log(`Accessed GET /api/ninos/:ninoId with params: ${JSON.stringify(req.params)}`);
    try {
        const { ninoId } = req.params;
        const pool = getPool();
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

app.get('/api/ninos/:ninoId/appointments', [verifyToken, checkRole(['Administrador', 'Medico', 'Tutor'])], async (req, res) => {
    console.log(`Accessed GET /api/ninos/:ninoId/appointments with params: ${JSON.stringify(req.params)}`);
    try {
        const { ninoId } = req.params;
        const pool = getPool();
        const result = await pool.request()
            .input('id_Nino', sql.Int, ninoId)
            .execute('usp_GetAppointmentsByNino');
        res.json(result.recordset);
    } catch (err) {
        console.error('SQL error on GET /api/ninos/:ninoId/appointments:', err);
        res.status(500).send({ message: 'Failed to retrieve appointments.', error: err.message });
    }
});

// PUT /api/ninos/:id - Update a child's record
app.put('/api/ninos/:id', [verifyToken, checkRole(['Administrador', 'Medico'])], async (req, res) => {
    try {
        const { id } = req.params;
        const { Nombres, Apellidos, FechaNacimiento, Genero, CodigoIdentificacionPropio, id_CentroSaludAsignado } = req.body;

        const pool = getPool();
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

// DELETE /api/ninos/:id - Delete a child's record
app.delete('/api/ninos/:id', [verifyToken, checkRole(['Administrador'])], async (req, res) => {
    try {
        const { id } = req.params;
        const pool = getPool();
        await pool.request()
            .input('id_Nino', sql.Int, id)
            .execute('usp_DeleteNino');

        res.status(200).send({ message: 'Child record deleted successfully.' });
    } catch (err) {
        console.error('SQL error on DELETE /api/ninos/:id:', err);
        res.status(500).send({ message: 'Failed to delete child record.', error: err.message });
    }
});

// --- Appointment Endpoints ---
app.post('/api/appointments', [verifyToken], async (req, res) => {
    console.log(`Accessed POST /api/appointments with body: ${JSON.stringify(req.body)}`);
    try {
        const { id_Nino, id_Vacuna, id_CentroVacunacion, FechaCita, HoraCita } = req.body;
        const id_UsuarioRegistraCita = req.user.id;

        if (!id_Vacuna || !id_CentroVacunacion || !FechaCita || !HoraCita) {
            return res.status(400).send({ message: 'Missing required appointment fields.' });
        }

        // Create a Date object for the time component, as the tedious driver expects an object.
        // Using a neutral date '1970-01-01' to ensure only the time is relevant.
        const timeAsDateObject = new Date(`1970-01-01T${HoraCita}:00`);

        const pool = getPool();
        const request = pool.request()
            // Handle optional id_Nino, passing null if not provided or explicitly null.
            .input('id_Nino', sql.Int, (id_Nino === undefined || id_Nino === null) ? null : id_Nino)
            .input('id_Vacuna', sql.Int, id_Vacuna)
            .input('id_CentroVacunacion', sql.Int, id_CentroVacunacion)
            .input('Fecha', sql.Date, FechaCita) // Pass date string directly
            .input('Hora', sql.Time, timeAsDateObject) // Pass Date object for time
            .input('id_UsuarioRegistraCita', sql.Int, id_UsuarioRegistraCita)
            // Set RequiereTutor based on whether id_Nino is present
            .input('RequiereTutor', sql.Bit, (id_Nino === undefined || id_Nino === null) ? 0 : 1)
            .output('OutputMessage', sql.NVarChar(255))
            .output('New_id_Cita', sql.Int);

        const result = await request.execute('usp_ScheduleAppointment');

        if (result.output.New_id_Cita) {
            res.status(201).json({
                message: result.output.OutputMessage,
                appointmentId: result.output.New_id_Cita
            });
        } else {
            // If the SP returns an error message in the output parameter without raising an error
            res.status(400).json({ message: result.output.OutputMessage });
        }

    } catch (err) {
        console.error('SQL error on POST /api/appointments:', err);
        const errorMessage = err.originalError?.info?.message || err.message;
        res.status(500).send({ message: 'Failed to schedule appointment.', error: errorMessage });
    }
});

// The duplicate endpoint that was here has been removed to fix a critical bug.

// PUT /api/appointments/:id - Update an appointment
app.put('/api/appointments/:id', [verifyToken, checkRole(['Administrador', 'Medico', 'Enfermera'])], async (req, res) => {
    try {
        const { id } = req.params;
        const { id_Vacuna, id_CentroVacunacion, Fecha, Hora, id_EstadoCita } = req.body;
        const pool = getPool();
        await pool.request()
            .input('id_Cita', sql.Int, id)
            .input('id_Vacuna', sql.Int, id_Vacuna)
            .input('id_CentroVacunacion', sql.Int, id_CentroVacunacion)
            .input('Fecha', sql.Date, Fecha)
            .input('Hora', sql.Time, Hora)
            .input('id_EstadoCita', sql.Int, id_EstadoCita)
            .execute('usp_UpdateAppointment');
        res.status(200).send({ message: 'Appointment updated successfully.' });
    } catch (err) {
        console.error('SQL error on PUT /api/appointments/:id:', err);
        res.status(500).send({ message: 'Failed to update appointment.', error: err.message });
    }
});

// GET /api/appointments/:id - Get a single appointment by ID
app.get('/api/appointments/:id', [verifyToken, checkRole(['Administrador', 'Medico', 'Enfermera', 'Digitador', 'Tutor'])], async (req, res) => {
    try {
        const { id } = req.params;
        const pool = getPool();
        const result = await pool.request()
            .input('id_Cita', sql.Int, id)
            .execute('usp_GetAppointmentById');
        if (result.recordset.length === 0) {
            return res.status(404).send({ message: 'Appointment not found.' });
        }
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('SQL error on GET /api/appointments/:id:', err);
        res.status(500).send({ message: 'Failed to retrieve appointment.', error: err.message });
    }
});

// DELETE /api/appointments/:id - Delete an appointment
app.delete('/api/appointments/:id', [verifyToken, checkRole(['Administrador', 'Medico'])], async (req, res) => {
    try {
        const { id } = req.params;
        const pool = getPool();
        await pool.request()
            .input('id_Cita', sql.Int, id)
            .execute('usp_DeleteAppointment');
        res.status(200).send({ message: 'Appointment deleted successfully.' });
    } catch (err) {
        console.error('SQL error on DELETE /api/appointments/:id:', err);
        res.status(500).send({ message: 'Failed to delete appointment.', error: err.message });
    }
});

app.put('/api/appointments/:appointmentId/status', [verifyToken, checkRole(['Medico', 'Enfermera', 'Digitador'])], async (req, res) => {
    console.log(`Accessed PUT /api/appointments/:appointmentId/status with params: ${JSON.stringify(req.params)} and body: ${JSON.stringify(req.body)}`);
    try {
        const { appointmentId } = req.params;
        const { id_EstadoCita } = req.body;
        const pool = getPool();
        const request = pool.request()
            .input('id_Cita', sql.Int, appointmentId)
            .input('id_EstadoCita', sql.Int, id_EstadoCita);
        await request.execute('usp_UpdateAppointmentStatus');
        res.json({ message: 'Appointment status updated successfully.' });
    } catch (err) {
        console.error('SQL error on PUT /api/appointments/:appointmentId/status:', err);
        res.status(500).send({ message: 'Failed to update appointment status.', error: err.message });
    }
});

// --- Location Endpoints ---

// GET /api/locations/provinces - Get all provinces
app.get('/api/locations/provinces', [verifyToken, checkRole(['Administrador', 'Medico', 'Enfermera', 'Digitador'])], async (req, res) => {
    try {
        const pool = getPool();
        const result = await pool.request().query('SELECT id_Provincia, Nombre FROM Provincia ORDER BY Nombre');
        res.json(result.recordset);
    } catch (err) {
        console.error('SQL error on GET /api/locations/provinces:', err);
        res.status(500).send({ message: 'Failed to retrieve provinces.', error: err.message });
    }
});

// GET /api/locations/municipalities/:provinceId - Get municipalities by province
app.get('/api/locations/municipalities/:provinceId', [verifyToken, checkRole(['Administrador', 'Medico', 'Enfermera', 'Digitador'])], async (req, res) => {
    try {
        const { provinceId } = req.params;
        const pool = getPool();
        const result = await pool.request()
            .input('id_Provincia', sql.Int, provinceId)
            .execute('usp_GetMunicipiosByProvincia');
        res.json(result.recordset);
    } catch (err) {
        console.error(`SQL error on GET /api/locations/municipalities/${req.params.provinceId}:`, err);
        res.status(500).send({ message: 'Failed to retrieve municipalities.', error: err.message });
    }
});

// --- Vaccination Center Management Endpoints ---

// GET /api/centers/statuses - Get all center statuses
app.get('/api/centers/statuses', [verifyToken, checkRole(['Administrador'])], async (req, res) => {
    try {
        const pool = getPool();
        const result = await pool.request().query('SELECT id_Estado, NombreEstado FROM EstadosCentro');
        res.json(result.recordset);
    } catch (err) {
        console.error('SQL error on GET /api/centers/statuses:', err);
        res.status(500).send({ message: 'Failed to retrieve center statuses.', error: err.message });
    }
});

// POST /api/vaccination-centers - Create a new vaccination center
app.post('/api/vaccination-centers', [verifyToken, checkRole(['Administrador'])], async (req, res) => {
    try {
        const { NombreCentro, Direccion, id_Provincia, id_Municipio, Telefono, Director, Web, Capacidad, id_Estado } = req.body;
        
        const pool = getPool();
        await pool.request()
            .input('NombreCentro', sql.NVarChar(100), NombreCentro)
            .input('Direccion', sql.NVarChar(200), Direccion)
            .input('id_Provincia', sql.Int, id_Provincia)
            .input('id_Municipio', sql.Int, id_Municipio)
            .input('Telefono', sql.NVarChar(20), Telefono)
            .input('Director', sql.NVarChar(100), Director)
            .input('Web', sql.NVarChar(100), Web)
            .input('Capacidad', sql.Int, Capacidad)
            .input('id_Estado', sql.Int, id_Estado)
            .execute('usp_CreateVaccinationCenter');
        
        res.status(201).send({ message: 'Vaccination center created successfully.' });
    } catch (err) {
        console.error('SQL error on POST /api/vaccination-centers:', err);
        res.status(500).send({ message: 'Failed to create vaccination center.', error: err.message });
    }
});

// PUT /api/vaccination-centers/:id - Update a vaccination center
app.put('/api/vaccination-centers/:id', [verifyToken, checkRole(['Administrador'])], async (req, res) => {
    try {
        const { id } = req.params;
        const { NombreCentro, Direccion, id_Provincia, id_Municipio, Telefono, Director, Web, Capacidad, id_Estado } = req.body;

        const pool = getPool();
        await pool.request()
            .input('id_CentroVacunacion', sql.Int, id)
            .input('NombreCentro', sql.NVarChar(100), NombreCentro)
            .input('Direccion', sql.NVarChar(200), Direccion)
            .input('id_Provincia', sql.Int, id_Provincia)
            .input('id_Municipio', sql.Int, id_Municipio)
            .input('Telefono', sql.NVarChar(20), Telefono)
            .input('Director', sql.NVarChar(100), Director)
            .input('Web', sql.NVarChar(100), Web)
            .input('Capacidad', sql.Int, Capacidad)
            .input('id_Estado', sql.Int, id_Estado)
            .query(`
                UPDATE CentroVacunacion
                SET NombreCentro = @NombreCentro,
                    Direccion = @Direccion,
                    id_Provincia = @id_Provincia,
                    id_Municipio = @id_Municipio,
                    Telefono = @Telefono,
                    Director = @Director,
                    Web = @Web,
                    Capacidad = @Capacidad,
                    id_Estado = @id_Estado
                WHERE id_CentroVacunacion = @id_CentroVacunacion
            `);

        res.status(200).send({ message: 'Vaccination center updated successfully.' });
    } catch (err) {
        console.error('SQL error on PUT /api/vaccination-centers/:id:', err);
        res.status(500).send({ message: 'Failed to update vaccination center.', error: err.message });
    }
});

// DELETE /api/vaccination-centers/:id - Soft delete a vaccination center (set status to Inactivo)
app.delete('/api/vaccination-centers/:id', [verifyToken, checkRole(['Administrador'])], async (req, res) => {
    try {
        const { id } = req.params;
        const pool = getPool();

        const statusResult = await pool.request()
            .input('NombreEstado', sql.NVarChar, 'Inactivo')
            .query('SELECT id_Estado FROM EstadosCentro WHERE NombreEstado = @NombreEstado');
        
        if (statusResult.recordset.length === 0) {
            return res.status(500).send({ message: 'Could not find "Inactivo" status in database.' });
        }
        const inactivoStatusId = statusResult.recordset[0].id_Estado;

        await pool.request()
            .input('id_CentroVacunacion', sql.Int, id)
            .input('id_Estado', sql.Int, inactivoStatusId)
            .query('UPDATE CentroVacunacion SET id_Estado = @id_Estado WHERE id_CentroVacunacion = @id_CentroVacunacion');

        res.status(200).send({ message: 'Vaccination center deactivated successfully.' });
    } catch (err) {
        console.error('SQL error on DELETE /api/vaccination-centers/:id:', err);
        res.status(500).send({ message: 'Failed to deactivate vaccination center.', error: err.message });
    }
});

// --- Dashboard Endpoints ---
app.get('/api/dashboard/stats', [verifyToken, checkRole(['Administrador', 'Medico', 'Enfermera', 'Digitador'])], async (req, res) => {
    try {
        const pool = getPool();
        const result = await pool.request().execute('usp_GetDashboardStats');
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('SQL error on GET /api/dashboard/stats:', err);
        res.status(500).send({ message: 'Failed to retrieve dashboard stats.', error: err.message });
    }
});

// --- Vaccine Lot Endpoints ---
app.get('/api/vaccine-lots/active', [verifyToken, checkRole(['Administrador', 'Medico', 'Enfermera'])], async (req, res) => {
    console.log('Accessed GET /api/vaccine-lots/active endpoint');
    try {
        const pool = getPool();
        const result = await pool.request().execute('usp_GetActiveVaccineLots');
        res.json(result.recordset);
    } catch (err) {
        console.error('SQL error on GET /api/vaccine-lots/active:', err);
        res.status(500).send({ message: 'Failed to retrieve active vaccine lots.', error: err.message });
    }
});

app.post('/api/vaccine-lots', [verifyToken, checkRole(['Administrador', 'Medico'])], async (req, res) => {
    console.log(`Accessed POST /api/vaccine-lots with body: ${JSON.stringify(req.body)}`);
    try {
        const { id_Vacuna, NumeroLote, FechaFabricacion, FechaVencimiento, CantidadInicial, id_CentroVacunacion } = req.body;
        const pool = getPool();
        const request = pool.request()
            .input('id_Vacuna', sql.Int, id_Vacuna)
            .input('NumeroLote', sql.NVarChar(50), NumeroLote)
            .input('FechaFabricacion', sql.Date, FechaFabricacion)
            .input('FechaVencimiento', sql.Date, FechaVencimiento)
            .input('CantidadInicial', sql.Int, CantidadInicial)
            .input('id_CentroVacunacion', sql.Int, id_CentroVacunacion);
        const result = await request.execute('usp_AddVaccineLot');
        res.status(201).json({ message: 'Vaccine lot added successfully.', data: result.recordset });
    } catch (err) {
        console.error('SQL error on POST /api/vaccine-lots:', err);
        res.status(500).send({ message: 'Failed to add vaccine lot.', error: err.message });
    }
});

// --- Vaccination Endpoints ---
app.post('/api/vaccinations', [verifyToken, checkRole(['Medico', 'Enfermera'])], async (req, res) => {
    console.log(`Accessed POST /api/vaccinations with body: ${JSON.stringify(req.body)}`);
    try {
        const { id_Cita, id_LoteVacuna, FechaAplicacion, EdadAlVacunar, id_PersonalSalud, Observaciones } = req.body;
        const pool = getPool();
        const request = pool.request()
            .input('id_Cita', sql.Int, id_Cita)
            .input('id_LoteVacuna', sql.Int, id_LoteVacuna)
            .input('FechaAplicacion', sql.Date, FechaAplicacion)
            .input('EdadAlVacunar', sql.NVarChar(50), EdadAlVacunar) // Or INT if it's just age in months/years
            .input('id_PersonalSalud', sql.Int, id_PersonalSalud)
            .input('Observaciones', sql.NVarChar(sql.MAX), Observaciones);
        await request.execute('usp_RecordVaccination');
        res.status(201).json({ message: 'Vaccination recorded successfully.' });
    } catch (err) {
        console.error('SQL error on POST /api/vaccinations:', err);
        res.status(500).send({ message: 'Failed to record vaccination.', error: err.message });
    }
});

// --- General GET Endpoints ---

// --- Child Registration Endpoints ---
app.post('/api/children', [verifyToken, checkRole(['Tutor'])], async (req, res) => {
    try {
        // Step 1: Get id_Usuario from the JWT token.
        const { id: id_Usuario } = req.user;
        const { Nombres, Apellidos, Genero, FechaNacimiento, DireccionResidencia } = req.body;

        // Step 2: Validate the incoming data.
        if (!Nombres || !Apellidos || !Genero || !FechaNacimiento || !DireccionResidencia) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
        }

        const pool = getPool();

        // Step 3: Use id_Usuario to find the correct id_Tutor from the Tutor table.
        const tutorResult = await pool.request()
            .input('id_Usuario', sql.Int, id_Usuario)
            .query('SELECT id_Tutor FROM Tutor WHERE id_Usuario = @id_Usuario');

        if (tutorResult.recordset.length === 0) {
            return res.status(404).send({ message: 'Tutor profile not found for the logged-in user.' });
        }
        const id_Tutor = tutorResult.recordset[0].id_Tutor;

        // Step 4: Call the stored procedure with the correct id_Tutor and parameter names.
        const result = await pool.request()
            .input('id_Tutor', sql.Int, id_Tutor)
            .input('Nombres_Nino', sql.NVarChar(100), Nombres)
            .input('Apellidos_Nino', sql.NVarChar(100), Apellidos)
            .input('Genero_Nino', sql.Char(1), Genero)
            .input('FechaNacimiento_Nino', sql.Date, FechaNacimiento)
            .input('DireccionResidencia_Nino', sql.NVarChar(255), DireccionResidencia)
            .execute('usp_RegisterNino');

        // Step 5: Return the successful result.
        res.status(201).json(result.recordset[0]);

    } catch (err) {
        // Step 6: Handle any errors.
        console.error('SQL error on POST /api/children:', err);
        res.status(500).send({ message: 'Failed to register child.', error: err.message });
    }
});

// POST /api/children/link - Link a tutor to an existing child via activation code
app.post('/api/children/link', [verifyToken, checkRole(['Tutor'])], async (req, res) => {
    try {
        const { id: id_Usuario } = req.user; // Correctly get user ID from token
        const { CodigoActivacion } = req.body;

        if (!CodigoActivacion) {
            return res.status(400).send({ message: 'Activation code is required.' });
        }

        const pool = getPool();

        // Look up id_Tutor from id_Usuario
        const tutorResult = await pool.request()
            .input('id_Usuario', sql.Int, id_Usuario)
            .query('SELECT id_Tutor FROM Tutor WHERE id_Usuario = @id_Usuario');

        if (tutorResult.recordset.length === 0) {
            return res.status(404).send({ message: 'Tutor profile not found for the logged-in user.' });
        }
        const id_Tutor = tutorResult.recordset[0].id_Tutor;

        // Call procedure with the correct id_Tutor
        const result = await pool.request()
            .input('id_Tutor', sql.Int, id_Tutor)
            .input('CodigoActivacion', sql.NVarChar(10), CodigoActivacion)
            .execute('usp_LinkNinoToTutor');

        if (!result.recordset || result.recordset.length === 0) {
            return res.status(404).send({ message: 'Link failed. The activation code may be invalid or already used.' });
        }

        res.status(200).json(result.recordset[0]);
    } catch (err) {
        console.error('SQL error on POST /api/children/link:', err);
        res.status(500).send({ message: 'Failed to link child.', error: err.message });
    }
});


// GET /api/children/tutor - Get all children for the logged-in tutor
app.get('/api/children/tutor', [verifyToken, checkRole(['Tutor'])], async (req, res) => {
    try {
        const { id: id_Usuario } = req.user;
        console.log(`[CHILDREN] Fetching children for user ID: ${id_Usuario}`);
        const pool = getPool();

        const childrenResult = await pool.request()
            .input('id_Usuario', sql.Int, id_Usuario)
            .execute('usp_GetNinosByTutor');

        console.log(`[CHILDREN] Successfully fetched ${childrenResult.recordset.length} children for user ID ${id_Usuario}.`);
        res.status(200).json(childrenResult.recordset);

    } catch (err) {
        console.error('SQL error on GET /api/children/tutor:', err);
        res.status(500).send({ message: 'Failed to retrieve children.', error: err.message });
    }
});


app.get('/api/tutors', [verifyToken, checkRole(['Administrador'])], async (req, res) => {
    console.log('Accessed GET /api/tutors endpoint');
    try {
        const pool = getPool();
        const result = await pool.request().execute('usp_GetAllTutors');
        res.json(result.recordset);
    } catch (err) {
        console.error('SQL error on GET /api/tutors:', err);
        res.status(500).send({ message: 'Failed to retrieve tutors.', error: err.message });
    }
});