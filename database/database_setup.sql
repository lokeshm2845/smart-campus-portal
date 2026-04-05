CREATE DATABASE IF NOT EXISTS smart_campus_db;
USE smart_campus_db;

-- 1. Hostel Table
CREATE TABLE Hostel (
    hostel_id VARCHAR(10) PRIMARY KEY,
    hostel_name VARCHAR(50) NOT NULL,
    room_number VARCHAR(10) NOT NULL,
    fees_status ENUM('Paid', 'Pending') DEFAULT 'Pending',
    UNIQUE (hostel_name, room_number)
);

-- 2. Students Table
CREATE TABLE Students (
    student_id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15),
    department VARCHAR(50) NOT NULL,
    year INT CHECK (year >= 1 AND year <= 4),
    hostel_id VARCHAR(10),
    FOREIGN KEY (hostel_id) REFERENCES Hostel(hostel_id) ON DELETE SET NULL
);

-- 3. Faculty Table
CREATE TABLE Faculty (
    faculty_id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    department VARCHAR(50) NOT NULL,
    designation VARCHAR(50),
    phone VARCHAR(15)
);

-- 4. Courses Table
CREATE TABLE Courses (
    course_id VARCHAR(20) PRIMARY KEY,
    course_name VARCHAR(100) NOT NULL,
    credits INT CHECK (credits > 0),
    faculty_id VARCHAR(20),
    department VARCHAR(50),
    FOREIGN KEY (faculty_id) REFERENCES Faculty(faculty_id) ON DELETE SET NULL
);

-- 5. Attendance Table
CREATE TABLE Attendance (
    attendance_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(20),
    course_id VARCHAR(20),
    date DATE NOT NULL,
    status ENUM('Present', 'Absent') NOT NULL,
    semester INT CHECK (semester >= 1 AND semester <= 8),
    FOREIGN KEY (student_id) REFERENCES Students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES Courses(course_id) ON DELETE CASCADE
);

-- 6. Marks/Grades Table
CREATE TABLE Marks (
    mark_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(20),
    course_id VARCHAR(20),
    internal_marks DECIMAL(5,2) DEFAULT 0.0 CHECK (internal_marks >= 0 AND internal_marks <= 40),
    external_marks DECIMAL(5,2) DEFAULT 0.0 CHECK (external_marks >= 0 AND external_marks <= 60),
    total_marks DECIMAL(5,2) GENERATED ALWAYS AS (internal_marks + external_marks) STORED,
    grade VARCHAR(2),
    FOREIGN KEY (student_id) REFERENCES Students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES Courses(course_id) ON DELETE CASCADE
);

-- 7. Library Table
CREATE TABLE `Library` (
    `book_id` VARCHAR(20) PRIMARY KEY,
    `title` VARCHAR(200) NOT NULL,
    `author` VARCHAR(100),
    `student_id` VARCHAR(20),
    `issue_date` DATE,
    `return_date` DATE,
    `status` ENUM('Available', 'Issued') DEFAULT 'Available',
    FOREIGN KEY (`student_id`) REFERENCES `Students`(`student_id`) ON DELETE SET NULL
);

-- 8. Events Table
CREATE TABLE Events (
    event_id VARCHAR(20) PRIMARY KEY,
    event_name VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    venue VARCHAR(100),
    description TEXT,
    organized_by VARCHAR(20),
    FOREIGN KEY (organized_by) REFERENCES Faculty(faculty_id) ON DELETE SET NULL
);

-- 9. Complaints Table
CREATE TABLE Complaints (
    complaint_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(20),
    complaint_text TEXT NOT NULL,
    status ENUM('Pending', 'In Progress', 'Resolved') DEFAULT 'Pending',
    date_submitted DATE NOT NULL,
    FOREIGN KEY (student_id) REFERENCES Students(student_id) ON DELETE CASCADE
);

-- 10. Fee Payment Table
CREATE TABLE FeePayment (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(20),
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    payment_date DATE NOT NULL,
    semester INT CHECK (semester >= 1 AND semester <= 8),
    payment_status ENUM('Successful', 'Failed', 'Pending') DEFAULT 'Pending',
    FOREIGN KEY (student_id) REFERENCES Students(student_id) ON DELETE CASCADE
);

-- 11. Assignments Table
CREATE TABLE Assignments (
    assignment_id INT AUTO_INCREMENT PRIMARY KEY,
    course_id VARCHAR(20),
    title VARCHAR(100),
    description TEXT,
    due_date DATE,
    FOREIGN KEY (course_id) REFERENCES Courses(course_id) ON DELETE CASCADE
);

