const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_VQWhqU4l9osL@ep-winter-bread-amooorvu.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require',
});

async function checkSchema() {
  try {
    const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'teachers_profile'");
    console.log("Columns in teachers_profile:", res.rows.map(r => r.column_name));
    
    // Test the getTeachers query
    const res2 = await pool.query(`
        SELECT u.id, u.name, u.phone, u.city,
               tp.diploma_level as "diploma",
               tp.subjects, tp.description, tp.rating, tp.reviews_count as "reviewsCount",
               tp.availability_days, tp.profile_picture_url
        FROM users u
        JOIN teachers_profile tp ON u.id = tp.user_id
        WHERE u.role = 'teacher'
    `);
    console.log("Query success! Found", res2.rows.length, "teachers");
  } catch (err) {
    console.error("Schema error:", err.message);
  } finally {
    pool.end();
  }
}

checkSchema();
