const userModel = require("../models/userModel");
const userRolesModel = require("../models/userRolesModel");
const bcrypt = require("bcryptjs");
const db = require("../config/db");

module.exports = {
    create: async (req, res, next) => {
        let connection; 

        try {
            const { username, email, password, phone, first_name, last_name, dni, roles } = req.body;

            if ([username, email, password, phone, first_name, last_name, dni].some(field => !field)) {
                return res.status(400).json({ message: 'Todos los campos son obligatorios', code: 'E001' });
            }

            connection = await db.getConnection();
            await connection.beginTransaction(); 

            const existingUser = await userModel.validateUser(connection,email);
            
            if (existingUser === 1) {
                return res.status(401).json({ message: 'El correo ya está registrado', code: 'E002' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const result = await userModel.registerUser(connection,username, email, hashedPassword, phone, first_name, last_name, dni);
            await userRolesModel.registerUserRoles(connection,roles, result.id);

            await connection.commit(); 
            res.status(201).json({ message: 'Usuario registrado exitosamente'});

        } catch (error) {

            if (connection) await connection.rollback();
            console.error('Error al registrar usuario:', error);
            res.status(500).json({ message: 'Error en el servidor', error: error.message });

        } finally {

            if (connection) connection.release();

        }
    }
};
