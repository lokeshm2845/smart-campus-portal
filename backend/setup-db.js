const db = require('./db');
const fs = require('fs');
const path = require('path');

async function setup() {
    try {
        console.log("🚀 Starting Database Setup on Supabase...");
        
        // Read the SQL file
        const sqlPath = path.join(__dirname, '../database/database_setup.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Execute the SQL
        await db.query(sql);
        
        console.log("✅ Database tables created and sample data inserted successfully!");
    } catch (err) {
        console.error("❌ Setup Failed!");
        console.error(err.message);
    } finally {
        process.exit();
    }
}

setup();
