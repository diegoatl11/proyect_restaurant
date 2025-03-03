const userModel = require("../models/userModel");
const accesModel = require("../models/accessModel");
const userRolesModel = require("../models/userRolesModel");
const roleModel = require("../models/rolesModel");
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

            const existingUser = await userModel.checkEmail(connection, email);
            if (existingUser.status) {
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

            const result = await userModel.validateCredentials(connection, email);

            if (!result.status) {
                return res.status(401).json({ message: 'Credenciales incorrectas. Inténtalo de nuevo.', code: 'E002' });
            }

            if (!await bcrypt.compare(password, result.password)) {
                await accesModel.registerLogAccess(connection, result.user_id, email, req.ip, req.headers["user-agent"], "FAILED");
                await connection.commit();
                return res.status(401).json({ message: "Credenciales incorrectas. Inténtalo de nuevo.", code: "E002" });
            }

            if (!email || !password) {
                return res.status(400).json({ message: "Correo y contraseña son obligatorios", code: "E001" });
            }

            const userRole = await roleModel.getRolesById(connection, result.user_id);

            const token = jwt.sign({ id: result.user_id, email, roles: userRole }, process.env.JWT_SECRET, { expiresIn: "2h" });

            await accesModel.registerLogAccess(connection, result.user_id, email, req.ip, req.headers["user-agent"], "SUCCESS");
            await connection.commit();

            res.cookie("access-token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "Strict",
                maxAge: 2 * 60 * 60 * 1000
            });

            res.status(200).json({ message: "Login exitoso", userId: result.user_id, username: result.username, roles: userRole });

        } catch (error) {
            if (connection) await connection.rollback();
            console.error('Error en el login:', error);
            res.status(500).json({ message: 'Error en el servidor', error: error.message });
        } finally {
            if (connection) connection.release();
        }
    },

    update: async (req, res) => {
        let connection;

        try {
            const { username, email, phone, first_name, last_name, dni } = req.body;
            const userId = req.user.id;

            if ([username, email, phone, first_name, last_name, dni].some(field => !field)) {
                return res.status(400).json({ message: 'Todos los campos son obligatorios', code: 'E001' });
            }

            connection = await db.getConnection();
            await connection.beginTransaction();

            const result = await userModel.updateUser(connection, userId, username, email, phone, first_name, last_name, dni);

            await connection.commit();
            res.status(200).json({ message: 'Usuario actualizado con éxito' });

        } catch (error) {
            if (connection) await connection.rollback();
            console.error('Error al actualizar usuario:', error);
            res.status(500).json({ message: 'Error en el servidor', error: error.message });
        } finally {
            if (connection) connection.release();
        }
    },

    delete: async (req, res) => {
        let connection;
        try {
            const userId = req.params.id;

            connection = await db.getConnection();
            await connection.beginTransaction();

            await userModel.deleteUser(connection, userId);

            await connection.commit();
            res.status(200).json({ message: "Usuario eliminado correctamente" });

        } catch (error) {
            if (connection) await connection.rollback();
            console.error("Error al eliminar usuario:", error);
            res.status(500).json({ message: "Error en el servidor", error: error.message });
        } finally {
            if (connection) connection.release();
        }
    },

    getUserInfo: async (req, res) => {
        let connection;
        try {
            const { id } = req.user
            connection = await db.getConnection();
            await connection.beginTransaction();

            const result = await userModel.getUserById(connection, id);
            await connection.commit();
            res.status(200).json(result);

        } catch (error) {
            if (connection) await connection.rollback();
            console.error("Error al encontrar usuario:", error);
            res.status(500).json({ message: "Error en el servidor", error: error.message });
        } finally {
            if (connection) connection.release();
        }

    },


    logout: async (req, res) => {
        res.clearCookie("access-token");
        res.json({ message: "Sesión cerrada" });
    }


};