-- 12. Assignment Submissions Table
CREATE TABLE AssignmentSubmissions (
    submission_id INT AUTO_INCREMENT PRIMARY KEY,
    assignment_id INT,
    student_id VARCHAR(20),
    submission_link VARCHAR(255),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assignment_id) REFERENCES Assignments(assignment_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES Students(student_id) ON DELETE CASCADE
);

-- 13. Faculty Feedback Table
CREATE TABLE FacultyFeedback (
    feedback_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(20),
    faculty_id VARCHAR(20),
    feedback_text TEXT,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    FOREIGN KEY (student_id) REFERENCES Students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (faculty_id) REFERENCES Faculty(faculty_id) ON DELETE CASCADE
);

-- Users Table for Authentication (Added for web dev requirements)
CREATE TABLE Users (
    user_id VARCHAR(20) PRIMARY KEY,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('Student', 'Faculty', 'Admin', 'HOD', 'Dean', 'Associate Dean', 'Director', 'Librarian') NOT NULL
);

-- Insert Sample Data
INSERT INTO Hostel (hostel_id, hostel_name, room_number, fees_status) VALUES
('H01', 'Boys Hostel A', '101', 'Paid'),
('H02', 'Boys Hostel A', '102', 'Paid'),
('H03', 'Boys Hostel B', '101', 'Pending'),
('H04', 'Boys Hostel B', '102', 'Paid'),
('H05', 'Girls Hostel A', '201', 'Paid'),
('H06', 'Girls Hostel A', '202', 'Pending'),
('H07', 'Girls Hostel B', '201', 'Paid'),
('H08', 'Girls Hostel B', '202', 'Paid'),
('H09', 'Boys Hostel C', '301', 'Pending'),
('H10', 'Girls Hostel C', '301', 'Paid');

INSERT INTO Students (student_id, name, email, phone, department, year, hostel_id) VALUES
('S001', 'John Doe', 'john@example.com', '9876543210', 'Computer Science', 3, 'H01'),
('S002', 'Jane Smith', 'jane@example.com', '9876543211', 'Electronics', 2, 'H05'),
('S003', 'Bob Johnson', 'bob@example.com', '9876543212', 'Mechanical', 4, 'H02'),
('S004', 'Alice Brown', 'alice@example.com', '9876543213', 'Computer Science', 1, 'H06'),
('S005', 'Charlie Davis', 'charlie@example.com', '9876543214', 'Civil', 3, 'H03'),
('S006', 'Eva White', 'eva@example.com', '9876543215', 'Electronics', 4, 'H07'),
('S007', 'Frank Miller', 'frank@example.com', '9876543216', 'Computer Science', 2, 'H04'),
('S008', 'Grace Taylor', 'grace@example.com', '9876543217', 'Information Tech', 3, 'H08'),
('S009', 'Harry Wilson', 'harry@example.com', '9876543218', 'Mechanical', 1, 'H09'),
('S010', 'Ivy Moore', 'ivy@example.com', '9876543219', 'Civil', 2, 'H10');

INSERT INTO Faculty (faculty_id, name, email, department, designation, phone) VALUES
('F001', 'Dr. Alan Turing', 'alan@example.com', 'Computer Science', 'Professor', '8765432109'),
('F002', 'Dr. Marie Curie', 'marie@example.com', 'Physics', 'Associate Professor', '8765432108'),
('F003', 'Dr. Nikola Tesla', 'nikola@example.com', 'Electronics', 'Professor', '8765432107'),
('F004', 'Dr. Ada Lovelace', 'ada@example.com', 'Computer Science', 'Assistant Professor', '8765432106'),
('F005', 'Dr. Isaac Newton', 'isaac@example.com', 'Mathematics', 'Professor', '8765432105'),
('F006', 'Dr. Albert Einstein', 'albert@example.com', 'Physics', 'Professor', '8765432104'),
('F007', 'Dr. Grace Hopper', 'ghopper@example.com', 'Computer Science', 'Associate Professor', '8765432103'),
('F008', 'Dr. Charles Babbage', 'charles@example.com', 'Mechanical', 'Professor', '8765432102'),
('F009', 'Dr. Blaise Pascal', 'blaise@example.com', 'Mathematics', 'Assistant Professor', '8765432101'),
('F010', 'Dr. CV Raman', 'raman@example.com', 'Physics', 'Professor', '8765432100');

