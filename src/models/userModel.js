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
            throw new Error(error.sqlMessage || 'Error al registrar usuario');
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

    async getUserById(connection, userId) {
        try {
            const [result] = await connection.query('CALL GET_USER_BY_ID(?)', [userId]);
            return result[0];
        } catch (error) {
            console.error('Error al obtener usuario por ID:', error);
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
    }
}

module.exports = UserModel;