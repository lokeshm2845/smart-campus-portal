# SMART CAMPUS PORTAL: DATABASE DESIGN & IMPLEMENTATION REPORT

## 1. ABSTRACT
The Smart Campus Portal is a comprehensive university management ecosystem. Its database is constructed around robust relational integrity, handling 14 interlinked entities. The system covers academic performance, assignments, hostel tracking, role-based security, fee management, and feedback matrices utilizing MySQL normalized up to the Boyce-Codd Normal Form (BCNF). 

---

## 2. ENTITY-RELATIONSHIP (ER) DIAGRAM DESCRIPTION
*Note: You can draw this in draw.io or lucidchart using the following breakdown:*

### Entities & Attributes:
- **Users**: <ins>user_id</ins>, password_hash, role
- **Students**: <ins>student_id</ins>, name, email, phone, department, year, hostel_id (FK)
- **Faculty**: <ins>faculty_id</ins>, name, email, department, designation, phone
- **Courses**: <ins>course_id</ins>, course_name, credits, faculty_id (FK), department
- **Hostel**: <ins>hostel_id</ins>, hostel_name, room_number, fees_status
- **Library**: <ins>book_id</ins>, title, author, student_id (FK), status, issue_date
- **Events**: <ins>event_id</ins>, event_name, date, venue, description, faculty_id (FK)
- **Complaints**: <ins>complaint_id</ins>, student_id (FK), complaint_text, status
- **FeePayment**: <ins>payment_id</ins>, student_id (FK), amount, payment_status, semester
- **Assignments**: <ins>assignment_id</ins>, course_id (FK), title, due_date
- **AssignmentSubmissions**: <ins>submission_id</ins>, assignment_id (FK), student_id (FK), submission_link
- **FacultyFeedback**: <ins>feedback_id</ins>, student_id (FK), faculty_id (FK), text, rating

### Relationship Mappings (Cardinality):
* **One-to-One (1:1)**: 
  - `Users` (1) to `Students`/`Faculty` (1): Each core entity map holds one authentication profile.
* **One-to-Many (1:N)**: 
  - `Hostel` (1) to `Students` (N): One room holds multiple students.
  - `Faculty` (1) to `Courses` (N): A professor teaches multiple subjects.
  - `Courses` (1) to `Assignments` (N): A course has many assignments deployed.
  - `Students` (1) to `Complaints`/`FeePayments`/`Library` (N): A student logs multiple transactions.
* **Many-to-Many (M:N) Resolved through Mapping Tables**:
  - `Attendance` mapping: Connects `Students` and `Courses` on a specific `date`.
  - `Marks` mapping: Connects `Students` and `Courses` via grading.
  - `FacultyFeedback`: Connects `Students` to `Faculty`.
  - `AssignmentSubmissions`: Connects `Students` to `Assignments`.

---

## 3. RELATIONAL SCHEMA 
*(Primary Keys are underlined, Foreign Keys are italicized)*

1. Users(<ins>user_id</ins>, password_hash, role)
2. Hostel(<ins>hostel_id</ins>, hostel_name, room_number, fees_status)
3. Students(<ins>student_id</ins>, name, email, phone, department, year, *hostel_id*)
4. Faculty(<ins>faculty_id</ins>, name, email, department, designation, phone)
5. Courses(<ins>course_id</ins>, course_name, credits, department, *faculty_id*)
6. Attendance(*student_id*, *course_id*, <ins>date</ins>, status, semester) → Composite PK (student_id, course_id, date)
7. Marks(*student_id*, *course_id*, internal_marks, external_marks, grade) → Composite PK (student_id, course_id)
8. Library(<ins>book_id</ins>, title, author, *student_id*, issue_date, return_date, status)
9. Events(<ins>event_id</ins>, event_name, date, venue, description, *organized_by*)
10. Complaints(<ins>complaint_id</ins>, *student_id*, complaint_text, status, date_submitted)
11. FeePayment(<ins>payment_id</ins>, *student_id*, amount, payment_date, semester, payment_status)
12. Assignments(<ins>assignment_id</ins>, *course_id*, title, description, due_date)
13. AssignmentSubmissions(<ins>submission_id</ins>, *assignment_id*, *student_id*, submission_link, submitted_at)
14. FacultyFeedback(<ins>feedback_id</ins>, *student_id*, *faculty_id*, feedback_text, rating)

