const UserModel = {
    async registerUser(connection,username, email, password, phone, first_name, last_name, dni) {
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

    async validateUser(connection,email) {
        try {
            const [rows] = await connection.query('SELECT email_exists(?) AS exists_result', [email]);
            return rows[0].exists_result;
        } catch (error) {
            console.error('Error al verificar el email:', error);
            return 0;
        }
    }
}

module.exports = UserModel;