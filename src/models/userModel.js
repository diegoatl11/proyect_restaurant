const { connect } = require("../config/db");

const UserModel = {
    async registerUser(connection, username, email, password, phone, first_name, last_name, dni) {
        try {

            const [result] = await connection.query(
                `CALL registerUser(?, ?, ?, ?, ?, ?, ?, @user_id); SELECT @user_id AS user_id;`,
                [username, email, password, phone, first_name, last_name, dni]
            );
            const userId = result[1][0].user_id;
            return { success: true, message: 'Usuario registrado con éxito', id: userId };
        } catch (error) {
            return { success: false, message: error.sqlMessage || 'Error al registrar usuario' };
        }
    },

    async validateUser(connection, email) {
        try {
            const [rows] = await connection.query('SELECT email_exists(?) AS exists_result', [email]);
            return rows[0].exists_result;
        } catch (error) {
            console.error('Error al verificar el email:', error);
            return 0;
        }
    },

    async checkEmailLogin(connection, email) {
        try {

            await connection.query('CALL VALIDATE_EMAIL(?, @user_id, @password, @status)', [email]);
            const [[result]] = await connection.execute('SELECT @user_id AS user_id, @password AS password, @status AS status');

            result.status = Boolean(result.status);
            return result;

        } catch (error) {
            console.error('Error al verificar el email:', error);
            return null;
        }
    },

    async registerLogAccess(connection, userId, email, ip_address, user_agent, login_status) {
        try {
            await connection.query('CALL REGISTER_ACCESS_LOG(?, ?, ?, ?, ?)', [userId, email, ip_address, user_agent, login_status]);
        } catch (error) {
            console.error('Error al registrar log de acceso:', error);

        }
    }

}

module.exports = UserModel;