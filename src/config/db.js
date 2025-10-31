const mysql = require('mysql2');
require('dotenv').config();

const pool  = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true,
    waitForConnections: true,
    allowPublicKeyRetrieval: true, 
    ssl: false                   
});

const promisePool = pool.promise();
module.exports = promisePool;
