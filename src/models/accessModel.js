const AccessModel = {

    async registerLogAccess(connection, userId, email, ip_address, user_agent, login_status) {
        try {
            await connection.query('CALL REGISTER_ACCESS_LOG(?, ?, ?, ?, ?)', [userId, email, ip_address, user_agent, login_status]);
        } catch (error) {
            console.error('Error al registrar log de acceso:', error);

        }
    }
}

module.exports = AccessModel;