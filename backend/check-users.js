const db = require('./db');
async function run() {
    try {
        const result = await db.query('SELECT * FROM users');
        console.log(JSON.stringify(result.rows, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
run();
