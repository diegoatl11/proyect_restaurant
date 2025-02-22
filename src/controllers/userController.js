const userModel = require("../models/userModel");
const userRolesModel = require("../models/userRolesModel");
const jwt = require("jsonwebtoken");
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

            const existingUser = await userModel.validateUser(connection, email);

            if (existingUser === 1) {
                return res.status(401).json({ message: 'El correo ya está registrado', code: 'E002' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const result = await userModel.registerUser(connection, username, email, hashedPassword, phone, first_name, last_name, dni);
            await userRolesModel.registerUserRoles(connection, roles, result.id);

            await connection.commit();
            res.status(201).json({ message: 'Usuario registrado exitosamente' });

        } catch (error) {

            if (connection) await connection.rollback();
            console.error('Error al registrar usuario:', error);
            res.status(500).json({ message: 'Error en el servidor', error: error.message });

        } finally {

            if (connection) connection.release();

        }
    },

    login: async (req, res) => {
        let connection;

        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ message: "Correo y contraseña son obligatorios", code: "E001" });
            }

            connection = await db.getConnection();
            await connection.beginTransaction();

            const result = await userModel.checkEmailLogin(connection, email);
            if (!result.status) {
                return res.status(401).json({ message: 'Correo no registrado', code: 'E002' });
            }

            if (!await bcrypt.compare(password, result.password)) {
                await userModel.registerLogAccess(connection, result.user_id, email, req.ip, req.headers["user-agent"], "FAILED");
                await connection.commit();
                return res.status(401).json({ message: "Contraseña incorrecta", code: "E003" });
            }

            const token = jwt.sign({ id: result.user_id, email }, process.env.JWT_SECRET, { expiresIn: "2h" });

            await userModel.registerLogAccess(connection, result.user_id, email, req.ip, req.headers["user-agent"], "SUCCESS");
            await connection.commit();
            res.status(200).json({ message: "Login exitoso", token });

        } catch (error) {
            if (connection) await connection.rollback();
            console.error('Error en el login:', error);
            res.status(500).json({ message: 'Error en el servidor', error: error.message });
        } finally {
            if (connection) connection.release();
        }
    }
};
