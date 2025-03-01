const rolesModel = {
    async registerRole(connection, name) {
        try {
            await connection.query("CALL REGISTER_ROLE(?)", [name]);
            return { success: true, message: "Rol registrado con éxito" };
        } catch (error) {
            return {
                success: false,
                message: error.sqlMessage || "Error al registrar rol",
            };
        }
    },

    async getRolesById(connection, userId) {
        try {
            const [rows] = await connection.query("CALL GET_USER_ROLE(?)", [userId]);
            const roles = rows[0].map((row) => row.ROLE_NAME);
            return roles;
        } catch (error) {
            throw new Error(error.sqlMessage || "Rol No Encontrado ");
        }
    },
};

module.exports = rolesModel;
