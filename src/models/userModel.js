const UserModel = {
    async registerUser(connection, username, email, password, phone, first_name, last_name, dni) {
        try {

            const [result] = await connection.query(
                `CALL REGISTER_USER(?, ?, ?, ?, ?, ?, ?, @user_id); SELECT @user_id AS user_id;`,
                [username, email, password, phone, first_name, last_name, dni]
            );
            const userId = result[1][0].user_id;
            return { success: true, message: 'Usuario registrado con éxito', id: userId };
        } catch (error) {
            throw new Error(error.sqlMessage || 'Error al registrar usuario');
        }
    },

    async checkEmail(connection, email) {
        try {

            await connection.query('CALL VALIDATE_EMAIL(?, @status)', [email]);
            const [[result]] = await connection.execute('SELECT @status AS status');

            result.status = Boolean(result.status);
            return result;

        } catch (error) {
            console.error('Error al verificar el email:', error);
            return null;
        }
    },

    async validateCredentials(connection, email) {
        try {

            await connection.query('CALL VALIDATE_CREDENTIALS(?, @user_id, @username, @password, @status)', [email]);
            const [[result]] = await connection.execute('SELECT @user_id AS user_id, @username AS username, @password AS password, @status AS status');

            result.status = Boolean(result.status);
            return result;

        } catch (error) {
            console.error('Error al verificar el email:', error);
            return null;
        }
    },

    async updateUser(connection, userId, username, email, phone, first_name, last_name, dni) {
        try {
            await connection.query('CALL UPDATE_USER(?, ?, ?, ?, ?, ?, ?)', [userId, username, email, phone, first_name, last_name, dni]);
            return { success: true, message: 'Usuario actualizado con éxito' };
        } catch (error) {
            throw new Error(error.sqlMessage || 'Error al actualizar usuario');
        }
    },

    async deleteUser(connection, userId) {
        try {
            await connection.query('CALL DELETE_USER(?)', [userId]);
            return { success: true, message: 'Usuario eliminado con éxito' };
        } catch (error) {
            throw new Error(error.sqlMessage || 'Error al actualizar usuario');
        }
    },

    async getUserById(connection, userId) {
        try {
            const [rows] = await connection.query('CALL GET_USER_BY_ID(?)', [userId]);

            const user = rows[0]?.[0] || null;

            return user;
        } catch (error) {
            throw new Error(error.sqlMessage || 'Usuario No Encontrado ');
        }
    }
}

module.exports = UserModel;