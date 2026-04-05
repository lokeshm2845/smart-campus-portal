-- 20+ SQL Queries for Smart Campus Portal

USE smart_campus_db;

-- 1. Simple SELECT
SELECT * FROM Students;

-- 2. DDL - ALTER
ALTER TABLE Students ADD COLUMN address VARCHAR(200);

-- 3. DDL - DROP and CREATE (handled in setup, but demonstrating here for the document, we will create a temporary table and drop it)
CREATE TABLE TempTable (id INT);
DROP TABLE TempTable;

-- 4. DML - UPDATE
UPDATE Students SET address = 'Campus Hostel' WHERE hostel_id IS NOT NULL;

-- 5. DML - DELETE
DELETE FROM Events 
WHERE event_id IN (
    SELECT event_id FROM (
        SELECT event_id FROM Events WHERE date < '2023-01-01'
    ) AS temp
);

-- 6. JOIN - INNER JOIN (Students and Hostel)
SELECT s.name, s.department, h.hostel_name, h.room_number
FROM Students s
INNER JOIN Hostel h ON s.hostel_id = h.hostel_id;

-- 7. JOIN - LEFT JOIN (Students and Complaints)
SELECT s.name, c.complaint_text, c.status
FROM Students s
LEFT JOIN Complaints c ON s.student_id = c.student_id;

-- 8. JOIN - RIGHT JOIN (Courses and Faculty)
SELECT c.course_name, f.name AS faculty_name, f.designation
FROM Courses c
RIGHT JOIN Faculty f ON c.faculty_id = f.faculty_id;

-- 9. JOIN - 3 Tables Join (Students, Attendance, Courses)
SELECT s.name, c.course_name, a.date, a.status
FROM Attendance a
JOIN Students s ON a.student_id = s.student_id
JOIN Courses c ON a.course_id = c.course_id;

-- 10. Aggregate - COUNT
SELECT COUNT(*) AS total_students FROM Students;

-- 11. Aggregate - SUM and AVG
SELECT SUM(amount) AS total_fees_collected, AVG(amount) AS avg_fee FROM FeePayment WHERE payment_status = 'Successful';

-- 12. Aggregate - MAX and MIN
SELECT MAX(total_marks) AS highest_marks, MIN(total_marks) AS lowest_marks FROM Marks;

-- 13. GROUP BY with HAVING
SELECT department, COUNT(student_id) AS student_count
FROM Students
GROUP BY department
HAVING student_count > 1;

-- 14. Nested Subquery
SELECT name, email FROM Students
WHERE student_id IN (
    SELECT student_id FROM Marks WHERE grade = 'O'
);

-- 15. Set Operation - UNION
SELECT name, email, 'Student' AS Role FROM Students
UNION
SELECT name, email, 'Faculty' AS Role FROM Faculty;

-- 16. Set Operation - INTERSECT Simulation (using IN)
SELECT course_name FROM Courses WHERE course_id IN (SELECT course_id FROM Marks WHERE total_marks > 80);

-- 17. VIEW - Create View 1 (Student Profiles)
CREATE VIEW StudentProfiles AS
SELECT s.student_id, s.name, s.department, h.hostel_name
FROM Students s
LEFT JOIN Hostel h ON s.hostel_id = h.hostel_id;

-- 18. VIEW - Create View 2 (Faculty Courses)
CREATE VIEW FacultyCourses AS
SELECT f.name AS Faculty_Name, c.course_name, c.credits
FROM Faculty f
JOIN Courses c ON f.faculty_id = c.faculty_id;

-- 19. Using a View
SELECT * FROM StudentProfiles WHERE department = 'Computer Science';

-- 20. Store Procedure Example 
DELIMITER //
CREATE PROCEDURE GetStudentMarks(IN p_student_id VARCHAR(20))
BEGIN
    SELECT c.course_name, m.internal_marks, m.external_marks, m.total_marks, m.grade
    FROM Marks m
    JOIN Courses c ON m.course_id = c.course_id
    WHERE m.student_id = p_student_id;
END //
DELIMITER ;

-- 21. Transaction Management Demonstration
START TRANSACTION;
INSERT INTO FeePayment (student_id, amount, payment_date, semester, payment_status) VALUES ('S001', 5000, '2023-10-10', 5, 'Successful');
UPDATE Hostel SET fees_status = 'Paid' WHERE hostel_id = (SELECT hostel_id FROM Students WHERE student_id = 'S001');
COMMIT;
-- If error occurs, use ROLLBACK;

