const db = require('../config/db');

const rolesModel = {
    async registerRole(name) {
        try {
            await db.query('CALL REGISTER_ROLE(?)', [name]);
            return { success: true, message: 'Rol registrado con éxito' };
        } catch (error) {
            return { success: false, message: error.sqlMessage || 'Error al registrar rol' };
        }
    }
}

module.exports = rolesModel;