---

## 4. DATABASE NORMALIZATION LOGIC

The database is compliant up to **Boyce-Codd Normal Form (BCNF)**.

### First Normal Form (1NF)
*Condition: All attributes must be atomic and single-valued.*
- **Implementation:** No multi-valued attributes exist. `name`, `email`, and `phone` are split into distinct atomic columns. Instead of a single column for marks, `internal_marks` and `external_marks` are isolated.

### Second Normal Form (2NF)
*Condition: Must be in 1NF, and all non-key attributes must be fully functionally dependent on the Primary Key (no partial dependencies).*
- **Implementation:** In the `Marks` table, the Primary Key is the composite of `(student_id, course_id)`. The grade and marks depend strictly on BOTH IDs. If `course_name` was inside the `Marks` table, it would be a partial dependency (relying only on `course_id`). Therefore, `course_name` is correctly isolated strictly into the `Courses` table.

### Third Normal Form (3NF)
*Condition: Must be in 2NF, and no transitive dependencies exist (non-key relies on another non-key).*
- **Implementation:** In the `Students` table, if we stored `hostel_name` and `room_number` directly, they would theoretically depend on `hostel_id` rather than the primary `student_id`. To resolve this transitive dependency, residential info was broken off into the separate `Hostel` table linked by a Foreign Key.

### Boyce-Codd Normal Form (BCNF)
*Condition: For every non-trivial functional dependency X → Y, X must be a super key.*
- **Implementation:** By isolating `Assignments` entirely from `AssignmentSubmissions` and enforcing strict constraint cascades, data anomalies are completely eradicated. Every determinant parameter in our schema securely validates as a candidate key.

---

## 5. ESSENTIAL SQL QUERIES (CRUD Operations)

### A. DDL (Data Definition) - Advanced Table Creation
```sql
CREATE TABLE AssignmentSubmissions (
    submission_id INT AUTO_INCREMENT PRIMARY KEY,
    assignment_id INT,
    student_id VARCHAR(20),
    submission_link VARCHAR(255),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assignment_id) REFERENCES Assignments(assignment_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES Students(student_id) ON DELETE CASCADE
);
```

### B. DML (Data Manipulation) - Core System Flow Insertions
```sql
-- Deploying a live assignment to class
INSERT INTO Assignments (course_id, title, description, due_date) 
VALUES ('C001', 'Database Architecture Paper', 'Submit PDF detailing BCNF', '2026-11-20');

-- Student filing anonymous faculty feedback
INSERT INTO FacultyFeedback (student_id, faculty_id, feedback_text, rating) 
VALUES ('S001', 'F001', 'Excellent coverage of Web Tech.', 5);
```

### C. DQL (Data Querying) - Complex Analytics (JOINs & Aggregates)
```sql
-- Query 1: Fetching all active Assignments paired with their explicit Course names
SELECT a.assignment_id, a.title, a.due_date, c.course_name 
FROM Assignments a 
JOIN Courses c ON a.course_id = c.course_id 
ORDER BY a.due_date ASC;

-- Query 2: Executive UI - Calculating Pending Complaints and Overall Student Count
SELECT 
  (SELECT COUNT(*) FROM Students) AS total_students,
  (SELECT COUNT(*) FROM Faculty) AS total_faculty,
  (SELECT COUNT(*) FROM Complaints WHERE status != 'Resolved') AS pending_complaints;

-- Query 3: Multi-layer inner join for fetching a professor's live course roster 
SELECT c.course_name, s.name as student_name, a.status, a.date
FROM Attendance a
JOIN Courses c ON a.course_id = c.course_id
JOIN Students s ON a.student_id = s.student_id
WHERE c.faculty_id = 'F001' AND a.date = CURDATE();
```