INSERT INTO Courses (course_id, course_name, credits, faculty_id, department) VALUES
('C001', 'Database Management', 4, 'F001', 'Computer Science'),
('C002', 'Web Programming', 3, 'F004', 'Computer Science'),
('C003', 'Analog Electronics', 4, 'F003', 'Electronics'),
('C004', 'Quantum Mechanics', 3, 'F006', 'Physics'),
('C005', 'Calculus', 4, 'F005', 'Mathematics'),
('C006', 'Data Structures', 4, 'F007', 'Computer Science'),
('C007', 'Thermodynamics', 3, 'F008', 'Mechanical'),
('C008', 'Operating Systems', 4, 'F001', 'Computer Science'),
('C009', 'Digital Logic', 3, 'F003', 'Electronics'),
('C010', 'Linear Algebra', 3, 'F009', 'Mathematics');

INSERT INTO Attendance (student_id, course_id, date, status, semester) VALUES
('S001', 'C001', '2023-10-01', 'Present', 5),
('S002', 'C003', '2023-10-01', 'Absent', 3),
('S003', 'C007', '2023-10-01', 'Present', 7),
('S004', 'C006', '2023-10-01', 'Present', 1),
('S005', 'C005', '2023-10-01', 'Absent', 5),
('S006', 'C009', '2023-10-01', 'Present', 7),
('S007', 'C002', '2023-10-01', 'Present', 3),
('S008', 'C008', '2023-10-01', 'Present', 5),
('S009', 'C007', '2023-10-01', 'Absent', 1),
('S010', 'C005', '2023-10-01', 'Present', 3);

INSERT INTO Marks (student_id, course_id, internal_marks, external_marks, grade) VALUES
('S001', 'C001', 35, 55, 'A'),
('S001', 'C002', 30, 45, 'B'),
('S002', 'C003', 38, 58, 'O'),
('S003', 'C007', 25, 40, 'C'),
('S004', 'C006', 32, 50, 'A'),
('S005', 'C005', 28, 42, 'B'),
('S006', 'C009', 39, 59, 'O'),
('S007', 'C002', 31, 48, 'B'),
('S008', 'C008', 36, 54, 'A'),
('S010', 'C005', 29, 41, 'C');

INSERT INTO `Library` (book_id, title, author, student_id, issue_date, return_date, status) 
VALUES
('B001', 'Database System Concepts', 'Silberschatz', 'S001', '2023-09-01', '2023-09-15', 'Available'),
('B002', 'Learning Web Design', 'Jennifer Robbins', 'S001', '2023-09-10', NULL, 'Issued'),
('B003', 'Electronic Devices', 'Thomas Floyd', 'S002', '2023-09-05', '2023-09-20', 'Available'),
('B004', 'Engineering Thermodynamics', 'P.K. Nag', 'S003', '2023-09-12', NULL, 'Issued'),
('B005', 'Data Structures in C', 'Reema Thareja', 'S004', '2023-09-15', NULL, 'Issued'),
('B006', 'Higher Engineering Maths', 'B.S. Grewal', 'S005', '2023-09-18', '2023-10-02', 'Available'),
('B007', 'Operating System Concepts', 'Galvin', 'S008', '2023-09-20', NULL, 'Issued'),
('B008', 'Digital Design', 'Morris Mano', 'S006', '2023-09-22', NULL, 'Issued'),
('B009', 'Clean Code', 'Robert Martin', 'S007', '2023-09-25', NULL, 'Issued'),
('B010', 'Advanced Engineering Maths', 'Erwin Kreyszig', 'S010', '2023-09-28', NULL, 'Issued');

INSERT INTO Events (event_id, event_name, date, venue, description, organized_by) VALUES
('E001', 'Tech Symposium 2023', '2023-11-15', 'Main Auditorium', 'Annual Tech Fest', 'F001'),
('E002', 'Science Fair', '2023-12-05', 'Science Block', 'Exhibition of projects', 'F002'),
('E003', 'Robotics Workshop', '2023-10-20', 'Lab 3', 'Hands-on robotics', 'F003'),
('E004', 'Coding Hackathon', '2023-10-25', 'Computer Center', '24-hour coding challenge', 'F004'),
('E005', 'Math Olympiad', '2023-11-10', 'Room 101', 'Mathematics competition', 'F005'),
('E006', 'Physics Guest Lecture', '2023-10-15', 'Seminar Hall', 'Lecture by famous physicist', 'F006'),
('E007', 'Web Dev Seminar', '2023-11-05', 'Auditorium B', 'Modern Web Technologies', 'F007'),
('E008', 'Auto Expo', '2023-12-10', 'Grounds', 'Automobile exhibition', 'F008'),
('E009', 'AI Workshop', '2023-11-20', 'Lab 1', 'Introduction to AI', 'F001'),
('E010', 'Cultural Meet', '2023-12-20', 'Open Air Theatre', 'Annual cultural festival', 'F010');

