const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('../frontend'));

// API Routes

// Login Authentication
app.post('/api/login', async (req, res) => {
    try {
        const { user_id, password, role } = req.body;
        const [users] = await db.execute(
            'SELECT * FROM Users WHERE user_id = ? AND password_hash = ? AND role = ?',
            [user_id, password, role]
        );

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
        const [rows] = await db.query('SELECT * FROM Students');
        res.json(rows);
    } catch (e) { res.status(500).json({error: e.message}); }
});

app.post('/api/students', async (req, res) => {
    try {
        const { student_id, name, email, phone, department, year, hostel_id } = req.body;
        await db.execute(
            'INSERT INTO Students (student_id, name, email, phone, department, year, hostel_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
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
        await db.execute(
            'UPDATE Students SET name=?, email=?, phone=?, department=?, year=?, hostel_id=? WHERE student_id=?',
            [name, email, phone, department, year, hostel_id, req.params.id]
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/students/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM Students WHERE student_id=?', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin - Complaints
app.get('/api/complaints', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT c.*, s.name as student_name FROM Complaints c JOIN Students s ON c.student_id = s.student_id');
        res.json(rows);
    } catch (e) { res.status(500).json({error: e.message}); }
});

app.put('/api/complaints/:id/resolve', async (req, res) => {
    try {
        await db.execute('UPDATE Complaints SET status="Resolved" WHERE complaint_id=?', [req.params.id]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({error: e.message}); }
});

// Student - Profile
app.get('/api/student/:id', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM Students WHERE student_id=?', [req.params.id]);
        res.json(rows[0]);
    } catch (e) { res.status(500).json({error: e.message}); }
});

app.get('/api/student/:id/attendance', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT a.*, c.course_name FROM Attendance a JOIN Courses c ON a.course_id = c.course_id WHERE a.student_id=?', [req.params.id]);
        res.json(rows);
    } catch (e) { res.status(500).json({error: e.message}); }
});

app.get('/api/student/:id/marks', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT m.*, c.course_name FROM Marks m JOIN Courses c ON m.course_id = c.course_id WHERE m.student_id=?', [req.params.id]);
        res.json(rows);
    } catch (e) { res.status(500).json({error: e.message}); }
});

app.get('/api/student/:id/library', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM Library WHERE student_id=?', [req.params.id]);
        res.json(rows);
    } catch (e) { res.status(500).json({error: e.message}); }
});

app.get('/api/student/:id/fee', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM FeePayment WHERE student_id=?', [req.params.id]);
        res.json(rows);
    } catch (e) { res.status(500).json({error: e.message}); }
});

app.post('/api/student/complaint', async (req, res) => {
    try {
        const { student_id, complaint_text } = req.body;
        await db.execute('INSERT INTO Complaints (student_id, complaint_text, date_submitted) VALUES (?, ?, CURDATE())', [student_id, complaint_text]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({error: e.message}); }
});

// Student - Courses & Assignments
app.get('/api/courses', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT c.*, f.name as faculty_name FROM Courses c LEFT JOIN Faculty f ON c.faculty_id = f.faculty_id');
        res.json(rows);
    } catch (e) { res.status(500).json({error: e.message}); }
});

app.get('/api/student/:id/assignments', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT a.*, c.course_name FROM Assignments a JOIN Courses c ON a.course_id = c.course_id');
        res.json(rows);
    } catch (e) { res.status(500).json({error: e.message}); }
});

app.post('/api/student/assignments/submit', async (req, res) => {
    try {
        const { assignment_id, student_id, submission_link } = req.body;
        await db.execute('INSERT INTO AssignmentSubmissions (assignment_id, student_id, submission_link) VALUES (?, ?, ?)', [assignment_id, student_id, submission_link]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({error: e.message}); }
});

app.post('/api/student/feedback', async (req, res) => {
    try {
        const { student_id, faculty_id, feedback_text, rating } = req.body;
        await db.execute('INSERT INTO FacultyFeedback (student_id, faculty_id, feedback_text, rating) VALUES (?, ?, ?, ?)', [student_id, faculty_id, feedback_text, rating]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({error: e.message}); }
});

// Faculty - Profile and functions
app.get('/api/faculty/:id/courses', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM Courses WHERE faculty_id=?', [req.params.id]);
        res.json(rows);
    } catch (e) { res.status(500).json({error: e.message}); }
});

app.post('/api/faculty/attendance', async (req, res) => {
    try {
        const { student_id, course_id, status, semester } = req.body;
        await db.execute('INSERT INTO Attendance (student_id, course_id, date, status, semester) VALUES (?, ?, CURDATE(), ?, ?)', [student_id, course_id, status, semester]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({error: e.message}); }
});

app.post('/api/faculty/marks', async (req, res) => {
    try {
        const { student_id, course_id, internal, external, grade } = req.body;
        await db.execute('INSERT INTO Marks (student_id, course_id, internal_marks, external_marks, grade) VALUES (?, ?, ?, ?, ?)', [student_id, course_id, internal, external, grade]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({error: e.message}); }
});

app.post('/api/faculty/assignments', async (req, res) => {
    try {
        const { course_id, title, description, due_date } = req.body;
        await db.execute('INSERT INTO Assignments (course_id, title, description, due_date) VALUES (?, ?, ?, ?)', [course_id, title, description, due_date]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({error: e.message}); }
});

// Add generic stats for dashboard
app.get('/api/stats', async (req, res) => {
    try {
        const [students] = await db.query('SELECT COUNT(*) as c FROM Students');
        const [faculty] = await db.query('SELECT COUNT(*) as c FROM Faculty');
        const [courses] = await db.query('SELECT COUNT(*) as c FROM Courses');
        const [complaints] = await db.query('SELECT COUNT(*) as c FROM Complaints WHERE status != "Resolved"');
        res.json({
            students: students[0].c,
            faculty: faculty[0].c,
            courses: courses[0].c,
            pending_complaints: complaints[0].c
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
