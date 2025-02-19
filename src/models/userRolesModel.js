const userRolesModel = {
    async registerUserRoles(connection,roles, userId) {
        try {
            if (Array.isArray(roles) && roles.length > 0) {
                const rolesJson = JSON.stringify(roles.map(roleId => ({ USER_ID: userId, ROLE_ID: roleId })));
                console.log(rolesJson);
                await connection.query('CALL REGISTER_USER_ROLES(?)', [rolesJson]);
                return { success: true, message: 'Rol Asignado al Usuario con éxito' };
            }
          
        } catch (error) {
            return { success: false, message: error.sqlMessage || 'Error al asignar rol al usuario' };
        }
    }
}

module.exports = userRolesModel;