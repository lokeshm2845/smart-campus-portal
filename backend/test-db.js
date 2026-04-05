const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');
const envPath = path.join(__dirname, '../.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error('Dotenv Error:', result.error);
} else {
    console.log('Dotenv loaded successfully from:', envPath);
    console.log('Parsed vars:', result.parsed);
}
const fs = require('fs');

async function testConnection() {
    let output = '';
    const log = (msg) => {
        console.log(msg);
        output += msg + '\n';
    };

    try {
        const config = {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3307
        };
        log('Testing with config: ' + JSON.stringify(config, null, 2));
        
        const pool = mysql.createPool(config);
        const [rows] = await pool.query('SELECT 1 + 1 AS result');
        log('Connection test successful. Result: ' + rows[0].result);
        
        const [usersExist] = await pool.query('SHOW TABLES LIKE "Users"');
        log('Users table check: ' + (usersExist.length > 0 ? 'Exists' : 'Missing'));
        
        if (usersExist.length > 0) {
            const [users] = await pool.query('SELECT * FROM Users LIMIT 5');
            log('Users found: ' + JSON.stringify(users, null, 2));
        }

        await pool.end();
    } catch (error) {
        log('Connection test failed!');
        log('Code: ' + error.code);
        log('Message: ' + error.message);
        log('Stack: ' + error.stack);
    } finally {
        fs.writeFileSync('db-test-log.txt', output);
    }
}

testConnection();