INSERT INTO Complaints (student_id, complaint_text, status, date_submitted) VALUES
('S001', 'Wi-Fi not working in Hostel A', 'In Progress', '2023-10-02'),
('S003', 'Water purifier filter needs replacement', 'Resolved', '2023-09-28'),
('S005', 'Library fine dispute', 'Pending', '2023-10-03'),
('S006', 'Projector in room 201 is blank', 'Resolved', '2023-09-25'),
('S008', 'Mess food quality issue', 'Pending', '2023-10-04'),
('S002', 'Hostel room door lock broken', 'In Progress', '2023-10-01'),
('S004', 'Course schedule conflict', 'Resolved', '2023-09-20'),
('S009', 'Insufficient sports equipment', 'Pending', '2023-10-02'),
('S010', 'Parking space issue', 'Resolved', '2023-09-15'),
('S007', 'ID card lost, need replacement', 'In Progress', '2023-10-03');

INSERT INTO FeePayment (student_id, amount, payment_date, semester, payment_status) VALUES
('S001', 45000.00, '2023-07-15', 5, 'Successful'),
('S002', 45000.00, '2023-07-20', 3, 'Successful'),
('S003', 45000.00, '2023-07-18', 7, 'Pending'),
('S004', 50000.00, '2023-08-01', 1, 'Successful'),
('S005', 45000.00, '2023-07-25', 5, 'Successful'),
('S006', 45000.00, '2023-07-22', 7, 'Failed'),
('S007', 45000.00, '2023-07-30', 3, 'Successful'),
('S008', 45000.00, '2023-07-28', 5, 'Successful'),
('S009', 50000.00, '2023-08-05', 1, 'Pending'),
('S010', 45000.00, '2023-07-10', 3, 'Successful');

INSERT INTO Users (user_id, password_hash, role) VALUES
('S001', 'password123', 'Student'),
('S002', 'password123', 'Student'),
('F001', 'password123', 'Faculty'),
('F002', 'password123', 'Faculty'),
('HOD01', 'password123', 'HOD'),
('DEAN01', 'password123', 'Dean'),
('ADEAN01', 'password123', 'Associate Dean'),
('DIR01', 'password123', 'Director'),
('LIB01', 'password123', 'Librarian'),
('admin', 'admin123', 'Admin');

INSERT INTO Assignments (assignment_id, course_id, title, description, due_date) VALUES
(1, 'C001', 'Database Normalization Homework', 'Normalize the provided hospital database to 3NF', '2026-11-20'),
(2, 'C001', 'SQL Complex Queries Project', 'Write 10 complex queries using JOINs and Subqueries', '2026-12-05'),
(3, 'C002', 'Build a REST API', 'Use Node and Express to build a standard REST application', '2026-11-25'),
(4, 'C002', 'AngularJS Single Page App', 'Create a routing system in AngularJS', '2026-12-10'),
(5, 'C004', 'Quantum Physics Paper', '10 page analytical essay on Quantum entanglement', '2026-11-30');

INSERT INTO AssignmentSubmissions (submission_id, assignment_id, student_id, submission_link, submitted_at) VALUES
(1, 1, 'S001', 'https://github.com/S001/dbms_hw1', '2026-11-18 10:23:00'),
(2, 1, 'S002', 'https://github.com/S002/db_hw', '2026-11-19 14:10:00'),
(3, 3, 'S001', 'https://github.com/S001/web_api', '2026-11-24 09:30:00');

INSERT INTO FacultyFeedback (feedback_id, student_id, faculty_id, feedback_text, rating) VALUES
(1, 'S001', 'F001', 'Great professor, makes database concepts very clear and answers queries well!', 5),
(2, 'S002', 'F004', 'The web programming assignments are a bit tough but very practical.', 4),
(3, 'S003', 'F006', 'Physics classes are well structured.', 5),
(4, 'S004', 'F001', 'Please slow down during SQL JOINs lectures.', 3);


-- Run this query to see actual results from your database
SELECT 
    s.name,
    s.department,
    COUNT(DISTINCT c.complaint_id) AS pending_complaints,
    COALESCE(ROUND(AVG(ff.rating), 1), 0) AS avg_rating
FROM Students s
LEFT JOIN Complaints c ON s.student_id = c.student_id AND c.status = 'Pending'
LEFT JOIN FacultyFeedback ff ON s.student_id = ff.student_id
GROUP BY s.student_id, s.name, s.department
ORDER BY pending_complaints DESC;