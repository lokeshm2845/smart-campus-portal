const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes

// Login Authentication
app.post('/api/login', async (req, res) => {
    try {
        const { user_id, password, role } = req.body;
        const result = await db.query(
            'SELECT * FROM users WHERE user_id = $1 AND password_hash = $2 AND role = $3',
            [user_id, password, role]
        );
        const users = result.rows;

        if (users.length > 0) {
            res.json({ success: true, user: users[0] });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials or role' });
        }
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
});

// Admin - Manage Students (CRUD)
app.get('/api/students', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM students');
        res.json(result.rows);
    } catch (e) { res.status(500).json({error: e.message}); }
});

app.post('/api/students', async (req, res) => {
    try {
        const { student_id, name, email, phone, department, year, hostel_id } = req.body;
        await db.query(
            'INSERT INTO students (student_id, name, email, phone, department, year, hostel_id) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [student_id, name, email, phone, department, year, hostel_id]
        );
        res.json({ success: true, message: 'Student added' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/students/:id', async (req, res) => {
    try {
        const { name, email, phone, department, year, hostel_id } = req.body;
        await db.query(
            'UPDATE students SET name=$1, email=$2, phone=$3, department=$4, year=$5, hostel_id=$6 WHERE student_id=$7',
            [name, email, phone, department, year, hostel_id, req.params.id]
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/students/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM students WHERE student_id=$1', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin - Complaints
app.get('/api/complaints', async (req, res) => {
    try {
        const result = await db.query('SELECT c.*, s.name as student_name FROM complaints c JOIN students s ON c.student_id = s.student_id');
        res.json(result.rows);
    } catch (e) { res.status(500).json({error: e.message}); }
});

app.put('/api/complaints/:id/resolve', async (req, res) => {
    try {
        await db.query('UPDATE complaints SET status=$1 WHERE complaint_id=$2', ["Resolved", req.params.id]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({error: e.message}); }
});

// Student - Profile
app.get('/api/student/:id', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM students WHERE student_id=$1', [req.params.id]);
        res.json(result.rows[0]);
    } catch (e) { res.status(500).json({error: e.message}); }
});

app.get('/api/student/:id/attendance', async (req, res) => {
    try {
        const result = await db.query('SELECT a.*, c.course_name FROM attendance a JOIN courses c ON a.course_id = c.course_id WHERE a.student_id=$1', [req.params.id]);
        res.json(result.rows);
    } catch (e) { res.status(500).json({error: e.message}); }
});

app.get('/api/student/:id/marks', async (req, res) => {
    try {
        const result = await db.query('SELECT m.*, c.course_name FROM marks m JOIN courses c ON m.course_id = c.course_id WHERE m.student_id=$1', [req.params.id]);
        res.json(result.rows);
    } catch (e) { res.status(500).json({error: e.message}); }
});

app.get('/api/student/:id/library', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM library WHERE student_id=$1', [req.params.id]);
        res.json(result.rows);
    } catch (e) { res.status(500).json({error: e.message}); }
});

app.get('/api/student/:id/fee', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM fee_payment WHERE student_id=$1', [req.params.id]);
        res.json(result.rows);
    } catch (e) { res.status(500).json({error: e.message}); }
});

app.post('/api/student/complaint', async (req, res) => {
    try {
        const { student_id, complaint_text } = req.body;
        await db.query('INSERT INTO complaints (student_id, complaint_text, date_submitted) VALUES ($1, $2, CURRENT_DATE)', [student_id, complaint_text]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({error: e.message}); }
});

// Student - Courses & Assignments
app.get('/api/courses', async (req, res) => {
    try {
        const result = await db.query('SELECT c.*, f.name as faculty_name FROM courses c LEFT JOIN faculty f ON c.faculty_id = f.faculty_id');
        res.json(result.rows);
    } catch (e) { res.status(500).json({error: e.message}); }
});

app.get('/api/student/:id/assignments', async (req, res) => {
    try {
        const result = await db.query('SELECT a.*, c.course_name FROM assignments a JOIN courses c ON a.course_id = c.course_id');
        res.json(result.rows);
    } catch (e) { res.status(500).json({error: e.message}); }
});

app.post('/api/student/assignments/submit', async (req, res) => {
    try {
        const { assignment_id, student_id, submission_link } = req.body;
        await db.query('INSERT INTO assignment_submissions (assignment_id, student_id, submission_link) VALUES ($1, $2, $3)', [assignment_id, student_id, submission_link]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({error: e.message}); }
});

app.post('/api/student/feedback', async (req, res) => {
    try {
        const { student_id, faculty_id, feedback_text, rating } = req.body;
        await db.query('INSERT INTO faculty_feedback (student_id, faculty_id, feedback_text, rating) VALUES ($1, $2, $3, $4)', [student_id, faculty_id, feedback_text, rating]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({error: e.message}); }
});

// Faculty - Profile and functions
app.get('/api/faculty/:id/courses', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM courses WHERE faculty_id=$1', [req.params.id]);
        res.json(result.rows);
    } catch (e) { res.status(500).json({error: e.message}); }
});

app.post('/api/faculty/attendance', async (req, res) => {
    try {
        const { student_id, course_id, status, semester } = req.body;
        await db.query('INSERT INTO attendance (student_id, course_id, date, status, semester) VALUES ($1, $2, CURRENT_DATE, $3, $4)', [student_id, course_id, status, semester]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({error: e.message}); }
});

app.post('/api/faculty/marks', async (req, res) => {
    try {
        const { student_id, course_id, internal, external, grade } = req.body;
        await db.query('INSERT INTO marks (student_id, course_id, internal_marks, external_marks, grade) VALUES ($1, $2, $3, $4, $5)', [student_id, course_id, internal, external, grade]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({error: e.message}); }
});

app.post('/api/faculty/assignments', async (req, res) => {
    try {
        const { course_id, title, description, due_date } = req.body;
        await db.query('INSERT INTO assignments (course_id, title, description, due_date) VALUES ($1, $2, $3, $4)', [course_id, title, description, due_date]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({error: e.message}); }
});

// Add generic stats for dashboard
app.get('/api/stats', async (req, res) => {
    try {
        const students = await db.query('SELECT COUNT(*) as c FROM students');
        const faculty = await db.query('SELECT COUNT(*) as c FROM faculty');
        const courses = await db.query('SELECT COUNT(*) as c FROM courses');
        const complaints = await db.query('SELECT COUNT(*) as c FROM complaints WHERE status != $1', ["Resolved"]);
        res.json({
            students: students.rows[0].c,
            faculty: faculty.rows[0].c,
            courses: courses.rows[0].c,
            pending_complaints: complaints.rows[0].c
        });
    } catch (e) {
        res.status(500).json({error: e.message});
    }
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}

// Export the app for Vercel Serverless Functions deployment
module.exports = app;
