-- 1. Simple SELECT
SELECT * FROM students;

-- 2. DDL - ALTER
ALTER TABLE students ADD COLUMN address VARCHAR(200);

-- 3. DDL - DROP and CREATE (temporary table)
CREATE TEMP TABLE temp_table (id INT);
DROP TABLE temp_table;

-- 4. DML - UPDATE
UPDATE students SET address = 'Campus Hostel' WHERE hostel_id IS NOT NULL;

-- 5. DML - DELETE (events before 2023-01-01)
DELETE FROM events 
WHERE event_id IN (
    SELECT event_id FROM events WHERE date < '2023-01-01'
);

-- 6. JOIN - INNER JOIN (students and hostel)
SELECT s.name, s.department, h.hostel_name, h.room_number
FROM students s
INNER JOIN hostel h ON s.hostel_id = h.hostel_id;

-- 7. JOIN - LEFT JOIN (students and complaints)
SELECT s.name, c.complaint_text, c.status
FROM students s
LEFT JOIN complaints c ON s.student_id = c.student_id;

-- 8. JOIN - RIGHT JOIN (courses and faculty)
SELECT c.course_name, f.name AS faculty_name, f.designation
FROM courses c
RIGHT JOIN faculty f ON c.faculty_id = f.faculty_id;

-- 9. JOIN - 3 Tables Join (students, attendance, courses)
SELECT s.name, c.course_name, a.date, a.status
FROM attendance a
JOIN students s ON a.student_id = s.student_id
JOIN courses c ON a.course_id = c.course_id;

-- 10. Aggregate - COUNT
SELECT COUNT(*) AS total_students FROM students;

-- 11. Aggregate - SUM and AVG
SELECT SUM(amount) AS total_fees_collected, AVG(amount) AS avg_fee 
FROM fee_payment WHERE payment_status = 'Successful';

-- 12. Aggregate - MAX and MIN
SELECT MAX(total_marks) AS highest_marks, MIN(total_marks) AS lowest_marks 
FROM marks;

-- 13. GROUP BY with HAVING
SELECT department, COUNT(student_id) AS student_count
FROM students
GROUP BY department
HAVING COUNT(student_id) > 1;

-- 14. Nested Subquery (students with 'O' grade)
SELECT name, email FROM students
WHERE student_id IN (
    SELECT student_id FROM marks WHERE grade = 'O'
);

-- 15. Set Operation - UNION
SELECT name, email, 'Student' AS role FROM students
UNION
SELECT name, email, 'Faculty' AS role FROM faculty;

-- 16. Set Operation - INTERSECT simulation (courses with marks > 80)
SELECT course_name FROM courses 
WHERE course_id IN (SELECT course_id FROM marks WHERE total_marks > 80);

-- 17. VIEW - Student Profiles
CREATE VIEW student_profiles AS
SELECT s.student_id, s.name, s.department, h.hostel_name
FROM students s
LEFT JOIN hostel h ON s.hostel_id = h.hostel_id;

-- 18. VIEW - Faculty Courses
CREATE VIEW faculty_courses AS
SELECT f.name AS faculty_name, c.course_name, c.credits
FROM faculty f
JOIN courses c ON f.faculty_id = c.faculty_id;

-- 19. Using a View
SELECT * FROM student_profiles WHERE department = 'Computer Science';

-- 20. Stored Function (replaces MySQL procedure)
-- Returns a table of marks for a given student
CREATE OR REPLACE FUNCTION get_student_marks(p_student_id VARCHAR)
RETURNS TABLE(
    course_name VARCHAR,
    internal_marks DECIMAL,
    external_marks DECIMAL,
    total_marks DECIMAL,
    grade VARCHAR
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT c.course_name, m.internal_marks, m.external_marks, m.total_marks, m.grade
    FROM marks m
    JOIN courses c ON m.course_id = c.course_id
    WHERE m.student_id = p_student_id;
END;
$$;

-- Example usage:
-- SELECT * FROM get_student_marks('S001');

-- 21. Transaction Management
BEGIN;  -- or START TRANSACTION;
INSERT INTO fee_payment (student_id, amount, payment_date, semester, payment_status) 
VALUES ('S001', 5000, '2023-10-10', 5, 'Successful');
UPDATE hostel SET fees_status = 'Paid' 
WHERE hostel_id = (SELECT hostel_id FROM students WHERE student_id = 'S001');
COMMIT;
-- If error occurs, use ROLLBACK;

-- Additional Query 1: Students who have not submitted 'Database Design Project'
SELECT s.name, s.email
FROM students s
LEFT JOIN assignment_submissions sub ON s.student_id = sub.student_id
LEFT JOIN assignments a ON sub.assignment_id = a.assignment_id AND a.title = 'Database Design Project'
WHERE a.assignment_id IS NULL;

-- Additional Query 2: Pending complaints per department
SELECT 
    s.department,
    COUNT(c.complaint_id) AS pending_complaints
FROM students s
LEFT JOIN complaints c ON s.student_id = c.student_id AND c.status = 'Pending'
GROUP BY s.department
ORDER BY pending_complaints DESC;