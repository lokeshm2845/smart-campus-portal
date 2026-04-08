const db = require('./db');

async function testConnection() {
    try {
        console.log("🔄 Attempting to connect to Supabase...");
        
        // 1. Test basic connectivity
        const now = await db.query('SELECT NOW()');
        console.log("✅ Connection Successful!");
        console.log("🕒 Server Time from Supabase:", now.rows[0].now);

        // 2. Test if tables exist (checking 'users' table)
        const tables = await db.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        
        console.log("📊 Tables found in your database:");
        tables.rows.forEach(row => console.log(` - ${row.table_name}`));

    } catch (err) {
        console.error("❌ Connection Failed!");
        console.error("Reason:", err.message);
    } finally {
        process.exit();
    }
}

testConnection();
